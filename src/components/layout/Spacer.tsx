import { FC } from 'react';
import styled from 'styled-components/native';

type SpacerProps = {
  height?: string;
  width?: string;
};

export const Spacer: FC<SpacerProps> = styled.View<SpacerProps>`
  ${({ height }: { height: string }) => height && `height: ${height}px`}
  ${({ width }: { width: string }) => width && `width: ${width}px`}
`;
