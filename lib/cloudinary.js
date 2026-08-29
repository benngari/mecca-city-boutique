import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Uploads a base64 data URI (or remote URL) to Cloudinary and returns { url, publicId }
export async function uploadImage(fileDataUri) {
  const result = await cloudinary.uploader.upload(fileDataUri, {
    folder: 'mecca-city-boutique/products',
    resource_type: 'image',
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
