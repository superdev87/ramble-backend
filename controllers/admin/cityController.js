const City = require('../../models/cities'); // Replace with your actual path to the City model
const s3 = require('../s3Controller'); // Replace with your

exports.all = async (req, res) => {
  try {
    let { page = 0, limit = 10, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Build the query
    let query = {};
    if (search) {
      query = {$or: [{nm_name: { $regex: search, $options: 'i' }}]}; // Case-insensitive regex search
    }

    const cities = await City.find(query)
      .skip((page) * limit)
      .limit(limit);

    const total = await City.countDocuments(query);

    res.json({ total, cities });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message });
  }
};

exports.createCity = async (req, res) => {
  try {
    const city = new City(req.body);
    await city.save();
    res.status(201).json({ message: 'City created successfully', city });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(200).json(city);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updateCity = async (req, res) => {
  try {
    const existingCity = await City.findById(req.params.id);
    if (!existingCity) {
      return res.status(404).json({ message: 'City not found' });
    }

    // Check if a new image is provided and is different from the existing one
    if (req.body.img_image && req.body.img_image !== existingCity.img_image) {
      // Delete the existing image from AWS S3
      const deleteParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: existingCity.img_image.split('/').pop() // Key of the existing image
      };
      s3.deleteObject(deleteParams).promise();
    }

    // Update the city in MongoDB
    const updatedCity = await City.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({ message: 'City updated successfully', updatedCity });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: existingCity.img_image.split('/').pop() // Key of the existing image
    };
    s3.deleteObject(deleteParams).promise();
    
    res.status(200).json({ message: 'City deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
