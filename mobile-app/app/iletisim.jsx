import { useCallback, useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react-native'
import { getIletisim } from '../lib/api'
import HaritaButonu from '../components/HaritaButonu'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorView from '../components/ErrorView'
import { COLORS, SHADOW } from '../constants/theme'

function hasValue(v) {
  return v != null && String(v).trim() !== ''
}

function toWhatsAppDigits(raw) {
  let d = String(raw).replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('00')) d = d.slice(2)
  if (d.startsWith('0')) d = `90${d.slice(1)}`
  return d
}

async function openUrl(url) {
  try {
    await Linking.openURL(url)
  } catch {
    /* */
  }
}

export default function IletisimScreen() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const row = await getIletisim()
      setData(row)
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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.page}>{body}</View>
    </SafeAreaView>
  )

  const header = (
    <View style={styles.top}>
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} hitSlop={12}>
        <Text style={styles.back}>← Geri</Text>
      </TouchableOpacity>
      <Text style={styles.topLabel}>BELEDİYE</Text>
      <Text style={styles.topTitle}>İletişim</Text>
    </View>
  )

  if (loading) return chrome(<>{header}<LoadingSpinner /></>)
  if (error) return chrome(<>{header}<ErrorView message={error} onRetry={load} /></>)

  const cards = []
  if (hasValue(data?.telefon)) {
    cards.push({
      key: 'telefon',
      label: 'Telefon',
      value: data.telefon,
      Icon: Phone,
      onPress: () => openUrl(`tel:${String(data.telefon).replace(/\s/g, '')}`),
    })
  }
  if (hasValue(data?.eposta)) {
    cards.push({
      key: 'eposta',
      label: 'E-posta',
      value: data.eposta,
      Icon: Mail,
      onPress: () => openUrl(`mailto:${String(data.eposta).trim()}`),
    })
  }
  if (hasValue(data?.whatsapp)) {
    const wa = toWhatsAppDigits(data.whatsapp)
    cards.push({
      key: 'whatsapp',
      label: 'WhatsApp',
      value: data.whatsapp,
      Icon: MessageCircle,
      onPress: () => openUrl(`https://wa.me/${wa}`),
    })
  }
  if (hasValue(data?.adres)) {
    cards.push({
      key: 'adres',
      label: 'Adres',
      value: data.adres,
      Icon: MapPin,
    })
  }

  return chrome(
    <>
      {header}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {cards.length === 0 ? (
          <Text style={styles.empty}>İletişim bilgisi henüz girilmedi.</Text>
        ) : (
          cards.map((c) => {
            const Icon = c.Icon
            const inner = (
              <>
                <View style={styles.cardIcon}>
                  <Icon size={20} color={COLORS.PRIMARY} strokeWidth={2.2} />
                </View>
                <View style={styles.cardMid}>
                  <Text style={styles.cardLabel}>{c.label}</Text>
                  <Text style={styles.cardValue}>{c.value}</Text>
                </View>
              </>
            )
            if (c.onPress) {
              return (
                <TouchableOpacity key={c.key} style={styles.card} onPress={c.onPress} activeOpacity={0.75}>
                  {inner}
                </TouchableOpacity>
              )
            }
            return (
              <View key={c.key} style={styles.card}>
                {inner}
              </View>
            )
          })
        )}
        {hasValue(data?.adres) ? (
          <HaritaButonu
            lat={data.koordinatLat}
            lng={data.koordinatLng}
            label={data.adres || 'Belediye'}
          />
        ) : null}
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.PRIMARY },
  page: { flex: 1, backgroundColor: COLORS.BG },
  top: { backgroundColor: COLORS.DARK, padding: 16, paddingBottom: 16 },
  back: { color: COLORS.WHITE, fontWeight: '700', fontSize: 14, marginBottom: 10 },
  topLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 2,
  },
  topTitle: { fontSize: 24, fontWeight: '800', color: COLORS.WHITE },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 32, gap: 8 },
  empty: { textAlign: 'center', color: COLORS.TEXT_3, marginTop: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMid: { flex: 1, minWidth: 0 },
  cardLabel: { fontSize: 10, fontWeight: '800', color: COLORS.PRIMARY, marginBottom: 4 },
  cardValue: { fontSize: 13, fontWeight: '700', color: COLORS.TEXT_1, lineHeight: 18 },
})
