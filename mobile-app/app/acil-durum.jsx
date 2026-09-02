import { Alert, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { Flame, PhoneCall, Shield, ShieldAlert } from 'lucide-react-native'
import { COLORS, SHADOW } from '../constants/theme'

const SERVISLER = [
  {
    ad: 'Acil Çağrı Merkezi',
    numara: '112',
    aciklama: 'Yaşamsal tehlike, sağlık acil durumları',
    renk: COLORS.PRIMARY,
    Icon: PhoneCall,
  },
  {
    ad: 'İtfaiye',
    numara: '110',
    aciklama: 'Yangın, kaza ve acil kurtarma',
    Icon: Flame,
  },
  {
    ad: 'Polis',
    numara: '155',
    aciklama: 'Güvenlik ve asayiş olayları',
    Icon: Shield,
  },
  {
    ad: 'Jandarma',
    numara: '156',
    aciklama: 'Kırsal alan güvenliği',
    Icon: ShieldAlert,
  },
]

const DIGER_SERVISLER = SERVISLER.filter((s) => s.numara !== '112')
const MERKEZ = SERVISLER.find((s) => s.numara === '112')

async function ara(numara) {
  try {
    await Linking.openURL(`tel:${numara}`)
  } catch {
    /* */
  }
}

function onaylaVeAra(ad, numara) {
  Alert.alert(
    ad,
    `${numara} numarasını aramak istediğinize emin misiniz?`,
    [
      { text: 'İptal', style: 'cancel' },
      { text: 'Ara', onPress: () => ara(numara) },
    ]
  )
}

export default function AcilDurumScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.page}>
        <View style={styles.top}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.75} hitSlop={12}>
            <Text style={styles.back}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.topLabel}>YARDIM</Text>
          <Text style={styles.topTitle}>Acil Durum</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroIconWrap}>
              <PhoneCall size={22} color={COLORS.WHITE} strokeWidth={2.4} />
            </View>
            <Text style={styles.heroTitle}>{MERKEZ.ad}</Text>
            <Text style={styles.heroMsg}>Yaşamsal tehlike varsa derhal 112'yi arayın</Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => onaylaVeAra(MERKEZ.ad, MERKEZ.numara)}
              activeOpacity={0.8}
            >
              <Text style={styles.heroBtnTxt}>112 - Ara</Text>
            </TouchableOpacity>
          </LinearGradient>

          <Text style={styles.section}>Diğer acil hatlar</Text>
          <View style={styles.grid}>
            {DIGER_SERVISLER.map((s) => {
              const Icon = s.Icon
              return (
                <TouchableOpacity
                  key={s.numara}
                  style={styles.card}
                  onPress={() => onaylaVeAra(s.ad, s.numara)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardIcon}>
                    <Icon size={20} color={COLORS.PRIMARY} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.cardAd}>{s.ad}</Text>
                  <Text style={styles.cardNo}>{s.numara}</Text>
                  <Text style={styles.cardDesc}>{s.aciklama}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.PRIMARY },
  page: { flex: 1, backgroundColor: COLORS.BG },
  top: { backgroundColor: COLORS.DARK, padding: 16, paddingBottom: 16 },
  back: { color: COLORS.WHITE, fontWeight: '700', fontSize: 14, marginBottom: 10 },
  topLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 2,
  },
  topTitle: { fontSize: 24, fontWeight: '800', color: COLORS.WHITE },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 32 },
  hero: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    ...SHADOW,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: { fontSize: 16, fontWeight: '800', color: COLORS.WHITE, marginBottom: 6 },
  heroMsg: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroBtn: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  heroBtnTxt: { color: COLORS.PRIMARY, fontWeight: '800', fontSize: 16 },
  section: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.TEXT_2,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '48.5%',
    maxWidth: '48.5%',
    flexGrow: 0,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    ...SHADOW,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.PRIMARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardAd: { fontSize: 12, fontWeight: '800', color: COLORS.TEXT_1, marginBottom: 4 },
  cardNo: { fontSize: 20, fontWeight: '800', color: COLORS.PRIMARY, marginBottom: 6 },
  cardDesc: { fontSize: 10, color: COLORS.TEXT_3, lineHeight: 15 },
})
