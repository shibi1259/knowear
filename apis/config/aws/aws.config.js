// config/awsConfig.js
const { S3Client } = require('@aws-sdk/client-s3');

// Configure AWS with environment variables
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

module.exports = {
  s3: s3Client,
  bucketName: process.env.AWS_S3BUCKET_NAME,
};