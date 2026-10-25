# Expo SDK 58 Hard-Cut Design

## Intent

Move `expo-draw-over-apps` from Expo SDK 57 to SDK 58 and adopt the Android Expo Modules 2.0 beta API. At the same time, reduce the module's UI opinion to two content-agnostic window components that users can copy, paste, and fill with their own UI:

- `ReactNativeWindow` for ordinary React Native content.
- `NativeWindow` for `@expo/ui/jetpack-compose` content.

The package will stop shipping a pretend Compose renderer or prebuilt bubble presentation. Its responsibility is to create and manage overlay windows; application-owned children define what those windows display.

## Goals

- Target Expo SDK 58 and its matching React Native, React, Expo UI, Reanimated, Worklets, and module-tooling versions.
- Migrate the Android native module from `ModuleDefinition` to Expo Modules 2.0 annotations and compile-time discovery.
- Replace the two old `*WindowContainer` exports with exactly `ReactNativeWindow` and `NativeWindow`; do not retain deprecated aliases.
- Make `NativeWindow` a real Expo UI `Host` boundary that directly accepts Jetpack Compose components. React Native content inside it is possible only through Expo UI's documented `RNHostView` interop.
- Keep the permission, overlay lifecycle, named-bubble, edge-hide, shared-value, renderer-registration, and preview capabilities needed to mount user-owned window content.
- Reduce the example app to two representative overlay choices: one React Native window and one native Compose window.
- Replace the SDK 55/56/57 documentation matrix with one unversioned SDK 58 documentation experience containing short, complete, copy-paste examples.
- Validate both window paths in the running Android emulator, including permission, opening, interaction, resizing, closing, and absence of crashes.

## Non-goals

- Backward compatibility with SDK 55, 56, or 57.
- Deprecated aliases for `ReactNativeWindowContainer`, `NativeWindowContainer`, or the packaged Compose renderer APIs.
- Shipping a styled/default counter, timer, or other application-specific bubble renderer from the library.
- Adding iOS support; Android remains the only native platform.
- Replacing the existing overlay service, dragging, docking, or named-window behavior when it already works under SDK 58.

## Anti-goals

- A `NativeWindow` that merely paints a native backdrop and then overlays React Native children.
- Documentation that asks readers to choose an old SDK track or assemble examples from several pages.
- Silent fallbacks from native Compose to React Native. A missing `@expo/ui` dependency should produce an actionable development error.
- Compatibility code that leaves the removed `WindowContainer` names in the public declarations or generated API reference.

## Constraints

- Expo SDK 58 uses React Native 0.88 and Android Expo Modules 2.0 is beta.
- The native module must opt into v2 in Gradle and use the SDK 58 `io.github.expo.modules.v2` API.
- V2 Android modules are discovered at compile time, so the legacy Android module-class list in `expo-module.config.json` must be removed.
- Overlay UI is hosted by a React Native surface outside the activity's normal view tree; both React Native and Expo UI composition must work within that service-owned surface.
- `@expo/ui`, Reanimated, and Worklets are required SDK 58 peer dependencies. Reanimated and Worklets power animated React Native window sizing; Expo UI powers the root-exported `NativeWindow`.
- Existing static bubble IDs and shared-value keys remain non-sensitive transport identifiers.

## Approaches considered

### 1. SDK 58 hard cut — selected

Remove the old component names and packaged renderer, migrate native code to Modules 2.0, simplify the example, and publish one SDK 58 documentation path. This produces the smallest and clearest public surface and matches the requested break from multi-version documentation.

### 2. Compatibility bridge — rejected

Keep deprecated aliases for the old container names while documenting only the new names. This would reduce consumer breakage but leave four component names in the public API and conflict with the requirement to remove `WindowContainer`.

### 3. Separate native-window package — rejected

Move Compose support into another package. This would isolate the optional dependency but make installation and examples harder, and it is unnecessary now that SDK 58 provides the intended Expo UI Host and RN interop components.

