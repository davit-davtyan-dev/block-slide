import React, {useRef, useEffect, useState} from 'react';
import {Animated, StyleSheet, Dimensions, Easing} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {View} from '..';
import MenuContent from './MenuContent';
import AnimatedMenuIcon from './AnimatedMenuIcon';
import {useTheme} from '../../contexts/ThemeContext';
import {ANIMATION_DEFAULT_DURATION} from '../../constants';
import {
  MENU_MODAL_Z_INDEX,
  SIDE_MENU_WIDTH_PERCENTAGE,
  SIDE_MENU_HEIGHT_PERCENTAGE,
  MENU_ICON_SIZE,
  MENU_ICON_PADDING,
  MODAL_POSITION_TOP,
} from './constants';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const sideMenuWidth = screenWidth * SIDE_MENU_WIDTH_PERCENTAGE;
const sideMenuHeight = screenHeight * SIDE_MENU_HEIGHT_PERCENTAGE;
const sideMenuMargin = (screenWidth - sideMenuWidth) / 2;

export default function SideMenu() {
  const [isVisible, setIsVisible] = useState(false);
  const {effectiveColorScheme, theme, statusBarBluryViewOpacity} = useTheme();

  const translateX = useRef(new Animated.Value(screenWidth)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: ANIMATION_DEFAULT_DURATION * 2,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(statusBarBluryViewOpacity, {
          toValue: 1,
          duration: ANIMATION_DEFAULT_DURATION * 2,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: screenWidth,
          duration: ANIMATION_DEFAULT_DURATION * 2,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(statusBarBluryViewOpacity, {
          toValue: 0,
          duration: ANIMATION_DEFAULT_DURATION * 2,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, translateX, statusBarBluryViewOpacity]);

  return (
    <View position="absolute" top={0} left={0} w="100%" h="100%">
      {/* Menu modal */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            backgroundColor: theme.backgroundColor,
            borderColor: theme.mainColor,
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [0, screenWidth],
                  outputRange: [0, screenWidth],
                }),
              },
            ],
          },
        ]}>
        <MenuContent />
      </Animated.View>
      {/* Menu Icon */}
      <AnimatedMenuIcon
        opened={isVisible}
        size={MENU_ICON_SIZE}
        color={theme.mainColor}
        onPress={() => setIsVisible(!isVisible)}
        translateConfig={{
          x: {
            start: 16,
            end:
              sideMenuWidth +
              sideMenuMargin -
              MENU_ICON_SIZE * 1.5 -
              MENU_ICON_PADDING,
          },
          y: {
            start: 16,
            end: MODAL_POSITION_TOP + MENU_ICON_PADDING,
          },
        }}
      />
      <Animated.View
        style={[styles.absolute, {opacity: statusBarBluryViewOpacity}]}>
        <BlurView
          style={styles.absolute}
          blurType={effectiveColorScheme}
          blurAmount={10}
          reducedTransparencyFallbackColor="white"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  absolute: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    position: 'absolute',
    top: MODAL_POSITION_TOP,
    left: sideMenuMargin,
    width: sideMenuWidth,
    height: sideMenuHeight,
    borderWidth: 2,
    borderRadius: 16,
    zIndex: MENU_MODAL_Z_INDEX,
  },
});
