import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import ImagePicker from 'react-native-image-crop-picker';
import { CropDimensions, ProcessingStats } from '@/types';
import { formatFileSize, calculateReduction } from '@/utils';

interface ImageProcessingOptions {
  compressionQuality: number;
  cropDimensions?: CropDimensions;
  enableCrop: boolean;
  format?: 'JPEG' | 'PNG' | 'WEBP';
}

/**
 * Process image with compression and optional cropping
 * @param uri - Original image URI
 * @param options - Processing options
 * @returns Processed image URI and statistics
 */
export const processImage = async (
  uri: string,
  options: ImageProcessingOptions,
): Promise<{ processedUri: string; stats: ProcessingStats }> => {
  try {
    // Get original file info
    const fileInfo = await RNFS.stat(uri);
    const originalSize = parseInt(fileInfo.size.toString()) || 0;

    let processedUri = uri;

    // Handle cropping if enabled and ImagePicker is available
    if (
      options.enableCrop &&
      options.cropDimensions &&
      options.cropDimensions.width > 0 &&
      options.cropDimensions.height > 0 &&
      ImagePicker
    ) {
      try {
        // Use ImagePicker for cropping
        const croppedImage = await ImagePicker.openCropper({
          mediaType: 'photo',
          path: uri,
          width: options.cropDimensions.width,
          height: options.cropDimensions.height,
          // cropOffsetX: options.cropDimensions.x || 0,
          // cropOffsetY: options.cropDimensions.y || 0,
        });

        processedUri = croppedImage.path;
      } catch (cropError) {
        console.error('Error during cropping:', cropError);
        // Continue with the original image if cropping fails
      }
    }

    // Determine format
    const format = options.format || 'JPEG';
    const outputFormat =
      format === 'PNG' ? 'PNG' : format === 'WEBP' ? 'WEBP' : 'JPEG';

    // Use default dimensions - no need to try to get them from ImagePicker
    // since that's causing issues
    const imageWidth = 1024; // default width
    const imageHeight = 1024; // default height

    // Compress the image
    const resizedImage = await ImageResizer.createResizedImage(
      processedUri,
      imageWidth,
      imageHeight,
      outputFormat,
      Math.floor(options.compressionQuality * 100), // Convert 0-1 to 0-100
      0, // rotation
      null, // outputPath (null = temp directory)
      false, // keepMeta
      { onlyScaleDown: true },
    );

    // If we created an intermediate file, clean it up
    if (processedUri !== uri) {
      try {
        await RNFS.unlink(processedUri);
      } catch (err) {
        console.warn('Could not delete intermediate file:', err);
      }
    }

    // Get processed file info
    const processedFileInfo = await RNFS.stat(resizedImage.uri);
    const newSize = parseInt(processedFileInfo.size.toString()) || 0;

    // Calculate stats
    const stats: ProcessingStats = {
      originalSize: formatFileSize(originalSize),
      newSize: formatFileSize(newSize),
      percentageReduction: calculateReduction(originalSize, newSize),
    };

    return {
      processedUri: resizedImage.uri,
      stats,
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Resize an image to specific dimensions while maintaining aspect ratio
 * @param uri - Image URI
 * @param maxWidth - Maximum width
 * @param maxHeight - Maximum height
 * @returns Resized image URI
 */
export const resizeImage = async (
  uri: string,
  maxWidth: number,
  maxHeight: number,
): Promise<string> => {
  try {
    const result = await ImageResizer.createResizedImage(
      uri,
      maxWidth,
      maxHeight,
      'JPEG',
      100, // quality
      0, // rotation
      null, // outputPath (null = temp directory)
      false, // keepMeta
      { mode: 'contain' },
    );

    return result.uri;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw new Error('Failed to resize image');
  }
};

/**
 * Convert any image to JPEG format
 * @param uri - Original image URI
 * @param quality - JPEG quality (0-1)
 * @returns JPEG image URI
 */
export const convertToJpeg = async (
  uri: string,
  quality: number = 0.9,
): Promise<string> => {
  try {
    // Use default dimensions instead of trying to get them from ImagePicker
    const width = 1024;
    const height = 1024;

    const result = await ImageResizer.createResizedImage(
      uri,
      width,
      height,
      'JPEG',
      Math.floor(quality * 100), // Convert 0-1 to 0-100
      0, // rotation
      null, // outputPath (null = temp directory)
      false, // keepMeta
    );

    return result.uri;
  } catch (error) {
    console.error('Error converting to JPEG:', error);
    throw new Error('Failed to convert image to JPEG');
  }
};

/**
 * Generate a thumbnail from an image
 * @param uri - Image URI
 * @param size - Thumbnail size (width and height)
 * @returns Thumbnail URI
 */
export const generateImageThumbnail = async (
  uri: string,
  size: number = 200,
): Promise<string> => {
  try {
    const result = await ImageResizer.createResizedImage(
      uri,
      size,
      size,
      'JPEG',
      70, // quality
      0, // rotation
      null, // outputPath (null = temp directory)
      false, // keepMeta
      { mode: 'cover' },
    );

    return result.uri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

/**
 * Alternative implementation for image cropping using react-native-image-crop-picker
 * This might be useful if react-native-image-manipulator doesn't support all your needs
 * @param uri - Image URI
 * @param options - Processing options
 * @returns Processed image information
 */
export const cropWithImagePicker = async (
  uri: string,
  options: {
    width: number;
    height: number;
    x?: number;
    y?: number;
    quality?: number;
  },
): Promise<unknown> => {
  try {
    // Check if ImagePicker is available
    if (!ImagePicker) {
      throw new Error('ImagePicker is not available');
    }

    // Extract the file path from URI
    // This handles both file:// URIs and content:// URIs
    const path = uri.replace('file://', '').replace('content://', '');

    // Open and crop the image
    const result = await ImagePicker.openCropper({
      mediaType: 'photo',
      path,
      width: options.width,
      height: options.height,
      // cropOffsetX: options.x || 0,
      // cropOffsetY: options.y || 0,
      compressImageQuality: options.quality || 0.8,
    });

    return result;
  } catch (error) {
    console.error('Error cropping with image picker:', error);
    throw new Error('Failed to crop image with image picker');
  }
};
