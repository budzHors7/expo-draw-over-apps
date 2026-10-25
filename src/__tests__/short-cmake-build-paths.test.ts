import fs from 'node:fs';
import path from 'node:path';

const pluginSource = fs.readFileSync(
  path.resolve(__dirname, '../../example/plugins/with-short-cmake-build-paths.js'),
  'utf8'
);
const {
  upsertSnippet,
  upsertAppSnippet,
} = require('../../example/plugins/with-short-cmake-build-paths') as {
  upsertSnippet: (contents: string) => string;
  upsertAppSnippet: (contents: string) => string;
};

describe('Windows CMake build path configuration', () => {
  it('keeps native intermediates inside the example while forcing hashed object paths', () => {
    expect(pluginSource).toContain(
      'new File(rootProject.projectDir, "../.cxx")'
    );
    expect(pluginSource).toContain('"expo-modules-core": "e"');
    expect(pluginSource).toContain('withAppBuildGradle');
    expect(pluginSource).toContain('arguments "-DCMAKE_OBJECT_PATH_MAX=250"');
    expect(pluginSource).not.toContain('new File(rootProject.buildDir');
  });

  it('replaces the legacy generated block and remains idempotent', () => {
    const legacyContents = `plugins {}\n\n// expo-draw-over-apps-short-cmake-build-paths\nold block\n`;
    const updatedContents = upsertSnippet(legacyContents);

    expect(updatedContents).not.toContain('old block');
    expect(updatedContents).toContain('CMAKE_OBJECT_PATH_MAX=250');
    expect(upsertSnippet(updatedContents)).toBe(updatedContents);
  });

  it('adds the object-path limit to the app defaultConfig before AGP reads it', () => {
    const appBuildGradle = `android {\n    defaultConfig {\n        applicationId 'example'\n    }\n}\n`;
    const updatedContents = upsertAppSnippet(appBuildGradle);

    expect(updatedContents).toContain(
      'buildStagingDirectory new File(rootProject.projectDir, "../.cxx/a")'
    );
    expect(updatedContents).toContain('CMAKE_OBJECT_PATH_MAX=250');
    expect(upsertAppSnippet(updatedContents)).toBe(updatedContents);
  });
});
