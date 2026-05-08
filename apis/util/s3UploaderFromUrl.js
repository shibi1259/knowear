const { Upload } = require('@aws-sdk/lib-storage');
const { S3Client } = require('@aws-sdk/client-s3');
const request = require('request');
const { PassThrough } = require('stream');
require("dotenv").config();
let AWS_S3BUCKET_BASE_URL = process.env.BASE_URL;

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
})

async function uploadImageToS3WithUrl(imageUrl, fileName, options = {}) {
  try {
    if (!isValidUrl(imageUrl)) {
      console.error('Invalid image URL');
      return false;
    }

    if (!AWS_S3BUCKET_BASE_URL) {
      return false
    }

    const passThrough = new PassThrough();
    const uploadParams = {
      Bucket: process.env.AWS_S3BUCKET_NAME,
      Key: fileName,
      Body: passThrough,
      ContentDisposition: 'inline',
      ContentType: 'image/jpeg',
      ...options, // Merge additional upload options
    };

    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    // Track upload progress
    upload.on('httpUploadProgress', (progress) => {
      console.log(`Upload progress: ${progress.loaded} / ${progress.total}`);
    });


    request.get(imageUrl)
      .on('error', (requestError) => {
        console.error('Error fetching image:', requestError);
        return false;
      }).pipe(passThrough);

    try {
      let data = await upload.done();
      const location = data.Location;
      const path = location.replace(AWS_S3BUCKET_BASE_URL, '');
      return { value: true, path };
    } catch (uploadError) {
      console.error('Error uploading image to S3:', uploadError);
    }
  } catch (error) {
    console.error('Error processing image upload:', error);
    return false;
  }
}

// Helper function to validate URL format
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = { uploadImageToS3WithUrl };