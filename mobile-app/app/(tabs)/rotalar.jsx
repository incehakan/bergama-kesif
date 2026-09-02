import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { WebView } from 'react-native-webview'
import { Mountain } from 'lucide-react-native'
import { getRotalar } from '../../lib/api'
import { buildRouteMapHtml } from '../../lib/leafletWebMap'
import GorselPlaceholder from '../../components/GorselPlaceholder'
import HaritaButonu from '../../components/HaritaButonu'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import { COLORS, SHADOW } from '../../constants/theme'

function zorlukRenk(z) {
  if (z === 'KOLAY') return '#27AE60'
  if (z === 'ORTA') return '#E67E22'
  if (z === 'ZOR') return '#C0392B'
  return COLORS.DARK_2
}

function extractAllStops(rotaDuraklar) {
  if (rotaDuraklar == null) return []

  let raw = rotaDuraklar
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch {
      return []
    }
  }

  let list = []
  if (Array.isArray(raw)) list = raw
  else if (raw && typeof raw === 'object') {
    list = raw.duraklar || raw.stops || raw.points || raw.items || []
  }
  if (!Array.isArray(list)) return []

  return list
    .map((stop, index) => {
      if (!stop || typeof stop !== 'object') return null
      const lat =
        stop.lat ??
        stop.latitude ??
        stop.koordinatLat ??
        (stop.koordinat && stop.koordinat.lat)
      const lng =
        stop.lng ??
        stop.lon ??
        stop.longitude ??
        stop.koordinatLng ??
        (stop.koordinat && stop.koordinat.lng)
      const la = Number(lat)
      const ln = Number(lng)
      if (!Number.isFinite(la) || !Number.isFinite(ln)) return null
      const sira = Number(stop.sira)
      return {
        sira: Number.isFinite(sira) ? sira : index + 1,
        lat: la,
        lng: ln,
        ad: stop.ad || stop.isim || stop.name || '',
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.sira - b.sira)
}

function extractFirstStopCoords(rotaDuraklar) {
  const all = extractAllStops(rotaDuraklar)
  return all[0] || null
}

export default function RotalarScreen() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [secili, setSecili] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const r = await getRotalar()
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

  const seciliDuraklar = secili ? extractAllStops(secili.rotaDuraklar) : []
  const seciliIlkDurak = secili ? extractFirstStopCoords(secili.rotaDuraklar) : null

  const chrome = (body) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.PRIMARY }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.BG }}>{body}</View>
    </SafeAreaView>
  )

  if (loading) return chrome(<LoadingSpinner />)
  if (error) return chrome(<ErrorView message={error} onRetry={load} />)

  return (
    chrome(
      <>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Rotalar</Text>
      </View>
      <FlatList
        style={{ flex: 1 }}
        data={rows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Rota bulunamadı.</Text>}
        renderItem={({ item }) => {
          const badgeBg = zorlukRenk(item.zorluk)
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSecili(item)}
              activeOpacity={0.75}
            >
              <View style={styles.cardImg}>
                {item.kapakFotoUrl ? (
                  <>
                    <Image source={{ uri: item.kapakFotoUrl }} style={styles.img} resizeMode="cover" />
                    <View style={styles.imgOverlay} />
                  </>
                ) : (
                  <>
                    <GorselPlaceholder icon={Mountain} size={160} iconSize={30} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.12)']}
                      style={styles.cardTitleFade}
                      pointerEvents="none"
                    />
                  </>
                )}
                <Text
                  style={[styles.cardTitle, !item.kapakFotoUrl && styles.cardTitleOnPlaceholder]}
                  numberOfLines={2}
                >
                  {item.baslik}
                </Text>
                <View style={[styles.zBadge, { backgroundColor: badgeBg }]}>
                  <Text style={styles.zBadgeText}>{item.zorluk || '—'}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.meta}>
                  ⏱ {item.sureSaat != null ? `${item.sureSaat} saat` : '—'}
                </Text>
                <Text style={styles.meta}>
                  📍 {item.mesafeKm != null ? `${item.mesafeKm} km` : '—'}
                </Text>
              </View>
            </TouchableOpacity>
          )
        }}
      />

      <Modal visible={!!secili} animationType="slide" transparent onRequestClose={() => setSecili(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalInner}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalImgWrap}>
                {secili?.kapakFotoUrl ? (
                  <Image source={{ uri: secili.kapakFotoUrl }} style={styles.modalImg} resizeMode="cover" />
                ) : (
                  <GorselPlaceholder icon={Mountain} size={260} iconSize={48} />
                )}
              </View>
              <View style={styles.modalSheet}>
                <Text style={styles.modalTitle}>{secili?.baslik}</Text>
                <View style={styles.modalMetaRow}>
                  <View style={[styles.zBadgeSm, { backgroundColor: zorlukRenk(secili?.zorluk) }]}>
                    <Text style={styles.zBadgeText}>{secili?.zorluk || '—'}</Text>
                  </View>
                  <Text style={styles.modalMetaTxt}>
                    {secili?.sureSaat != null ? `${secili.sureSaat} saat` : '—'} ·{' '}
                    {secili?.mesafeKm != null ? `${secili.mesafeKm} km` : '—'}
                  </Text>
                </View>
                {secili?.kisaAciklama ? <Text style={styles.modalLead}>{secili.kisaAciklama}</Text> : null}
                {secili?.detayliAciklama ? (
                  <Text style={styles.modalBody}>{secili.detayliAciklama}</Text>
                ) : null}
              </View>
            </ScrollView>
            {seciliDuraklar.length >= 2 ? (
              <View style={styles.miniMap}>
                <WebView
                  originWhitelist={['*']}
                  source={{
                    html: buildRouteMapHtml({
                      stops: seciliDuraklar,
                      color: COLORS.PRIMARY,
                    }),
                  }}
                  style={styles.miniWeb}
                  javaScriptEnabled
                  scrollEnabled={false}
                  nestedScrollEnabled={false}
                  setSupportMultipleWindows={false}
                />
              </View>
            ) : null}
            <View style={styles.modalActions}>
              <HaritaButonu
                lat={seciliIlkDurak?.lat}
                lng={seciliIlkDurak?.lng}
                label={secili?.baslik || 'Rota'}
              />
              <TouchableOpacity style={styles.closeBtn} onPress={() => setSecili(null)} activeOpacity={0.75}>
                <Text style={styles.closeBtnText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </>
    )
  )
}

