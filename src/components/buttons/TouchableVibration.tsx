// @ts-nocheck
import React, { ComponentType, ReactNode } from 'react';
import {
  Pressable,
  PressableProps,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { vibrate } from '@utils/device';

const withVibration =
  // prettier-ignore
  < P, >(Touchable: ComponentType<P>) =>
        // eslint-disable-next-line react/display-name
        (props: P & { children: ReactNode; onPress: () => void }) => {
            const onPress = () => {
                vibrate();
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                typeof props?.onPress === 'function' && props?.onPress?.();
            };

            return <Touchable {...props} onPress={onPress} />;
        };

export const PressableVibration = withVibration<PressableProps>(Pressable);
export const OpacityVibration =
  withVibration<TouchableOpacityProps>(TouchableOpacity);
