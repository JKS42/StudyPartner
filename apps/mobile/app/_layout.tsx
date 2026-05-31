import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProviders } from '../src/providers/AppProviders';
import { useAppTheme } from '../src/theme';

export default function RootLayout() {
  const theme = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <StatusBar style={theme.background === '#f8fafc' ? 'dark' : 'light'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="upload" options={{ presentation: 'modal' }} />
          <Stack.Screen name="note/[id]" />
          <Stack.Screen name="summary/[noteId]" />
          <Stack.Screen name="quiz/[id]" />
          <Stack.Screen name="flashcards/[deckId]" />
          <Stack.Screen name="settings" />
        </Stack>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
