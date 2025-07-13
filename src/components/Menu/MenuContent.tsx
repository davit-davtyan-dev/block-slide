import {Animated} from 'react-native';
import {
  Column,
  Divider,
  Row,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from '..';
import ThemeButton from './ThemeButton';
import ColorSchemeButton from './ColorSchemeButton';
import {useTheme, themes} from '../../contexts/ThemeContext';

import {ColorScheme} from '../../hooks/useColorScheme';
import type {ThemeNames} from '../../contexts/ThemeContext';

const AnimatedText = Animated.createAnimatedComponent(Text);

export default function MenuContent() {
  const {
    themeName,
    setThemeName,
    colorScheme,
    effectiveColorScheme,
    setColorScheme,
  } = useTheme();

  return (
    <View p={4} h="100%">
      <Divider mt={10} />

      <Section title="Color Scheme">
        <Column gap={12}>
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
        </Column>
      </Section>

      <Divider />

      <Section title="Theme Palette">
        <OptionsContainer>
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
        </OptionsContainer>
      </Section>

      <Divider />

      <Section title="Settings">
        <OptionsContainer>
          <Option>Sound</Option>
          <Option>Vibration</Option>
        </OptionsContainer>
      </Section>
    </View>
  );
}

function Section({title, children, ...props}: ViewProps & {title: string}) {
  const {animatedMainColor} = useTheme();

  return (
    <View p={4} {...props}>
      <AnimatedText
        mb={2}
        fontSize={16}
        fontWeight="bold"
        color={animatedMainColor}>
        {title}
      </AnimatedText>
      {children}
    </View>
  );
}

function OptionsContainer(props: ViewProps) {
  return <Row gap={16} flexWrap="wrap" {...props} />;
}

function Option({children, ...props}: ViewProps) {
  const {animatedMainColor, theme} = useTheme();

  return (
    <TouchableOpacity
      p={2}
      borderRadius={8}
      borderWidth={1}
      borderColor={theme.mainColor}
      {...props}>
      <AnimatedText color={animatedMainColor}>{children}</AnimatedText>
    </TouchableOpacity>
  );
}
