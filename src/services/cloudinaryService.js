const crypto = require('crypto');
require('dotenv').config();

exports.generarFirmaConParametros = (uploadPreset, folder) => {
  const timestamp = Math.round(Date.now() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}&upload_preset=${uploadPreset}`;

  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset,
    folder,
  };
};
