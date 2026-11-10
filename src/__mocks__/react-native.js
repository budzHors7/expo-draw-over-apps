const React = require('react');

const hostComponent = (name) => name;

module.exports = {
  AppRegistry: {
    registerComponent: jest.fn(),
  },
  Platform: {
    OS: 'android',
  },
  Pressable: hostComponent('Pressable'),
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => {
      if (!Array.isArray(style)) return style || {};
      return Object.assign({}, ...style.filter(Boolean).map((entry) => module.exports.StyleSheet.flatten(entry)));
    },
    absoluteFill: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  Text: hostComponent('Text'),
  useColorScheme: jest.fn(() => 'light'),
  View: hostComponent('View'),
  __esModule: true,
  default: React,
};
