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
import * as Linking from 'expo-linking'
import { UtensilsCrossed } from 'lucide-react-native'
import { getAllYemeIcme } from '../../lib/api'
import GorselPlaceholder from '../../components/GorselPlaceholder'
import HaritaButonu from '../../components/HaritaButonu'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorView from '../../components/ErrorView'
import ScreenPage from '../../components/ScreenPage'
import ScreenHeader from '../../components/ScreenHeader'
import ListCard from '../../components/ListCard'
import { FilterChipPoster } from '../../components/FilterChip'
import { COLORS, FONTS, POSTER, RADIUS } from '../../constants/theme'

const FILTERS = [
  { label: 'Tümü', value: null },
  { label: 'Restoran', value: 'RESTORAN' },
  { label: 'Kafe', value: 'KAFE' },
  { label: 'Pastane', value: 'PASTANE' },
  { label: 'Sokak Lezzeti', value: 'SOKAK_LEZZETI' },
  { label: 'Yerel Ürünler', value: 'YEREL_URUN' },
]

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
        <ErrorView message={error} onRetry={load} />
      </ScreenPage>
    )
  }

  return (
    <ScreenPage>
      <ScreenHeader title="Rehber" subtitle="MEKANLAR & ÜRÜNLER">
        <FilterChipPoster items={FILTERS} value={kategori} onChange={setKategori} />
      </ScreenHeader>

      <FlatList
        style={{ flex: 1 }}
        data={rows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Kayıt bulunamadı.</Text>}
        renderItem={({ item }) => (
          <ListCard
            onPress={() => setDetay(item)}
            title={item.isim}
            subtitle={item.adres || 'Adres yok'}
            badge={String(item.kategori || '').toUpperCase()}
            thumbnail={
              item.kapakFotoUrl ? (
                <Image source={{ uri: item.kapakFotoUrl }} style={styles.thumb} resizeMode="cover" />
              ) : (
                <GorselPlaceholder icon={UtensilsCrossed} size={56} iconSize={22} style={styles.thumb} />
              )
            }
          />
        )}
      />

      <Modal visible={!!detay} animationType="slide" transparent onRequestClose={() => setDetay(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalInner}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {detay?.kapakFotoUrl ? (
                <Image source={{ uri: detay.kapakFotoUrl }} style={styles.modalCover} resizeMode="cover" />
              ) : (
                <GorselPlaceholder icon={UtensilsCrossed} size={220} iconSize={48} style={styles.modalCover} />
              )}
              <View style={styles.modalSheet}>
                <Text style={styles.modalName}>{detay?.isim}</Text>
                {detay?.aciklama ? <Text style={styles.modalDesc}>{detay.aciklama}</Text> : null}
                <HaritaButonu
                  lat={detay?.koordinatLat}
                  lng={detay?.koordinatLng}
                  label={detay?.isim || 'Mekan'}
                  style={{ marginBottom: 10 }}
                />
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
    </ScreenPage>
  )
}

const styles = StyleSheet.create({
  list: { padding: 12, paddingBottom: 32 },
  empty: { textAlign: 'center', color: COLORS.TEXT_3, fontFamily: FONTS.body, marginTop: 20 },
  thumb: { width: 56, height: 56, borderRadius: RADIUS.sm, backgroundColor: COLORS.BORDER },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalInner: {
    maxHeight: '90%',
    backgroundColor: POSTER.PAPER,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalCover: { width: '100%', height: 220, backgroundColor: COLORS.BORDER },
  modalSheet: {
    backgroundColor: POSTER.PAPER,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
    padding: 18,
    paddingBottom: 12,
  },
  modalName: { fontFamily: FONTS.display, fontSize: 20, color: COLORS.TEXT_1, marginBottom: 4 },
  modalDesc: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.TEXT_2, lineHeight: 22, marginBottom: 14 },
  telBtn: {
    backgroundColor: '#25D366',
    borderRadius: RADIUS.md,
    padding: 13,
    alignItems: 'center',
  },
  telBtnTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 11 },
  modalFooter: { padding: 16, paddingTop: 0, backgroundColor: POSTER.PAPER },
  darkClose: {
    backgroundColor: COLORS.DARK,
    borderRadius: RADIUS.md,
    padding: 13,
    alignItems: 'center',
  },
  darkCloseTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 14 },
})
