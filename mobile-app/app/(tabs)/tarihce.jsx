import { useCallback, useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { getTarihce } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import { COLORS } from '../../constants/theme'

export default function TarihceScreen() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const t = await getTarihce()
      setData(t)
    } catch (err) {
      setError(err?.message || 'Veri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const chrome = (body) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.PRIMARY }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.BG }}>{body}</View>
    </SafeAreaView>
  )

  if (loading) return chrome(<LoadingSpinner />)
  if (error) return chrome(<ErrorView message={error} onRetry={load} />)
  if (!data) return chrome(<ErrorView message="Tarihçe bulunamadı." onRetry={load} />)

  return (
    chrome(
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tarihçe</Text>
        </View>
        <View style={styles.coverWrap}>
          {data.kapakFotoUrl ? (
            <>
              <Image source={{ uri: data.kapakFotoUrl }} style={styles.cover} resizeMode="cover" />
              <View style={styles.coverOverlay} />
            </>
          ) : (
            <LinearGradient
              colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
              style={styles.cover}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          <Text style={styles.coverTitle}>{data.baslik}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.accent} />
          <Text style={styles.bodyText}>{data.icerik}</Text>
        </View>
      </ScrollView>
    )
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerTitle: { color: COLORS.WHITE, fontSize: 18, fontWeight: '700' },
  scroll: { paddingBottom: 32 },
  coverWrap: { width: '100%', height: 240, position: 'relative' },
  cover: { width: '100%', height: 240, backgroundColor: COLORS.PRIMARY },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  coverTitle: {
    position: 'absolute',
    left: 16,
    bottom: 20,
    right: 16,
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.WHITE,
  },
  body: {
    backgroundColor: COLORS.BG,
    padding: 20,
  },
  accent: {
    width: 32,
    height: 3,
    backgroundColor: COLORS.PRIMARY,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 26,
    color: COLORS.TEXT_2,
  },
})
