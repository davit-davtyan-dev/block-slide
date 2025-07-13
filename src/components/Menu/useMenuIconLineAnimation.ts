import {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';
import {ANIMATION_DEFAULT_DURATION} from '../../constants';

export type TranslateConfig = {
  x: {
    start: number;
    end: number;
  };
  y: {
    start: number;
    end: number;
  };
};

export default function useMenuIconLineAnimation({
  value,
  delay = 0,
  rotate,
  translateConfig,
  translateY,
  size,
}: {
  value: boolean;
  size: number;
  rotate: string;
  translateConfig: TranslateConfig;
  translateY: number;
  delay?: number;
}) {
  const halfSize = size / 2;
  const animatedValue = useRef(new Animated.Value(Number(value))).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: Number(value),
      duration: ANIMATION_DEFAULT_DURATION * 2,
      easing: Easing.linear,
      useNativeDriver: true,
      delay,
    }).start();
  }, [value, animatedValue, delay]);

  const rotateInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', rotate],
  });
  const translateXInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [translateConfig.x.start, translateConfig.x.end],
  });
  const translateYInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      translateConfig.y.start + translateY,
      halfSize + translateConfig.y.end,
    ],
  });

  return [
    rotateInterpolate,
    translateXInterpolate,
    translateYInterpolate,
    animatedValue,
  ];
}
