import React, {useRef, useEffect} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Animated, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {View, Text, Divider} from '.';
import {useTheme, themes} from '../contexts/ThemeContext';

import {ColorScheme} from '../hooks/useColorScheme';
import type {ThemeNames} from '../contexts/ThemeContext';

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

interface ThemeButtonProps {
  isSelected: boolean;
  onPress: () => void;
  backgroundColor: string;
  borderColor: string;
}

function ThemeButton({
  isSelected,
  onPress,
  backgroundColor,
  borderColor,
}: ThemeButtonProps) {
  const borderScaleAnim = useRef(new Animated.Value(1)).current;
  const innerScaleAnim = useRef(new Animated.Value(1)).current;
  const selectedInnerScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(innerScaleAnim, {
        toValue: isSelected ? 1.2 : 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(selectedInnerScaleAnim, {
        toValue: isSelected ? 1 : 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [isSelected, borderScaleAnim, innerScaleAnim, selectedInnerScaleAnim]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.themeButtonWrapper}>
      {/* Background view (becomes border when selected) */}
      <Animated.View
        style={[
          styles.themeButtonBorder,
          {
            backgroundColor: borderColor,
            transform: [{scale: borderScaleAnim}],
          },
        ]}>
        {/* Border view (becomes inner when selected) */}
        <Animated.View
          style={[
            styles.themeButtonInner,
            {
              backgroundColor: backgroundColor,
              transform: [{scale: innerScaleAnim}],
            },
          ]}>
          {/* Selected inner view */}
          <Animated.View
            style={[
              styles.themeButtonSelectedInner,
              {
                backgroundColor: borderColor,
                transform: [{scale: selectedInnerScaleAnim}],
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Golden ratio
const SIDE_MENU_WIDTH_PERCENTAGE = 0.618;
const sideMenuWidth =
  Dimensions.get('window').width * SIDE_MENU_WIDTH_PERCENTAGE;

export default function SideMenu({isVisible, onClose}: SideMenuProps) {
  const {
    theme,
    themeName,
    setThemeName,
    colorScheme,
    effectiveColorScheme,
    setColorScheme,
  } = useTheme();

  const translateX = React.useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isVisible ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, translateX]);

  return (
    <>
      {isVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{translateX}],
            backgroundColor: theme.backgroundColor,
          },
        ]}>
        <View style={styles.header}>
          <Text fontSize={20} fontWeight="bold" color={theme.mainColor}>
            Menu
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={theme.mainColor} />
          </TouchableOpacity>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text fontSize={16} fontWeight="bold" mb={8} color={theme.mainColor}>
            Color Scheme
          </Text>
          <View style={styles.options}>
            <TouchableOpacity
              style={[
                styles.textButton,
                colorScheme === ColorScheme.Light && styles.textButtonSelected,
                {borderColor: theme.mainColor},
              ]}
              onPress={() => setColorScheme(ColorScheme.Light)}>
              <Text color={theme.mainColor}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.textButton,
                colorScheme === ColorScheme.Dark && styles.textButtonSelected,
                {borderColor: theme.mainColor},
              ]}
              onPress={() => setColorScheme(ColorScheme.Dark)}>
              <Text color={theme.mainColor}>Dark</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.textButton,
                colorScheme === ColorScheme.System && styles.textButtonSelected,
                {borderColor: theme.mainColor},
              ]}
              onPress={() => setColorScheme(ColorScheme.System)}>
              <Text color={theme.mainColor}>System</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text fontSize={16} fontWeight="bold" mb={8} color={theme.mainColor}>
            Theme Palette
          </Text>
          <View style={styles.options}>
            {Object.entries(themes).map(([name, themeConfig]) => (
              <ThemeButton
                key={name}
                isSelected={themeName === name}
                onPress={() => setThemeName(name as ThemeNames)}
                backgroundColor={
                  themeConfig[effectiveColorScheme].backgroundColor
                }
                borderColor={themeConfig[effectiveColorScheme].mainColor}
              />
            ))}
          </View>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text fontSize={16} fontWeight="bold" mb={8} color={theme.mainColor}>
            Settings
          </Text>
          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.option, {borderColor: theme.mainColor}]}>
              <Text color={theme.mainColor}>Sound</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, {borderColor: theme.mainColor}]}>
              <Text color={theme.mainColor}>Vibration</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const themeButtonBorderSize = 32;
const themeButtonInnerSize = 20;
const themeButtonSelectedInnerSize = 10;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: sideMenuWidth,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  section: {
    padding: 16,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  option: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  textButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  textButtonSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  themeButtonWrapper: {
    width: themeButtonBorderSize,
    height: themeButtonBorderSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeButtonBorder: {
    width: themeButtonBorderSize,
    height: themeButtonBorderSize,
    borderRadius: themeButtonBorderSize / 2,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeButtonInner: {
    width: themeButtonInnerSize,
    height: themeButtonInnerSize,
    borderRadius: themeButtonInnerSize / 2,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeButtonSelectedInner: {
    width: themeButtonSelectedInnerSize,
    height: themeButtonSelectedInnerSize,
    borderRadius: themeButtonSelectedInnerSize / 2,
    position: 'absolute',
  },
});
