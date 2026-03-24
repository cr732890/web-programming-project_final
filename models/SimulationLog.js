const mongoose = require('mongoose');

const simulationLogSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  labId:     { type: String, required: true },
  inputs:    { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  result:    { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  sessionId: { type: String, default: '' },
}, { timestamps: true });

simulationLogSchema.index({ labId: 1, createdAt: -1 });

module.exports = mongoose.model('SimulationLog', simulationLogSchema);
