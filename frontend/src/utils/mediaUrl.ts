// Create a new file: utils/mediaUrl.ts
export const normalizeMediaUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // Already a full URL
  if (url.startsWith('http')) return url;
  
  // Django media URL pattern
  if (url.startsWith('/media/')) {
    return `https://dhospitalback.onrender.com${url}`;
  }
  
  // Just a filename
  if (url.includes('.')) {
    return `https://dhospitalback.onrender.com/media/${url}`;
  }
  
  return null;
};
