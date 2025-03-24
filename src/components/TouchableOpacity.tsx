import React from 'react';
import {TouchableOpacity as RNTouchableOpacity} from 'react-native';
import {formatCommonStyleProps} from './helpers';

import type {TouchableOpacityProps as RNTouchableOpacityProps} from 'react-native';
import type {CommonStyleProps} from './types';

export interface TouchableOpacityProps
  extends RNTouchableOpacityProps,
    CommonStyleProps {}

export const TouchableOpacity = ({
  disabled,
  opacity = disabled ? 0.5 : undefined,
  ...props
}: TouchableOpacityProps) => (
  <RNTouchableOpacity
    {...formatCommonStyleProps({disabled, opacity, ...props})}
  />
);

export default TouchableOpacity;
