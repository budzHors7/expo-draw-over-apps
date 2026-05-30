const { withProjectBuildGradle } = require('expo/config-plugins');

const MARKER = 'expo-draw-over-apps-short-cmake-build-paths';

const SNIPPET = `
// ${MARKER}
def expoDrawOverAppsShortCmakeProjects = ["react-native-worklets", "react-native-reanimated"] as Set

subprojects { subproject ->
  if (expoDrawOverAppsShortCmakeProjects.contains(subproject.name)) {
    subproject.plugins.withId("com.android.library") {
      subproject.android {
        externalNativeBuild {
          cmake {
            buildStagingDirectory new File(rootProject.buildDir, "native-cxx/\${subproject.name}")
          }
        }
      }
    }
  }
}
`;

module.exports = function withShortCmakeBuildPaths(config) {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language !== 'groovy') {
      return config;
    }

    if (!config.modResults.contents.includes(MARKER)) {
      config.modResults.contents = `${config.modResults.contents.trimEnd()}\n${SNIPPET}\n`;
    }

    return config;
  });
};
