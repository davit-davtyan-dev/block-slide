import React from 'react';
import {TouchableHighlight as RNTouchableHighlight} from 'react-native';
import {formatCommonStyleProps} from './helpers';

import type {TouchableHighlightProps as RNTouchableHighlightProps} from 'react-native';
import type {CommonStyleProps} from './types';

export interface TouchableHighlightProps
  extends RNTouchableHighlightProps,
    CommonStyleProps {}

export const TouchableHighlight = ({
  disabled,
  opacity = disabled ? 0.5 : undefined,
  ...props
}: TouchableHighlightProps) => (
  <RNTouchableHighlight
    {...formatCommonStyleProps({disabled, opacity, ...props})}
  />
);

export default TouchableHighlight;
