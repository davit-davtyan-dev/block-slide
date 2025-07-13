import {Animated, StyleSheet} from 'react-native';
import {TouchableOpacity, View} from '..';
import useMenuIconLineAnimation from './useMenuIconLineAnimation';
import {MENU_MODAL_Z_INDEX} from './constants';

import type {TranslateConfig} from './useMenuIconLineAnimation';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedMenuIconProps {
  opened: boolean;
  /** default is 48 */
  size?: number;
  color?: string;
  /** Configuration for translation animations */
  translateConfig: TranslateConfig;
  onPress?: () => void;
}

export default function AnimatedMenuIcon(props: AnimatedMenuIconProps) {
  const {size = 48, color = 'gray', opened, translateConfig, onPress} = props;
  const burgerLineVerticalMargin = size / 5;
  const [rotate1, translateX1, translateY1, animatedValue1] =
    useMenuIconLineAnimation({
      value: opened,
      size,
      rotate: '225deg',
      translateConfig,
      translateY: burgerLineVerticalMargin,
    });
  const [rotate2, translateX2, translateY2] = useMenuIconLineAnimation({
    value: opened,
    size,
    rotate: '315deg',
    translateConfig,
    translateY: size / 2,
    delay: 100,
  });
  const [rotate3, translateX3, translateY3] = useMenuIconLineAnimation({
    value: opened,
    size,
    rotate: '495deg',
    translateConfig,
    translateY: size - burgerLineVerticalMargin,
    delay: 200,
  });

  const translateYTouchable = animatedValue1.interpolate({
    inputRange: [0, 1],
    outputRange: [translateConfig.y.start, translateConfig.y.end],
  });

  return (
    <View center style={{width: size + 12, height: size + 12}}>
      <View style={{width: size, height: size}}>
        <AnimatedMenuIconLine
          color={color}
          rotateZ={rotate1}
          translateX={translateX1}
          translateY={translateY1}
        />

        <AnimatedMenuIconLine
          color={color}
          rotateZ={rotate2}
          translateX={translateX2}
          translateY={translateY2}
        />

        <AnimatedMenuIconLine
          color={color}
          rotateZ={rotate3}
          translateX={translateX3}
          translateY={translateY3}
        />
      </View>
      <AnimatedTouchable
        position="absolute"
        zIndex={MENU_MODAL_Z_INDEX + 1}
        onPress={onPress}
        width="100%"
        height="100%"
        style={{
          transform: [
            {translateX: translateX1},
            {translateY: translateYTouchable},
          ],
        }}
      />
    </View>
  );
}

interface AnimatedMenuIconLineProps {
  color: string;
  rotateZ: Animated.AnimatedNode;
  translateX: Animated.AnimatedNode;
  translateY: Animated.AnimatedNode;
}

function AnimatedMenuIconLine(props: AnimatedMenuIconLineProps) {
  const {color, rotateZ, translateX, translateY} = props;

  return (
    <Animated.View
      style={[
        styles.iconLineContainer,
        {transform: [{translateX}, {translateY}]},
      ]}>
      <Animated.View
        style={[
          styles.iconLine,
          {backgroundColor: color},
          {transform: [{rotateZ}]},
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconLine: {
    width: '100%',
    height: '100%',
    borderRadius: 200, // very big raduis to make sure it's always round
  },
  iconLineContainer: {
    position: 'absolute',
    width: '100%',
    height: '12%',
    zIndex: MENU_MODAL_Z_INDEX + 1,
  },
});
