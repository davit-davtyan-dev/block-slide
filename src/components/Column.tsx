import React from 'react';
import {View, ViewProps} from '.';

export interface ColumnProps
  extends Omit<ViewProps, 'flexDir' | 'flexDirection'> {}

export const Column = (props: ColumnProps) => (
  <View {...props} flexDirection="column" />
);
