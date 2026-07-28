import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Linking from 'expo-linking'
import { ChevronRight, Navigation } from 'lucide-react-native'
import { getAllYemeIcme } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import { COLORS, SHADOW } from '../../constants/theme'

const FILTERS = [
  { label: 'Tümü', value: null },
  { label: 'Restoran', value: 'RESTORAN' },
  { label: 'Kafe', value: 'KAFE' },
  { label: 'Pastane', value: 'PASTANE' },
  { label: 'Sokak Lezzeti', value: 'SOKAK_LEZZETI' },
]

function buildMekanMapsUrl(detay) {
  const lat = detay?.koordinatLat
  const lng = detay?.koordinatLng
  if (lat != null && lng != null) {
    const la = Number(lat)
    const ln = Number(lng)
    if (Number.isFinite(la) && Number.isFinite(ln)) {
      return `https://www.google.com/maps/dir/?api=1&destination=${la},${ln}`
    }
  }
  const name = detay?.isim || 'Mekan'
  const query = encodeURIComponent(`${name} Bergama`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

export default function RehberScreen() {
  const [kategori, setKategori] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [detay, setDetay] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const r = await getAllYemeIcme(kategori)
      setRows(Array.isArray(r) ? r : [])
    } catch (err) {
      setError(err?.message || 'Veri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [kategori])

  useEffect(() => {
    load()
  }, [load])

  async function openTel() {
    if (!detay?.telefon) return
    const tel = `tel:${detay.telefon.replace(/\s/g, '')}`
    try {
      await Linking.openURL(tel)
    } catch {
      /* */
    }
  }

  async function openMaps() {
    if (!detay) return
    try {
      await Linking.openURL(buildMekanMapsUrl(detay))
    } catch {
      /* */
    }
  }

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
      <View style={styles.top}>
        <Text style={styles.topLabel}>MEKANLAR</Text>
        <Text style={styles.topTitle}>Rehber</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((f) => {
            const active = kategori === f.value
            return (
              <TouchableOpacity
                key={f.label}
                onPress={() => setKategori(f.value)}
                style={[
                  styles.chip,
                  active ? { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY } : { borderColor: 'rgba(255,255,255,0.2)' },
                ]}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipTxt, active ? { color: COLORS.WHITE } : { color: 'rgba(255,255,255,0.5)' }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={rows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Kayıt bulunamadı.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setDetay(item)} activeOpacity={0.75}>
            {item.kapakFotoUrl ? (
              <Image source={{ uri: item.kapakFotoUrl }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <LinearGradient
                colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
                style={styles.thumb}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <View style={styles.cardMid}>
              <Text style={styles.name}>{item.isim}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>{String(item.kategori || '').toUpperCase()}</Text>
              </View>
              <Text style={styles.addr} numberOfLines={2}>
                {item.adres || 'Adres yok'}
              </Text>
            </View>
            <View style={styles.arrowBox}>
              <ChevronRight size={18} color={COLORS.PRIMARY} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!detay} animationType="slide" transparent onRequestClose={() => setDetay(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalInner}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {detay?.kapakFotoUrl ? (
                <Image source={{ uri: detay.kapakFotoUrl }} style={styles.modalCover} resizeMode="cover" />
              ) : (
                <LinearGradient
                  colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
                  style={styles.modalCover}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              )}
              <View style={styles.modalSheet}>
                <Text style={styles.modalName}>{detay?.isim}</Text>
                {detay?.aciklama ? <Text style={styles.modalDesc}>{detay.aciklama}</Text> : null}
                <TouchableOpacity style={styles.dirBtn} onPress={openMaps} activeOpacity={0.75}>
                  <Navigation size={18} color={COLORS.WHITE} />
                  <Text style={styles.dirBtnTxt}>Google Haritalar ile Yol Tarifi</Text>
                </TouchableOpacity>
                {detay?.telefon ? (
                  <TouchableOpacity style={styles.telBtn} onPress={openTel} activeOpacity={0.75}>
                    <Text style={styles.telBtnTxt}>Ara: {detay.telefon}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.darkClose} onPress={() => setDetay(null)} activeOpacity={0.75}>
                <Text style={styles.darkCloseTxt}>Kapat</Text>
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
  top: { backgroundColor: COLORS.DARK, padding: 16, paddingBottom: 14 },
  topLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 2,
  },
  topTitle: { fontSize: 24, fontWeight: '800', color: COLORS.WHITE },
  chips: { marginTop: 10, gap: 8, flexDirection: 'row', alignItems: 'center', paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  chipTxt: { fontSize: 9, fontWeight: '800' },
  list: { padding: 12, paddingBottom: 32, gap: 8 },
  empty: { textAlign: 'center', color: COLORS.TEXT_3, marginTop: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 8,
    ...SHADOW,
  },
  thumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: COLORS.BORDER },
  cardMid: { flex: 1, minWidth: 0 },
  name: { fontSize: 12, fontWeight: '800', color: COLORS.TEXT_1, marginBottom: 3 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.PRIMARY_BG,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  badgeTxt: { fontSize: 7, fontWeight: '800', color: COLORS.PRIMARY },
  addr: { fontSize: 9, color: COLORS.TEXT_3 },
  arrowBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalInner: {
    maxHeight: '90%',
    backgroundColor: COLORS.BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalCover: { width: '100%', height: 220, backgroundColor: COLORS.BORDER },
  modalSheet: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    padding: 18,
    paddingBottom: 12,
  },
  modalName: { fontSize: 18, fontWeight: '800', color: COLORS.TEXT_1, marginBottom: 4 },
  modalDesc: { fontSize: 13, color: COLORS.TEXT_2, lineHeight: 22, marginBottom: 14 },
  dirBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dirBtnTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 11, flexShrink: 1 },
  telBtn: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
  },
  telBtnTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 11 },
  modalFooter: { padding: 16, paddingTop: 0, backgroundColor: COLORS.WHITE },
  darkClose: {
    backgroundColor: COLORS.DARK,
    borderRadius: 12,
    padding: 13,
    alignItems: 'center',
  },
  darkCloseTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 14 },
})
