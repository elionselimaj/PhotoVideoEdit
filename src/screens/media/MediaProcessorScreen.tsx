import React, { useState } from 'react';
import { Button, Column, Row, Spacer, Text } from '@/components';
import { theme } from '@/styles';
import styled from 'styled-components/native';
import { Platform, ScrollView, Alert } from 'react-native';
import { useMediaPicker } from '@/hooks';
import { MediaPreview } from './components/MediaPreview';
import { QualitySlider } from './components/QualitySlider';
import { StatsDisplay } from './components/StatsDisplay';
import useMediaProcessor from '@/hooks/useMediaProcessor';
import ImageCropPicker from 'react-native-image-crop-picker';

// Optional: Import a cropping library if you want to implement cropping
// import ImageCropper from 'react-native-image-crop-picker';

export const MediaProcessorScreen: React.FC = () => {
  // State to track if we're in cropping mode
  const [isCropping, setIsCropping] = useState(false);

  // Use your existing media picker hook
  const {
    mediaFile,
    isLoading: isLoadingMedia,
    pickFromGallery,
    openCamera,
    resetMedia,
  } = useMediaPicker();

  // Use the media processor hook we created
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

  // Handler for processing the media
  const handleProcess = async () => {
    if (!mediaFile) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    // If cropping is enabled, enter cropping mode first
    if (processingOptions.enableCrop && !isCropping) {
      handleCrop();
      return;
    }

    // Process the media
    await processMedia(mediaFile);
  };

  // Handler for cropping (this is an example implementation)
  const handleCrop = async () => {
    if (!mediaFile) return;

    setIsCropping(true);

    try {
      // Here you would integrate with a cropping library
      // For example with react-native-image-crop-picker:
      const croppedImage = await ImageCropPicker.openCropper({
        path: mediaFile.uri,
        width: 300,
        height: 400,
      });

      // Update the crop dimensions
      setCropDimensions({
        offsetX: croppedImage.cropRect.x,
        offsetY: croppedImage.cropRect.y,
        width: croppedImage.cropRect.width,
        height: croppedImage.cropRect.height,
      });

      // After cropping, resume processing
      setIsCropping(false);
      await processMedia(mediaFile);
    } catch (error) {
      console.error('Error during cropping:', error);
      setIsCropping(false);
      Alert.alert('Error', 'Failed to crop image');
    }
  };

  // Handler for resetting everything
  const handleReset = () => {
    reset();
    resetMedia();
  };

  // Determine if processing is enabled
  const isProcessingEnabled = mediaFile && !isProcessing && !isCropping;

  return (
    <Scroll>
      <Column p={16}>
        <Spacer height={theme.spacing.md} />

        {/* Media Selection Card */}
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

        {/* Media Processing Options */}
        {mediaFile ? (
          <Card>
            <SectionTitle>Selected Media</SectionTitle>
            <MediaPreview
              uri={mediaFile.uri}
              type={mediaFile.type}
              thumbnailUri={mediaFile.thumbnailUri}
              isLoading={isLoadingMedia}
            />

            <Spacer height={theme.spacing.sm} />
            <SectionTitle>Processing Options</SectionTitle>

            {/* Quality Slider */}
            <QualitySlider
              value={processingOptions.compressionQuality}
              onValueChange={setCompressionQuality}
              disabled={isProcessing || isCropping}
            />

            {/* Crop Toggle Button */}
            <Button
              onPress={toggleCropMode}
              variant={processingOptions.enableCrop ? 'accent' : 'primary'}
              size="small"
              disabled={isProcessing || isCropping}
            >
              {processingOptions.enableCrop ? 'Disable Crop' : 'Enable Crop'}
            </Button>

            <Spacer height={theme.spacing.sm} />

            {/* Process Button */}
            <Button
              onPress={handleProcess}
              variant="secondary"
              disabled={!isProcessingEnabled}
              loading={isProcessing || isCropping}
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

        {/* Results Card */}
        {processedMedia && (
          <Card>
            <SectionTitle>Processed Image</SectionTitle>
            <MediaPreview
              uri={processedMedia.processedUri}
              type={processedMedia.type}
              showControls={true}
            />

            {/* Display Processing Stats */}
            <StatsDisplay stats={processedMedia.stats} />

            {/* Save & Reset Buttons */}
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

const SectionTitle = styled(Text)`
  font-size: ${theme.fontSizes.lg};
  font-weight: bold;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text};
`;
