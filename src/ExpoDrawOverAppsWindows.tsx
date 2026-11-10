import React, { useEffect } from 'react';
import { Host, type HostProps } from '@expo/ui/jetpack-compose';
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

export type ReactNativeWindowProps = ViewProps &
  NativeWindProps & {
    children?: React.ReactNode;
    /** Animated window width. Non-finite values are ignored. */
    width?: number;
    /** Animated window height. Non-finite values are ignored. */
    height?: number;
    /** Animated corner radius used by the outer clipping surface. */
    borderRadius?: number;
    /** Surface color used behind the child content. */
    backgroundColor?: ColorValue;
    /** Force a light or dark surface. Omit or pass `null` to follow the system. */
    colorScheme?: WindowColorScheme;
    /** Styles for the outer floating window surface. */
    style?: StyleProp<ViewStyle>;
    /** Styles for the child content wrapper. */
    contentContainerStyle?: StyleProp<ViewStyle>;
    /** NativeWind classes for the child content wrapper. */
    contentClassName?: string;
    /** Reanimated timing config. Pass `duration: 0` to disable smooth resizing. */
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
    width: animatedWidth.value >= 0 ? animatedWidth.value : undefined,
    height: animatedHeight.value >= 0 ? animatedHeight.value : undefined,
    borderRadius: animatedRadius.value >= 0 ? animatedRadius.value : undefined,
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
  return backgroundColor ??
    flattenedStyle.backgroundColor ??
    (colorScheme === 'dark' ? DEFAULT_DARK_BACKGROUND : DEFAULT_LIGHT_BACKGROUND);
}

function getNativeWindProps(className: string | undefined): NativeWindProps {
  return className ? ({ className } as NativeWindProps) : {};
}

/** A Reanimated React Native window for application-owned bubble renderers. */
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
  const resolvedColorScheme = useResolvedColorScheme(colorScheme);
  const surfaceColor = getSurfaceColor(backgroundColor, style, resolvedColorScheme);
  const animatedStyle = useWindowAnimatedStyle(style, width, height, borderRadius, animationConfig);

  return (
    <Animated.View
      {...viewProps}
      {...getNativeWindProps(className)}
      collapsable={false}
      renderToHardwareTextureAndroid
      needsOffscreenAlphaCompositing
      style={[styles.windowSurface, { backgroundColor: surfaceColor }, style, animatedStyle]}
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

/** A direct Expo UI Jetpack Compose host for application-owned native windows. */
export function NativeWindow({ children, matchContents, ...hostProps }: NativeWindowProps) {
  return (
    <Host {...hostProps} matchContents={matchContents ?? true}>
      {children}
    </Host>
  );
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
