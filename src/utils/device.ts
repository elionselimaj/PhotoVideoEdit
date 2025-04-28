import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

export const vibrate = (
  type: ReactNativeHapticFeedback.HapticFeedbackTypes = 'selection',
) =>
  ReactNativeHapticFeedback.trigger(type, {
    enableVibrateFallback: true,
  });
