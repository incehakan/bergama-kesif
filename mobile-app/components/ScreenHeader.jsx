import { View, Text, StyleSheet } from 'react-native'
import PosterHero from './PosterHero'
import { FONTS, POSTER } from '../constants/theme'

/**
 * Alt ekranlar için poster şerit başlık
 */
export default function ScreenHeader({ title, subtitle, rightAction, children }) {
  return (
    <View style={styles.wrap}>
      <PosterHero
        variant="strip"
        title={title}
        subtitle={subtitle}
        rightAction={rightAction}
      />
      {children ? <View style={styles.extra}>{children}</View> : null}
    </View>
  )
}

export function SectionLabel({ children, style }) {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: POSTER.BG,
    overflow: 'hidden',
  },
  extra: {
    backgroundColor: POSTER.BG,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionLabel: {
    fontFamily: FONTS.bodySemi,
    fontSize: 8,
    color: POSTER.TAG,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
})
