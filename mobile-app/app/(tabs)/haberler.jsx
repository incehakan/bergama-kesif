import { useCallback, useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { getHaberler } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import { COLORS, SHADOW } from '../../constants/theme'

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

  const chrome = (body) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.WHITE }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.BG }}>{body}</View>
    </SafeAreaView>
  )

  if (loading) return chrome(<LoadingSpinner />)
  if (error) return chrome(<ErrorView message={error} onRetry={load} />)

  return (
    chrome(
      <>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Haberler</Text>
      </View>
      <FlatList
        style={{ flex: 1 }}
        data={rows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Haber bulunamadı.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/haber/${item.id}`)}
            activeOpacity={0.75}
          >
            <Text style={styles.title} numberOfLines={2}>
              {item.baslik}
            </Text>
            {item.ozet ? (
              <Text style={styles.ozet} numberOfLines={2}>
                {item.ozet}
              </Text>
            ) : null}
            <View style={styles.footer}>
              <Text style={styles.date}>
                {item.olusturma ? new Date(item.olusturma).toLocaleDateString('tr-TR') : ''}
              </Text>
              <Text style={styles.readMore}>Devamını oku →</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      </>
    )
  )
}

const styles = StyleSheet.create({
  pageHeader: { paddingHorizontal: 16, paddingVertical: 12 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT_1 },
  list: { paddingBottom: 32 },
  empty: { textAlign: 'center', color: COLORS.TEXT_3, marginTop: 24 },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
    padding: 14,
    ...SHADOW,
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT_1,
    lineHeight: 20,
    marginBottom: 4,
  },
  ozet: {
    fontSize: 11,
    color: COLORS.TEXT_2,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 10, color: COLORS.PRIMARY, fontWeight: '600' },
  readMore: { fontSize: 10, fontWeight: '800', color: COLORS.PRIMARY },
})
