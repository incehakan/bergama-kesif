import { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ImageBackground,
  StatusBar,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { ChevronRight, Landmark, Navigation, Phone, Pill, Siren } from 'lucide-react-native'
import { getBaskan, getEtkinlikler, getEserler, getHaberler } from '../../lib/api'
import { eczaneMapsUrl, eczaneTelUrl, getNobetciEczaneler } from '../../lib/eczaneler'
import PosterHero, { HamburgerButton } from '../../components/PosterHero'
import ScreenPage from '../../components/ScreenPage'
import GorselPlaceholder from '../../components/GorselPlaceholder'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import { COLORS, FONTS, POSTER, RADIUS, SHADOW } from '../../constants/theme'

function formatEventDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }).toUpperCase()
  } catch {
    return '—'
  }
}

function QrIconMini() {
  const s = 7
  const g = 1
  return (
    <View style={{ width: 18, height: 18, flexDirection: 'row', flexWrap: 'wrap' }}>
      <View style={{ width: s, height: s, margin: g, backgroundColor: COLORS.WHITE, borderRadius: 1 }} />
      <View style={{ width: s, height: s, margin: g, backgroundColor: COLORS.WHITE, borderRadius: 1 }} />
      <View style={{ width: s, height: s, margin: g, backgroundColor: COLORS.WHITE, borderRadius: 1 }} />
      <View style={{ width: s, height: s, margin: g, backgroundColor: COLORS.WHITE, borderRadius: 1 }} />
    </View>
  )
}

function ScreenChrome({ children }) {
  return <ScreenPage paper={false}>{children}</ScreenPage>
}

