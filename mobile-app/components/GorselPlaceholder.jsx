import { View, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '../constants/theme'

function calcIconSize(size) {
  const raw = Math.round(size * 0.22)
  return Math.min(56, Math.max(20, raw))
}

export default function GorselPlaceholder({ icon: Icon, size = 160, iconSize, style }) {
  const resolvedIconSize = iconSize ?? calcIconSize(size)

  return (
    <View style={[{ width: '100%', height: size, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={[COLORS.BORDER, COLORS.CREAM]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.center}>
        <Icon size={resolvedIconSize} color={COLORS.TEXT_3} strokeWidth={1.6} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
