import type { ImageSourcePropType } from 'react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import type { BubbleRendererProps } from './bubbleRenderer';
import { setBubbleRenderer, setBubbleRendererForBubble } from './bubbleRenderer';

type ComposeApi = typeof import('@expo/ui/jetpack-compose');
type ComposeModifiersApi = typeof import('@expo/ui/jetpack-compose/modifiers');

let hasWarnedComposeUnavailable = false;

const ANDROID_SYSTEM_ICONS = {
  increment: { uri: 'android.resource://android/drawable/ic_input_add' },
  decrement: { uri: 'android.resource://android/drawable/ic_delete' },
  openApp: { uri: 'android.resource://android/drawable/ic_menu_view' },
  hide: { uri: 'android.resource://android/drawable/ic_menu_close_clear_cancel' },
} satisfies Record<string, ImageSourcePropType>;

function warnComposeUnavailable(error?: unknown) {
  if (hasWarnedComposeUnavailable) {
    return;
  }

  hasWarnedComposeUnavailable = true;

  console.warn(
    `ExpoDrawOverApps Compose bubble renderer is unavailable: ${
      error instanceof Error ? error.message : String(error ?? 'unknown error')
    }`
  );
}

function getComposeRendererModules():
  | {
      compose: ComposeApi;
      modifiers: ComposeModifiersApi;
    }
  | null {
  if (Platform.OS !== 'android') {
    return null;
  }

  try {
    return {
      compose: require('@expo/ui/jetpack-compose') as ComposeApi,
      modifiers: require('@expo/ui/jetpack-compose/modifiers') as ComposeModifiersApi,
    };
  } catch (error) {
    warnComposeUnavailable(error);
    return null;
  }
}

function ComposeUnavailableFallback({ state, decrement, increment, hide, openApp }: BubbleRendererProps) {
  return (
    <View style={fallbackStyles.shell}>
      <Text style={fallbackStyles.eyebrow}>Jetpack Compose Bubble</Text>
      <View style={fallbackStyles.debugBadge}>
        <Text style={fallbackStyles.debugBadgeText}>ID: {state.bubbleId}</Text>
      </View>
      <Text style={fallbackStyles.count}>{state.count}</Text>

      <View style={fallbackStyles.actions}>
        <Pressable onPress={decrement} style={[fallbackStyles.actionButton, fallbackStyles.negativeButton]}>
          <Text style={fallbackStyles.actionText}>-</Text>
        </Pressable>

        <Pressable onPress={increment} style={[fallbackStyles.actionButton, fallbackStyles.positiveButton]}>
          <Text style={fallbackStyles.actionText}>+</Text>
        </Pressable>
      </View>

      <View style={fallbackStyles.actions}>
        <Pressable onPress={() => void openApp()} style={[fallbackStyles.actionButton, fallbackStyles.secondaryButton]}>
          <Text style={fallbackStyles.secondaryText}>Open</Text>
        </Pressable>

        <Pressable onPress={hide} style={[fallbackStyles.actionButton, fallbackStyles.tertiaryButton]}>
          <Text style={fallbackStyles.secondaryText}>Hide</Text>
        </Pressable>
      </View>

      <Text style={fallbackStyles.hint}>Install `@expo/ui` in an Android development build to use native Compose UI.</Text>
    </View>
  );
}

