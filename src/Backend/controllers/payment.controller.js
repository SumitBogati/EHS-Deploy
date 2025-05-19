const Payment = require('../models/payment.model');
const Booking = require('../models/booking.model');
const Service = require('../models/service.model');
const User = require('../models/user.model');
const Staff = require('../models/staff.model');
const axios = require('axios');

exports.initiatePayment = async (req, res) => {
    try {
      const { serviceId, userId, date, timeSlot } = req.body;
      
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
  
      // Check if time slot is available
      const existingBooking = await Booking.findOne({
        service: serviceId,
        date,
        timeSlot,
        status: { $in: ['pending', 'confirmed', 'inprogress'] }
      });
  
      if (existingBooking) {
        return res.status(400).json({
          error: 'This time slot is already booked'
        });
      }
  
      // Create payment record
      const payment = new Payment({
        service: serviceId,
        user: userId,
        amount: service.price,
        date,
        timeSlot,
        status: 'initiated'
      });
      await payment.save();
  
      // Prepare Khalti payment initiation payload
      const payload = {
        return_url: `${process.env.FRONTEND_URL}/api/payment/verify`,
        website_url: process.env.FRONTEND_URL,
        amount: service.price * 100, // Convert to paisa
        purchase_order_id: payment._id.toString(),
        purchase_order_name: `Booking for ${service.name}`,
        customer_info: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        }
      };
      
      // Initiate payment with Khalti
      const response = await axios.post(
        'https://dev.khalti.com/api/v2/epayment/initiate/', 
        payload,
        {
          headers: {
            'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      // Save pidx in payment record
      payment.pidx = response.data.pidx;
      await payment.save();
  
      res.json({
        payment_url: response.data.payment_url,
        pidx: response.data.pidx
      });
  
    } catch (error) {
      console.error('Payment initiation error:', error);
      res.status(500).json({ error: 'Payment initiation failed' });
    }
  };  

exports.handleKhaltiCallback = async (req, res) => {
  try {
    const { pidx, status, transaction_id } = req.query;

    console.log('Received Khalti Callback:', { pidx, status, transaction_id });

    if (!pidx) {
      return res.status(400).json({ error: 'Invalid request. Missing pidx.' });
    }

    // Find the payment record using pidx
    const payment = await Payment.findOne({ pidx });
    if (!payment) {
      console.error('Payment record not found for pidx:', pidx);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify with Khalti
    try {
      const verificationResponse = await axios.post(
        'https://dev.khalti.com/api/v2/epayment/lookup/',
        { pidx },
        {
          headers: {
            'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Khalti Verification Response:', verificationResponse.data);

      let frontendRedirectURL = `http://localhost:5000/src/Frontend/User/serviceDetail.html?id=${payment.service}`;

      // Normalize status check
      if (status && status.toLowerCase() === 'completed') {
        console.log('Payment successfully verified for:', payment.user);

        // Update payment status
        payment.status = 'completed';
        payment.khaltiTransactionId = transaction_id;
        await payment.save();

        // Fetch related data
        const service = await Service.findById(payment.service);
        const user = await User.findById(payment.user);

        if (!service || !user) {
          console.error('Service or user not found for booking creation.');
          return res.status(400).json({ error: 'Service or User not found' });
        }

        // Use the staffId from the payment record, ensuring that the originally selected staff is used
        const staff = await Staff.findById(payment.staff);
        if (!staff) {
          console.error('Staff not found for the booking:', payment.staff);
          return res.status(400).json({ error: 'Staff not found' });
        }

        // Create the booking with the selected staff
        const booking = new Booking({
          service: payment.service,
          user: payment.user,
          serviceName: service.name,
          userName: `${user.firstName} ${user.lastName}`,
          userEmail: user.email,
          price: payment.amount,
          date: payment.date,
          timeSlot: payment.timeSlot,
          status: 'pending',
          paymentId: payment._id,
          paymentStatus: 'completed',
          staffCategory: staff.category,
          staff: staff._id,  // Use the original staff ID from the payment
          staffName: staff.name,  // Use the original staff's name
        });

        await booking.save();

        console.log('Booking successfully created:', booking._id);

        // Redirect user to frontend success page
        return res.redirect(
          `${frontendRedirectURL}&payment=success&serviceName=${encodeURIComponent(service.name)}&date=${encodeURIComponent(payment.date)}&timeSlot=${encodeURIComponent(payment.timeSlot)}`
        );
      } else {
        console.log('Payment verification failed. Status:', status);

        // Update payment as failed
        payment.status = 'failed';
        await payment.save();

        // Redirect user to failure page
        return res.redirect(`${frontendRedirectURL}&payment=failed`);
      }
    } catch (error) {
      console.error('Khalti verification error:', error.response?.data || error.message);
      return res.status(500).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('service user', 'name');
    res.json(payments);
  } catch (error) {
    console.error('Error getting all payments:', error);
    res.status(500).json({ error: 'Error fetching payments' });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Error getting payment by ID:', error);
    res.status(500).json({ error: 'Error fetching payment' });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find the payment by ID
    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if the related booking is completed
    const relatedBooking = await Booking.findOne({ paymentId: payment._id });
    if (relatedBooking && relatedBooking.status === 'completed') {
      return res.status(400).json({
        error: 'Cannot update payment status. The related booking is already completed.',
      });
    }

    // Update the payment status
    payment.status = status;
    await payment.save();

    // Update the booking status
    await Booking.updateMany(
      { paymentId: payment._id },
      { $set: { paymentStatus: status } }
    );

    // Respond with the updated payment details
    res.status(200).json({
      message: 'Payment status updated successfully',
      updatedPayment: payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Error deleting payment' });
  }
};