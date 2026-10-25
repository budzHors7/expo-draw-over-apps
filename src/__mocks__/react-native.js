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
      if (!Array.isArray(style)) return style ?? {};
      return Object.assign({}, ...style.map(module.exports.StyleSheet.flatten));
    },
  },
  Text: hostComponent('Text'),
  useColorScheme: () => 'light',
  View: hostComponent('View'),
  __esModule: true,
  default: React,
};
