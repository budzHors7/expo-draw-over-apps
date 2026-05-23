import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { BubbleRendererProps } from './bubbleRenderer';
import { setBubbleRenderer, setBubbleRendererForBubble } from './bubbleRenderer';

type ComposeFallbackProps = BubbleRendererProps & {
  hint?: string;
};

function ComposeUnavailableFallback({
  state,
  close,
  openApp,
  hint,
}: ComposeFallbackProps) {
  return (
    <View style={fallbackStyles.shell}>
      <Text style={fallbackStyles.eyebrow}>Jetpack Compose Bubble</Text>
      <View style={fallbackStyles.debugBadge}>
        <Text style={fallbackStyles.debugBadgeText}>ID: {state.bubbleId}</Text>
      </View>
      <Text style={fallbackStyles.title}>Native UI slot</Text>
      <Text style={fallbackStyles.bodyText}>Use a custom renderer to wire your own actions and state.</Text>

      <View style={fallbackStyles.actions}>
        <Pressable
          onPress={() => {
            openApp().catch(() => {});
          }}
          style={[fallbackStyles.actionButton, fallbackStyles.secondaryButton]}
        >
          <Text style={fallbackStyles.secondaryText}>Open</Text>
        </Pressable>

        <Pressable onPress={close} style={[fallbackStyles.actionButton, fallbackStyles.tertiaryButton]}>
          <Text style={fallbackStyles.secondaryText}>Close</Text>
        </Pressable>
      </View>

      <Text style={fallbackStyles.hint}>
        {hint ?? 'Install `@expo/ui` in an Android development build to use native Compose UI.'}
      </Text>
    </View>
  );
}

/**
 * Packaged Compose-flavored bubble renderer.
 *
 * Current Android overlay builds render a React Native fallback for stability.
 */
export function ExpoDrawOverAppsComposeBubbleRenderer(props: BubbleRendererProps) {
  if (Platform.OS !== 'android') {
    return <ComposeUnavailableFallback {...props} />;
  }

  return (
    <ComposeUnavailableFallback
      {...props}
      hint="Jetpack Compose overlay bubbles currently fall back to a React Native renderer to avoid Android overlay crashes."
    />
  );
}

/**
 * Registers the packaged Compose-flavored renderer globally or for one named bubble.
 */
export function setComposeBubbleRenderer(bubbleId?: string) {
  if (bubbleId) {
    setBubbleRendererForBubble(bubbleId, ExpoDrawOverAppsComposeBubbleRenderer);
    return ExpoDrawOverAppsComposeBubbleRenderer;
  }

  setBubbleRenderer(ExpoDrawOverAppsComposeBubbleRenderer);
  return ExpoDrawOverAppsComposeBubbleRenderer;
}

const fallbackStyles = StyleSheet.create({
  shell: {
    width: 196,
    minHeight: 190,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#22d3ee',
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 18,
  },
  eyebrow: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
  },
  debugBadge: {
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#475569',
  },
  debugBadgeText: {
    color: '#cbd5e1',
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  bodyText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#0f766e',
  },
  tertiaryButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
  },
  secondaryText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '800',
  },
  hint: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    textAlign: 'center',
  },
});
