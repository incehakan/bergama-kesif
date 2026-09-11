import { useCallback, useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { getTarihce } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import ScreenPage from '../../components/ScreenPage'
import ScreenHeader from '../../components/ScreenHeader'
import { COLORS, FONTS, POSTER, RADIUS } from '../../constants/theme'

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

  if (loading) {
    return (
      <ScreenPage>
        <LoadingSpinner />
      </ScreenPage>
    )
  }
  if (error) {
    return (
      <ScreenPage>
        <ErrorView message={error} onRetry={load} />
      </ScreenPage>
    )
  }
  if (!data) {
    return (
      <ScreenPage>
        <ErrorView message="Tarihçe bulunamadı." onRetry={load} />
      </ScreenPage>
    )
  }

  return (
    <ScreenPage>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ScreenHeader title="Tarihçe" subtitle="BERGAMA" />
        <View style={styles.coverWrap}>
          {data.kapakFotoUrl ? (
            <>
              <Image source={{ uri: data.kapakFotoUrl }} style={styles.cover} resizeMode="cover" />
              <View style={styles.coverOverlay} />
            </>
          ) : (
            <LinearGradient
              colors={[POSTER.BG, POSTER.BG_DEEP]}
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
    </ScreenPage>
  )
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32 },
  coverWrap: { width: '100%', height: 240, position: 'relative' },
  cover: { width: '100%', height: 240, backgroundColor: POSTER.BG },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  coverTitle: {
    position: 'absolute',
    left: 16,
    bottom: 20,
    right: 16,
    fontFamily: FONTS.display,
    fontSize: 24,
    color: COLORS.WHITE,
  },
  body: {
    backgroundColor: POSTER.PAPER,
    padding: 20,
  },
  accent: {
    width: 32,
    height: 3,
    backgroundColor: COLORS.PRIMARY,
    marginBottom: 12,
    borderRadius: RADIUS.sm,
  },
  bodyText: {
    fontFamily: FONTS.body,
    fontSize: 15,
    lineHeight: 26,
    color: COLORS.TEXT_2,
  },
})
