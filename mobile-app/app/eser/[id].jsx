import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Video, ResizeMode } from 'expo-av'
import { Glasses, Landmark, Play } from 'lucide-react-native'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import GorselPlaceholder from '../../components/GorselPlaceholder'
import HaritaButonu from '../../components/HaritaButonu'
import ScreenPage from '../../components/ScreenPage'
import PosterHero from '../../components/PosterHero'
import { getEserler } from '../../lib/api'
import { COLORS, FONTS, POSTER, RADIUS } from '../../constants/theme'

export default function EserDetayScreen() {
  const params = useLocalSearchParams()
  const rawId = params.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  const rawEserData = params.eserData
  const eserDataParam = Array.isArray(rawEserData) ? rawEserData[0] : rawEserData
  const router = useRouter()
  const [eser, setEser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [videoAcik, setVideoAcik] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      if (eserDataParam) {
        const data = JSON.parse(eserDataParam)
        if (String(data.id) === String(id)) {
          setEser(data)
          return
        }
      }
      const list = await getEserler()
      const found = (Array.isArray(list) ? list : []).find((e) => String(e.id) === String(id))
      if (found) {
        setEser(found)
        return
      }
      setError('Eser verisi bulunamadı. Lütfen QR kod ile tekrar deneyin.')
      setEser(null)
    } catch {
      setError('Eser okunamadı.')
      setEser(null)
    } finally {
      setLoading(false)
    }
  }, [id, eserDataParam])

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
  if (error || !eser) {
    return (
      <ScreenPage>
        <ErrorView message={error || 'Eser bulunamadı.'} onRetry={load} />
      </ScreenPage>
    )
  }

  const vrId = eser.vrIcerikId ?? eser.vrIcerik?.id

  return (
    <ScreenPage>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} hitSlop={12}>
          <Text style={styles.back}>← Geri</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <PosterHero variant="strip" title={eser.isim} subtitle="TARİHİ ESER" />
        <View style={styles.coverWrap}>
          {eser.kapakFotoUrl ? (
            <>
              <Image source={{ uri: eser.kapakFotoUrl }} style={styles.cover} resizeMode="cover" />
              <View style={styles.coverOverlay} />
            </>
          ) : (
            <GorselPlaceholder icon={Landmark} size={240} iconSize={48} style={styles.cover} />
          )}
          {eser.donem ? (
            <View style={styles.periodBadge}>
              <Text style={styles.periodBadgeTxt}>{eser.donem}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.sheet}>
          {eser.kisaAciklama ? <Text style={styles.kisa}>{eser.kisaAciklama}</Text> : null}
          <View style={styles.accent} />
          {eser.detayliAciklama ? (
            <Text style={styles.detay}>{eser.detayliAciklama}</Text>
          ) : null}

          <HaritaButonu
            lat={eser.koordinatLat}
            lng={eser.koordinatLng}
            label={eser.isim || 'Eser'}
            style={{ marginBottom: 12 }}
          />

          {eser.videoUrl ? (
            <TouchableOpacity style={styles.btnVid} onPress={() => setVideoAcik(true)} activeOpacity={0.75}>
              <Play size={22} color={COLORS.WHITE} />
              <Text style={styles.btnVidTxt}>Videoyu İzle</Text>
            </TouchableOpacity>
          ) : null}

          {vrId ? (
            <TouchableOpacity
              style={styles.btnVr}
              onPress={() => router.push(`/vr/${vrId}`)}
              activeOpacity={0.75}
            >
              <Glasses size={22} color={COLORS.WHITE} />
              <Text style={styles.btnVrTxt}>VR ile Keşfet</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={videoAcik} animationType="fade" onRequestClose={() => setVideoAcik(false)}>
        <View style={styles.videoModal}>
          <Video
            source={{ uri: eser.videoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
          />
          <TouchableOpacity style={styles.videoClose} onPress={() => setVideoAcik(false)} activeOpacity={0.75}>
            <Text style={styles.videoCloseTxt}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScreenPage>
  )
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: POSTER.BG,
  },
  back: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 15 },
  scroll: { paddingBottom: 32 },
  coverWrap: { width: '100%', height: 240, position: 'relative' },
  cover: { width: '100%', height: 240, backgroundColor: POSTER.BG },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  periodBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(192,57,43,0.85)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  periodBadgeTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 11 },
  sheet: {
    backgroundColor: POSTER.PAPER,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    padding: 20,
  },
  kisa: { fontFamily: FONTS.bodyMedium, fontSize: 14, fontStyle: 'italic', color: COLORS.TEXT_2, marginBottom: 10, lineHeight: 22 },
  accent: { width: 32, height: 3, backgroundColor: COLORS.PRIMARY, marginBottom: 12 },
  detay: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.TEXT_2, lineHeight: 24, marginBottom: 8 },
  btnVid: {
    marginTop: 4,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnVidTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 15 },
  btnVr: {
    marginTop: 10,
    backgroundColor: COLORS.DARK,
    borderRadius: RADIUS.md,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnVrTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 15 },
  videoModal: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  video: { width: '100%', height: '70%' },
  videoClose: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  videoCloseTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold },
})
