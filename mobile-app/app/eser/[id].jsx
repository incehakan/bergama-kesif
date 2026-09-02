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
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Video, ResizeMode } from 'expo-av'
import { Glasses, Landmark, Play } from 'lucide-react-native'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import GorselPlaceholder from '../../components/GorselPlaceholder'
import { getEserler } from '../../lib/api'
import { COLORS } from '../../constants/theme'

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

  const chrome = (body) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.PRIMARY }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.BG }}>{body}</View>
    </SafeAreaView>
  )

  if (loading) return chrome(<LoadingSpinner />)
  if (error || !eser) {
    return chrome(<ErrorView message={error || 'Eser bulunamadı.'} onRetry={load} />)
  }

  const vrId = eser.vrIcerikId ?? eser.vrIcerik?.id

  return (
    chrome(
      <>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} hitSlop={12}>
            <Text style={styles.back}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Tarihi Eser</Text>
          <View style={{ width: 56 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.coverWrap}>
            {eser.kapakFotoUrl ? (
              <>
                <Image source={{ uri: eser.kapakFotoUrl }} style={styles.cover} resizeMode="cover" />
                <View style={styles.coverOverlay} />
              </>
            ) : (
              <GorselPlaceholder icon={Landmark} size={280} iconSize={48} style={styles.cover} />
            )}
            {eser.donem ? (
              <View style={styles.periodBadge}>
                <Text style={styles.periodBadgeTxt}>{eser.donem}</Text>
              </View>
            ) : null}
            <Text style={[styles.coverTitle, !eser.kapakFotoUrl && styles.coverTitleOnPlaceholder]}>
              {eser.isim}
            </Text>
          </View>

          <View style={styles.sheet}>
            {eser.kisaAciklama ? <Text style={styles.kisa}>{eser.kisaAciklama}</Text> : null}
            <View style={styles.accent} />
            {eser.detayliAciklama ? (
              <Text style={styles.detay}>{eser.detayliAciklama}</Text>
            ) : null}

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
  coverWrap: { width: '100%', height: 280, position: 'relative' },
  cover: { width: '100%', height: 280, backgroundColor: COLORS.PRIMARY },
  coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  periodBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(192,57,43,0.85)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  periodBadgeTxt: { color: COLORS.WHITE, fontSize: 11, fontWeight: '700' },
  coverTitle: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.WHITE,
  },
  coverTitleOnPlaceholder: { color: COLORS.TEXT_1 },
  sheet: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    padding: 20,
  },
  kisa: { fontSize: 14, fontStyle: 'italic', color: COLORS.TEXT_2, marginBottom: 10, lineHeight: 22 },
  accent: { width: 32, height: 3, backgroundColor: COLORS.PRIMARY, marginBottom: 12 },
  detay: { fontSize: 14, color: COLORS.TEXT_2, lineHeight: 24, marginBottom: 8 },
  btnVid: {
    marginTop: 12,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnVidTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 15 },
  btnVr: {
    marginTop: 10,
    backgroundColor: COLORS.DARK,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnVrTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 15 },
  videoModal: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  video: { width: '100%', height: '70%' },
  videoClose: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  videoCloseTxt: { color: COLORS.WHITE, fontWeight: '800' },
})
