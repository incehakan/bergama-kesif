import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native'
import { WebView } from 'react-native-webview'
import * as Location from 'expo-location'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { Locate, Phone } from 'lucide-react-native'
import { getEserler, getHaritaNoktalari } from '../../lib/api'
import HaritaButonu from '../../components/HaritaButonu'
import { buildExplorerMapHtml } from '../../lib/leafletWebMap'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import ScreenPage from '../../components/ScreenPage'
import ScreenHeader from '../../components/ScreenHeader'
import { FilterChipPoster } from '../../components/FilterChip'
import { COLORS, FONTS, POSTER, RADIUS, SHADOW } from '../../constants/theme'

const FILTERS = [
  { label: 'Tümü', value: 'all' },
  { label: 'Tarihi Eserler', value: 'eser' },
  { label: 'Rehber', value: 'yemeicme' },
]

export default function HaritaScreen() {
  const router = useRouter()
  const webRef = useRef(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [user, setUser] = useState(null)
  const [secili, setSecili] = useState(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await getHaritaNoktalari()
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Harita yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    let cancelled = false
    async function locate() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted' || cancelled) return
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        if (cancelled) return
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUser(loc)
      } catch {
        /* izin yoksa sessiz */
      }
    }
    locate()
    return () => {
      cancelled = true
    }
  }, [])

  const points = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase('tr-TR')
    return rows.filter((p) => {
      if (filter !== 'all' && p.tip !== filter) return false
      if (!needle) return true
      const hay = `${p.isim || ''} ${p.adres || ''} ${p.donem || ''}`.toLocaleLowerCase('tr-TR')
      return hay.includes(needle)
    })
  }, [rows, q, filter])

  const html = useMemo(
    () => buildExplorerMapHtml({ points, user, color: COLORS.PRIMARY }),
    [points, user]
  )

  async function onMessage(event) {
    try {
      const msg = JSON.parse(event.nativeEvent.data)
      if (msg?.type !== 'select') return
      if (msg.tip === 'eser') {
        setSecili(null)
        let eser = rows.find((r) => r.tip === 'eser' && String(r.id) === String(msg.id))
        try {
          const list = await getEserler()
          const found = (Array.isArray(list) ? list : []).find((e) => String(e.id) === String(msg.id))
          if (found) eser = found
        } catch {
          /* */
        }
        if (eser) {
          router.push({
            pathname: '/eser/[id]',
            params: { id: String(msg.id), eserData: JSON.stringify(eser) },
          })
        }
        return
      }
      if (msg.tip === 'yemeicme') {
        const mekan = rows.find((r) => r.tip === 'yemeicme' && String(r.id) === String(msg.id))
        setSecili(mekan || null)
      }
    } catch {
      /* */
    }
  }

  async function goMyLocation() {
    try {
      if (!user) {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== 'granted') return
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUser(loc)
        webRef.current?.injectJavaScript(`window.panToUser(${loc.lat},${loc.lng}); true;`)
        return
      }
      webRef.current?.injectJavaScript(`window.focusUser && window.focusUser(); true;`)
    } catch {
      /* */
    }
  }

  if (loading) {
    return (
      <ScreenPage paper={false}>
        <LoadingSpinner />
      </ScreenPage>
    )
  }
  if (error) {
    return (
      <ScreenPage paper={false}>
        <ErrorView message={error} onRetry={load} />
      </ScreenPage>
    )
  }

  return (
    <ScreenPage paper={false}>
      <ScreenHeader title="Harita" subtitle="KEŞFET">
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Ara..."
          placeholderTextColor={POSTER.TAG}
          style={styles.search}
        />
        <FilterChipPoster items={FILTERS} value={filter} onChange={setFilter} />
      </ScreenHeader>
      <View style={styles.mapWrap}>
        <WebView
          ref={webRef}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={onMessage}
          style={styles.web}
          javaScriptEnabled
          setSupportMultipleWindows={false}
        />
        <TouchableOpacity style={styles.locate} onPress={goMyLocation} activeOpacity={0.8}>
          <Locate size={20} color={COLORS.PRIMARY} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
      {secili ? (
        <View style={styles.sheet}>
          <Text style={styles.sheetName}>{secili.isim}</Text>
          {secili.adres ? (
            <Text style={styles.sheetAddr} numberOfLines={2}>
              {secili.adres}
            </Text>
          ) : null}
          <View style={styles.sheetRow}>
            {secili.telefon ? (
              <TouchableOpacity
                style={styles.sheetBtn}
                onPress={() => Linking.openURL(`tel:${String(secili.telefon).replace(/\s/g, '')}`)}
                activeOpacity={0.75}
              >
                <Phone size={16} color={COLORS.WHITE} />
                <Text style={styles.sheetBtnTxt}>Ara</Text>
              </TouchableOpacity>
            ) : null}
            <HaritaButonu
              lat={secili.koordinatLat}
              lng={secili.koordinatLng}
              label={secili.isim || 'Mekan'}
              style={secili.telefon ? { flex: 1, paddingVertical: 9 } : { paddingVertical: 9 }}
            />
            <TouchableOpacity style={styles.sheetClose} onPress={() => setSecili(null)} activeOpacity={0.75}>
              <Text style={styles.sheetCloseTxt}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </ScreenPage>
  )
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    color: COLORS.WHITE,
    fontFamily: FONTS.body,
    fontSize: 13,
    marginBottom: 10,
  },
  mapWrap: { flex: 1, backgroundColor: POSTER.PAPER },
  web: { flex: 1, backgroundColor: POSTER.PAPER },
  locate: {
    position: 'absolute',
    right: 14,
    bottom: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
  },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 16,
    backgroundColor: POSTER.PAPER,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: POSTER.PAPER_EDGE,
    ...SHADOW,
  },
  sheetName: { fontFamily: FONTS.bodyExtra, fontSize: 14, color: COLORS.TEXT_1 },
  sheetAddr: { marginTop: 4, fontFamily: FONTS.body, fontSize: 12, color: COLORS.TEXT_2, lineHeight: 17 },
  sheetRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  sheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  sheetBtnTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 11 },
  sheetClose: { marginLeft: 'auto' },
  sheetCloseTxt: { fontFamily: FONTS.bodyBold, fontSize: 12, color: COLORS.TEXT_2 },
})
