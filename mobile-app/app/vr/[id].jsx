import { useCallback, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import { Video, ResizeMode } from 'expo-av'
import { getVRIcerik } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import { COLORS } from '../../constants/theme'

const { width: W, height: H } = Dimensions.get('window')

export default function VrScreen() {
  const insets = useSafeAreaInsets()
  const rawId = useLocalSearchParams().id
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const v = await getVRIcerik(id)
      setData(v)
    } catch (err) {
      setError(err?.message || 'Veri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    ;(async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
      } catch {
        /* */
      }
    })()
    return () => {
      ;(async () => {
        try {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
        } catch {
          /* */
        }
      })()
    }
  }, [])

  async function handleKapat() {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    } catch {
      /* */
    }
    if (router.canGoBack()) router.back()
    else router.replace('/')
  }

  const chrome = (body) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>{body}</View>
    </SafeAreaView>
  )

  if (loading) {
    return chrome(
      <View style={styles.full}>
        <LoadingSpinner />
      </View>
    )
  }

  if (error || !data) {
    return chrome(
      <View style={styles.full}>
        <ErrorView message={error} onRetry={load} />
        <TouchableOpacity style={styles.geriAlt} onPress={handleKapat} activeOpacity={0.75}>
          <Text style={styles.geriTxt}>Geri</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const uri = data.dosyaUrl
  const isLikelyImage =
    /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(uri || '') || data.tip === 'FOTOGRAF_360'

  return (
    chrome(
      <View style={styles.full}>
        <TouchableOpacity
          style={[styles.closeTop, { top: Math.max(12, insets.top) }]}
          onPress={handleKapat}
          activeOpacity={0.75}
        >
          <Text style={styles.closeTopTxt}>✕ Kapat</Text>
        </TouchableOpacity>

        {isLikelyImage ? (
          <Image source={{ uri }} style={styles.media} resizeMode="contain" />
        ) : (
          <Video
            source={{ uri }}
            style={styles.media}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
          />
        )}
      </View>
    )
  )
}

const styles = StyleSheet.create({
  full: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: Math.max(W, H),
    height: Math.min(W, H) * 0.92,
  },
  closeTop: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeTopTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 16 },
  geriAlt: {
    marginTop: 16,
    backgroundColor: COLORS.DARK_2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  geriTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 15 },
})
