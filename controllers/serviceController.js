const Service = require('../models/service');
const Vehicle = require('../models/vehicle');
const logger = require('../config/logger');

// View service page
const viewService = async (req, res) => {
  return res.render('approver/service', {
    title: 'Kelola Service'
  });
};

// Get all services
const getServices = async (req, res) => {
  try {
    const services = await Service.find()
      .populate('vehicle')
      .sort('-createdAt');
    return res.json(services);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// Create new service
// Create new service
const createService = async (req, res) => {
  try {
    const { vehicleId } = req.body;
    
    // Create service record with default dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Default 7 hari service
    
    const service = await Service.create({
      vehicle: vehicleId,
      startDate,
      endDate,
      description: 'Pemeliharaan rutin'
    });

    // Update vehicle status to maintenance
    await Vehicle.findByIdAndUpdate(vehicleId, { status: 'maintenance' });

    logger.info(`Service created for vehicle ${vehicleId}`);
    
    return res.status(201).json({
      msg: 'Service berhasil ditambahkan',
      data: service
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// Complete service
const completeService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ msg: 'Service tidak ditemukan' });
    }

    service.status = 'completed';
    await service.save();

    // Update vehicle status back to available
    await Vehicle.findByIdAndUpdate(service.vehicle, { status: 'available' });

    logger.info(`Service ${req.params.id} marked as completed`);

    return res.json({
      msg: 'Service telah selesai',
      data: service
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .select('name licensePlate status')
      .sort('name');
    return res.json(vehicles);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

module.exports = {
  viewService,
  getServices,
  createService,
  completeService,
  getVehicles
}; 