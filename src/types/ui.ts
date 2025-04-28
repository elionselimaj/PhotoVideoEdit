import { ReactNode } from 'react';

export type RowColumnProps = {
  children?: ReactNode;
  flex?: number;
  alignCenter?: boolean;
  alignFlexEnd?: boolean;
  alignFlexStart?: boolean;
  alignBaseline?: boolean;
  justifyCenter?: boolean;
  justifySpaceBetween?: boolean;
  justifySpaceAround?: boolean;
  justifyFlexEnd?: boolean;
  m?: number;
  mh?: number;
  mv?: number;
  mb?: number;
  mt?: number;
  ml?: number;
  mr?: number;
  defaultPadding?: boolean;
  p?: number;
  ph?: number;
  pv?: number;
  pb?: number;
  pt?: number;
  pl?: number;
  pr?: number;
};