const styles = StyleSheet.create({
  pageHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.PRIMARY,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: COLORS.WHITE },
  list: { padding: 16, paddingBottom: 32 },
  empty: { textAlign: 'center', color: COLORS.TEXT_3, marginTop: 24 },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.BG_CARD,
    ...SHADOW,
  },
  cardImg: { height: 160, position: 'relative' },
  img: { width: '100%', height: 160, backgroundColor: COLORS.BORDER },
  imgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  cardTitleFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
  },
  cardTitle: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    right: 80,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.WHITE,
  },
  cardTitleOnPlaceholder: {
    color: COLORS.TEXT_1,
  },
  zBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  zBadgeText: { fontSize: 8, fontWeight: '800', color: COLORS.WHITE },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  meta: { fontSize: 11, color: COLORS.TEXT_2 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalInner: { maxHeight: '92%', backgroundColor: COLORS.BG, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  modalScroll: { paddingBottom: 8 },
  modalActions: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: COLORS.WHITE,
    gap: 10,
  },
  modalImgWrap: { width: '100%' },
  modalImg: { width: '100%', height: 260, backgroundColor: COLORS.BORDER },
  modalSheet: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    padding: 20,
    paddingBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.TEXT_1, marginBottom: 4 },
  modalMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  zBadgeSm: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  modalMetaTxt: { fontSize: 12, color: COLORS.TEXT_2, flex: 1 },
  modalLead: { fontSize: 14, color: COLORS.TEXT_2, lineHeight: 22, marginBottom: 8 },
  modalBody: { fontSize: 14, color: COLORS.TEXT_2, lineHeight: 24 },
  miniMap: {
    marginHorizontal: 16,
    marginTop: 4,
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BG,
  },
  miniWeb: { width: '100%', height: 220, backgroundColor: COLORS.BG },
  closeBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  closeBtnText: { color: COLORS.WHITE, fontWeight: '800', fontSize: 15 },
})
