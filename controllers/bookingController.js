/*** import mudels ***/
const logger = require('../config/logger');

/*** import models ***/
const Booking = require('../models/booking');
const Vehicle = require('../models/vehicle');
const Driver = require('../models/driver');
const User = require('../models/user');

// @desc    View bookings page
// @route   GET /u/bookings
// @access  Private
const viewBooking = async (req, res) => {
  return res.render('approver/booking', {
    title: 'Kelola Pesanan Kendaraan'
  });
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  const bookings = await Booking.find({}).populate('vehicle').populate('user').populate('approvers');
  return res.json(bookings);
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('vehicle').populate('user').populate('approvers');

  if (booking) {
    return res.json(booking);
  } else {
    return res.status(403).json({ msg: 'Booking not found!' });
  }
};

// Tambahkan fungsi helper
function isWorkingHours(date) {
  const hours = date.getHours();
  return hours >= 8 && hours < 17;
}

// Tambahkan fungsi helper setelah isWorkingHours
function isValidBookingDate(startDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const bookingDate = new Date(startDate);
  bookingDate.setHours(0, 0, 0, 0);
  
  // Hitung selisih hari
  const diffTime = bookingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 1;
}

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { vehicleId, driverId, time, approvers, fuelNeeds } = req.body;

  if (!vehicleId || !driverId || !time || !approvers || !fuelNeeds) {
    return res.status(403).json({ msg: 'Please provide all required fields!' });
  }

  const startDate = time.split(' to ')[0];
  const endDate = time.split(' to ')[1];

  // Validasi tanggal pemesanan
  if (!isValidBookingDate(startDate)) {
    return res.status(403).json({ 
      msg: 'Pemesanan harus dilakukan minimal 1 hari sebelumnya' 
    });
  }

  // Validasi jam kerja
  const currentTime = new Date();
  if (!isWorkingHours(currentTime)) {
    return res.status(403).json({ 
      msg: 'Pemesanan hanya dapat dilakukan pada jam kerja (08:00 - 17:00)' 
    });
  }

  const vehicleExists = await Vehicle.findById(vehicleId);
  const driverExists = await Driver.findById(driverId);
  const approversExist = await User.find({ _id: { $in: approvers } });

  if (!vehicleExists || !driverExists || approversExist.length !== approvers.length) {
    return res.status(403).json({ msg: 'Invalid vehicle, driver, or approvers!' });
  }

  const booking = new Booking({
    vehicle: vehicleId,
    driver: driverId,
    user: req.auth._id,
    startDate,
    endDate,
    approvers,
    fuelNeeds
  });

  logger.info(`${req.auth.username} booked ${vehicleExists.name}`);
  const createdBooking = await booking.save();
  return res.status(201).json({ msg: 'Created booking', data: createdBooking });
};

// @desc    Approve booking
// @route   POST /api/bookings/:id/approve
// @access  Private
const approveBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(403).json({ msg: 'Booking not found!' });
  }

  if (booking.currentApproverIndex >= booking.approvers.length || !booking.approvers[booking.currentApproverIndex].equals(req.auth._id)) {
    return res.status(403).json({ msg: 'Not authorized to approve this booking!' });
  }

  if (booking.currentApproverIndex === booking.approvers.length - 1) {
    booking.status = 'approved';
  } else {
    booking.currentApproverIndex += 1;
  }

  await booking.save();
  logger.info(`${req.auth.username} approve booking from ${booking.user.username}`);
  return res.json({ msg: 'Booking approved' });
};

// @desc    Reject booking
// @route   POST /api/bookings/:id/reject
// @access  Private
const rejectBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(403).json({ msg: 'Booking not found!' });
  }

  if (booking.currentApproverIndex >= booking.approvers.length || !booking.approvers[booking.currentApproverIndex].equals(req.auth._id)) {
    return res.status(403).json({ msg: 'Not authorized to reject this booking!' });
  }
  
  booking.status = 'rejected';
  await booking.save();
  
  logger.info(`${req.auth.username} rejected booking from ${booking.user.username}`);
  return res.json({ msg: 'Booking rejected' });
};

module.exports = {
  viewBooking,
  getBookings,
  getBookingById,
  createBooking,
  approveBooking,
  rejectBooking
};
