import React from 'react';
import { Button, Column, Container, Row, Spacer, Text } from '@/components';
import { theme } from '@/styles';
import styled from 'styled-components/native';
import { Platform } from 'react-native';
import { useMediaPicker } from '@/hooks';
import { MediaPreview } from './components';
import useMediaProcessor from '@/hooks/useMediaProcessor';

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
    <Container>
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
          </Card>
        ) : null}
      </Column>
    </Container>
  );
};

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
