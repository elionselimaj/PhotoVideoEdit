import React from 'react';
import styled from 'styled-components/native';
import { theme } from '@/styles';
import Slider from '@react-native-community/slider';
import { Row } from '@/components';

interface QualitySliderProps {
  value: number;
  onValueChange: (value: number) => void;
  step?: number;
  minimumValue?: number;
  maximumValue?: number;
  label?: string;
  disabled?: boolean;
  mediaType?: 'image' | 'video';
}

export const QualitySlider: React.FC<QualitySliderProps> = ({
  value,
  onValueChange,
  step = 0.1,
  minimumValue = 0.1,
  maximumValue = 1.0,
  label,
  disabled = false,
  mediaType = 'image',
}) => {
  // Default label based on media type
  const defaultLabel =
    mediaType === 'image'
      ? 'Image Compression Quality'
      : 'Video Compression Quality';

  const sliderLabel = label || defaultLabel;

  const getQualityDescription = (quality: number): string => {
    if (mediaType === 'image') {
      if (quality > 0.8) return 'High Quality (Larger File)';
      if (quality > 0.5) return 'Medium Quality';
      return 'Low Quality (Smaller File)';
    } else {
      // Video quality descriptions
      if (quality > 0.8) return 'High Resolution (Larger File)';
      if (quality > 0.5) return 'Medium Resolution';
      return 'Low Resolution (Smaller File)';
    }
  };

  // Calculate estimated file size impact
  const getFileSizeImpact = (quality: number): string => {
    if (quality > 0.8) return 'File size reduction: ~20-30%';
    if (quality > 0.5) return 'File size reduction: ~40-60%';
    return 'File size reduction: ~70-80%';
  };

  return (
    <SliderContainer>
      <SliderLabel>{sliderLabel}</SliderLabel>

      <StyledSlider
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={
          disabled ? theme.colors.disabled : theme.colors.primary
        }
        maximumTrackTintColor={theme.colors.disabled}
        thumbTintColor={disabled ? theme.colors.disabled : theme.colors.primary}
        disabled={disabled}
      />

      <SliderValueContainer justifySpaceBetween>
        <SliderValue quality={value} disabled={disabled}>
          {(value * 100).toFixed(0)}%
        </SliderValue>
        <QualityDescription>{getQualityDescription(value)}</QualityDescription>
      </SliderValueContainer>

      <ImpactText>{getFileSizeImpact(value)}</ImpactText>
    </SliderContainer>
  );
};

const SliderContainer = styled.View`
  margin-vertical: ${theme.spacing.md};
`;

const SliderLabel = styled.Text`
  font-size: ${theme.fontSizes.md};
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.text};
`;

const StyledSlider = styled(Slider)`
  width: 100%;
  height: 40px;
`;

const SliderValueContainer = styled(Row)`
  margin-top: ${theme.spacing.xs};
`;

const SliderValue = styled.Text<{ quality: number; disabled?: boolean }>`
  font-size: ${theme.fontSizes.sm};
  font-weight: bold;
  color: ${({ quality, disabled }: { quality: number; disabled?: boolean }) => {
    if (disabled) return theme.colors.textLight;
    if (quality > 0.7) return theme.colors.success;
    if (quality > 0.4) return theme.colors.accent;
    return theme.colors.error;
  }};
`;

const QualityDescription = styled.Text`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textLight};
`;

const ImpactText = styled.Text`
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.textLight};
  font-style: italic;
  margin-top: ${theme.spacing.xs};
  text-align: center;
`;
