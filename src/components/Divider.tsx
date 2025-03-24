import React from 'react';
import {View, ViewProps} from '.';

export const Divider = (props: ViewProps) => (
  <View w="100%" h="1px" bgColor="#e0e0e0" {...props} />
);
