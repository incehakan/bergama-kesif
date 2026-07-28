import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import { COLORS } from '../constants/theme'

export default function LoadingSpinner({ message = 'Yükleniyor…' }) {
  return (
    <View style={styles.wrap} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      {message ? <Text style={styles.text}>{message}</Text> : null}
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
  text: {
    fontSize: 15,
    color: COLORS.TEXT_2,
  },
})
