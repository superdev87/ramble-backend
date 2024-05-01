const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
    region: process.env.AWS_REGION
  });
  
const s3 = new AWS.S3();

module.exports = s3;