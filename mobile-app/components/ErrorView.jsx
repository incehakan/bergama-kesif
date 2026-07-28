import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS } from '../constants/theme'

export default function ErrorView({ message, onRetry }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Bir sorun oluştu</Text>
      <Text style={styles.msg}>
        {message || 'Veri yüklenemedi, tekrar deneyin.'}
      </Text>
      {onRetry ? (
        <TouchableOpacity style={styles.btn} onPress={onRetry} activeOpacity={0.75}>
          <Text style={styles.btnText}>Yenile</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: COLORS.BG,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.TEXT_1,
  },
  msg: {
    fontSize: 15,
    color: '#C0392B',
    textAlign: 'center',
  },
  btn: {
    marginTop: 8,
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 16,
  },
})
