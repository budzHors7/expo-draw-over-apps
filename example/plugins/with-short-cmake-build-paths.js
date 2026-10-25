const {
  withAppBuildGradle,
  withProjectBuildGradle,
} = require('expo/config-plugins');

const MARKER = 'expo-draw-over-apps-short-cmake-build-paths';
const START_MARKER = `// ${MARKER}`;
const END_MARKER = `// ${MARKER}-end`;
const APP_ARGUMENTS_MARKER = `${MARKER}-app-arguments`;
const APP_START_MARKER = `// ${APP_ARGUMENTS_MARKER}`;
const APP_END_MARKER = `// ${APP_ARGUMENTS_MARKER}-end`;
const APP_STAGING_MARKER = `${MARKER}-app-staging`;
const APP_STAGING_START_MARKER = `// ${APP_STAGING_MARKER}`;
const APP_STAGING_END_MARKER = `// ${APP_STAGING_MARKER}-end`;

const SNIPPET = `
${START_MARKER}
def expoDrawOverAppsShortCmakeProjects = [
  "expo-modules-core": "e",
  "react-native-worklets": "w",
  "react-native-reanimated": "r"
]
def expoDrawOverAppsNativeBuildRoot = new File(rootProject.projectDir, "../.cxx")

subprojects { subproject ->
  if (expoDrawOverAppsShortCmakeProjects.containsKey(subproject.name)) {
    subproject.plugins.withId("com.android.library") {
      subproject.android {
        externalNativeBuild {
          cmake {
            buildStagingDirectory new File(
              expoDrawOverAppsNativeBuildRoot,
              expoDrawOverAppsShortCmakeProjects[subproject.name]
            )
          }
        }
        defaultConfig {
          externalNativeBuild {
            cmake {
              arguments "-DCMAKE_OBJECT_PATH_MAX=250"
            }
          }
        }
      }
    }
  }
}
${END_MARKER}
`;

const APP_STAGING_SNIPPET = `    ${APP_STAGING_START_MARKER}
    externalNativeBuild {
        cmake {
            buildStagingDirectory new File(rootProject.projectDir, "../.cxx/a")
        }
    }
    ${APP_STAGING_END_MARKER}
`;

const APP_ARGUMENTS_SNIPPET = `        ${APP_START_MARKER}
        externalNativeBuild {
            cmake {
                arguments "-DCMAKE_OBJECT_PATH_MAX=250"
            }
        }
        ${APP_END_MARKER}
`;

function upsertSnippet(contents) {
  const start = contents.indexOf(START_MARKER);
  let before = contents;
  let after = '';

  if (start >= 0) {
    before = contents.slice(0, start);
    const end = contents.indexOf(END_MARKER, start);
    if (end >= 0) {
      after = contents.slice(end + END_MARKER.length);
    }
  }

  return [before.trimEnd(), SNIPPET.trim(), after.trimStart()]
    .filter(Boolean)
    .join('\n\n')
    .concat('\n');
}

function removeMarkedBlock(contents, startMarker, endMarker) {
  const start = contents.indexOf(startMarker);
  if (start >= 0) {
    const lineStart = contents.lastIndexOf('\n', start) + 1;
    const end = contents.indexOf(endMarker, start);
    if (end < 0) {
      throw new Error(`Missing ${endMarker} in android/app/build.gradle`);
    }

    const nextLine = contents.indexOf('\n', end + endMarker.length);
    return (
      contents.slice(0, lineStart) +
      contents.slice(nextLine < 0 ? contents.length : nextLine + 1)
    );
  }

  return contents;
}

function insertAfterMatchingLine(contents, pattern, snippet, description) {
  const match = pattern.exec(contents);
  if (!match || match.index == null) {
    throw new Error(`Could not find ${description} in android/app/build.gradle`);
  }

  const lineEnd = contents.indexOf('\n', match.index);
  const insertAt = lineEnd < 0 ? contents.length : lineEnd + 1;
  return contents.slice(0, insertAt) + snippet + contents.slice(insertAt);
}

function upsertAppSnippet(contents) {
  contents = removeMarkedBlock(contents, APP_START_MARKER, APP_END_MARKER);
  contents = removeMarkedBlock(
    contents,
    APP_STAGING_START_MARKER,
    APP_STAGING_END_MARKER
  );

  contents = insertAfterMatchingLine(
    contents,
    /^android\s*\{[ \t]*\r?$/m,
    APP_STAGING_SNIPPET,
    'android block'
  );

  return insertAfterMatchingLine(
    contents,
    /^[ \t]*defaultConfig\s*\{[ \t]*\r?$/m,
    APP_ARGUMENTS_SNIPPET,
    'android.defaultConfig'
  );
}

function withShortCmakeBuildPaths(config) {
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }

    config.modResults.contents = upsertSnippet(config.modResults.contents);

    return config;
  });

  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }

    config.modResults.contents = upsertAppSnippet(config.modResults.contents);
    return config;
  });
}

module.exports = withShortCmakeBuildPaths;
module.exports.upsertSnippet = upsertSnippet;
module.exports.upsertAppSnippet = upsertAppSnippet;
