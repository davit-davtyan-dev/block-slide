import React from 'react';
import {View, ViewProps} from '.';
import {useTheme} from '../contexts/ThemeContext';

export const Divider = (props: ViewProps) => {
  const {theme} = useTheme();
  return <View w="100%" h="1px" bgColor={theme.matrixCellBorder} {...props} />;
};
