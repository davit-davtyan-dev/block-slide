import type {
  DimensionValue,
  TextProps as RNTextProps,
  TextStyle,
  ViewStyle,
} from 'react-native';

export type DimensionPixelValue = `${number}px`;

export type DimensionValueWithPixel = DimensionValue | DimensionPixelValue;

export type CommonStyleProps = {
  size?: DimensionValueWithPixel | DimensionValueWithPixel;

  w?: DimensionValueWithPixel;
  width?: DimensionValueWithPixel;
  h?: DimensionValueWithPixel;
  height?: DimensionValueWithPixel;
  minW?: DimensionValueWithPixel;
  minWidth?: DimensionValueWithPixel;
  minH?: DimensionValueWithPixel;
  minHeight?: DimensionValueWithPixel;
  maxW?: DimensionValueWithPixel;
  maxWidth?: DimensionValueWithPixel;
  maxH?: DimensionValueWithPixel;
  maxHeight?: DimensionValueWithPixel;

  center?: boolean;

  justifyContent?: ViewStyle['justifyContent'];
  alignItems?: ViewStyle['alignItems'];
  alignSelf?: ViewStyle['alignSelf'];
  alignContent?: ViewStyle['alignContent'];
  flexDir?: ViewStyle['flexDirection'];
  flexDirection?: ViewStyle['flexDirection'];
  flex?: ViewStyle['flex'];
  flexWrap?: ViewStyle['flexWrap'];
  flexShrink?: ViewStyle['flexShrink'];
  flexGrow?: ViewStyle['flexGrow'];
  flexBasis?: ViewStyle['flexBasis'];
  gap?: ViewStyle['gap'];

  overflow?: ViewStyle['overflow'];
  position?: ViewStyle['position'];
  top?: ViewStyle['top'];
  bottom?: ViewStyle['bottom'];
  left?: ViewStyle['left'];
  right?: ViewStyle['right'];
  zIndex?: ViewStyle['zIndex'];

  m?: DimensionValueWithPixel;
  margin?: DimensionValueWithPixel;
  mb?: DimensionValueWithPixel;
  marginBottom?: DimensionValueWithPixel;
  mt?: DimensionValueWithPixel;
  marginTop?: DimensionValueWithPixel;
  ml?: DimensionValueWithPixel;
  marginLeft?: DimensionValueWithPixel;
  mr?: DimensionValueWithPixel;
  marginRight?: DimensionValueWithPixel;
  mx?: DimensionValueWithPixel;
  marginHorizontal?: DimensionValueWithPixel;
  my?: DimensionValueWithPixel;
  marginVertical?: DimensionValueWithPixel;

  p?: DimensionValueWithPixel;
  padding?: DimensionValueWithPixel;
  pb?: DimensionValueWithPixel;
  paddingBottom?: DimensionValueWithPixel;
  pt?: DimensionValueWithPixel;
  paddingTop?: DimensionValueWithPixel;
  pl?: DimensionValueWithPixel;
  paddingLeft?: DimensionValueWithPixel;
  pr?: DimensionValueWithPixel;
  paddingRight?: DimensionValueWithPixel;
  px?: DimensionValueWithPixel;
  paddingHorizontal?: DimensionValueWithPixel;
  py?: DimensionValueWithPixel;
  paddingVertical?: DimensionValueWithPixel;

  bgColor?: ViewStyle['backgroundColor'];
  backgroundColor?: ViewStyle['backgroundColor'];
  opacity?: ViewStyle['opacity'];

  borderRadius?: ViewStyle['borderRadius'];
  borderColor?: ViewStyle['borderColor'];
  borderWidth?: ViewStyle['borderWidth'];
  borderStyle?: ViewStyle['borderStyle'];
  borderTopWidth?: ViewStyle['borderTopWidth'];
  borderBottomWidth?: ViewStyle['borderBottomWidth'];
  borderLeftWidth?: ViewStyle['borderLeftWidth'];
  borderRightWidth?: ViewStyle['borderRightWidth'];
  borderRightRadius?: ViewStyle['borderRadius'];
  borderLeftRadius?: ViewStyle['borderRadius'];
  borderTopRadius?: ViewStyle['borderRadius'];
  borderTopLeftRadius?: ViewStyle['borderTopLeftRadius'];
  borderTopRightRadius?: ViewStyle['borderTopRightRadius'];
  borderBottomRadius?: ViewStyle['borderRadius'];
  borderBottomLeftRadius?: ViewStyle['borderBottomLeftRadius'];
  borderBottomRightRadius?: ViewStyle['borderBottomRightRadius'];

  shadowColor?: ViewStyle['shadowColor'];
  shadowOffset?: ViewStyle['shadowOffset'];
  shadowOpacity?: ViewStyle['shadowOpacity'];
  shadowRadius?: ViewStyle['shadowRadius'];
  elevation?: ViewStyle['elevation'];
};

export type TextStyleProps = CommonStyleProps & {
  color?: TextStyle['color'];
  fontSize?: TextStyle['fontSize'];
  fontStyle?: TextStyle['fontStyle'];
  fontVariant?: TextStyle['fontVariant'];
  fontWeight?: TextStyle['fontWeight'];
  textAlign?: TextStyle['textAlign'];
  lineHeight?: TextStyle['lineHeight'];
  letterSpacing?: TextStyle['letterSpacing'];
  textTransform?: TextStyle['textTransform'];
  textDecorationLine?: TextStyle['textDecorationLine'];
};

export interface TextProps extends RNTextProps, TextStyleProps {}
