const ReactNative = require('react-native');

const Animated = {
  View: ReactNative.View,
  createAnimatedComponent: (component) => component,
};

function useSharedValue(initialValue) {
  return { value: initialValue };
}

function useAnimatedStyle(worklet) {
  return worklet();
}

function withTiming(value) {
  return value;
}

const Easing = {
  cubic: (value) => value,
  out: (easing) => easing,
};

module.exports = {
  __esModule: true,
  default: Animated,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
};
