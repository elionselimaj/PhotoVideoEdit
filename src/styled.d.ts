// import original module declarations
import '@types/styled-components-react-native';

// and extend them!
declare module '@types/styled-components-react-native' {
  export { Theme as DefaultTheme };
}

export interface Theme {
  colors: Colors;
  spacing: Spacing;
  borderRadius: BorderRadius;
  fontSizes: FontSizes;
  shadows: Shadows;
}

export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textLight: string;
  disabled: string;
  error: string;
  success: string;
  info: string;
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface BorderRadius {
  sm: string;
  md: string;
  lg: string;
}

export interface FontSizes {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: {
    width: number;
    height: number;
  };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  sm: ShadowStyle;
  md: ShadowStyle;
  lg: ShadowStyle;
}
