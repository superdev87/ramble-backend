const Multimedia = require('../../models/multimedias'); // Replace with your actual path to the Multimedia model
const mongoose = require('mongoose');

exports.all = async (req, res) => {
  try {
    let { page = 0, limit = 10, search = '', cityId, tp_fileType } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Build the query
    const query = {};
    // Filter by cityId if it's provided
    if (cityId && mongoose.isValidObjectId(cityId)) {
      query.city = cityId;
    }

    query.tp_fileType = tp_fileType;

    if (search) {
      query.nm_fileName = { $regex: search, $options: 'i' }; // Case-insensitive regex search
    }

    const multimedias = await Multimedia.find(query)
      .populate('city')
      .skip((page) * limit)
      .limit(limit);

    const total = await Multimedia.countDocuments(query);

    res.json({ total, multimedias });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMultimedia = async (req, res) => {
  try {
    const multimedia = new Multimedia(req.body);
    await multimedia.save();
    res.status(201).json({ message: 'Multimedia uploaded successfully', multimedia });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getMultimedia = async (req, res) => {
  try {
    const multimedia = await Multimedia.findById(req.params.id);
    if (!multimedia) {
      return res.status(404).json({ message: 'Multimedia not found' });
    }
    res.status(200).json(multimedia);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateMultimedia = async (req, res) => {
  try {
    const multimedia = await Multimedia.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!multimedia) {
      return res.status(404).json({ message: 'Multimedia not found' });
    }
    res.status(200).json({ message: 'Multimedia updated successfully', multimedia });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.deleteMultimedia = async (req, res) => {
  try {
    const multimedia = await Multimedia.findByIdAndDelete(req.params.id);
    if (!multimedia) {
      return res.status(404).json({ message: 'Multimedia not found' });
    }
    res.status(200).json({ message: 'Multimedia deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
