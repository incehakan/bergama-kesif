import 'react-native-gesture-handler'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { COLORS } from '../constants/theme'

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="qr" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="eser/[id]" />
          <Stack.Screen name="vr/[id]" />
          <Stack.Screen name="haber/[id]" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
