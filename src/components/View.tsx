import React from 'react';
import {View as RNView} from 'react-native';
import {formatCommonStyleProps} from './helpers';

import type {ViewProps as RNViewProps} from 'react-native';
import type {CommonStyleProps} from './types';

export interface ViewProps extends RNViewProps, CommonStyleProps {}

export const View = (props: ViewProps) => (
  <RNView {...formatCommonStyleProps(props)} />
);

export default View;
