import React from 'react';
import { Button, Column, Row, Spacer, Text } from '@/components';
import { theme } from '@/styles';
import styled from 'styled-components/native';
import { Platform, ScrollView } from 'react-native';
import { useMediaPicker } from '@/hooks';
import { MediaPreview, QualitySlider } from './components';
import useMediaProcessor from '@/hooks/useMediaProcessor';
import { StatsDisplay } from '@/screens/media/components/StatsDisplay';

export const MediaProcessorScreen: React.FC = () => {
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
    toggleCropMode,
    processMedia,
    saveToGallery,
    reset,
  } = useMediaProcessor();

  const handleProcess = async () => {
    if (mediaFile) {
      await processMedia(mediaFile);
    }
  };

  const handleReset = () => {
    reset();
    resetMedia();
  };

  const isProcessingEnabled = mediaFile && !isProcessing;

  return (
    <Scroll>
      <Column p={16}>
        <Spacer height={theme.spacing.md} />
        <Card>
          <SectionTitle>Select Media</SectionTitle>
          <Row justifySpaceBetween>
            <Button
              onPress={pickFromGallery}
              disabled={isLoadingMedia || isProcessing}
            >
              From Gallery
            </Button>
            <Button
              onPress={openCamera}
              disabled={isLoadingMedia || isProcessing}
            >
              Take New
            </Button>
          </Row>
        </Card>

        {mediaFile ? (
          <Card>
            <SectionTitle>Processed Media</SectionTitle>
            <MediaPreview
              uri={mediaFile.uri}
              type={mediaFile.type}
              thumbnailUri={mediaFile.thumbnailUri}
              isLoading={isLoadingMedia}
            />

            <Spacer height={theme.spacing.sm} />
            <SectionTitle>Processing Options</SectionTitle>
            <QualitySlider
              value={processingOptions.compressionQuality}
              onValueChange={setCompressionQuality}
            />
            <Button
              onPress={toggleCropMode}
              variant={processingOptions.enableCrop ? 'accent' : 'primary'}
              size="small"
            >
              {processingOptions.enableCrop ? 'Disable Crop' : 'Enable Crop'}
            </Button>

            <Spacer height={theme.spacing.sm} />
            <Button
              onPress={handleProcess}
              variant="secondary"
              disabled={!isProcessingEnabled}
              loading={isProcessing}
              fullWidth
            >
              Process Media
            </Button>
          </Card>
        ) : (
          <Card>
            <Text>Please select or capture media to get started</Text>
          </Card>
        )}

        {processedMedia && (
          <Card>
            <SectionTitle>Processed Media</SectionTitle>
            <MediaPreview
              uri={processedMedia.processedUri}
              type={processedMedia.type}
              showControls={true}
            />

            <StatsDisplay stats={processedMedia.stats} />

            {/* Save & Reset Buttons */}
            <Row justifySpaceBetween>
              <Button onPress={saveToGallery} variant="accent">
                Save to Gallery
              </Button>
              <Button onPress={handleReset}>Reset</Button>
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
