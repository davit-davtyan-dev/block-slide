import {useRef, useEffect} from 'react';
import {Animated, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Text} from '..';
import {useTheme} from '../../contexts/ThemeContext';
import {addOpacityToHex} from '../../helpers';

import type {ColorScheme} from '../../hooks/useColorScheme';

export default function ColorSchemeButton({
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
        <Text ml={2} color={theme.mainColor}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  colorSchemeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
});
