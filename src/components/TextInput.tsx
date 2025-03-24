import React from 'react';
import {TextInput as RNTextInput} from 'react-native';
import {formatTextCommonStyleProps} from './helpers';

import type {TextInputProps as RNTextInputProps} from 'react-native';
import type {TextStyleProps} from './types';

export interface TextInputProps
  extends RNTextInputProps,
    Omit<TextStyleProps, 'textAlign'> {}

export const TextInput = ({textAlign, ...props}: TextInputProps) => (
  <RNTextInput {...formatTextCommonStyleProps(props)} textAlign={textAlign} />
);

export default TextInput;
