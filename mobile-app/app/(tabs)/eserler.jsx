import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Video, ResizeMode } from 'expo-av'
import { QrCode } from 'lucide-react-native'
import { getEserler } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import { COLORS, SHADOW } from '../../constants/theme'

export default function EserlerScreen() {
  const [eserler, setEserler] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [secilen, setSecilen] = useState(null)
  const [videoAcik, setVideoAcik] = useState(false)
  const [aktifVideoUrl, setAktifVideoUrl] = useState('')

  const yukle = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getEserler()
      setEserler(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.message || 'Eserler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    yukle()
  }, [yukle])

  const chrome = (body) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.PRIMARY }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: COLORS.BG }}>{body}</View>
    </SafeAreaView>
  )

  if (loading) return chrome(<LoadingSpinner />)
  if (error) return chrome(<ErrorView message={error} onRetry={yukle} />)

  return (
    chrome(
      <>
      <View style={styles.banner}>
        <QrCode size={22} color={COLORS.PRIMARY} strokeWidth={2} />
        <Text style={styles.bannerTxt}>QR kodları okutarak tam deneyime ulaşın</Text>
      </View>

      <FlatList
        data={eserler}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.liste}
        ListEmptyComponent={<Text style={styles.bos}>Kayıt bulunamadı.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.kart} onPress={() => setSecilen(item)} activeOpacity={0.75}>
            {item.kapakFotoUrl ? (
              <Image source={{ uri: item.kapakFotoUrl }} style={styles.foto} resizeMode="cover" />
            ) : (
              <View style={styles.fotoPh}>
                <Text style={styles.emoji}>🏛️</Text>
              </View>
            )}
            <View style={styles.kartIcerik}>
              <Text style={styles.isim}>{item.isim}</Text>
              {item.donem ? <Text style={styles.donem}>{item.donem}</Text> : null}
              {item.kisaAciklama ? (
                <Text style={styles.kisa} numberOfLines={2}>
                  {item.kisaAciklama}
                </Text>
              ) : null}
              <View style={styles.qrBadge}>
                <Text style={styles.qrBadgeTxt}>QR ile Keşfet</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!secilen} animationType="slide" onRequestClose={() => setSecilen(null)}>
        <SafeAreaView style={styles.modalSafe} edges={['left', 'right', 'bottom']}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalCoverWrap}>
              {secilen?.kapakFotoUrl ? (
                <>
                  <Image source={{ uri: secilen.kapakFotoUrl }} style={styles.modalFoto} resizeMode="cover" />
                  <View style={styles.modalOverlay} />
                </>
              ) : (
                <LinearGradient
                  colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
                  style={styles.modalFoto}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              )}
              {secilen?.donem ? (
                <View style={styles.donemBadge}>
                  <Text style={styles.donemBadgeTxt}>{secilen.donem}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.modalSheet}>
              <Text style={styles.modalBaslik}>{secilen?.isim}</Text>
              {secilen?.donem ? <Text style={styles.modalDonem}>{secilen.donem}</Text> : null}
              <View style={styles.accent} />
              {secilen?.kisaAciklama ? (
                <Text style={styles.modalKisa}>{secilen.kisaAciklama}</Text>
              ) : null}
              {secilen?.detayliAciklama ? (
                <Text style={styles.modalDetay}>{secilen.detayliAciklama}</Text>
              ) : null}
              {secilen?.videoUrl ? (
                <TouchableOpacity
                  style={styles.videoBtn}
                  onPress={() => {
                    setAktifVideoUrl(secilen.videoUrl)
                    setSecilen(null)
                    setVideoAcik(true)
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.videoBtnTxt}>Videoyu İzle</Text>
                </TouchableOpacity>
              ) : null}
              <View style={styles.qrBanner}>
                <Text style={styles.qrBannerTit}>QR Tara — Ek Deneyim için</Text>
                <Text style={styles.qrBannerSub}>
                  Eserin yanındaki QR kodu ile hızlı açılış ve VR içeriğine ulaşın.
                </Text>
                <TouchableOpacity
                  style={styles.qrActBtn}
                  onPress={() => {
                    setSecilen(null)
                    router.push('/qr')
                  }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.qrActBtnTxt}>QR Kodu Tarat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <TouchableOpacity style={styles.kapatBtn} onPress={() => setSecilen(null)} activeOpacity={0.75}>
            <Text style={styles.kapatBtnTxt}>Kapat</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={videoAcik}
        animationType="fade"
        onRequestClose={() => {
          setVideoAcik(false)
          setAktifVideoUrl('')
        }}
      >
        <View style={styles.videoModal}>
          <Video
            source={{ uri: aktifVideoUrl }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
          />
          <TouchableOpacity
            style={styles.videoClose}
            onPress={() => {
              setVideoAcik(false)
              setAktifVideoUrl('')
            }}
            activeOpacity={0.75}
          >
            <Text style={styles.videoCloseTxt}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      </>
    )
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: COLORS.DARK,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerTxt: { flex: 1, color: COLORS.WHITE, fontSize: 10, fontWeight: '600', lineHeight: 15 },
  liste: { paddingTop: 8, paddingBottom: 32 },
  bos: { textAlign: 'center', color: COLORS.TEXT_3, marginTop: 24 },
  kart: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  foto: { width: 110, height: 110, backgroundColor: COLORS.BORDER },
  fotoPh: {
    width: 110,
    height: 110,
    backgroundColor: COLORS.PRIMARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: { fontSize: 32 },
  kartIcerik: { flex: 1, padding: 12, justifyContent: 'center' },
  isim: { fontSize: 14, fontWeight: '800', color: COLORS.TEXT_1, marginBottom: 3 },
  donem: { fontSize: 11, color: COLORS.PRIMARY, fontStyle: 'italic', marginBottom: 4 },
  kisa: { fontSize: 10, color: COLORS.TEXT_2, lineHeight: 16, marginBottom: 6 },
  qrBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.PRIMARY_BG,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  qrBadgeTxt: { fontSize: 8, fontWeight: '800', color: COLORS.PRIMARY },
  modalSafe: { flex: 1, backgroundColor: COLORS.BG },
  modalCoverWrap: { width: '100%', height: 280, position: 'relative' },
  modalFoto: { width: '100%', height: 280, backgroundColor: COLORS.PRIMARY },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  donemBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(192,57,43,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  donemBadgeTxt: { color: COLORS.WHITE, fontSize: 11, fontWeight: '700' },
  modalSheet: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    padding: 20,
    paddingBottom: 24,
  },
  modalBaslik: { fontSize: 22, fontWeight: '800', color: COLORS.TEXT_1 },
  modalDonem: { marginTop: 4, fontSize: 13, color: COLORS.PRIMARY, fontStyle: 'italic' },
  accent: { width: 32, height: 3, backgroundColor: COLORS.PRIMARY, marginVertical: 12 },
  modalKisa: { fontSize: 14, color: COLORS.TEXT_2, lineHeight: 22, marginBottom: 10 },
  modalDetay: { fontSize: 14, color: COLORS.TEXT_2, lineHeight: 24, marginBottom: 16 },
  videoBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  videoBtnTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 14 },
  qrBanner: {
    backgroundColor: COLORS.PRIMARY_BG,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_BG,
    borderRadius: 12,
    padding: 12,
  },
  qrBannerTit: { fontSize: 12, fontWeight: '800', color: COLORS.TEXT_1, marginBottom: 6 },
  qrBannerSub: { fontSize: 10, color: COLORS.TEXT_2, marginBottom: 8, lineHeight: 15 },
  qrActBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 10,
    padding: 11,
    alignItems: 'center',
  },
  qrActBtnTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 13 },
  kapatBtn: {
    margin: 16,
    backgroundColor: COLORS.DARK,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  kapatBtnTxt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 15 },
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
