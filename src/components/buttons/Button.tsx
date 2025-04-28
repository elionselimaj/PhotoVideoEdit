import React from 'react';
import styled from 'styled-components/native';
import { TouchableOpacityProps } from 'react-native';
import { theme } from '@/styles';
import { PressableVibration } from './TouchableVibration';
import { Text } from '../other';

export type ButtonVariant = 'primary' | 'secondary' | 'accent';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}

const StyledButton = styled(PressableVibration)<{
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
  disabled: boolean;
}>`
  background-color: ${({
    variant,
    disabled,
  }: {
    variant: ButtonVariant;
    disabled: string;
  }) => {
    if (disabled) return theme.colors.disabled;
    switch (variant) {
      case 'secondary':
        return theme.colors.secondary;
      case 'accent':
        return theme.colors.accent;
      default:
        return theme.colors.primary;
    }
  }};
  padding: ${({ size }: { size: ButtonSize }) => {
    switch (size) {
      case 'small':
        return '8px 16px';
      case 'large':
        return '16px 24px';
      default:
        return '12px 20px';
    }
  }};
  border-radius: ${theme.borderRadius.md};
  align-items: center;
  justify-content: center;
  width: ${({ fullWidth }: { fullWidth: boolean }) =>
    fullWidth ? '100%' : 'auto'};
  align-self: ${({ fullWidth }: { fullWidth: boolean }) =>
    fullWidth ? 'stretch' : 'center'};
  margin-vertical: ${theme.spacing.sm};
  opacity: ${({ disabled }: { disabled: boolean }) => (disabled ? 0.7 : 1)};
`;

const ButtonText = styled(Text)<{ size: ButtonSize }>`
  color: white;
  font-weight: bold;
  font-size: ${({ size }: { size: ButtonSize }) => {
    switch (size) {
      case 'small':
        return theme.fontSizes.sm;
      case 'large':
        return theme.fontSizes.lg;
      default:
        return theme.fontSizes.md;
    }
  }};
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  children,
  disabled = false,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      {...props}
    >
      <ButtonText size={size}>{children}</ButtonText>
    </StyledButton>
  );
};
