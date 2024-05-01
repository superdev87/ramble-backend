const Attendance = require('../../models/attendances'); // Replace with your actual path to the Attendance model

exports.all = async (req, res) => {
  try {
    let { page = 0, limit = 10, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Build the query
    const query = {};
    if (search) {
      query.em_email = { $regex: search, $options: 'i' }; // Case-insensitive regex search
    }

    const attendances = await Attendance.find(query)
      .skip((page) * limit)
      .limit(limit);

    const total = await Attendance.countDocuments(query);

    res.json({ total, attendances });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.recordAttendance = async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json({ message: 'Attendance recorded successfully', attendance });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }
    res.status(200).json({ message: 'Attendance updated successfully', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' });
    }
    res.status(200).json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.searchAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      em_email: req.body.em_email,
      vl_latitude: req.body.vl_latitude,
      vl_longitude: req.body.vl_longitude
    })

    console.log(attendance);

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}