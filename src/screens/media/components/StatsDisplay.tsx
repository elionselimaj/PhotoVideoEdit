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
