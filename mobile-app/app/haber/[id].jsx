import { useCallback, useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { getHaberDetay } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import { COLORS } from '../../constants/theme'

export default function HaberDetayScreen() {
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
      const h = await getHaberDetay(id)
      setData(h)
    } catch (err) {
      setError(err?.message || 'Veri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const chrome = (body) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.WHITE }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.BG }}>{body}</View>
    </SafeAreaView>
  )

  if (loading) return chrome(<LoadingSpinner />)
  if (error) return chrome(<ErrorView message={error} onRetry={load} />)
  if (!data) return chrome(<ErrorView message="Haber bulunamadı." onRetry={load} />)

  const dateStr = data.olusturma
    ? new Date(data.olusturma).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  return (
    chrome(
      <>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} hitSlop={12}>
            <Text style={styles.back}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Haber</Text>
          <View style={{ width: 56 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.coverWrap}>
            {data.kapakFotoUrl ? (
              <Image source={{ uri: data.kapakFotoUrl }} style={styles.cover} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
                style={styles.cover}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
          </View>
          <View style={styles.body}>
            {dateStr ? (
              <Text style={styles.date}>{dateStr.toUpperCase()}</Text>
            ) : null}
            <Text style={styles.title}>{data.baslik}</Text>
            <View style={styles.accent} />
            {data.icerik ? <Text style={styles.content}>{data.icerik}</Text> : null}
          </View>
        </ScrollView>
      </>
    )
  )
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.BG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  back: { color: COLORS.PRIMARY, fontSize: 16, fontWeight: '700' },
  topTitle: { fontSize: 17, fontWeight: '800', color: COLORS.TEXT_1 },
  scroll: { paddingBottom: 32 },
  coverWrap: { width: '100%' },
  cover: { width: '100%', height: 250, backgroundColor: COLORS.PRIMARY },
  body: { padding: 20 },
  date: {
    fontSize: 10,
    color: COLORS.PRIMARY,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.TEXT_1,
    lineHeight: 30,
    marginBottom: 12,
  },
  accent: {
    width: 32,
    height: 3,
    backgroundColor: COLORS.PRIMARY,
    marginBottom: 12,
  },
  content: {
    fontSize: 15,
    lineHeight: 26,
    color: COLORS.TEXT_2,
  },
})
