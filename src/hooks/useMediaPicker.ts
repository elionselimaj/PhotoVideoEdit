import { useState } from 'react';
import { Alert } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { createThumbnail } from 'react-native-create-thumbnail';
import { CapturedMedia, MediaFile } from '@/types';
import usePermissions from '@/hooks/usePermissions';

interface MediaPickerState {
  mediaFile: MediaFile | null;
  isLoading: boolean;
  isCameraActive: boolean;
  pickFromGallery: () => Promise<void>;
  openCamera: () => Promise<void>;
  closeCamera: () => void;
  onMediaCaptured: (capturedMedia: CapturedMedia) => void;
  resetMedia: () => void;
}

export const useMediaPicker = (): MediaPickerState => {
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const { allPermissionsGranted, requestPermissions } = usePermissions();

  const checkPermissions = async (): Promise<boolean> => {
    if (!allPermissionsGranted) {
      const granted = await requestPermissions();
      return !!granted;
    }
    return true;
  };

  const generateThumbnail = async (
    videoUri: string,
  ): Promise<string | undefined> => {
    try {
      const { path } = await createThumbnail({
        url: videoUri,
        timeStamp: 1000,
      });
      return path;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      return undefined;
    }
  };

  const processPickedMedia = async (
    uri: string,
    mediaType: 'image' | 'video',
    fileName?: string,
    fileSize?: number,
  ): Promise<void> => {
    setIsLoading(true);
    try {
      let thumbnailUri: string | undefined;

      if (mediaType === 'video') {
        thumbnailUri = await generateThumbnail(uri);
      }

      setMediaFile({
        uri,
        type: mediaType,
        name: fileName || `${mediaType}-${Date.now()}`,
        size: fileSize,
        thumbnailUri,
      });
    } catch (error) {
      console.error('Error processing picked media:', error);
      Alert.alert('Error', 'Failed to process selected media');
    } finally {
      setIsLoading(false);
    }
  };

  const pickFromGallery = async (): Promise<void> => {
    const permissionsGranted = await checkPermissions();
    if (!permissionsGranted) {
      Alert.alert(
        'Permission Required',
        'Media access permissions are required',
      );
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        quality: 1,
        selectionLimit: 1,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await processPickedMedia(
          asset.uri || '',
          asset.type?.startsWith('video/') ? 'video' : 'image',
          asset.fileName,
          asset.fileSize,
        );
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to select media from gallery');
    }
  };

  const openCamera = async (): Promise<void> => {
    const permissionsGranted = await checkPermissions();
    if (!permissionsGranted) {
      Alert.alert('Permission Required', 'Camera permissions are required');
      return;
    }

    try {
      // Use react-native-image-picker's launchCamera instead of vision-camera
      const result = await launchCamera({
        mediaType: 'photo', // We're focusing on images only
        quality: 1,
        saveToPhotos: false,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await processPickedMedia(
          asset.uri || '',
          'image', // For now, we're only handling images
          asset.fileName,
          asset.fileSize,
        );
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const closeCamera = (): void => {
    setIsCameraActive(false);
  };

  const onMediaCaptured = (capturedMedia: CapturedMedia): void => {
    processPickedMedia(
      capturedMedia.uri,
      capturedMedia.type,
      `${capturedMedia.type}-${Date.now()}`,
      capturedMedia.size,
    );

    setIsCameraActive(false);
  };

  const resetMedia = (): void => {
    setMediaFile(null);
  };

  return {
    mediaFile,
    isLoading,
    isCameraActive,
    pickFromGallery,
    openCamera,
    closeCamera,
    onMediaCaptured,
    resetMedia,
  };
};

export default useMediaPicker;
