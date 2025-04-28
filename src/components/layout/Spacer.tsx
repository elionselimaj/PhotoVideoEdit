import { FC } from 'react';
import styled from 'styled-components/native';

type SpacerProps = {
  height?: number;
  width?: number;
};

export const Spacer: FC<SpacerProps> = styled.View<SpacerProps>`
  ${({ height }: { height: number }) => height && `height: ${height}px`}
  ${({ width }: { width: number }) => width && `width: ${width}px`}
`;
