import { useState } from 'react';
import { Alert } from 'react-native';

import { MediaFile, ProcessedMedia } from '@/types';
import { processMediaImage } from '@/utils/mediaUtils';
import { processMediaVideo } from '@/utils/videoUtils';
import { saveToGallery } from '@/utils/fileUtils';

export interface ProcessingOptions {
  // Common options
  compressionQuality: number;

  // Image-specific options
  enableCrop: boolean;
  cropDimensions: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };

  // Video-specific options
  currentTime: number;
  duration: number;
}

interface MediaProcessorState {
  isProcessing: boolean;
  processedMedia: ProcessedMedia | null;
  processingOptions: ProcessingOptions;
  processingProgress: number;

  // Common methods
  setCompressionQuality: (quality: number) => void;
  processMedia: (mediaFile: MediaFile) => Promise<void>;
  saveToGallery: () => Promise<boolean>;
  reset: () => void;

  // Image-specific methods
  setCropDimensions: (dimensions: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  }) => void;
  toggleCropMode: () => void;

  // Video metadata methods
  setVideoMetadata: (currentTime: number, duration: number) => void;
}

export const useMediaProcessor = (): MediaProcessorState => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedMedia, setProcessedMedia] = useState<ProcessedMedia | null>(
    null,
  );
  const [processingProgress, setProcessingProgress] = useState<number>(0);

  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>(
    {
      // Common options
      compressionQuality: 0.7,

      // Image-specific options
      enableCrop: false,
      cropDimensions: { offsetX: 0, offsetY: 0, width: 0, height: 0 },

      // Video-specific options
      currentTime: 0,
      duration: 0,
    },
  );

  /* Update compression quality */
  const setCompressionQuality = (quality: number): void => {
    setProcessingOptions(prev => ({
      ...prev,
      compressionQuality: quality,
    }));
  };

  /* Set crop dimensions */
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

  /* Toggle crop mode */
  const toggleCropMode = (): void => {
    setProcessingOptions(prev => ({
      ...prev,
      enableCrop: !prev.enableCrop,
    }));
  };

  /* Set video metadata */
  const setVideoMetadata = (currentTime: number, duration: number): void => {
    setProcessingOptions(prev => ({
      ...prev,
      currentTime,
      duration,
    }));
  };

  /* Process media (image or video) */
  const processMedia = async (mediaFile: MediaFile): Promise<void> => {
    if (!mediaFile || !mediaFile.uri) {
      Alert.alert('Error', 'Please select media first');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Handle based on media type
      if (mediaFile.type === 'image') {
        const cropData = processingOptions.enableCrop
          ? processingOptions.cropDimensions
          : undefined;

        const result = await processMediaImage(
          mediaFile.uri,
          processingOptions.compressionQuality,
          cropData,
        );

        setProcessedMedia({
          originalUri: mediaFile.uri,
          processedUri: result.processedUri,
          stats: result.stats,
          type: 'image',
        });
      } else if (mediaFile.type === 'video') {
        // Just compress the video
        const result = await processMediaVideo(
          mediaFile.uri,
          {
            quality: processingOptions.compressionQuality,
          },
          progress => {
            setProcessingProgress(progress);
          },
        );

        setProcessedMedia({
          originalUri: mediaFile.uri,
          processedUri: result.processedUri,
          stats: result.stats,
          type: 'video',
        });
      } else {
        Alert.alert('Error', 'Unsupported media type');
      }
    } catch (error) {
      console.error('Error processing media:', error);
      Alert.alert('Error', `Failed to process ${mediaFile.type}`);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(1); // Ensure progress shows as complete
    }
  };

  const saveToGalleryHandler = async (): Promise<boolean> => {
    if (!processedMedia || !processedMedia.processedUri) {
      Alert.alert('Error', 'No processed media to save');
      return false;
    }

    try {
      const mediaType = processedMedia.type === 'image' ? 'Photos' : 'Videos';
      const success = await saveToGallery(
        processedMedia.processedUri,
        mediaType,
      );

      if (success) {
        Alert.alert(
          'Success',
          `${processedMedia.type === 'image' ? 'Image' : 'Video'} saved to gallery`,
        );
      }

      return success;
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert('Error', 'Failed to save to gallery');
      return false;
    }
  };

  /* Reset processed media and options */
  const reset = (): void => {
    setProcessedMedia(null);
    setProcessingProgress(0);
    setProcessingOptions({
      compressionQuality: 0.7,
      enableCrop: false,
      cropDimensions: { offsetX: 0, offsetY: 0, width: 0, height: 0 },
      currentTime: 0,
      duration: 0,
    });
  };

  return {
    isProcessing,
    processedMedia,
    processingOptions,
    processingProgress,
    setCompressionQuality,
    setCropDimensions,
    toggleCropMode,
    setVideoMetadata,
    processMedia,
    saveToGallery: saveToGalleryHandler,
    reset,
  };
};

export default useMediaProcessor;
