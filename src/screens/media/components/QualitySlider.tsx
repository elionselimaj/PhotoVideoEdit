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
}

export const QualitySlider: React.FC<QualitySliderProps> = ({
  value,
  onValueChange,
  step = 0.1,
  minimumValue = 0.1,
  maximumValue = 1.0,
  label = 'Compression Quality',
}) => {
  const getQualityDescription = (quality: number): string => {
    if (quality > 0.8) return 'High Quality (Larger File)';
    if (quality > 0.5) return 'Medium Quality';
    return 'Low Quality (Smaller File)';
  };

  return (
    <SliderContainer>
      <SliderLabel>{label}</SliderLabel>

      <StyledSlider
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.disabled}
        thumbTintColor={theme.colors.primary}
      />

      <SliderValueContainer justifySpaceBetween>
        <SliderValue quality={value}>{(value * 100).toFixed(0)}%</SliderValue>
        <QualityDescription>{getQualityDescription(value)}</QualityDescription>
      </SliderValueContainer>
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

const SliderValue = styled.Text<{ quality: number }>`
  font-size: ${theme.fontSizes.sm};
  font-weight: bold;
  color: ${({ quality }: { quality: number }) => {
    if (quality > 0.7) return theme.colors.success;
    if (quality > 0.4) return theme.colors.accent;
    return theme.colors.error;
  }};
`;

const QualityDescription = styled.Text`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textLight};
`;
