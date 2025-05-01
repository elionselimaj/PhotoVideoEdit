import React, { useState } from 'react';
import { Platform, ScrollView, Alert, Text } from 'react-native';
import styled from 'styled-components/native';
import ImageCropPicker from 'react-native-image-crop-picker';

import { Button, Column, Loader, Row, Spacer } from '@/components';
import { theme } from '@/styles';
import { useMediaPicker, useMediaProcessor } from '@/hooks';

import { MediaPreview, StatsDisplay, QualitySlider } from './components';
import { MediaFile } from '@/types';

export const MediaProcessorScreen: React.FC = () => {
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [croppedImage, setCroppedImage] = useState(null);

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
    setVideoMetadata,
    processMedia,
    saveToGallery,
    reset,
  } = useMediaProcessor();

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

    // Process the media (either the original or cropped image)
    const mediaToProcess =
      mediaFile.type === 'image' && croppedImage ? croppedImage : mediaFile;
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

  const handleReset = () => {
    setCroppedImage(null);
    reset();
    resetMedia();
  };

  const isProcessingEnabled = mediaFile && !isProcessing && !isCropping;

  return (
    <Scroll>
      <Column p={16}>
        <Spacer height={theme.spacing.md} />

        <Card>
          <SectionTitle>Select Media</SectionTitle>
          <Row justifySpaceBetween>
            <Button
              onPress={pickFromGallery}
              disabled={isLoadingMedia || isProcessing || isCropping}
            >
              From Gallery
            </Button>
            <Button
              onPress={openCamera}
              disabled={isLoadingMedia || isProcessing || isCropping}
            >
              Take New
            </Button>
          </Row>
        </Card>

        {mediaFile ? (
          <Card>
            <SectionTitle>Selected Media</SectionTitle>
            <MediaPreview
              uri={mediaFile?.uri || null}
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
              disabled={isProcessing || isCropping}
              mediaType={mediaFile.type}
            />

            {/* Image-specific options */}
            {mediaFile.type === 'image' && (
              <Button
                onPress={toggleCropMode}
                variant={processingOptions.enableCrop ? 'accent' : 'primary'}
                size="small"
                disabled={isProcessing || isCropping}
              >
                {processingOptions.enableCrop ? 'Disable Crop' : 'Enable Crop'}
              </Button>
            )}

            {/* Video-specific options - just info text */}
            {mediaFile.type === 'video' && (
              <InfoContainer>
                <InfoText>
                  Adjust the quality slider above to control video compression.
                  Lower values produce smaller files with reduced quality, while
                  higher values maintain better quality but result in larger
                  files.
                </InfoText>
              </InfoContainer>
            )}

            <Spacer height={theme.spacing.sm} />

            {isProcessing && (
              <>
                <Loader />
                <ProgressText>
                  {Math.round(processingProgress * 100)}% Processed
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
                disabled={isProcessing || isCropping}
              >
                Save to Gallery
              </Button>
              <Button
                onPress={handleReset}
                disabled={isProcessing || isCropping}
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

export default MediaProcessorScreen;
