import React from 'react';
import {View, ViewProps} from '.';

export interface RowProps
  extends Omit<ViewProps, 'flexDir' | 'flexDirection'> {}

export const Row = (props: RowProps) => <View {...props} flexDirection="row" />;
