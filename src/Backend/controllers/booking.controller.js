const Booking = require('../models/booking.model');
const User = require('../models/user.model');
const Service = require('../models/service.model');
const Staff = require('../models/staff.model');
const Payment = require('../models/payment.model');
const { sendRescheduleNotification, sendBookingConfirmationEmail, sendCompletionEmail, sendCancellationEmail } = require("../emailService");
const axios = require('axios');

// Add Booking
exports.addBooking = async (req, res) => {
  try {
    const { serviceId, userId, staffId, date, timeSlot } = req.body;

    // Validate service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate staff
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    // Ensure staff belongs to the correct service category
    if (staff.category !== service.category) {
      return res.status(400).json({ error: 'Selected staff does not belong to the required service category.' });
    }

    // Check if the user already has an ongoing booking for this service
    const existingBooking = await Booking.findOne({
      user: userId,
      service: serviceId,
      status: { $in: ['pending', 'inprogress'] },
    });

    if (existingBooking) {
      return res.status(400).json({
        error: 'You already have an ongoing booking for this service. Please complete or cancel it before booking another one.',
      });
    }

    // Check if the selected time slot is already booked for this service
    const timeSlotBooking = await Booking.findOne({
      date,
      timeSlot,
      service: serviceId,
    });

    if (timeSlotBooking) {
      return res.status(400).json({
        error: 'This time slot is already booked on the selected date.',
      });
    }

    // Check if the selected staff is already booked in a pending or in-progress state
    const staffBooked = await Booking.findOne({
      staff: staffId,
      date,
      timeSlot,
      status: { $in: ['pending', 'inprogress'] },
    });

    if (staffBooked) {
      return res.status(400).json({
        error: 'This staff member is already booked for the selected time slot.',
      });
    }

    // Create a payment record before booking
    const payment = new Payment({
      service: serviceId,
      user: userId,
      staff: staffId,
      userName: `${user.firstName} ${user.lastName}`,
      serviceName: service.name,
      staffName: staff.name,
      amount: service.price,
      date,
      timeSlot,
      status: 'initiated',
    });

    // Prepare Khalti payment initiation payload
    const payload = {
      return_url: `${process.env.FRONTEND_URL}/api/payment/verify`,
      website_url: process.env.FRONTEND_URL,
      amount: service.price * 100,
      purchase_order_id: payment._id.toString(),
      purchase_order_name: `Booking for ${service.name}`,
      customer_info: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
    };

    // Initiate payment with Khalti
    const response = await axios.post(
      'https://dev.khalti.com/api/v2/epayment/initiate/', 
      payload,
      {
        headers: {
          'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Save pidx in payment record
    payment.pidx = response.data.pidx;
    await payment.save();

    await sendBookingConfirmationEmail(
      user.email,
      user.firstName,
      service,
      staff,
      date,
      timeSlot
    );

    res.status(201).json({
      message: 'Payment initiation successful. Complete the payment to finalize the booking.',
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
    });

  } catch (error) {
    console.error('Booking and Payment initiation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('service', 'name image')
      .populate('user', 'firstName lastName email')
      .populate('staff', 'name phone image')
      .populate('paymentId', 'status amount');

    const result = bookings.map(booking => ({
      id: booking._id,
      service: {
        name: booking.serviceName,
        image: booking.service?.image || '',
      },
      user: {
        name: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`,
        email: booking.user?.email || '',
      },
      staff: {
        name: booking.staff?.name || 'Not Available',
        phone: booking.staff?.phone || 'Not Available',
        image: booking.staff?.image || '',
      },
      staffName: booking.staffName || 'Not Available',
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      price: booking.price,
      payment: {
        status: booking.paymentId?.status || 'Not Paid',
        amount: booking.paymentId?.amount || 0,
      },
      paymentStatus: booking.paymentStatus || 'initiated',
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all bookings for a specific user
exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all bookings for the user
    const bookings = await Booking.find({ user: userId })
      .populate('service', 'name image')
      .populate('staff', 'name phone image')
      .populate('user', 'firstName lastName email')
      .populate('paymentId', 'status amount');

    // Check if no bookings are found
    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found for this user.' });
    }

    const result = bookings.map(booking => ({
      id: booking._id,
      service: {
        name: booking.serviceName,
        image: booking.service?.image || ' ',
      },
      user: {
        name: `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`,
        email: booking.user?.email || '',
      },
      staff: {
        name: booking.staff?.name || 'Not Available',
        phone: booking.staff?.phone || 'Not Available',
        image: booking.staff?.image || ' ',
      },
      staffName: booking.staffName || 'Not Available',
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      price: booking.price,
      payment: {
        status: booking.paymentId?.status || 'Not Paid',
        amount: booking.paymentId?.amount || 0,
      },
      paymentStatus: booking.paymentStatus || 'initiated',
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all bookings for a specific staff
exports.getStaffBookings = async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }

    const bookings = await Booking.find({ staff: staffId })
      .populate('service')
      .populate('user')    
      .populate('paymentId', 'status amount');

    if (!bookings.length) {
      return res.status(404).json({ message: 'No bookings found for this staff member.' });
    }

    const result = bookings.map(booking => ({
      id: booking._id,
      service: booking.service || {},
      user: booking.user || {},       
      staffName: booking.staffName || 'Not Available',
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      price: booking.price,
      payment: {
        status: booking.paymentId?.status || 'Not Paid',
        amount: booking.paymentId?.amount || 0,
      },
      paymentStatus: booking.paymentStatus || 'initiated',
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching staff bookings:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Time slot mapping
const timeSlotToHour = {
  '8AM - 9AM': 8,
  '9AM - 10AM': 9,
  '10AM - 11AM': 10,
  '11AM - 12PM': 11,
  '12PM - 1PM': 12,
  '1PM - 2PM': 13,
  '2PM - 3PM': 14,
  '3PM - 4PM': 15,
  '4PM - 5PM': 16,
};

// Convert date and time slot to a full Date object
function getStartTimeFromSlot(dateString, timeSlot) {
  const parsedDate = new Date(`${dateString.trim()}, ${new Date().getFullYear()}`);
  const startHour = timeSlotToHour[timeSlot];
  if (!startHour) {
    throw new Error(`Invalid time slot: ${timeSlot}`);
  }
  parsedDate.setHours(startHour, 0, 0, 0);
  return parsedDate;
}

// Get the next time slot
function getNextTimeSlot(currentTimeSlot) {
  const currentHour = timeSlotToHour[currentTimeSlot];
  const nextHour = currentHour + 1;
  return Object.keys(timeSlotToHour).find(key => timeSlotToHour[key] === nextHour) || null;
}

// Delay function to avoid Gmail rate limits
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.rescheduleBooking = async (req, res) => {
  try {
    const { newDate, newTimeSlot } = req.body;
    const bookingId = req.params.id;

    // Log incoming request
    console.log(`Reschedule request for booking ${bookingId}:`, { newDate, newTimeSlot });

    // Validate request body
    if (!newDate || !newTimeSlot) {
      console.error('Missing newDate or newTimeSlot in request');
      return res.status(400).json({ error: 'newDate and newTimeSlot are required' });
    }

    // Validate time slot
    if (!Object.keys(timeSlotToHour).includes(newTimeSlot)) {
      console.error(`Invalid time slot provided: ${newTimeSlot}`);
      return res.status(400).json({ error: 'Invalid time slot' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Log booking details
    console.log(`Found booking ${bookingId}:`, {
      user: booking.user,
      userEmail: booking.userEmail,
      userName: booking.userName,
      service: booking.service,
      serviceName: booking.serviceName,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
    });

    // Check booking status
    if (!['pending', 'inprogress'].includes(booking.status)) {
      console.error(`Cannot reschedule booking ${bookingId}: Invalid status ${booking.status}`);
      return res.status(400).json({
        error: "Only bookings with status 'pending' or 'inprogress' can be rescheduled",
      });
    }

    // Validate new start time
    const newStartTime = getStartTimeFromSlot(newDate, newTimeSlot);
    const now = new Date();
    if (newStartTime < now) {
      console.error(`Cannot reschedule booking ${bookingId} to past time: ${newStartTime}`);
      return res.status(400).json({ error: 'Cannot reschedule to a past date or time' });
    }

    // Store original date for conflict check
    const originalDate = booking.date.trim();
    const normalizedNewDate = newDate.trim();
    const updatedBookings = [];

    // Update the current booking
    booking.startTime = newStartTime;
    booking.timeSlot = newTimeSlot;
    booking.date = normalizedNewDate;
    await booking.save();
    updatedBookings.push(booking);
    console.log(`Booking ${bookingId} rescheduled to ${normalizedNewDate}, ${newTimeSlot}`);

    // Send email to the user who initiated the reschedule
    if (!booking.userEmail) {
      console.error(`No userEmail found for booking ${bookingId}`);
    } else {
      console.log(`Sending reschedule email to ${booking.userEmail} for booking ${bookingId}`);
      const emailSent = await sendRescheduleNotification(
        booking.userEmail,
        booking.userName || 'User',
        booking.serviceName || 'your service',
        booking.date,
        booking.timeSlot
      );
      if (!emailSent) {
        console.warn(`Failed to send reschedule email to ${booking.userEmail} for booking ${bookingId}`);
      }
    }

    // Check for consecutive booking conflicts on the same date
    if (originalDate === normalizedNewDate) {
      // Log query parameters for debugging
      console.log('Conflict query parameters:', {
        service: booking.service,
        date: normalizedNewDate,
        timeSlot: newTimeSlot,
        _id: { $ne: booking._id },
      });

      // Find the booking that occupies the new time slot (if any)
      const conflictingBooking = await Booking.findOne({
        service: booking.service,
        date: normalizedNewDate,
        timeSlot: newTimeSlot,
        _id: { $ne: booking._id },
      });

      if (conflictingBooking) {
        console.log(`Found conflicting booking ${conflictingBooking._id} at ${normalizedNewDate}, ${newTimeSlot}`, {
          conflictingBooking: {
            userEmail: conflictingBooking.userEmail,
            userName: conflictingBooking.userName,
            serviceName: conflictingBooking.serviceName,
            date: conflictingBooking.date,
            timeSlot: conflictingBooking.timeSlot,
          },
        });

        // Get the next time slot
        const nextTimeSlot = getNextTimeSlot(newTimeSlot);
        if (!nextTimeSlot) {
          console.error(`No available time slot after ${newTimeSlot} for booking ${conflictingBooking._id}`);
          return res.status(400).json({ error: `No available time slot after ${newTimeSlot}` });
        }

        // Check if the next time slot is already occupied
        const nextSlotConflict = await Booking.findOne({
          service: booking.service,
          date: normalizedNewDate,
          timeSlot: nextTimeSlot,
          _id: { $ne: booking._id },
        });

        if (nextSlotConflict) {
          console.error(`Next time slot ${nextTimeSlot} is already occupied for ${normalizedNewDate}`);
          return res.status(400).json({ error: `Cannot shift conflicting booking: ${nextTimeSlot} is already occupied` });
        }

        // Update the conflicting booking
        conflictingBooking.timeSlot = nextTimeSlot;
        conflictingBooking.startTime = getStartTimeFromSlot(normalizedNewDate, nextTimeSlot);
        conflictingBooking.date = normalizedNewDate; // Ensure date consistency
        await conflictingBooking.save();
        updatedBookings.push(conflictingBooking);
        console.log(`Shifted booking ${conflictingBooking._id} to ${normalizedNewDate}, ${nextTimeSlot}`);

        // Send email to the affected user
        if (!conflictingBooking.userEmail) {
          console.error(`No userEmail found for affected booking ${conflictingBooking._id}`);
        } else {
          console.log(`Sending reschedule email to ${conflictingBooking.userEmail} for booking ${conflictingBooking._id}`);
          const emailSent = await sendRescheduleNotification(
            conflictingBooking.userEmail,
            conflictingBooking.userName || 'User',
            conflictingBooking.serviceName || 'your service',
            conflictingBooking.date,
            conflictingBooking.timeSlot
          );
          if (!emailSent) {
            console.warn(`Failed to send reschedule email to ${conflictingBooking.userEmail} for booking ${conflictingBooking._id}`);
          }
          // Add delay to avoid Gmail rate limits
          await delay(500);
        }
      } else {
        console.log(`No conflicting booking found for ${normalizedNewDate}, ${newTimeSlot}`);
      }
    }

    res.status(200).json({
      message: 'Booking rescheduled successfully',
      updatedBookings,
    });
  } catch (err) {
    console.error(`Reschedule error for booking ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate booking ID and status
    const booking = await Booking.findById(id)
      .populate('staff', 'name phone image')
      .populate('paymentId', 'status amount');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update status
    booking.status = status;
    await booking.save();

    // Send notification email if completed or cancelled
    const userEmail = booking.userEmail;
    const userName = booking.userName || 'User';
    const serviceName = booking.serviceName || 'Service';
    const date = booking.date;
    const timeSlot = booking.timeSlot;

    if (userEmail) {
      if (status === 'completed') {
        await sendCompletionEmail(userEmail, userName, serviceName, date, timeSlot);
      } else if (status === 'cancelled') {
        await sendCancellationEmail(userEmail, userName, serviceName, date, timeSlot);
      }
    }

    res.status(200).json({
      message: 'Booking status updated successfully',
      updatedBooking: {
        id: booking._id,
        service: booking.service,
        user: booking.user,
        staff: {
          name: booking.staff?.name || 'Not Assigned',
          phone: booking.staff?.phone || 'Not Available',
          image: booking.staff?.image || '',
        },
        date,
        timeSlot,
        status,
        payment: {
          status: booking.paymentId?.status || 'Not Paid',
          amount: booking.paymentId?.amount || 0,
        },
        paymentStatus: booking.paymentStatus || 'initiated',
      },
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await Booking.deleteOne({ _id: id });
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};