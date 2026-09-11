import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { COLORS, FONTS, POSTER, RADIUS, SHADOW } from '../constants/theme'

/**
 * Liste satırı kartı — yatay düzen (thumbnail + içerik + ok)
 */
export default function ListCard({
  onPress,
  thumbnail,
  title,
  subtitle,
  badge,
  meta,
  showArrow = true,
  style,
}) {
  const inner = (
    <>
      {thumbnail ? <View style={styles.thumbWrap}>{thumbnail}</View> : null}
      <View style={styles.mid}>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{badge}</Text>
          </View>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.sub} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {showArrow ? (
        <View style={styles.arrow}>
          <ChevronRight size={18} color={COLORS.PRIMARY} strokeWidth={2.5} />
        </View>
      ) : null}
    </>
  )

  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.75}>
        {inner}
      </TouchableOpacity>
    )
  }

  return <View style={[styles.card, style]}>{inner}</View>
}

/** Dikey / tam genişlik kart (haber, rota vb.) */
export function BlockCard({ onPress, children, style, accent }) {
  const Wrapper = onPress ? TouchableOpacity : View
  return (
    <Wrapper
      style={[styles.block, accent && styles.blockAccent, style]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {children}
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: POSTER.PAPER,
    borderRadius: RADIUS.md,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: POSTER.PAPER_EDGE,
    marginBottom: 8,
    ...SHADOW,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: COLORS.BORDER,
  },
  mid: { flex: 1, minWidth: 0 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.PRIMARY_BG,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  badgeTxt: {
    fontFamily: FONTS.bodyExtra,
    fontSize: 7,
    color: COLORS.PRIMARY,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FONTS.bodyExtra,
    fontSize: 13,
    color: COLORS.TEXT_1,
    lineHeight: 18,
  },
  sub: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.TEXT_3,
    marginTop: 3,
    lineHeight: 14,
  },
  meta: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: COLORS.PRIMARY,
    marginTop: 4,
  },
  arrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  block: {
    backgroundColor: POSTER.PAPER,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: POSTER.PAPER_EDGE,
    marginBottom: 10,
    ...SHADOW,
  },
  blockAccent: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
  },
})
