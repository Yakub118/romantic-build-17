/**
 * Compresses images to reduce storage usage while maintaining good visual quality
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
  format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const defaultOptions: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  maxSizeMB: 1,
  format: 'image/jpeg'
};

/**
 * Compresses an image file
 */
export const compressImage = async (
  file: File, 
  options: CompressionOptions = {}
): Promise<File> => {
  const opts = { ...defaultOptions, ...options };
  
  // If file is already small enough, return as is
  if (file.size <= opts.maxSizeMB * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = opts.maxWidth;
            height = width / aspectRatio;
          } else {
            height = opts.maxHeight;
            width = height * aspectRatio;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx!.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, '') + (opts.format === 'image/jpeg' ? '.jpg' : '.webp'),
              { 
                type: opts.format,
                lastModified: Date.now()
              }
            );

            // If still too large, try with lower quality
            if (compressedFile.size > opts.maxSizeMB * 1024 * 1024 && opts.quality > 0.3) {
              const lowerQualityOptions = { ...opts, quality: opts.quality * 0.7 };
              compressImage(file, lowerQualityOptions).then(resolve).catch(reject);
              return;
            }

            resolve(compressedFile);
          },
          opts.format,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Compresses multiple images
 */
export const compressImages = async (
  files: File[], 
  options: CompressionOptions = {}
): Promise<File[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Gets the size of an image file in MB
 */
export const getImageSizeMB = (file: File): number => {
  return file.size / (1024 * 1024);
};

/**
 * Checks if an image needs compression
 */
export const needsCompression = (file: File, maxSizeMB: number = 1): boolean => {
  return getImageSizeMB(file) > maxSizeMB;
};

/**
 * Creates a preview URL for an image file
 */
export const createImagePreview = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Cleans up a preview URL created with createImagePreview
 */
export const revokeImagePreview = (url: string): void => {
  URL.revokeObjectURL(url);
};