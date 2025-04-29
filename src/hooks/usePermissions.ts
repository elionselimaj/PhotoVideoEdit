import { useState, useEffect } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';

interface MediaState {
  cameraPermission: boolean;
  mediaLibraryPermission: boolean;
  allPermissionsGranted: boolean;

  requestPermissions: () => Promise<boolean>;
  takePhoto: () => Promise<Asset | null>;
  pickImage: () => Promise<Asset | null>;
  saveImageToGallery: (uri: string) => Promise<string>;
  getPhotosFromGallery: (count?: number) => Promise<
    {
      filename: string | null;
      filepath: string | null;
      extension: string | null;
      uri: string;
      height: number;
      width: number;
      fileSize: number | null;
      playableDuration: number;
      orientation: number | null;
    }[]
  >;
}

export const useMedia = (): MediaState => {
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [mediaLibraryPermission, setMediaLibraryPermission] =
    useState<boolean>(false);

  const allPermissionsGranted = cameraPermission && mediaLibraryPermission;

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const cameraPermissionType = Platform.select({
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      });

      const cameraResult = await request(cameraPermissionType!);
      const isCameraGranted = cameraResult === RESULTS.GRANTED;
      setCameraPermission(isCameraGranted);

      const mediaLibraryPermissionType = Platform.select({
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      });

      const mediaLibraryResult = await request(mediaLibraryPermissionType!);
      const isMediaLibraryGranted = mediaLibraryResult === RESULTS.GRANTED;
      setMediaLibraryPermission(isMediaLibraryGranted);

      let savePermission = true;
      if (Platform.OS === 'android') {
        const writePermissionResult = await request(
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        );
        savePermission = writePermissionResult === RESULTS.GRANTED;
      }

      const allGranted =
        isCameraGranted && isMediaLibraryGranted && savePermission;

      if (!allGranted) {
        Alert.alert(
          'Permission Required',
          'This app needs access to your camera and media library to function properly.',
          [
            { text: 'OK' },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
      }

      return allGranted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request necessary permissions');
      return false;
    }
  };

  const takePhoto = async (): Promise<Asset | null> => {
    if (!cameraPermission) {
      const granted = await requestPermissions();
      if (!granted) return null;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        console.log('User cancelled camera');
        return null;
      }

      if (result.errorCode) {
        console.log('Camera Error: ', result.errorMessage);
        return null;
      }

      return result.assets && result.assets.length > 0
        ? result.assets[0]
        : null;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  };

  const pickImage = async (): Promise<Asset | null> => {
    if (!mediaLibraryPermission) {
      const granted = await requestPermissions();
      if (!granted) return null;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return null;
      }

      if (result.errorCode) {
        console.log('ImagePicker Error: ', result.errorMessage);
        return null;
      }

      return result.assets && result.assets.length > 0
        ? result.assets[0]
        : null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  };

  const saveImageToGallery = async (uri: string): Promise<string> => {
    if (!mediaLibraryPermission) {
      const granted = await requestPermissions();
      if (!granted) throw new Error('Media library permission denied');
    }

    try {
      if (uri.startsWith('http')) {
        const fileName = uri.split('/').pop() || `image-${Date.now()}.jpg`;
        const localFilePath = `${RNFS.CachesDirectoryPath}/${fileName}`;

        await RNFS.downloadFile({
          fromUrl: uri,
          toFile: localFilePath,
        }).promise;

        const savedUri = await CameraRoll.save(localFilePath, {
          type: 'photo',
        });
        return savedUri;
      } else {
        const savedUri = await CameraRoll.save(uri, { type: 'photo' });
        return savedUri;
      }
    } catch (error) {
      console.error('Error saving image to gallery:', error);
      throw error;
    }
  };

  const getPhotosFromGallery = async (
    count: number = 20,
  ): Promise<
    {
      filename: string | null;
      filepath: string | null;
      extension: string | null;
      uri: string;
      height: number;
      width: number;
      fileSize: number | null;
      playableDuration: number;
      orientation: number | null;
    }[]
  > => {
    if (!mediaLibraryPermission) {
      const granted = await requestPermissions();
      if (!granted) return [];
    }

    try {
      const photos = await CameraRoll.getPhotos({
        first: count,
        assetType: 'Photos',
      });

      return photos.edges.map(edge => edge.node.image);
    } catch (error) {
      console.error('Error getting photos:', error);
      return [];
    }
  };

  useEffect(() => {
    (async () => {
      await requestPermissions();
    })();
  }, []);

  return {
    cameraPermission,
    mediaLibraryPermission,
    allPermissionsGranted,

    requestPermissions,
    takePhoto,
    pickImage,
    saveImageToGallery,
    getPhotosFromGallery,
  };
};

export default useMedia;
