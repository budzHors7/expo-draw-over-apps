import { Host, type HostProps } from '@expo/ui/jetpack-compose';
import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  useColorScheme,
  type ColorValue,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type WithTimingConfig,
} from 'react-native-reanimated';

type NativeWindProps = {
  className?: string;
};

type WindowColorScheme = 'light' | 'dark' | null;

export type WindowAnimationConfig = Partial<WithTimingConfig> & {
  /** Duration used for size and radius changes. Defaults to 220ms. */
  duration?: number;
};

export type ReactNativeWindowProps = Omit<ViewProps, 'style'> &
  NativeWindProps & {
    children?: React.ReactNode;
    width?: number;
    height?: number;
    borderRadius?: number;
    backgroundColor?: ColorValue;
    colorScheme?: WindowColorScheme;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    contentClassName?: string;
    animationConfig?: WindowAnimationConfig;
  };

export type NativeWindowProps = HostProps;

const DEFAULT_RADIUS = 24;
const DEFAULT_LIGHT_BACKGROUND = '#ffffff';
const DEFAULT_DARK_BACKGROUND = '#111827';
const DEFAULT_ANIMATION_DURATION = 220;

function getFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function sanitizeWindowStyle(style: StyleProp<ViewStyle>): ViewStyle | undefined {
  const flattenedStyle = StyleSheet.flatten(style);
  if (!flattenedStyle) return undefined;

  const sanitizedStyle = { ...flattenedStyle };
  for (const property of ['width', 'height', 'borderRadius'] as const) {
    const value = sanitizedStyle[property];
    if (typeof value === 'number' && !Number.isFinite(value)) {
      delete sanitizedStyle[property];
    }
  }
  return sanitizedStyle;
}

function getTimingConfig(animationConfig?: WindowAnimationConfig): WithTimingConfig {
  return {
    duration: animationConfig?.duration ?? DEFAULT_ANIMATION_DURATION,
    easing: animationConfig?.easing ?? Easing.out(Easing.cubic),
    reduceMotion: animationConfig?.reduceMotion,
  };
}

function useTimingValue(target: number | undefined, animationConfig?: WindowAnimationConfig) {
  const value = useSharedValue(target ?? -1);

  useEffect(() => {
    value.value = target == null ? -1 : withTiming(target, getTimingConfig(animationConfig));
  }, [animationConfig, target, value]);

  return value;
}

function useWindowAnimatedStyle(
  style: StyleProp<ViewStyle>,
  width: number | undefined,
  height: number | undefined,
  borderRadius: number | undefined,
  animationConfig?: WindowAnimationConfig
) {
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const targetWidth = getFiniteNumber(width) ?? getFiniteNumber(flattenedStyle.width);
  const targetHeight = getFiniteNumber(height) ?? getFiniteNumber(flattenedStyle.height);
  const targetRadius =
    getFiniteNumber(borderRadius) ??
    getFiniteNumber(flattenedStyle.borderRadius) ??
    DEFAULT_RADIUS;

  const animatedWidth = useTimingValue(targetWidth, animationConfig);
  const animatedHeight = useTimingValue(targetHeight, animationConfig);
  const animatedRadius = useTimingValue(targetRadius, animationConfig);

  return useAnimatedStyle(() => ({
    ...(animatedWidth.value >= 0 ? { width: animatedWidth.value } : {}),
    ...(animatedHeight.value >= 0 ? { height: animatedHeight.value } : {}),
    ...(animatedRadius.value >= 0 ? { borderRadius: animatedRadius.value } : {}),
  }));
}

function useResolvedColorScheme(colorScheme: WindowColorScheme | undefined) {
  const systemColorScheme = useColorScheme();
  return colorScheme ?? (systemColorScheme === 'dark' ? 'dark' : 'light');
}

function getSurfaceColor(
  backgroundColor: ColorValue | undefined,
  style: StyleProp<ViewStyle>,
  colorScheme: 'light' | 'dark'
) {
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const defaultColor =
    colorScheme === 'dark' ? DEFAULT_DARK_BACKGROUND : DEFAULT_LIGHT_BACKGROUND;
  return backgroundColor ?? flattenedStyle.backgroundColor ?? defaultColor;
}

function getNativeWindProps(className: string | undefined): NativeWindProps {
  return className ? { className } : {};
}

/**
 * A content-agnostic floating-window root for application-owned React Native UI.
 */
export function ReactNativeWindow({
  children,
  width,
  height,
  borderRadius,
  backgroundColor,
  colorScheme,
  style,
  contentContainerStyle,
  className,
  contentClassName,
  animationConfig,
  ...viewProps
}: ReactNativeWindowProps) {
  const sanitizedStyle = sanitizeWindowStyle(style);
  const resolvedColorScheme = useResolvedColorScheme(colorScheme);
  const surfaceColor = getSurfaceColor(backgroundColor, sanitizedStyle, resolvedColorScheme);
  const animatedStyle = useWindowAnimatedStyle(
    sanitizedStyle,
    width,
    height,
    borderRadius,
    animationConfig
  );

  return (
    <Animated.View
      {...viewProps}
      {...getNativeWindProps(className)}
      collapsable={false}
      renderToHardwareTextureAndroid
      needsOffscreenAlphaCompositing
      style={[styles.windowSurface, { backgroundColor: surfaceColor }, sanitizedStyle, animatedStyle]}
    >
      <View
        {...getNativeWindProps(contentClassName)}
        style={[styles.contentContainer, contentContainerStyle]}
      >
        {children}
      </View>
    </Animated.View>
  );
}

/**
 * A content-agnostic floating-window root for application-owned Jetpack Compose UI.
 */
export function NativeWindow({ matchContents, ...hostProps }: NativeWindowProps) {
  return <Host {...hostProps} matchContents={matchContents ?? true} />;
}

const styles = StyleSheet.create({
  windowSurface: {
    overflow: 'hidden',
    backgroundColor: DEFAULT_LIGHT_BACKGROUND,
  },
  contentContainer: {
    flexShrink: 1,
    backgroundColor: 'transparent',
  },
});
