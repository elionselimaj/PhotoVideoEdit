import React, { FC } from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';
import styled from 'styled-components/native';

import { Typefaces } from '@/styled';
import { theme } from '@/styles';

export interface TextProps extends RNTextProps {
  children?: string | number;
  color?: string;
  style?: TextStyle;
  type?: keyof Typefaces;
  alignLeft?: boolean;
  center?: boolean;
  alignRight?: boolean;
  scaling?: boolean;
}

export const getTextAlign = (props: TextProps) => {
  if (props.center) return 'center';
  if (props.alignLeft) return 'left';
  if (props.alignRight) return 'right';

  return 'left';
};

export const Text: FC<TextProps> = ({ style, scaling, ...rest }) => (
  <AppText allowFontScaling={scaling} style={style} {...rest} />
);

Text.displayName = 'Text';

const AppText = styled(RNText)<TextProps>`
  text-align: ${(props: TextProps) => getTextAlign(props)};
  color: ${({ color }: { color: string }) => color};
  ${({ type }) => theme.text[type]};
`;
