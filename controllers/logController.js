// controllers/logController.js
const Log = require("../models/Log");

// GET /api/logs
exports.getLogs = async (req, res) => {
  try {
    const {
      level,
      model,
      action,
      actorType,
      actorId,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (level) query.level = level;
    if (model) query.model = model;
    if (action) query.action = action;
    if (actorType) query.actorType = actorType;
    if (actorId) query.actorId = actorId;

    if (search) {
      query.message = { $regex: search, $options: "i" };
    }

    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Log.countDocuments(query);

    res.json({ total, page: Number(page), limit: Number(limit), logs });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch logs", details: err.message });
  }
};

// GET /api/logs/:id
exports.getLogById = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id);
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to get log", details: err.message });
  }
};

// DELETE /api/logs/:id
exports.deleteLog = async (req, res) => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ error: "Log not found" });
    res.json({ message: "Log deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete log", details: err.message });
  }
};

// DELETE /api/logs?olderThan=30
exports.deleteOldLogs = async (req, res) => {
  try {
    const days = parseInt(req.query.olderThan || "30");
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const result = await Log.deleteMany({ createdAt: { $lt: cutoff } });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete old logs", details: err.message });
  }
};
