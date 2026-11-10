import fs from 'node:fs';
import path from 'node:path';

const repositoryRoot = path.resolve(__dirname, '..', '..');

function readJson(relativePath: string): Record<string, any> {
  return JSON.parse(fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8'));
}

describe('Expo SDK 58 configuration', () => {
  it('targets the Expo SDK 58 dependency line', () => {
    const packageJson = readJson('package.json');
    const examplePackageJson = readJson('example/package.json');
    const appJson = readJson('example/app.json');
    const buildProperties = appJson.expo.plugins.find(
      (plugin: unknown) => Array.isArray(plugin) && plugin[0] === 'expo-build-properties'
    )[1].android;

    expect(packageJson.version).toBe('58.0.0');
    expect(packageJson.devDependencies).toMatchObject({
      '@types/jest': '30.0.0',
      expo: '~58.0.23',
      jest: '~30.5.2',
      react: '19.3.0',
      'react-native': '0.88.1',
      'react-native-reanimated': '4.7.1',
      'react-native-worklets': '0.13.0',
      'ts-jest': '~29.4.15',
    });
    expect(packageJson.peerDependenciesMeta?.['@expo/ui']).toBeUndefined();
    expect(examplePackageJson.dependencies).toMatchObject({
      '@expo/ui': '~58.0.27',
      expo: '~58.0.23',
      react: '19.3.0',
      'react-native': '0.88.1',
      'react-native-reanimated': '4.7.1',
      'react-native-worklets': '0.13.0',
    });
    expect(appJson.expo.version).toBe('58.0.0');
    expect(buildProperties.compileSdkVersion).toBe(37);
    expect(buildProperties.targetSdkVersion).toBe(36);
  });

  it('opts the Android module into v2 compile-time discovery', () => {
    const androidGradle = fs.readFileSync(
      path.join(repositoryRoot, 'android/build.gradle'),
      'utf8'
    );
    const moduleConfig = readJson('expo-module.config.json');

    expect(androidGradle).toContain("version = '58.0.0'");
    expect(androidGradle).toContain('versionName "58.0.0"');
    expect(androidGradle).toMatch(/expoModule\s*\{\s*v2\s+true\s*\}/);
    expect(moduleConfig.platforms).toEqual(['android']);
    expect(moduleConfig.android).toBeUndefined();
  });
});
