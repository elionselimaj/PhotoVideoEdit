import React from 'react';
import styled from 'styled-components/native';
import Slider from '@react-native-community/slider';
import { theme } from '@/styles';

interface VideoProcessingOptionsProps {
  compressionQuality: number;
  onCompressionQualityChange: (value: number) => void;
  disabled?: boolean;
}

export const VideoProcessingOptions: React.FC<VideoProcessingOptionsProps> = ({
  compressionQuality,
  onCompressionQualityChange,
  disabled = false,
}) => {
  return (
    <OptionsContainer>
      <SectionTitle>Video Compression Options</SectionTitle>

      <OptionGroup>
        <OptionLabel>
          Compression Quality: {Math.round(compressionQuality * 100)}%
        </OptionLabel>
        <Slider
          minimumValue={0.1}
          maximumValue={1}
          step={0.05}
          value={compressionQuality}
          onValueChange={onCompressionQualityChange}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.gray}
          thumbTintColor={theme.colors.primary}
          disabled={disabled}
        />
        <QualityLabels>
          <QualityLabel>Smaller file</QualityLabel>
          <QualityLabel>Higher quality</QualityLabel>
        </QualityLabels>
      </OptionGroup>

      <InfoContainer>
        <InfoText>
          Move the slider to adjust video compression quality. Lower values
          produce smaller files with reduced quality, while higher values
          maintain better quality but result in larger files.
        </InfoText>
      </InfoContainer>
    </OptionsContainer>
  );
};

const OptionsContainer = styled.View`
  margin-vertical: ${theme.spacing.md};
  width: 100%;
`;

const SectionTitle = styled.Text`
  font-size: ${theme.fontSizes.lg};
  font-weight: bold;
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text};
`;

const OptionGroup = styled.View`
  margin-bottom: ${theme.spacing.md};
`;

const OptionLabel = styled.Text`
  font-size: ${theme.fontSizes.md};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const QualityLabels = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${theme.spacing.xs};
`;

const QualityLabel = styled.Text`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textLight};
`;

const InfoContainer = styled.View`
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.md};
`;

const InfoText = styled.Text`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textLight};
`;
