import {useRef, useEffect} from 'react';
import {Animated, StyleSheet, TouchableOpacity} from 'react-native';

interface ThemeButtonProps {
  isSelected: boolean;
  onPress: () => void;
  backgroundColor: string;
  borderColor: string;
}

export default function ThemeButton({
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

const themeButtonBorderSize = 32;
const themeButtonInnerSize = 20;
const themeButtonSelectedInnerSize = 10;

const styles = StyleSheet.create({
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
