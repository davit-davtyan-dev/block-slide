import React, {useRef, useEffect} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Animated, StyleSheet, TouchableOpacity, Dimensions} from 'react-native';
import {View, Text, Divider} from '.';
import {useTheme, themes} from '../contexts/ThemeContext';
import {addOpacityToHex} from '../helpers';

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

function ColorSchemeButton({
  icon,
  label,
  isSelected,
  onPress,
}: {
  scheme: ColorScheme;
  icon: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const {theme} = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.1 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [isSelected, scaleAnim]);

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View
        style={[
          styles.colorSchemeButton,
          {transform: [{scale: scaleAnim}]},
          isSelected && {
            backgroundColor: addOpacityToHex(theme.mainColor, 0.2),
            borderColor: theme.mainColor,
          },
        ]}>
        <Icon name={icon} size={24} color={theme.mainColor} />
        <Text color={theme.mainColor} style={styles.colorSchemeButtonText}>
          {label}
        </Text>
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
    themeName,
    setThemeName,
    colorScheme,
    effectiveColorScheme,
    setColorScheme,
    animatedBackgroundColor,
    animatedMainColor,
    theme,
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
            backgroundColor: animatedBackgroundColor,
          },
        ]}>
        <View style={styles.header}>
          <Animated.Text
            style={[styles.headerText, {color: animatedMainColor}]}>
            Menu
          </Animated.Text>
          <TouchableOpacity onPress={onClose}>
            <Animated.Text style={{color: animatedMainColor}}>
              <Icon name="close" size={24} />
            </Animated.Text>
          </TouchableOpacity>
        </View>

        <Divider />

        <View style={styles.section}>
          <Animated.Text
            style={[styles.sectionTitle, {color: animatedMainColor}]}>
            Color Scheme
          </Animated.Text>
          <View style={styles.colorSchemeOptions}>
            <ColorSchemeButton
              scheme={ColorScheme.Light}
              icon="wb-sunny"
              label="Light"
              isSelected={colorScheme === ColorScheme.Light}
              onPress={() => setColorScheme(ColorScheme.Light)}
            />
            <ColorSchemeButton
              scheme={ColorScheme.Dark}
              icon="nightlight-round"
              label="Dark"
              isSelected={colorScheme === ColorScheme.Dark}
              onPress={() => setColorScheme(ColorScheme.Dark)}
            />
            <ColorSchemeButton
              scheme={ColorScheme.System}
              icon="settings"
              label="System"
              isSelected={colorScheme === ColorScheme.System}
              onPress={() => setColorScheme(ColorScheme.System)}
            />
          </View>
        </View>

        <Divider />

        <View style={styles.section}>
          <Animated.Text
            style={[styles.sectionTitle, {color: animatedMainColor}]}>
            Theme Palette
          </Animated.Text>
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
          <Animated.Text
            style={[styles.sectionTitle, {color: animatedMainColor}]}>
            Settings
          </Animated.Text>
          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.option, {borderColor: theme.mainColor}]}>
              <Animated.Text style={{color: animatedMainColor}}>
                Sound
              </Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.option, {borderColor: theme.mainColor}]}>
              <Animated.Text style={{color: animatedMainColor}}>
                Vibration
              </Animated.Text>
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
  colorSchemeOptions: {
    flexDirection: 'column',
    gap: 12,
  },
  colorSchemeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  colorSchemeButtonText: {
    marginLeft: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
