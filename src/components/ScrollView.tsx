import React from 'react';
import { ScrollView as RNScrollView } from 'react-native';
import { formatCommonStyleProps } from './helpers';

import type { ScrollViewProps as RNScrollViewProps } from 'react-native';
import type { CommonStyleProps } from './types';

export interface ScrollViewProps extends RNScrollViewProps, CommonStyleProps {}

export const ScrollView = (props: ScrollViewProps) => (
  <RNScrollView {...formatCommonStyleProps(props, 'contentContainerStyle')} />
);

export default ScrollView;
