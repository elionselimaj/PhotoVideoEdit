import { useState } from 'react';
import { Alert } from 'react-native';

import {
  MediaFile,
  ProcessingOptions,
  ProcessingStats,
  ProcessedMedia,
  CropDimensions,
} from '@/types';
import { processMediaImage, saveToGallery } from '@/utils';

interface MediaProcessorState {
  isProcessing: boolean;
  processedMedia: ProcessedMedia | null;
  processingOptions: ProcessingOptions;
  setCompressionQuality: (quality: number) => void;
  setCropDimensions: (dimensions: CropDimensions) => void;
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

  const setCompressionQuality = (quality: number): void => {
    setProcessingOptions(prev => ({
      ...prev,
      compressionQuality: quality,
    }));
  };

  const setCropDimensions = (dimensions: CropDimensions): void => {
    setProcessingOptions(prev => ({
      ...prev,
      cropDimensions: dimensions,
    }));
  };

  const toggleCropMode = (): void => {
    setProcessingOptions(prev => ({
      ...prev,
      enableCrop: !prev.enableCrop,
    }));
  };

  const processMedia = async (mediaFile: MediaFile): Promise<void> => {
    if (!mediaFile || !mediaFile.uri) {
      Alert.alert('Error', 'Please select media first');
      return;
    }

    setIsProcessing(true);

    try {
      let processedUri: string;
      let stats: ProcessingStats;

      if (mediaFile.type === 'image') {
        const result = await processMediaImage(
          mediaFile.uri,
          processingOptions,
        );
        processedUri = result.processedUri;
        stats = result.stats;
      } else if (mediaFile.type === 'video') {
        // const result = await processVideo(mediaFile.uri, processingOptions);
        // processedUri = result.processedUri;
        // stats = result.stats;
      } else {
        throw new Error('Unsupported media type');
      }

      setProcessedMedia({
        originalUri: mediaFile.uri,
        processedUri,
        stats,
        type: mediaFile.type,
      });
    } catch (error) {
      console.error('Error processing media:', error);
      Alert.alert('Error', 'Failed to process media');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToGalleryHandler = async (): Promise<boolean> => {
    if (!processedMedia || !processedMedia.processedUri) {
      Alert.alert('Error', 'No processed media to save');
      return false;
    }

    const mediaType = processedMedia.type === 'image' ? 'Photos' : 'Videos';
    const success = await saveToGallery(
      processedMedia.processedUri,
      mediaType,
      'MediaProcessor',
    );

    if (success) {
      Alert.alert('Success', 'Media saved to gallery');
    }

    return success;
  };

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
