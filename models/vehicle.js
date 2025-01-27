const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Sedan', 'MPV', 'SUV', 'Pick-up', 'Box-truck'],
      required: true
    },
    licensePlate: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'maintenance'],
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
