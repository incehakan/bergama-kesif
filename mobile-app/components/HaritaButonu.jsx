import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Map } from 'lucide-react-native'
import { haritaUygulamasindaAc } from '../lib/haritaAc'
import { COLORS } from '../constants/theme'

export default function HaritaButonu({ lat, lng, label, style }) {
  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={() => haritaUygulamasindaAc({ lat, lng, label })}
      activeOpacity={0.75}
    >
      <Map size={20} color={COLORS.WHITE} />
      <Text style={styles.txt}>Harita</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.DARK,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  txt: { color: COLORS.WHITE, fontWeight: '800', fontSize: 12 },
})
