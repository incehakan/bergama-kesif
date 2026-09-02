import { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { Phone, Pill, RefreshCw } from 'lucide-react-native'
import { eczaneTelUrl, getNobetciEczaneler } from '../lib/eczaneler'
import HaritaButonu from '../components/HaritaButonu'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorView from '../components/ErrorView'
import ScreenPage from '../components/ScreenPage'
import ScreenHeader from '../components/ScreenHeader'
import { COLORS, FONTS, POSTER, RADIUS, SHADOW } from '../constants/theme'

async function openUrl(url) {
  if (!url) return
  try {
    await Linking.openURL(url)
  } catch {
    /* */
  }
}

function formatSaat(d) {
  if (!d) return '—'
  try {
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

export default function NobetciEczanelerScreen() {
  const router = useRouter()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else {
      setLoading(true)
      setError(null)
    }
    try {
      const data = await getNobetciEczaneler()
      setRows(Array.isArray(data) ? data : [])
      setUpdatedAt(new Date())
      setError(null)
    } catch (err) {
      if (!isRefresh) setError(err?.message || 'Veri yüklenemedi')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load(false)
  }, [load])

  const headerExtra = (
    <>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => load(true)}
          activeOpacity={0.75}
          hitSlop={8}
        >
          <RefreshCw size={18} color={COLORS.WHITE} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>
      {updatedAt ? (
        <Text style={styles.updated}>Son güncelleme: {formatSaat(updatedAt)}</Text>
      ) : null}
    </>
  )

  const backBtn = (
    <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} hitSlop={12} style={styles.backWrap}>
      <Text style={styles.back}>← Geri</Text>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <ScreenPage>
        {backBtn}
        <ScreenHeader title="Nöbetçi Eczaneler" subtitle="SAĞLIK">
          {headerExtra}
        </ScreenHeader>
        <LoadingSpinner />
      </ScreenPage>
    )
  }
  if (error) {
    return (
      <ScreenPage>
        {backBtn}
        <ScreenHeader title="Nöbetçi Eczaneler" subtitle="SAĞLIK">
          {headerExtra}
        </ScreenHeader>
        <ErrorView message={error} onRetry={() => load(false)} />
      </ScreenPage>
    )
  }

  return (
    <ScreenPage>
      {backBtn}
      <ScreenHeader title="Nöbetçi Eczaneler" subtitle="SAĞLIK">
        {headerExtra}
      </ScreenHeader>
      <FlatList
      data={rows}
      keyExtractor={(item, index) => String(item?.EczaneId || item?.Adi || index)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => load(true)}
          tintColor={COLORS.PRIMARY}
          colors={[COLORS.PRIMARY]}
        />
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          Bugün için nöbetçi eczane bilgisi bulunamadı, lütfen daha sonra tekrar deneyin.
        </Text>
      }
      renderItem={({ item }) => {
        const tel = eczaneTelUrl(item)
        const bolge = [item?.Bolge, item?.BolgeAciklama].filter((x) => String(x || '').trim()).join(' · ')
        return (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.cardIcon}>
                <Pill size={18} color={COLORS.PRIMARY} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item?.Adi || 'Eczane'}</Text>
                {bolge ? <Text style={styles.bolge}>{bolge}</Text> : null}
              </View>
            </View>
            <Text style={styles.addr}>{item?.Adres || 'Adres yok'}</Text>
            <View style={styles.actions}>
              {tel ? (
                <TouchableOpacity style={styles.actBtn} onPress={() => openUrl(tel)} activeOpacity={0.75}>
                  <Phone size={16} color={COLORS.WHITE} strokeWidth={2.3} />
                  <Text style={styles.actTxt}>Ara</Text>
                </TouchableOpacity>
              ) : null}
              <HaritaButonu
                lat={item?.LokasyonX}
                lng={item?.LokasyonY}
                label={item?.Adi || 'Eczane'}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )
      }}
    />
    </ScreenPage>
  )
}

const styles = StyleSheet.create({
  backWrap: { paddingHorizontal: 16, paddingTop: 4, backgroundColor: POSTER.BG },
  back: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  updated: { fontFamily: FONTS.bodySemi, fontSize: 11, color: POSTER.TAG, marginTop: 4 },
  list: { padding: 12, paddingBottom: 32, gap: 8, flexGrow: 1 },
  empty: { textAlign: 'center', color: COLORS.TEXT_3, fontFamily: FONTS.body, marginTop: 28, lineHeight: 20, paddingHorizontal: 16 },
  card: {
    backgroundColor: POSTER.PAPER,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: 8,
    ...SHADOW,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: { fontFamily: FONTS.bodyExtra, fontSize: 13, color: COLORS.TEXT_1 },
  bolge: { marginTop: 2, fontFamily: FONTS.bodyBold, fontSize: 10, color: COLORS.PRIMARY },
  addr: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.TEXT_2, lineHeight: 18, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  actBtn: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actTxt: { color: COLORS.WHITE, fontFamily: FONTS.bodyBold, fontSize: 12 },
})
