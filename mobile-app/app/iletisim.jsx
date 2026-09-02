import { useCallback, useEffect, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react-native'
import { getIletisim } from '../lib/api'
import HaritaButonu from '../components/HaritaButonu'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorView from '../components/ErrorView'
import ScreenPage from '../components/ScreenPage'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS, FONTS, POSTER, RADIUS, SHADOW } from '../constants/theme'

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

  const backBtn = (
    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} hitSlop={12} style={styles.backWrap}>
      <Text style={styles.back}>← Geri</Text>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <ScreenPage>
        {backBtn}
        <ScreenHeader title="İletişim" subtitle="BELEDİYE" />
        <LoadingSpinner />
      </ScreenPage>
    )
  }
  if (error) {
    return (
      <ScreenPage>
        {backBtn}
        <ScreenHeader title="İletişim" subtitle="BELEDİYE" />
        <ErrorView message={error} onRetry={load} />
      </ScreenPage>
    )
  }

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

  return (
    <ScreenPage>
      {backBtn}
      <ScreenHeader title="İletişim" subtitle="BELEDİYE" />
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
    </ScreenPage>
  )
}

const styles = StyleSheet.create({
  backWrap: { paddingHorizontal: 16, paddingTop: 4, backgroundColor: POSTER.BG },
  back: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 14 },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 32, gap: 8 },
  empty: { textAlign: 'center', color: COLORS.TEXT_3, fontFamily: FONTS.body, marginTop: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: POSTER.PAPER,
    borderRadius: RADIUS.md,
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
  cardLabel: { fontFamily: FONTS.bodyBold, fontSize: 10, color: COLORS.PRIMARY, marginBottom: 4 },
  cardValue: { fontFamily: FONTS.bodySemi, fontSize: 13, color: COLORS.TEXT_1, lineHeight: 18 },
})
