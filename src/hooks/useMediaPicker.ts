import { useState } from 'react';
import { Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { createThumbnail } from 'react-native-create-thumbnail';
import { Camera } from 'react-native-vision-camera';
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
      if (!granted) return;
    }
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
    await checkPermissions();

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
    await checkPermissions();

    const cameraPermission = await Camera.getCameraPermissionStatus();
    const microphonePermission = await Camera.getMicrophonePermissionStatus();

    if (cameraPermission !== 'granted') {
      const newCameraPermission = await Camera.requestCameraPermission();
      if (newCameraPermission !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to capture media',
        );
        return;
      }
    }

    if (microphonePermission !== 'granted') {
      const newMicrophonePermission =
        await Camera.requestMicrophonePermission();
      if (newMicrophonePermission !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record video',
        );
        return;
      }
    }

    setIsCameraActive(true);
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
