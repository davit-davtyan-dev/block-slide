import React from 'react';
import {Text as RNText} from 'react-native';
import {formatTextCommonStyleProps} from './helpers';

import type {TextProps} from './types';

export {TextProps};

export const Text = (props: TextProps) => (
  <RNText {...formatTextCommonStyleProps(props)} />
);

export default Text;