export default function AnaSayfa() {
  const router = useRouter()
  const [baskan, setBaskan] = useState(null)
  const [etkinlikler, setEtkinlikler] = useState([])
  const [eserler, setEserler] = useState([])
  const [haberler, setHaberler] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [baskanModal, setBaskanModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [nobetciEczane, setNobetciEczane] = useState(null)
  const [nobetciYukleniyor, setNobetciYukleniyor] = useState(true)

  const MENU_ITEMS = [
    {
      key: 'acil-durum',
      label: 'Acil Durum',
      icon: Siren,
      onPress: () => {
        setMenuOpen(false)
        setTimeout(() => router.push('/acil-durum'), 80)
      },
    },
    {
      key: 'iletisim',
      label: 'İletişim',
      icon: Phone,
      onPress: () => {
        setMenuOpen(false)
        setTimeout(() => router.push('/iletisim'), 80)
      },
    },
    {
      key: 'nobetci-eczaneler',
      label: 'Nöbetçi Eczaneler',
      icon: Pill,
      onPress: () => {
        setMenuOpen(false)
        setTimeout(() => router.push('/nobetci-eczaneler'), 80)
      },
    },
  ]

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      let b = null
      let e = []
      let es = []
      let h = []
      try {
        b = await getBaskan()
      } catch {
        /* */
      }
      try {
        const raw = await getEtkinlikler()
        e = Array.isArray(raw) ? raw.slice(0, 8) : []
      } catch {
        /* */
      }
      try {
        const rawE = await getEserler()
        es = Array.isArray(rawE) ? rawE.slice(0, 3) : []
      } catch {
        /* */
      }
      try {
        const rawH = await getHaberler()
        h = Array.isArray(rawH) ? rawH.slice(0, 3) : []
      } catch {
        /* */
      }
      setBaskan(b)
      setEtkinlikler(e)
      setEserler(es)
      setHaberler(h)
    } catch (err) {
      setError(err?.message || 'Veri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    let cancelled = false
    async function loadNobetci() {
      setNobetciYukleniyor(true)
      try {
        const rows = await getNobetciEczaneler()
        if (cancelled) return
        setNobetciEczane(Array.isArray(rows) && rows[0] ? rows[0] : null)
      } catch {
        if (!cancelled) setNobetciEczane(null)
      } finally {
        if (!cancelled) setNobetciYukleniyor(false)
      }
    }
    loadNobetci()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <ScreenChrome>
        <LoadingSpinner />
      </ScreenChrome>
    )
  }
  if (error) {
    return (
      <ScreenChrome>
        <ErrorView message={error} onRetry={load} />
      </ScreenChrome>
    )
  }

  const mesajKisa =
    baskan?.mesaj?.length > 120 ? `${baskan.mesaj.slice(0, 120)}…` : baskan?.mesaj || ''

  return (
    <ScreenChrome>
      <StatusBar barStyle="light-content" backgroundColor={POSTER.BG} translucent={Platform.OS === 'android'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollRoot}>
        <PosterHero
          variant="full"
          rightAction={<HamburgerButton onPress={() => setMenuOpen(true)} />}
        />

        <View style={styles.scrollPad}>
          <TouchableOpacity
            style={styles.qrCard}
            onPress={() => router.push('/qr')}
            activeOpacity={0.75}
          >
            <View style={styles.qrIconBox}>
              <QrIconMini />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.qrTitle}>QR Kod Tara</Text>
              <Text style={styles.qrSub}>Tarihi eserleri keşfet</Text>
            </View>
          </TouchableOpacity>

          {!nobetciYukleniyor && nobetciEczane ? (
            <TouchableOpacity
              style={styles.eczCard}
              onPress={() => router.push('/nobetci-eczaneler')}
              activeOpacity={0.75}
            >
              <View style={styles.eczIconBox}>
                <Pill size={18} color={COLORS.WHITE} strokeWidth={2.3} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.eczLabel}>BUGÜNÜN NÖBETÇİ ECZANESİ</Text>
                <Text style={styles.eczName} numberOfLines={1}>
                  {nobetciEczane.Adi || 'Eczane'}
                </Text>
                <Text style={styles.eczAddr} numberOfLines={2}>
                  {nobetciEczane.Adres || 'Adres yok'}
                </Text>
              </View>
              <View style={styles.eczActions}>
                {eczaneTelUrl(nobetciEczane) ? (
                  <TouchableOpacity
                    style={styles.eczMini}
                    onPress={() => {
                      const url = eczaneTelUrl(nobetciEczane)
                      if (url) Linking.openURL(url).catch(() => {})
                    }}
                    activeOpacity={0.75}
                    hitSlop={8}
                  >
                    <Phone size={16} color={COLORS.PRIMARY} strokeWidth={2.4} />
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={styles.eczMini}
                  onPress={() => {
                    Linking.openURL(eczaneMapsUrl(nobetciEczane)).catch(() => {})
                  }}
                  activeOpacity={0.75}
                  hitSlop={8}
                >
                  <Navigation size={16} color={COLORS.PRIMARY} strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ) : null}

          {baskan ? (
            <TouchableOpacity
              style={styles.baskanCard}
              onPress={() => setBaskanModal(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.baskanLabel}>BAŞKANIN MESAJI</Text>
              <View style={styles.baskanRow}>
                {baskan.fotografUrl ? (
                  <Image source={{ uri: baskan.fotografUrl }} style={styles.baskanPhoto} />
                ) : (
                  <View style={[styles.baskanPhoto, styles.baskanPh]}>
                    <Text style={{ fontSize: 22 }}>👤</Text>
                  </View>
                )}
                <View style={styles.baskanTextCol}>
                  <Text style={styles.baskanName}>{baskan.baskanAdi}</Text>
                  <Text style={styles.baskanUnvan}>{baskan.unvan}</Text>
                  <Text style={styles.baskanMsg} numberOfLines={2}>
                    {mesajKisa || 'Tam mesaj için dokunun.'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ) : null}

          <View style={styles.evHeader}>
            <Text style={styles.evHeaderL}>YAKLAŞAN ETKİNLİKLER</Text>
            <Text style={styles.evHeaderR}>Tümü →</Text>
          </View>

          {etkinlikler.length === 0 ? (
            <Text style={styles.emptyEv}>Yakında etkinlik yok.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.evRow}
            >
              {etkinlikler.map((ev) => (
                <View key={ev.id} style={styles.evCard}>
                  <Text style={styles.evDate}>{formatEventDate(ev.tarihBaslangic)}</Text>
                  <Text style={styles.evTitle} numberOfLines={2}>
                    {ev.baslik}
                  </Text>
                  <Text style={styles.evLoc} numberOfLines={2}>
                    {ev.konum || 'Konum belirtilmedi'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>ÖNE ÇIKAN ESERLER</Text>
          {eserler.length === 0 ? (
            <Text style={styles.emptyHint}>Eser listesi yüklenemedi veya boş.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eserRow}
            >
              {eserler.map((es) => (
                <TouchableOpacity
                  key={es.id}
                  style={styles.eserCard}
                  onPress={() =>
                    router.push({
                      pathname: '/eser/[id]',
                      params: { id: String(es.id), eserData: JSON.stringify(es) },
                    })
                  }
                  activeOpacity={0.75}
                >
                  {es.kapakFotoUrl ? (
                    <ImageBackground
                      source={{ uri: es.kapakFotoUrl }}
                      style={styles.eserCardInner}
                      imageStyle={{ borderRadius: 14 }}
                    >
                      <View style={styles.eserFade} />
                      <View style={styles.eserTextBlock}>
                        <Text style={styles.eserName} numberOfLines={2}>
                          {es.isim}
                        </Text>
                        {es.donem ? <Text style={styles.eserDonem}>{es.donem}</Text> : null}
                      </View>
                    </ImageBackground>
                  ) : (
                    <View style={styles.eserCardInner}>
                      <GorselPlaceholder
                        icon={Landmark}
                        size={170}
                        iconSize={36}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <View style={[styles.eserFade, { backgroundColor: 'rgba(0,0,0,0.08)' }]} />
                      <View style={styles.eserTextBlock}>
                        <Text style={[styles.eserName, styles.eserNameOnPlaceholder]} numberOfLines={2}>
                          {es.isim}
                        </Text>
                        {es.donem ? (
                          <Text style={[styles.eserDonem, styles.eserDonemOnPlaceholder]}>{es.donem}</Text>
                        ) : null}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>SON HABERLER</Text>
          {haberler.length === 0 ? (
            <Text style={styles.emptyHint}>Haber bulunamadı.</Text>
          ) : (
            <View style={styles.haberBlock}>
              {haberler.map((h) => (
                <TouchableOpacity
                  key={h.id}
                  style={styles.haberRow}
                  onPress={() => router.push(`/haber/${h.id}`)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.haberTitle} numberOfLines={2}>
                    {h.baslik}
                  </Text>
                  <Text style={styles.haberDate}>
                    {h.olusturma ? new Date(h.olusturma).toLocaleDateString('tr-TR') : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="slide" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.modalBg}>
          <TouchableOpacity style={styles.menuDismiss} activeOpacity={1} onPress={() => setMenuOpen(false)} />
          <View style={styles.modalBox}>
            <Text style={styles.menuTitle}>Menü</Text>
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <TouchableOpacity
                  key={item.key}
                  style={styles.menuRow}
                  onPress={item.onPress}
                  activeOpacity={0.75}
                >
                  <View style={styles.menuIconBox}>
                    <Icon size={18} color={COLORS.PRIMARY} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <View style={styles.menuArrow}>
                    <ChevronRight size={18} color={COLORS.PRIMARY} strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              )
            })}
            <TouchableOpacity style={styles.modalClose} onPress={() => setMenuOpen(false)} activeOpacity={0.75}>
              <Text style={styles.modalCloseTxt}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={baskanModal} transparent animationType="slide" onRequestClose={() => setBaskanModal(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {baskan?.fotografUrl ? (
                <Image source={{ uri: baskan.fotografUrl }} style={styles.modalImg} resizeMode="cover" />
              ) : null}
              <Text style={styles.modalName}>{baskan?.baskanAdi}</Text>
              <Text style={styles.modalUnvan2}>{baskan?.unvan}</Text>
              <Text style={styles.modalFull}>{baskan?.mesaj}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalClose} onPress={() => setBaskanModal(false)} activeOpacity={0.75}>
              <Text style={styles.modalCloseTxt}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenChrome>
  )
}

const styles = StyleSheet.create({
  scrollRoot: { paddingBottom: 24, backgroundColor: POSTER.PAPER },
  scrollPad: { paddingTop: 10, paddingBottom: 16 },
  qrCard: {
    backgroundColor: COLORS.DARK,
    borderRadius: RADIUS.md,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 18,
    alignItems: 'center',
    ...SHADOW,
  },
  qrIconBox: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrTitle: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 13 },
  qrSub: { marginTop: 4, color: 'rgba(255,255,255,0.45)', fontFamily: FONTS.body, fontSize: 9 },
  eczCard: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  eczIconBox: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eczLabel: {
    fontSize: 8,
    color: COLORS.PRIMARY,
    letterSpacing: 1.2,
    fontWeight: '800',
    marginBottom: 4,
  },
  eczName: { fontSize: 13, fontWeight: '800', color: COLORS.TEXT_1 },
  eczAddr: { marginTop: 4, fontSize: 10, color: COLORS.TEXT_3, lineHeight: 14 },
  eczActions: { flexDirection: 'column', gap: 8 },
  eczMini: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baskanCard: {
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  baskanLabel: {
    fontSize: 8,
    color: COLORS.PRIMARY,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 6,
  },
  baskanRow: { flexDirection: 'row', alignItems: 'flex-start' },
  baskanPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY_BG,
  },
  baskanPh: { backgroundColor: COLORS.PRIMARY_BG, justifyContent: 'center', alignItems: 'center' },
  baskanTextCol: { flex: 1, marginLeft: 12 },
  baskanName: { fontSize: 14, fontWeight: '700', color: COLORS.TEXT_1 },
  baskanUnvan: { fontSize: 10, color: COLORS.TEXT_2, marginTop: 2 },
  baskanMsg: { fontSize: 10, color: COLORS.TEXT_3, marginTop: 6, lineHeight: 14 },
  evHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  evHeaderL: {
    fontSize: 8,
    color: COLORS.TEXT_3,
    letterSpacing: 2,
    fontWeight: '700',
  },
  evHeaderR: { fontSize: 10, fontWeight: '700', color: COLORS.PRIMARY },
  emptyEv: { marginHorizontal: 16, color: COLORS.TEXT_3, fontSize: 12 },
  evRow: { paddingHorizontal: 16, gap: 10, paddingBottom: 8 },
  evCard: {
    width: 160,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  evDate: {
    fontSize: 8,
    color: COLORS.PRIMARY,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  evTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.TEXT_1,
    lineHeight: 16,
    marginBottom: 3,
  },
  evLoc: { fontSize: 8, color: COLORS.TEXT_3 },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.TEXT_3,
    letterSpacing: 2,
  },
  emptyHint: { marginHorizontal: 16, color: COLORS.TEXT_3, fontSize: 12, marginBottom: 8 },
  eserRow: { paddingHorizontal: 16, gap: 12, paddingBottom: 8 },
  eserCard: { width: 140, height: 170, borderRadius: 14, overflow: 'hidden', ...SHADOW },
  eserCardInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    borderRadius: 14,
    overflow: 'hidden',
  },
  eserFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
  },
  eserTextBlock: { padding: 10, zIndex: 1 },
  eserName: { fontSize: 11, fontWeight: '800', color: COLORS.WHITE },
  eserNameOnPlaceholder: { color: COLORS.TEXT_1 },
  eserDonem: { marginTop: 4, fontSize: 9, fontWeight: '700', color: COLORS.PRIMARY_LIGHT },
  eserDonemOnPlaceholder: { color: COLORS.TEXT_2 },
  haberBlock: { paddingHorizontal: 16, gap: 10 },
  haberRow: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
    paddingLeft: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  haberTitle: { fontSize: 12, fontWeight: '800', color: COLORS.TEXT_1, marginBottom: 4 },
  haberDate: { fontSize: 9, color: COLORS.PRIMARY, fontWeight: '600' },
  menuDismiss: { flex: 1 },
  menuTitle: { fontSize: 20, fontWeight: '800', color: COLORS.TEXT_1, marginBottom: 14 },
  menuRow: {
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
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.TEXT_1 },
  menuArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: COLORS.BG_CARD,
    maxHeight: '88%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
  },
  modalImg: { width: '100%', height: 180, borderRadius: 12, marginBottom: 12, backgroundColor: COLORS.BORDER },
  modalName: { fontSize: 20, fontWeight: '800', color: COLORS.TEXT_1 },
  modalUnvan2: { marginTop: 4, fontSize: 13, color: COLORS.PRIMARY, fontWeight: '600' },
  modalFull: { marginTop: 12, fontSize: 15, lineHeight: 24, color: COLORS.TEXT_2 },
  modalClose: {
    marginTop: 14,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 15 },
})
