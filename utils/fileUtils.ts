
export const fileToBase64 = (file: File): Promise<{ base64: string; previewUrl: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, previewUrl: result });
    };
    reader.onerror = (error) => reject(error);
  });
};
