import { FC } from 'react';
import styled from 'styled-components/native';
import {
  commonMarginProps,
  commonPaddingProps,
  getAlign,
  getJustify,
} from '@/utils';
import { RowColumnProps } from '@/types';

export const Column: FC<RowColumnProps> = styled.View<RowColumnProps>`
  align-items: ${(props: RowColumnProps) => getAlign(props)};
  justify-content: ${(props: RowColumnProps) => getJustify(props)};
  ${({ flex }: { flex: number }) => flex && `flex: ${flex};`}
  ${commonMarginProps}
  ${commonPaddingProps}
`;
