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
  },
  Text: hostComponent('Text'),
  View: hostComponent('View'),
  __esModule: true,
  default: React,
};
