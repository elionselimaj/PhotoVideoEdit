import { MediaType } from '@/types';
import styled from 'styled-components/native';
import { theme } from '@/styles';
import Video from 'react-native-video';
import React from 'react';
import { Column, Loader } from '@/components';

interface MediaPreviewProps {
  uri: string | null;
  type: MediaType;
  thumbnailUri?: string;
  isLoading?: boolean;
  showControls?: boolean;
}
export const MediaPreview: React.FC<MediaPreviewProps> = ({
  uri,
  type,
  thumbnailUri,
  isLoading = false,
  showControls = false,
}) => {
  if (!uri) {
    return (
      <PreviewContainer>
        <EmptyPreview>
          <EmptyText>No media selected</EmptyText>
        </EmptyPreview>
      </PreviewContainer>
    );
  }

  return (
    <Column>
      <PreviewContainer>
        {type === 'image' ? (
          <ImagePreview source={{ uri }} resizeMode="contain" />
        ) : type === 'video' ? (
          thumbnailUri ? (
            <ImagePreview source={{ uri: thumbnailUri }} resizeMode="contain" />
          ) : (
            <VideoPreview
              source={{ uri }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              shouldPlay={false}
              useNativeControls={showControls}
            />
          )
        ) : null}

        {isLoading && <Loader />}
      </PreviewContainer>

      {type === 'video' && thumbnailUri && (
        <VideoLabel>Video Selected</VideoLabel>
      )}
    </Column>
  );
};

const PreviewContainer = styled.View`
  width: 100%;
  aspect-ratio: 16/9;
  margin-vertical: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  background-color: #e0e0e0;
`;

const ImagePreview = styled.Image`
  width: 100%;
  height: 100%;
`;

const VideoPreview = styled(Video)`
  width: 100%;
  height: 100%;
`;

const VideoLabel = styled.Text`
  text-align: center;
  font-style: italic;
  margin-top: ${theme.spacing.xs};
  color: ${theme.colors.textLight};
`;

const EmptyPreview = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: #e0e0e0;
`;

const EmptyText = styled.Text`
  color: ${theme.colors.textLight};
  font-size: ${theme.fontSizes.md};
`;
