import React, { useState } from 'react';
import { Platform, ScrollView, Alert, Text } from 'react-native';
import styled from 'styled-components/native';
import ImageCropPicker from 'react-native-image-crop-picker';

import { Button, Column, Row, Spacer } from '@/components';
import { theme } from '@/styles';
import { useMediaPicker, useMediaProcessor } from '@/hooks';

import { MediaPreview, QualitySlider } from './components';
import { StatsDisplay } from './components/StatsDisplay';
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
    setCompressionQuality,
    setCropDimensions,
    toggleCropMode,
    processMedia,
    saveToGallery,
    reset,
  } = useMediaProcessor();

  const handleProcess = async () => {
    if (!mediaFile) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    if (processingOptions.enableCrop && !isCropping) {
      await handleCrop();
      return;
    }
    const imageToProcess = croppedImage || mediaFile;
    await processMedia(imageToProcess);
  };

  const handleCrop = async () => {
    if (!mediaFile) return;

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

            <QualitySlider
              value={processingOptions.compressionQuality}
              onValueChange={setCompressionQuality}
              disabled={isProcessing || isCropping}
            />

            <Button
              onPress={toggleCropMode}
              variant={processingOptions.enableCrop ? 'accent' : 'primary'}
              size="small"
              disabled={isProcessing || isCropping}
            >
              {processingOptions.enableCrop ? 'Disable Crop' : 'Enable Crop'}
            </Button>

            <Spacer height={theme.spacing.sm} />

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
                  : 'Process Image'}
            </Button>
          </Card>
        ) : (
          <Card>
            <Text>Please select or capture an image to get started</Text>
          </Card>
        )}

        {processedMedia && (
          <Card>
            <SectionTitle>Processed Image</SectionTitle>
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
