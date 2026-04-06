import Constants from 'expo-constants';

const CLOUD_NAME: string = Constants.expoConfig?.extra?.cloudinaryCloudName ?? '';
const UPLOAD_PRESET: string = Constants.expoConfig?.extra?.cloudinaryUploadPreset ?? '';

export async function uploadImage(localUri: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary not configured. Set cloudinaryCloudName and cloudinaryUploadPreset in app.json extra.'
    );
  }

  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as unknown as Blob);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const data = await response.json() as { secure_url: string };
  return data.secure_url;
}