export function ExpoDrawOverAppsComposeBubbleRenderer(props: BubbleRendererProps) {
  const modules = getComposeRendererModules();

  if (!modules) {
    return <ComposeUnavailableFallback {...props} />;
  }

  const { compose, modifiers } = modules;
  const {
    Column,
    FilledIconButton,
    FilledTonalIconButton,
    Host,
    Icon,
    OutlinedIconButton,
    Row,
    Shape,
    Surface,
    Text: ComposeText,
  } = compose;
  const { fillMaxWidth, paddingAll, weight, width } = modifiers;

  const bubbleShape = Shape.RoundedCorner({
    cornerRadii: { topStart: 28, topEnd: 28, bottomStart: 28, bottomEnd: 28 },
  });
  const actionShape = Shape.RoundedCorner({
    cornerRadii: { topStart: 18, topEnd: 18, bottomStart: 18, bottomEnd: 18 },
  });

  return (
    <Host colorScheme="dark" matchContents>
      <Surface
        border={{ color: '#22d3ee', width: 1.5 }}
        color="#0f172a"
        contentColor="#f8fafc"
        modifiers={[width(196)]}
        shadowElevation={18}
        shape={bubbleShape}
        tonalElevation={8}
      >
        <Column
          horizontalAlignment="center"
          modifiers={[paddingAll(16)]}
          verticalArrangement={{ spacedBy: 12 }}
        >
          <ComposeText
            color="#67e8f9"
            style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1.1, textAlign: 'center' }}
          >
            JETPACK COMPOSE
          </ComposeText>

          <ComposeText
            color="#cbd5e1"
            style={{ fontSize: 10, fontWeight: '700', textAlign: 'center', typography: 'labelSmall' }}
          >
            ID: {props.bubbleId}
          </ComposeText>

          <ComposeText
            color="#f8fafc"
            style={{ fontSize: 34, fontWeight: '900', textAlign: 'center', typography: 'headlineMedium' }}
          >
            {props.state.count}
          </ComposeText>

          <ComposeText
            color="#94a3b8"
            style={{ fontSize: 11, lineHeight: 16, textAlign: 'center', typography: 'bodySmall' }}
          >
            Same shared counter, rendered with native Android Compose views.
          </ComposeText>

          <Row horizontalArrangement={{ spacedBy: 12 }} modifiers={[fillMaxWidth()]} verticalAlignment="center">
            <Column horizontalAlignment="center" modifiers={[weight(1)]} verticalArrangement={{ spacedBy: 6 }}>
              <FilledTonalIconButton
                colors={{ containerColor: '#334155', contentColor: '#f8fafc' }}
                onClick={props.decrement}
                shape={actionShape}
              >
                <Icon
                  contentDescription="Decrease counter"
                  size={18}
                  source={ANDROID_SYSTEM_ICONS.decrement}
                  tint="#f8fafc"
                />
              </FilledTonalIconButton>
              <ComposeText color="#cbd5e1" style={{ fontSize: 10, fontWeight: '700', textAlign: 'center' }}>
                Decrease
              </ComposeText>
            </Column>

            <Column horizontalAlignment="center" modifiers={[weight(1)]} verticalArrangement={{ spacedBy: 6 }}>
              <FilledIconButton
                colors={{ containerColor: '#2563eb', contentColor: '#eff6ff' }}
                onClick={props.increment}
                shape={actionShape}
              >
                <Icon
                  contentDescription="Increase counter"
                  size={18}
                  source={ANDROID_SYSTEM_ICONS.increment}
                  tint="#eff6ff"
                />
              </FilledIconButton>
              <ComposeText color="#dbeafe" style={{ fontSize: 10, fontWeight: '700', textAlign: 'center' }}>
                Increase
              </ComposeText>
            </Column>
          </Row>

          <Row horizontalArrangement={{ spacedBy: 12 }} modifiers={[fillMaxWidth()]} verticalAlignment="center">
            <Column horizontalAlignment="center" modifiers={[weight(1)]} verticalArrangement={{ spacedBy: 6 }}>
              <FilledTonalIconButton
                colors={{ containerColor: '#0f766e', contentColor: '#ecfeff' }}
                onClick={() => void props.openApp()}
                shape={actionShape}
              >
                <Icon contentDescription="Open app" size={18} source={ANDROID_SYSTEM_ICONS.openApp} tint="#ecfeff" />
              </FilledTonalIconButton>
              <ComposeText color="#99f6e4" style={{ fontSize: 10, fontWeight: '700', textAlign: 'center' }}>
                Open App
              </ComposeText>
            </Column>

            <Column horizontalAlignment="center" modifiers={[weight(1)]} verticalArrangement={{ spacedBy: 6 }}>
              <OutlinedIconButton
                colors={{ contentColor: '#f8fafc', disabledContentColor: '#94a3b8' }}
                onClick={props.hide}
                shape={actionShape}
              >
                <Icon contentDescription="Hide bubble" size={18} source={ANDROID_SYSTEM_ICONS.hide} tint="#f8fafc" />
              </OutlinedIconButton>
              <ComposeText color="#e2e8f0" style={{ fontSize: 10, fontWeight: '700', textAlign: 'center' }}>
                Hide
              </ComposeText>
            </Column>
          </Row>

          <ComposeText color="#64748b" style={{ fontSize: 10, fontWeight: '600', textAlign: 'center' }}>
            Hold the bubble to remove it from the Android overlay menu.
          </ComposeText>
        </Column>
      </Surface>
    </Host>
  );
}

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
  count: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '900',
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
  negativeButton: {
    backgroundColor: '#334155',
  },
  positiveButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#0f766e',
  },
  tertiaryButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
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
