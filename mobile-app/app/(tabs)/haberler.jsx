import { useCallback, useEffect, useState } from 'react'
import { Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { getHaberler } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import ScreenPage from '../../components/ScreenPage'
import ScreenHeader from '../../components/ScreenHeader'
import { BlockCard } from '../../components/ListCard'
import { COLORS, FONTS, RADIUS } from '../../constants/theme'

export default function HaberlerScreen() {
  const router = useRouter()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const r = await getHaberler()
      setRows(Array.isArray(r) ? r : [])
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

  return (
    <ScreenPage>
      <ScreenHeader title="Haberler" subtitle="GÜNCEL" />
      <FlatList
        style={{ flex: 1 }}
        data={rows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Haber bulunamadı.</Text>}
        renderItem={({ item }) => (
          <BlockCard accent onPress={() => router.push(`/haber/${item.id}`)} style={styles.card}>
            <Text style={styles.title} numberOfLines={2}>
              {item.baslik}
            </Text>
            {item.ozet ? (
              <Text style={styles.ozet} numberOfLines={2}>
                {item.ozet}
              </Text>
            ) : null}
            <TouchableOpacity onPress={() => router.push(`/haber/${item.id}`)} activeOpacity={0.75}>
              <Text style={styles.footer}>
                {item.olusturma ? new Date(item.olusturma).toLocaleDateString('tr-TR') : ''}
                {'  ·  '}
                Devamını oku →
              </Text>
            </TouchableOpacity>
          </BlockCard>
        )}
      />
    </ScreenPage>
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 32 },
  empty: { textAlign: 'center', color: COLORS.TEXT_3, fontFamily: FONTS.body, marginTop: 24 },
  card: { marginHorizontal: 0 },
  title: {
    fontFamily: FONTS.bodyExtra,
    fontSize: 14,
    color: COLORS.TEXT_1,
    lineHeight: 20,
    marginBottom: 4,
  },
  ozet: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.TEXT_2,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    fontFamily: FONTS.bodySemi,
    fontSize: 10,
    color: COLORS.PRIMARY,
  },
})
