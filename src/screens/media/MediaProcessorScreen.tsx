import React from 'react';
import { Button, Column, Container, Row, Spacer, Text } from '@/components';
import { theme } from '@/styles';
import styled from 'styled-components/native';
import { Platform } from 'react-native';
import { useMediaPicker } from '@/hooks';

export const MediaProcessorScreen: React.FC = () => {
  const { isLoading: isLoadingMedia, pickFromGallery } = useMediaPicker();
  return (
    <Container>
      <Column p={16}>
        <Spacer height={theme.spacing.md} />
        <Card>
          <SectionTitle>Select Media</SectionTitle>
          <Row>
            <Button onPress={pickFromGallery} disabled={isLoadingMedia}>
              From Gallery
            </Button>
          </Row>
        </Card>
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
