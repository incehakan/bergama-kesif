import 'react-native-gesture-handler'
import '../lib/fetchPolyfill'
import { useCallback, useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import {
  Fraunces_300Light,
  Fraunces_500Medium,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces'
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

SplashScreen.preventAutoHideAsync().catch(() => {})

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_300Light,
    Fraunces_500Medium,
    Fraunces_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  })

  const ready = fontsLoaded || !!fontError

  const hideSplash = useCallback(async () => {
    if (!ready) return
    try {
      await SplashScreen.hideAsync()
    } catch {
      /* */
    }
  }, [ready])

  useEffect(() => {
    hideSplash()
  }, [hideSplash])

  if (!ready) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={hideSplash}>
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
          <Stack.Screen name="acil-durum" />
          <Stack.Screen name="iletisim" />
          <Stack.Screen name="nobetci-eczaneler" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
