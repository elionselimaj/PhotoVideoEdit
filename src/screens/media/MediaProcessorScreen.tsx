import React, { useState, useEffect } from 'react';
import { Platform, ScrollView, Alert, Text } from 'react-native';
import styled from 'styled-components/native';
import ImageCropPicker from 'react-native-image-crop-picker';

import { Button, Column, Loader, Row, Spacer } from '@/components';
import { theme } from '@/styles';
import { useMediaPicker, useMediaProcessor } from '@/hooks';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { trimVideoUsingEditor } from '@/utils/videoUtils';

import { MediaPreview, StatsDisplay, QualitySlider } from './components';
import { MediaFile } from '@/types';

export const MediaProcessorScreen: React.FC = () => {
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [isTrimming, setIsTrimming] = useState<boolean>(false);
  const [croppedImage, setCroppedImage] = useState(null);
  const [trimmedVideo, setTrimmedVideo] = useState(null);

  const {
    mediaFile,
    isLoading: isLoadingMedia,
    pickFromGallery,
    openCamera,
    resetMedia,
  } = useMediaPicker();

  const {
    isProcessing,
    processedMedia,
    processingOptions,
    processingProgress,
    setCompressionQuality,
    setCropDimensions,
    toggleCropMode,
    processMedia,
    saveToGallery,
    reset,
  } = useMediaProcessor();

  // Set up listener for video trim events
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Only set up if on mobile
      const eventEmitter = new NativeEventEmitter(NativeModules.VideoTrim);
      const subscription = eventEmitter.addListener('VideoTrim', event => {
        console.log('VideoTrim event:', event.name);

        // Handle events
        switch (event.name) {
          case 'onStartTrimming':
            setIsTrimming(true);
            break;
          case 'onFinishTrimming':
            setIsTrimming(false);
            // Create a MediaFile from the trimmed video
            if (event.outputPath && mediaFile) {
              const trimmedFile: MediaFile = {
                uri: event.outputPath,
                type: 'video',
                name: `trimmed-${mediaFile.name || 'video'}`,
                size: 0, // Size will be determined when processing
              };
              setTrimmedVideo(trimmedFile);

              // Process the trimmed video automatically
              processMedia(trimmedFile).catch(error => {
                console.error('Error processing trimmed video:', error);
                Alert.alert('Error', 'Failed to process trimmed video');
              });
            }
            break;
          case 'onCancelTrimming':
          case 'onCancel':
            setIsTrimming(false);
            break;
        }
      });

      return () => {
        subscription.remove();
      };
    }
  }, [mediaFile]);

  const handleProcess = async () => {
    if (!mediaFile) {
      Alert.alert('Error', 'Please select media first');
      return;
    }

    // For images with crop enabled, handle the crop process
    if (
      mediaFile.type === 'image' &&
      processingOptions.enableCrop &&
      !isCropping
    ) {
      await handleCrop();
      return;
    }

    // Process the media (either the original or modified)
    const mediaToProcess =
      mediaFile.type === 'image' && croppedImage
        ? croppedImage
        : mediaFile.type === 'video' && trimmedVideo
          ? trimmedVideo
          : mediaFile;

    await processMedia(mediaToProcess);
  };

  const handleCrop = async () => {
    if (!mediaFile || mediaFile.type !== 'image') return;

    setIsCropping(true);

    try {
      const croppedResult = await ImageCropPicker.openCropper({
        mediaType: 'photo',
        path: mediaFile.uri,
        width: 300,
        height: 400,
      });

      setCropDimensions({
        offsetX: croppedResult.cropRect.x,
        offsetY: croppedResult.cropRect.y,
        width: croppedResult.cropRect.width,
        height: croppedResult.cropRect.height,
      });

      const croppedMediaFile: MediaFile = {
        uri: croppedResult.path,
        type: 'image',
        name: `cropped-${mediaFile.name || 'image'}`,
        size: croppedResult.size,
      };
      setCroppedImage(croppedMediaFile);
      setIsCropping(false);
      await processMedia(croppedMediaFile);
    } catch (error) {
      console.error('Error during cropping:', error);
      setIsCropping(false);
      Alert.alert('Error', 'Failed to crop image');
    }
  };

  const handleTrim = async () => {
    if (!mediaFile || mediaFile.type !== 'video') return;

    try {
      // Open the native video trim UI
      const options = {
        maxDuration: 60, // Optional max duration in seconds
        minDuration: 1, // Minimum duration in seconds
      };

      // Trimming happens in the native UI
      // The result will be handled by the event listener
      trimVideoUsingEditor(mediaFile.uri, options).catch(error => {
        console.error('Error in video trimming:', error);
        if (error.message !== 'Video trimming was canceled') {
          Alert.alert('Error', 'Failed to trim video');
        }
      });
    } catch (error) {
      console.error('Error initializing video trim:', error);
      Alert.alert('Error', 'Failed to open video trimmer');
    }
  };

  const handleReset = () => {
    setCroppedImage(null);
    setTrimmedVideo(null);
    reset();
    resetMedia();
  };

  const isProcessingEnabled =
    mediaFile && !isProcessing && !isCropping && !isTrimming;

  return (
    <Scroll>
      <Column p={16}>
        <Spacer height={theme.spacing.md} />

        <Card>
          <SectionTitle>Select Media</SectionTitle>
          <Row justifySpaceBetween>
            <Button
              onPress={pickFromGallery}
              disabled={
                isLoadingMedia || isProcessing || isCropping || isTrimming
              }
            >
              From Gallery
            </Button>
            <Button
              onPress={openCamera}
              disabled={
                isLoadingMedia || isProcessing || isCropping || isTrimming
              }
            >
              Take New
            </Button>
          </Row>
        </Card>

        {mediaFile ? (
          <Card>
            <SectionTitle>Selected Media</SectionTitle>
            <MediaPreview
              uri={trimmedVideo?.uri || mediaFile?.uri || null}
              type={mediaFile.type}
              thumbnailUri={mediaFile.thumbnailUri}
              isLoading={isLoadingMedia}
            />

            <Spacer height={theme.spacing.sm} />
            <SectionTitle>Processing Options</SectionTitle>

            {/* Quality slider for both image and video */}
            <QualitySlider
              value={processingOptions.compressionQuality}
              onValueChange={setCompressionQuality}
              disabled={isProcessing || isCropping || isTrimming}
              mediaType={mediaFile.type}
            />

            {/* Image-specific options */}
            {mediaFile.type === 'image' && (
              <Button
                onPress={toggleCropMode}
                variant={processingOptions.enableCrop ? 'accent' : 'primary'}
                size="small"
                disabled={isProcessing || isCropping || isTrimming}
              >
                {processingOptions.enableCrop ? 'Disable Crop' : 'Enable Crop'}
              </Button>
            )}

            {/* Video-specific options - Trim button */}
            {mediaFile.type === 'video' && (
              <>
                <Spacer height={theme.spacing.sm} />
                <Button
                  onPress={handleTrim}
                  variant="accent"
                  disabled={isProcessing || isTrimming}
                >
                  Trim Video
                </Button>

                <InfoContainer>
                  <InfoText>
                    Trimming will open a native UI where you can select the
                    start and end points of your video.
                    {trimmedVideo ? ' Video has been trimmed.' : ''}
                  </InfoText>
                </InfoContainer>
              </>
            )}

            <Spacer height={theme.spacing.sm} />

            {(isProcessing || isTrimming) && (
              <>
                <Loader />
                <ProgressText>
                  {isTrimming
                    ? 'Trimming video...'
                    : `${Math.round(processingProgress * 100)}% Processed`}
                </ProgressText>
                <Spacer height={theme.spacing.sm} />
              </>
            )}

            <Button
              onPress={handleProcess}
              variant="secondary"
              disabled={!isProcessingEnabled}
              fullWidth
            >
              {isCropping
                ? 'Cropping...'
                : isTrimming
                  ? 'Trimming...'
                  : isProcessing
                    ? 'Processing...'
                    : `Process ${mediaFile.type === 'image' ? 'Image' : 'Video'}`}
            </Button>
          </Card>
        ) : (
          <Card>
            <Text>Please select or capture media to get started</Text>
          </Card>
        )}

        {processedMedia && (
          <Card>
            <SectionTitle>
              Processed {processedMedia.type === 'image' ? 'Image' : 'Video'}
            </SectionTitle>
            <MediaPreview
              uri={processedMedia.processedUri}
              type={processedMedia.type}
              showControls={true}
            />

            <StatsDisplay stats={processedMedia.stats} />

            <Row justifySpaceBetween>
              <Button
                onPress={saveToGallery}
                variant="accent"
                disabled={isProcessing || isCropping || isTrimming}
              >
                Save to Gallery
              </Button>
              <Button
                onPress={handleReset}
                disabled={isProcessing || isCropping || isTrimming}
              >
                Reset
              </Button>
            </Row>
          </Card>
        )}
      </Column>
    </Scroll>
  );
};

const Scroll = styled(ScrollView)`
  flex: 1;
  background-color: ${theme.colors.background};
`;

const Card = styled.View`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.md};
  margin-vertical: ${theme.spacing.md};
  ${Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  })};
`;

const SectionTitle = styled.Text`
  font-size: ${theme.fontSizes.lg};
  font-weight: bold;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text};
`;

const ProgressText = styled.Text`
  text-align: center;
  color: ${theme.colors.textLight};
  margin-top: ${theme.spacing.xs};
  font-size: ${theme.fontSizes.sm};
`;

const InfoContainer = styled.View`
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.sm};
  margin-vertical: ${theme.spacing.md};
`;

const InfoText = styled.Text`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textLight};
`;