## Public API design

`ReactNativeWindow` owns an animated React Native surface. It accepts React Native children, `ViewProps`, `style`, `contentContainerStyle`, NativeWind class props, numeric `width`, `height`, and `borderRadius`, plus the existing timing configuration. Its visual defaults follow the system color scheme.

`NativeWindow` owns an Expo UI `Host`. Its children are Expo UI Jetpack Compose components such as `Surface`, `Column`, `Text`, and `Button`. `NativeWindowProps` inherits and forwards the complete SDK 58 `Host` prop contract rather than maintaining a duplicate curated list. The wrapper defaults `matchContents` to true so the service-owned overlay window follows Compose content measurement. Native resize animation belongs to the child Compose modifiers; `NativeWindow` does not wrap the tree in `ReactNativeWindow` and does not accept the React-Native-only animation or content-wrapper props.

The library keeps `setBubbleRenderer` and `setBubbleRendererForBubble` because the overlay service still needs an application-supplied React component as the root. The two documented renderers consist only of one of the window components plus user-owned children. The library's default surface becomes a concise development message that tells consumers to register a renderer; no styled product UI is supplied.

The removed public API is:

- `ReactNativeWindowContainer`
- `NativeWindowContainer`
- `ExpoDrawOverAppsComposeBubbleRenderer`
- `setComposeBubbleRenderer`
- `NativeWindowContainerProps`
- `WindowContainerProps`

Types are renamed or split so generated declarations expose `ReactNativeWindowProps`, `NativeWindowProps`, and the shared animation type only where applicable.

## Native migration

The Android Gradle module opts into Expo Modules 2.0. `ExpoDrawOverAppsModule` becomes an annotated v2 module with ordinary Kotlin methods:

- synchronous JavaScript functions use `@JS` methods;
- Promise-returning JavaScript functions use `@JS suspend` methods;
- events use the typed SDK 58 v2 event mechanism;
- module lifecycle hooks retain safe registration and cleanup of the active module instance;
- the service-facing state functions remain internal Kotlin functions so overlay events and redraws retain their current behavior.

JavaScript loads the module using the SDK 58 Expo entry point and preserves the existing callable JS behavior except for the deliberately removed UI APIs.

## Documentation design

The docs use the standard Docusaurus docs routes instead of custom `/versions/...` route trees. The sidebar is linear and task-oriented:

1. Install and configure SDK 58.
2. Request Android overlay permission.
3. Register and show a `ReactNativeWindow`.
4. Register and show a `NativeWindow` with Expo UI components.
5. Manage window state, edge hiding, and closing.
6. API reference and limitations.

Every primary example includes all imports, renderer registration, and the action that displays the window. Commands use `npx expo install` so readers receive SDK-compatible versions. Old version selectors, version badges, duplicated version pages, and SDK 55/56/57 prose are removed.

## Example and tests

The example app presents two launch cards only: React Native Window and Native Window. Both exercise user-owned content and the same overlay lifecycle. The native example uses Expo UI components directly below `NativeWindow`; it does not use a library-supplied renderer.

Automated tests will first assert the intended hard-cut exports and the two-example catalog, then cover prop behavior and state helpers. Native compilation, TypeScript build, Jest, lint, Expo Doctor, docs build, and Android Gradle install provide static verification. Emulator QA then launches both windows, interacts with their controls, exercises resizing and closing, captures UI evidence, and checks logcat/crash output.

## Builder decisions

- Use the latest compatible stable SDK 58 patch versions resolved by Expo's installer at implementation time.
- Preserve current native behavior unless the SDK 58 migration forces a focused change.
- Use direct imports from `@expo/ui/jetpack-compose`; the hard-cut package requires Expo UI and does not include a runtime fallback.
- Remove obsolete source, example, and version-route files instead of leaving unreachable compatibility artifacts.
