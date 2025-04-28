import { FC } from 'react';
import styled from 'styled-components/native';
import {
  commonMarginProps,
  commonPaddingProps,
  getAlign,
  getJustify,
} from '@/utils';
import { RowColumnProps } from '@/types';

export const Row: FC<RowColumnProps> = styled.View<RowColumnProps>`
  flex-direction: row;
  justify-content: ${(props: RowColumnProps) => getJustify(props)};
  align-items: ${(props: RowColumnProps) => getAlign(props)};
  ${({ flex }: { flex: number }) => flex && `flex: ${flex};`}
  ${commonMarginProps};
  ${commonPaddingProps};
`;
