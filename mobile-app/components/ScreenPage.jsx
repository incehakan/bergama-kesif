import { View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { POSTER } from '../constants/theme'

/**
 * Ortak sayfa kabuğu — poster arka plan + kağıt içerik alanı
 */
export default function ScreenPage({ children, edges = ['top'], paper = true, style }) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.page, paper && styles.paper, style]}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: POSTER.BG,
  },
  page: {
    flex: 1,
    backgroundColor: POSTER.BG,
  },
  paper: {
    backgroundColor: POSTER.PAPER,
  },
})
