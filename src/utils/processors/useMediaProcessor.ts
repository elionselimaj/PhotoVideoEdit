import { useState } from 'react';
import { Alert } from 'react-native';

import { MediaFile, ProcessedMedia } from '@/types';
import { processMediaImage, saveToGallery } from '@/utils';

// Updated type to focus only on image processing
export interface ProcessingOptions {
  compressionQuality: number;
  enableCrop: boolean;
  cropDimensions: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };
}

interface MediaProcessorState {
  isProcessing: boolean;
  processedMedia: ProcessedMedia | null;
  processingOptions: ProcessingOptions;
  setCompressionQuality: (quality: number) => void;
  setCropDimensions: (dimensions: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  }) => void;
  toggleCropMode: () => void;
  processMedia: (mediaFile: MediaFile) => Promise<void>;
  saveToGallery: () => Promise<boolean>;
  reset: () => void;
}

export const useMediaProcessor = (): MediaProcessorState => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedMedia, setProcessedMedia] = useState<ProcessedMedia | null>(
    null,
  );
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>(
    {
      compressionQuality: 0.7,
      enableCrop: false,
      cropDimensions: { offsetX: 0, offsetY: 0, width: 0, height: 0 },
    },
  );

  // Update compression quality
  const setCompressionQuality = (quality: number): void => {
    setProcessingOptions(prev => ({
      ...prev,
      compressionQuality: quality,
    }));
  };

  // Set crop dimensions
  const setCropDimensions = (dimensions: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  }): void => {
    setProcessingOptions(prev => ({
      ...prev,
      cropDimensions: dimensions,
    }));
  };

  // Toggle crop mode
  const toggleCropMode = (): void => {
    setProcessingOptions(prev => ({
      ...prev,
      enableCrop: !prev.enableCrop,
    }));
  };

  // Process media (image only now)
  const processMedia = async (mediaFile: MediaFile): Promise<void> => {
    if (!mediaFile || !mediaFile.uri) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    // Ensure we're only handling images
    if (mediaFile.type !== 'image') {
      Alert.alert('Error', 'Currently only image processing is supported');
      return;
    }

    setIsProcessing(true);

    try {
      // Process the image
      const cropData = processingOptions.enableCrop
        ? processingOptions.cropDimensions
        : undefined;

      const result = await processMediaImage(
        mediaFile.uri,
        processingOptions.compressionQuality,
        cropData,
      );

      // Set processed media
      setProcessedMedia({
        originalUri: mediaFile.uri,
        processedUri: result.processedUri,
        stats: result.stats,
        type: 'image',
      });
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save processed media to gallery
  const saveToGalleryHandler = async (): Promise<boolean> => {
    if (!processedMedia || !processedMedia.processedUri) {
      Alert.alert('Error', 'No processed image to save');
      return false;
    }

    const success = await saveToGallery(
      processedMedia.processedUri,
      'photo',
      'MediaProcessor',
    );

    if (success) {
      Alert.alert('Success', 'Image saved to gallery');
    }

    return success;
  };

  // Reset processed media and options
  const reset = (): void => {
    setProcessedMedia(null);
    setProcessingOptions({
      compressionQuality: 0.7,
      enableCrop: false,
      cropDimensions: { offsetX: 0, offsetY: 0, width: 0, height: 0 },
    });
  };

  return {
    isProcessing,
    processedMedia,
    processingOptions,
    setCompressionQuality,
    setCropDimensions,
    toggleCropMode,
    processMedia,
    saveToGallery: saveToGalleryHandler,
    reset,
  };
};

export default useMediaProcessor;
