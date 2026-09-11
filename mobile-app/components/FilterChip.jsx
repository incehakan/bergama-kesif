import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { COLORS, FONTS, POSTER, RADIUS } from '../constants/theme'

export default function FilterChip({ items, value, onChange, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, style]}
    >
      {items.map((item) => {
        const active = value === item.value
        return (
          <TouchableOpacity
            key={item.label}
            onPress={() => onChange(item.value)}
            style={[styles.chip, active && styles.chipOn]}
            activeOpacity={0.75}
          >
            <Text style={[styles.txt, active && styles.txtOn]}>{item.label}</Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

/** Poster arka plan üzerinde yarı saydam chip (rehber, harita) */
export function FilterChipPoster({ items, value, onChange, style }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.posterRow, style]}
    >
      {items.map((item) => {
        const active = value === item.value
        return (
          <TouchableOpacity
            key={item.label}
            onPress={() => onChange(item.value)}
            style={[styles.posterChip, active && styles.posterChipOn]}
            activeOpacity={0.75}
          >
            <Text style={[styles.posterTxt, active && styles.posterTxtOn]}>{item.label}</Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

export function FilterChipDarkWrap({ children }) {
  return <View style={styles.darkWrap}>{children}</View>
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: POSTER.PAPER_EDGE,
    backgroundColor: POSTER.PAPER,
  },
  chipOn: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  txt: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: COLORS.TEXT_2,
  },
  txtOn: {
    color: COLORS.WHITE,
  },
  darkWrap: {
    backgroundColor: POSTER.BG,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  posterRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingRight: 8,
  },
  posterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: POSTER.LINE,
  },
  posterChipOn: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  posterTxt: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: POSTER.TAG,
  },
  posterTxtOn: {
    color: COLORS.WHITE,
  },
})
