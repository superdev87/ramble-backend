const POI = require('../../models/pois'); // Replace with your actual path to the POI model
const City = require('../../models/cities'); // Replace with your actual path to the POI model
const s3 = require('../s3Controller'); // Replace with your

exports.all = async (req, res) => {
  try {
    let { page = 0, limit = 10, search = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Aggregation pipeline
    let pipeline = [
      {
        $lookup: {
          from: 'cities', // The name of the City collection in MongoDB, it is usually plural and lowercase
          localField: 'city', // The local field on POI schema
          foreignField: '_id', // The field from the City collection
          as: 'cityDetails' // The name of the new array field to add to the input documents
        }
      },
      {
        $unwind: '$cityDetails' // Deconstructs the cityDetails array field
      },
      {
        $match: {
          $or: [
            { 'cityDetails.nm_name': { $regex: search, $options: 'i' }},
            { nm_POI: { $regex: search, $options: 'i' }}
          ]
        }
      },
      {
        $skip: page * limit
      },
      {
        $limit: limit
      }
    ];

    const pois = await POI.aggregate(pipeline);

    // Since the aggregate doesn't directly support countDocuments, we need a separate count
    const countPipeline = [...pipeline];
    countPipeline.pop(); // Remove limit
    countPipeline.pop(); // Remove skip
    countPipeline.push({
      $count: 'total'
    });

    const totalResults = await POI.aggregate(countPipeline);
    const total = totalResults.length > 0 ? totalResults[0].total : 0;

    res.json({ total, pois });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message });
  }
};


exports.createPOI = async (req, res) => {
  try {
    const poi = new POI(req.body);
    await poi.save();
    res.status(201).json({ message: 'POI created successfully', poi });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getPOI = async (req, res) => {
  try {
    const poi = await POI.findById(req.params.id);
    if (!poi) {
      return res.status(404).json({ message: 'POI not found' });
    }
    res.status(200).json(poi);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.updatePOI = async (req, res) => {
  try {
    const existingPOI = await POI.findById(req.params.id);
    if (!existingPOI) {
      return res.status(404).json({ message: 'POI not found' });
    }

    // Check and delete existing image if a new one is provided
    if (req.body.img_image && req.body.img_image !== existingPOI.img_image) {
      const deleteImageParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: existingPOI.img_image.split('/').pop()
      };
      s3.deleteObject(deleteImageParams).promise();
    }

    // Check and delete existing audio if a new one is provided
    if (req.body.aud_audio && req.body.aud_audio !== existingPOI.aud_audio) {
      const deleteAudioParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: existingPOI.aud_audio.split('/').pop()
      };
      s3.deleteObject(deleteAudioParams).promise();
    }

    // Update the POI in MongoDB
    const updatedPOI = await POI.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({ message: 'POI updated successfully', updatedPOI });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
};


exports.deletePOI = async (req, res) => {
  try {
    const poi = await POI.findByIdAndDelete(req.params.id);
    if (!poi) {
      return res.status(404).json({ message: 'POI not found' });
    }

    const deleteImageParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: poi.img_image.split('/').pop()
    };
    s3.deleteObject(deleteImageParams).promise();

    const deleteAudioParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: poi.aud_audio.split('/').pop()
    };
    s3.deleteObject(deleteAudioParams).promise();

    res.status(200).json({ message: 'POI deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.getPOIsFromCity = async (req, res) => {
  try {
      const cityId = req.params.city_id; // or however you are getting the city ID

      // Find the city to ensure it exists
      const city = await City.findById(cityId);
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
      console.log(city)

      // Now find all POIs associated with this city
      const pois = await POI.find({ city: cityId }).populate('city', 'nm_name img_image');

      res.status(200).json(pois);
  } catch (error) {
      console.log(error)
      res.status(500).json({ message: error.message });
  }
};
