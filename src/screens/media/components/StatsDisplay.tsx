import React from 'react';
import { ProcessingStats } from '@/types';
import { theme } from '@/styles';
import styled from 'styled-components/native';

interface StatsDisplayProps {
  stats: ProcessingStats;
  title?: string;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  stats,
  title = 'Processing Stats',
}) => {
  // Extract percentage value from string (e.g., "50.25%" → 50.25)
  const reductionPercentage = parseFloat(
    stats.percentageReduction.replace('%', ''),
  );

  return (
    <StatsContainer>
      <StatsTitle>{title}</StatsTitle>

      <SectionTitle>File Size</SectionTitle>
      <StatsRow>
        <StatsLabel>Original Size</StatsLabel>
        <StatsValue>{stats.originalSize}</StatsValue>
      </StatsRow>

      <StatsRow>
        <StatsLabel>New Size</StatsLabel>
        <StatsValue>{stats.newSize}</StatsValue>
      </StatsRow>

      <StatsRow>
        <StatsLabel>Size Reduction</StatsLabel>
        <ReductionText reduction={reductionPercentage}>
          {stats.percentageReduction}
        </ReductionText>
      </StatsRow>

      <SectionTitle>Format</SectionTitle>
      <StatsRow>
        <StatsLabel>Original Format</StatsLabel>
        <StatsValue>{stats.originalFormat?.toUpperCase()}</StatsValue>
      </StatsRow>

      <StatsRow>
        <StatsLabel>New Format</StatsLabel>
        <StatsValue>{stats.newFormat?.toUpperCase()}</StatsValue>
      </StatsRow>

      {stats.originalDimensions && stats.newDimensions && (
        <>
          <SectionTitle>Dimensions</SectionTitle>
          <StatsRow>
            <StatsLabel>Original</StatsLabel>
            <StatsValue>
              {stats.originalDimensions.width} ×{' '}
              {stats.originalDimensions.height}
            </StatsValue>
          </StatsRow>
          <StatsRow>
            <StatsLabel>New</StatsLabel>
            <StatsValue>
              {stats.newDimensions.width} × {stats.newDimensions.height}
            </StatsValue>
          </StatsRow>
        </>
      )}
    </StatsContainer>
  );
};

const StatsContainer = styled.View`
  margin-vertical: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.info};
  border-radius: ${theme.borderRadius.md};
`;

const StatsTitle = styled.Text`
  font-size: ${theme.fontSizes.md};
  font-weight: bold;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text};
`;

const SectionTitle = styled.Text`
  font-size: ${theme.fontSizes.sm};
  font-weight: bold;
  margin-top: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.textLight};
`;

const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-vertical: ${theme.spacing.xs};
`;

const StatsLabel = styled.Text`
  font-size: ${theme.fontSizes.sm};
  color: ${theme.colors.textLight};
`;

const StatsValue = styled.Text`
  font-size: ${theme.fontSizes.sm};
  font-weight: bold;
  color: ${theme.colors.text};
`;

const ReductionText = styled.Text<{ reduction: number }>`
  font-size: ${theme.fontSizes.sm};
  font-weight: bold;
  color: ${({ reduction }: { reduction: number }) =>
    reduction > 50
      ? theme.colors.success
      : reduction > 20
        ? theme.colors.accent
        : theme.colors.text};
`;
