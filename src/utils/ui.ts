import { css } from 'styled-components/native';
import type { RowColumnProps } from '@/types';

export const getJustify = ({
  justifyCenter,
  justifySpaceBetween,
  justifySpaceAround,
  justifyFlexEnd,
}: RowColumnProps): string => {
  if (justifyCenter) return 'center';
  if (justifySpaceBetween) return 'space-between';
  if (justifySpaceAround) return 'space-around';
  if (justifyFlexEnd) return 'flex-end';

  return 'flex-start';
};

export const getAlign = ({
  alignCenter,
  alignFlexEnd,
  alignFlexStart,
  alignBaseline,
}: RowColumnProps): string => {
  if (alignCenter) return 'center';
  if (alignFlexStart) return 'flex-start';
  if (alignFlexEnd) return 'flex-end';
  if (alignBaseline) return 'baseline';

  return 'stretch';
};

export const commonMarginProps = css<RowColumnProps>`
  ${({ m }) => m !== undefined && `margin: ${m}px`};
  ${({ mh }) => mh !== undefined && `margin-horizontal: ${mh}px`};
  ${({ mv }) => mv !== undefined && `margin-vertical: ${mv}px`};
  ${({ mb }) => mb !== undefined && `margin-bottom: ${mb}px`};
  ${({ mt }) => mt !== undefined && `margin-top: ${mt}px`};
  ${({ mr }) => mr !== undefined && `margin-right: ${mr}px`};
  ${({ ml }) => ml !== undefined && `margin-left: ${ml}px`};
`;

export const commonPaddingProps = css<RowColumnProps>`
  ${({ p }) => p !== undefined && `padding: ${p}px`};
  ${({ ph }) => ph !== undefined && `padding-horizontal: ${ph}px`};
  ${({ pv }) => pv !== undefined && `padding-vertical: ${pv}px`};
  ${({ pb }) => pb !== undefined && `padding-bottom: ${pb}px`};
  ${({ pt }) => pt !== undefined && `padding-top: ${pt}px`};
  ${({ pr }) => pr !== undefined && `padding-right: ${pr}px`};
  ${({ pl }) => pl !== undefined && `padding-left: ${pl}px`};
`;
