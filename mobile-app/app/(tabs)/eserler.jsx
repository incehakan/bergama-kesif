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
import { router } from 'expo-router'
import { Video, ResizeMode } from 'expo-av'
import { Landmark, QrCode } from 'lucide-react-native'
import { getEserler } from '../../lib/api'
import GorselPlaceholder from '../../components/GorselPlaceholder'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import ScreenPage from '../../components/ScreenPage'
import ScreenHeader from '../../components/ScreenHeader'
import ListCard from '../../components/ListCard'
import { COLORS, FONTS, POSTER, RADIUS, SHADOW } from '../../constants/theme'

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

  if (loading) {
    return (
      <ScreenPage>
        <LoadingSpinner />
      </ScreenPage>
    )
  }
  if (error) {
    return (
      <ScreenPage>
        <ErrorView message={error} onRetry={yukle} />
      </ScreenPage>
    )
  }

  return (
    <ScreenPage>
      <ScreenHeader title="Eserler" subtitle="TARİHİ MİRAS" />
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
          <ListCard
            onPress={() => setSecilen(item)}
            title={item.isim}
            subtitle={item.kisaAciklama}
            badge={item.donem || 'QR ile Keşfet'}
            meta={item.donem ? undefined : undefined}
            thumbnail={
              item.kapakFotoUrl ? (
                <Image source={{ uri: item.kapakFotoUrl }} style={styles.foto} resizeMode="cover" />
              ) : (
                <GorselPlaceholder icon={Landmark} size={56} iconSize={22} style={styles.foto} />
              )
            }
          />
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
                <GorselPlaceholder icon={Landmark} size={280} iconSize={48} style={styles.modalFoto} />
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
    </ScreenPage>
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
  bannerTxt: { flex: 1, color: COLORS.WHITE, fontFamily: FONTS.bodySemi, fontSize: 10, lineHeight: 15 },
  liste: { padding: 12, paddingBottom: 32 },
  bos: { textAlign: 'center', color: COLORS.TEXT_3, fontFamily: FONTS.body, marginTop: 24 },
  foto: { width: 56, height: 56, borderRadius: RADIUS.sm, backgroundColor: COLORS.BORDER },
  modalSafe: { flex: 1, backgroundColor: POSTER.PAPER },
  modalCoverWrap: { width: '100%', height: 280, position: 'relative' },
  modalFoto: { width: '100%', height: 280, backgroundColor: POSTER.BG },
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
  donemBadgeTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 11 },
  modalSheet: {
    backgroundColor: POSTER.PAPER,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    padding: 20,
    paddingBottom: 24,
  },
  modalBaslik: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.TEXT_1 },
  modalDonem: { marginTop: 4, fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.PRIMARY, fontStyle: 'italic' },
  accent: { width: 32, height: 3, backgroundColor: COLORS.PRIMARY, marginVertical: 12 },
  modalKisa: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.TEXT_2, lineHeight: 22, marginBottom: 10 },
  modalDetay: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.TEXT_2, lineHeight: 24, marginBottom: 16 },
  videoBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  videoBtnTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 14 },
  qrBanner: {
    backgroundColor: COLORS.PRIMARY_BG,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY_BG,
    borderRadius: RADIUS.md,
    padding: 12,
  },
  qrBannerTit: { fontFamily: FONTS.bodyExtra, fontSize: 12, color: COLORS.TEXT_1, marginBottom: 6 },
  qrBannerSub: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.TEXT_2, marginBottom: 8, lineHeight: 15 },
  qrActBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: RADIUS.sm,
    padding: 11,
    alignItems: 'center',
  },
  qrActBtnTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 13 },
  kapatBtn: {
    margin: 16,
    backgroundColor: COLORS.DARK,
    borderRadius: RADIUS.md,
    padding: 14,
    alignItems: 'center',
  },
  kapatBtnTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 15 },
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
