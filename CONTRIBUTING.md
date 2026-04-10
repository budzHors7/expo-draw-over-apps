# Contributing to expo-draw-over-apps

Thanks for taking the time to contribute.

This project is an open source Expo module focused on Android overlay permissions, floating bubble UI, and shared state between the app and the overlay. Contributions to the module, example app, docs site, and issue triage are all welcome.

## Good First Contributions

- fix bugs in the module or example app
- improve the documentation or website copy
- add or improve tests
- improve accessibility, responsiveness, or developer experience in the docs site
- report reproducible integration issues with clear steps

## Before You Start

- Search existing issues and pull requests before starting similar work.
- For larger features or behavior changes, open an issue first so we can align on scope.
- Keep pull requests focused. Smaller changes are easier to review and ship.

## Local Setup

1. Install root dependencies with `npm install`.
2. Install the docs app dependencies with `npm run docs:install`.
3. Build the module with `npm run build`.
4. Start the docs site with `npm run docs:dev`.
5. Use the `example/` app when you need to verify real overlay behavior on Android.

## Making Changes

- Follow the current structure and naming in the repo instead of introducing a parallel pattern.
- If you change public module behavior, update the README, docs site, and example app when needed.
- If you touch the docs UI, make sure light and dark mode both still work.
- Avoid unrelated formatting-only changes in the same pull request.

## Pull Request Checklist

- The change is scoped to one problem or one small set of related problems.
- Code builds successfully for the area you changed.
- Documentation is updated when public behavior or setup changes.
- Screenshots or short notes are included for visible docs or UI changes.
- The pull request description explains what changed and why.

## Testing Expectations

- Run `npm run build` for module changes.
- Run `npm run docs:build` for docs site changes.
- If a change affects Android behavior, test it in the example app or document what you were able to verify.

## Reporting Bugs

When opening an issue, please include:

- what you expected to happen
- what actually happened
- Expo, React Native, and Android versions when relevant
- device or emulator details when relevant
- a minimal reproduction if possible

## Community Expectations

By participating in this project, you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).
