import React, { useEffect, useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  View,
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

type ExpoUiRuntime = {
  Host: React.ComponentType<any>;
  Shape?: {
    RoundedCorner?: (props: { cornerRadii?: Record<string, number> }) => React.ReactElement;
  };
  Surface?: React.ComponentType<any>;
};

type ExpoUiModifiersRuntime = {
  fillMaxSize?: (fraction?: number) => unknown;
  size?: (width: number, height: number) => unknown;
};

export type ExpoDrawOverAppsWindowAnimationConfig = Partial<WithTimingConfig> & {
  /**
   * Duration used for size and radius changes. Defaults to 220ms.
   */
  duration?: number;
};

export type ExpoDrawOverAppsWindowContainerProps = ViewProps &
  NativeWindProps & {
    children?: React.ReactNode;
    /**
     * Animated window width. Numeric values are animated with Reanimated.
     */
    width?: number;
    /**
     * Animated window height. Numeric values are animated with Reanimated.
     */
    height?: number;
    /**
     * Animated corner radius used by the outer clipping surface.
     */
    borderRadius?: number;
    /**
     * Surface color used behind children and as the clipped backdrop.
     */
    backgroundColor?: ColorValue;
    /**
     * Styles for the outer floating window surface. Numeric width, height, and
     * borderRadius values are also used as animated targets.
     */
    style?: StyleProp<ViewStyle>;
    /**
     * Styles for the child content wrapper.
     */
    contentContainerStyle?: StyleProp<ViewStyle>;
    /**
     * NativeWind classes for the child content wrapper.
     */
    contentClassName?: string;
    /**
     * Reanimated timing config. Pass `duration: 0` to disable smooth resizing.
     */
    animationConfig?: ExpoDrawOverAppsWindowAnimationConfig;
  };

export type ExpoDrawOverAppsNativeWindowContainerProps = ExpoDrawOverAppsWindowContainerProps & {
  /**
   * Expo UI Host color scheme. Android only.
   */
  colorScheme?: 'light' | 'dark' | null;
  /**
   * Expo UI Material 3 seed color. Android only.
   */
  seedColor?: ColorValue;
  /**
   * Native Surface color. Defaults to `backgroundColor`.
   */
  surfaceColor?: ColorValue;
  /**
   * Native Surface content color.
   */
  contentColor?: ColorValue;
  /**
   * Native Surface tonal elevation.
   */
  tonalElevation?: number;
  /**
   * Native Surface shadow elevation. Defaults to 0 because the React Native
   * clipping wrapper owns the rounded mask in overlay windows.
   */
  shadowElevation?: number;
};

const DEFAULT_RADIUS = 24;
const DEFAULT_BACKGROUND = '#ffffff';
const DEFAULT_ANIMATION_DURATION = 220;

let expoUiRuntime: ExpoUiRuntime | null | undefined;
let expoUiModifiersRuntime: ExpoUiModifiersRuntime | null | undefined;

function getExpoUiRuntime() {
  if (expoUiRuntime !== undefined) {
    return expoUiRuntime;
  }

  try {
    // Optional peer dependency. React Native renderers should keep working when
    // an app does not install @expo/ui.
    expoUiRuntime = require('@expo/ui/jetpack-compose') as ExpoUiRuntime;
  } catch {
    expoUiRuntime = null;
  }

  return expoUiRuntime;
}

function getExpoUiModifiersRuntime() {
  if (expoUiModifiersRuntime !== undefined) {
    return expoUiModifiersRuntime;
  }

  try {
    expoUiModifiersRuntime = require('@expo/ui/jetpack-compose/modifiers') as ExpoUiModifiersRuntime;
  } catch {
    expoUiModifiersRuntime = null;
  }

  return expoUiModifiersRuntime;
}

function getFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getTimingConfig(animationConfig?: ExpoDrawOverAppsWindowAnimationConfig): WithTimingConfig {
  return {
    duration: animationConfig?.duration ?? DEFAULT_ANIMATION_DURATION,
    easing: animationConfig?.easing ?? Easing.out(Easing.cubic),
    reduceMotion: animationConfig?.reduceMotion,
  };
}

function useTimingValue(target: number | undefined, animationConfig?: ExpoDrawOverAppsWindowAnimationConfig) {
  const value = useSharedValue(target ?? -1);

  useEffect(() => {
    value.value =
      target == null ? -1 : withTiming(target, getTimingConfig(animationConfig));
  }, [animationConfig, target, value]);

  return value;
}

function useWindowAnimatedStyle(
  style: StyleProp<ViewStyle>,
  width: number | undefined,
  height: number | undefined,
  borderRadius: number | undefined,
  animationConfig?: ExpoDrawOverAppsWindowAnimationConfig
) {
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const targetWidth = width ?? getFiniteNumber(flattenedStyle.width);
  const targetHeight = height ?? getFiniteNumber(flattenedStyle.height);
  const targetRadius = borderRadius ?? getFiniteNumber(flattenedStyle.borderRadius) ?? DEFAULT_RADIUS;

  const animatedWidth = useTimingValue(targetWidth, animationConfig);
  const animatedHeight = useTimingValue(targetHeight, animationConfig);
  const animatedRadius = useTimingValue(targetRadius, animationConfig);

  return useAnimatedStyle(() => {
    const nextStyle: ViewStyle = {};

    if (animatedWidth.value >= 0) {
      nextStyle.width = animatedWidth.value;
    }

    if (animatedHeight.value >= 0) {
      nextStyle.height = animatedHeight.value;
    }

    if (animatedRadius.value >= 0) {
      nextStyle.borderRadius = animatedRadius.value;
    }

    return nextStyle;
  });
}

function getSurfaceColor(backgroundColor: ColorValue | undefined, style: StyleProp<ViewStyle>) {
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  return backgroundColor ?? flattenedStyle.backgroundColor ?? DEFAULT_BACKGROUND;
}

function getNativeWindProps(className: string | undefined): NativeWindProps {
  return className ? ({ className } as NativeWindProps) : {};
}

/**
 * Reanimated React Native floating-window container.
 *
 * Use this inside a bubble renderer to get smooth default resize/radius
 * transitions while keeping normal React Native styles and NativeWind classes.
 */
export function ExpoDrawOverAppsReactNativeWindowContainer({
  children,
  width,
  height,
  borderRadius,
  backgroundColor,
  style,
  contentContainerStyle,
  className,
  contentClassName,
  animationConfig,
  ...viewProps
}: ExpoDrawOverAppsWindowContainerProps) {
  const surfaceColor = getSurfaceColor(backgroundColor, style);
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

/**
 * Expo UI native floating-window container with React Native children.
 *
 * On Android with `@expo/ui` installed, this renders an Expo UI Host/Surface
 * as the native backdrop and layers React Native children inside the same
 * clipped Reanimated window. On other platforms, or without `@expo/ui`, it
 * falls back to the Reanimated React Native container.
 */
export function ExpoDrawOverAppsNativeWindowContainer({
  children,
  colorScheme,
  seedColor,
  surfaceColor,
  contentColor,
  tonalElevation = 0,
  shadowElevation = 0,
  contentContainerStyle,
  contentClassName,
  width,
  height,
  borderRadius,
  backgroundColor,
  style,
  ...containerProps
}: ExpoDrawOverAppsNativeWindowContainerProps) {
  const expoUi = getExpoUiRuntime();
  const modifiers = getExpoUiModifiersRuntime();
  const outerBackground = getSurfaceColor(backgroundColor, style);
  const radius =
    borderRadius ?? getFiniteNumber((StyleSheet.flatten(style) ?? {}).borderRadius) ?? DEFAULT_RADIUS;
  const fillModifiers = useMemo(() => {
    if (modifiers?.fillMaxSize) {
      return [modifiers.fillMaxSize()];
    }

    return width != null && height != null && modifiers?.size
      ? [modifiers.size(width, height)]
      : undefined;
  }, [height, modifiers, width]);

  const nativeChildren = (
    <View
      {...getNativeWindProps(contentClassName)}
      style={[styles.contentContainer, styles.nativeChildren, contentContainerStyle]}
    >
      {children}
    </View>
  );

  if (Platform.OS !== 'android' || !expoUi?.Host || !expoUi.Surface || !expoUi.Shape) {
    return (
      <ExpoDrawOverAppsReactNativeWindowContainer
        {...containerProps}
        width={width}
        height={height}
        borderRadius={borderRadius}
        backgroundColor={backgroundColor}
        style={style}
        contentContainerStyle={contentContainerStyle}
        contentClassName={contentClassName}
      >
        {children}
      </ExpoDrawOverAppsReactNativeWindowContainer>
    );
  }

  const Host = expoUi.Host;
  const Surface = expoUi.Surface;
  const Shape = expoUi.Shape;

  return (
    <ExpoDrawOverAppsReactNativeWindowContainer
      {...containerProps}
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor={backgroundColor}
      style={style}
      contentContainerStyle={styles.nativeHostWrapper}
    >
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Host
          matchContents={false}
          colorScheme={colorScheme ?? undefined}
          seedColor={seedColor}
          style={styles.nativeHost}
        >
          <Surface
            color={surfaceColor ?? outerBackground}
            contentColor={contentColor}
            tonalElevation={tonalElevation}
            shadowElevation={shadowElevation}
            shape={Shape.RoundedCorner?.({
              cornerRadii: {
                topStart: radius,
                topEnd: radius,
                bottomStart: radius,
                bottomEnd: radius,
              },
            })}
            modifiers={fillModifiers}
          />
        </Host>
      </View>
      {nativeChildren}
    </ExpoDrawOverAppsReactNativeWindowContainer>
  );
}

const styles = StyleSheet.create({
  windowSurface: {
    overflow: 'hidden',
    backgroundColor: DEFAULT_BACKGROUND,
  },
  contentContainer: {
    flexShrink: 1,
    backgroundColor: 'transparent',
  },
  nativeHostWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  nativeHost: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  nativeChildren: {
    flex: 1,
  },
});
