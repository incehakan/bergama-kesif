import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg'
import { FONTS, HOME_TAGLINE, POSTER } from '../constants/theme'

function PosterPattern({ width, height }) {
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height} fill={POSTER.BG} />
      <Path
        d={`M0 ${height * 0.72} Q ${width * 0.5} ${height * 0.62} ${width} ${height * 0.74} L ${width} ${height} L 0 ${height} Z`}
        fill={POSTER.BG_DEEP}
        opacity={0.55}
      />
      {[0.12, 0.28, 0.44, 0.6, 0.76, 0.92].map((x) => (
        <Line
          key={x}
          x1={width * x}
          y1={height * 0.08}
          x2={width * x}
          y2={height * 0.88}
          stroke={POSTER.LINE}
          strokeWidth={1}
        />
      ))}
      <Circle cx={width * 0.18} cy={height * 0.22} r={28} stroke={POSTER.LINE} strokeWidth={1} fill="none" />
      <Circle cx={width * 0.82} cy={height * 0.38} r={18} stroke={POSTER.LINE} strokeWidth={1} fill="none" />
      <Path
        d={`M ${width * 0.08} ${height * 0.55} L ${width * 0.22} ${height * 0.55} L ${width * 0.15} ${height * 0.68} Z`}
        stroke={POSTER.LINE}
        strokeWidth={1}
        fill="none"
      />
    </Svg>
  )
}

/**
 * @param {'full'|'strip'} variant — full: ana sayfa posteri; strip: alt ekran başlığı
 */
export default function PosterHero({
  variant = 'full',
  title = 'BERGAMA',
  subtitle,
  tagline = HOME_TAGLINE,
  rightAction,
  children,
}) {
  const isFull = variant === 'full'
  const heroHeight = isFull ? 280 : 120

  return (
    <View style={[styles.wrap, { height: heroHeight }]}>
      <PosterPattern width={400} height={heroHeight} />
      <View style={[styles.content, !isFull && styles.contentStrip]} pointerEvents="box-none">
        {rightAction ? (
          <View style={styles.rightSlot} pointerEvents="box-none">
            {rightAction}
          </View>
        ) : null}
        {subtitle && !isFull ? (
          <Text style={styles.stripTag}>{subtitle}</Text>
        ) : null}
        <Text style={[styles.title, isFull ? styles.titleFull : styles.titleStrip]}>{title}</Text>
        {isFull ? (
          <>
            <View style={styles.rule} />
            <Text style={styles.tagline}>{tagline}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.info}>📍 Bergama, İzmir</Text>
              <Text style={styles.info}>🏛 UNESCO Mirası</Text>
            </View>
          </>
        ) : null}
        {children}
      </View>
      {isFull ? <View style={styles.paperCurve} pointerEvents="none" /> : null}
    </View>
  )
}

export function HamburgerButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.hamBtn} onPress={onPress} activeOpacity={0.75} hitSlop={16}>
      <View style={styles.hamLine} />
      <View style={[styles.hamLine, { marginTop: 5 }]} />
      <View style={[styles.hamLine, { marginTop: 5 }]} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: POSTER.BG,
    position: 'relative',
    overflow: 'visible',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
  },
  contentStrip: {
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  rightSlot: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 10,
  },
  stripTag: {
    fontFamily: FONTS.bodySemi,
    fontSize: 8,
    color: POSTER.TAG,
    letterSpacing: 2.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONTS.display,
    color: '#FFF',
    letterSpacing: 2,
  },
  titleFull: {
    fontSize: 44,
    lineHeight: 48,
  },
  titleStrip: {
    fontSize: 26,
    lineHeight: 30,
  },
  rule: {
    width: 44,
    height: 2,
    backgroundColor: POSTER.LINE,
    marginVertical: 10,
  },
  tagline: {
    fontFamily: FONTS.bodySemi,
    fontSize: 10,
    color: POSTER.INK_SOFT,
    letterSpacing: 3.5,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  info: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
  },
  paperCurve: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -18,
    height: 22,
    backgroundColor: POSTER.PAPER,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  hamBtn: { padding: 8 },
  hamLine: {
    width: 22,
    height: 2,
    backgroundColor: '#FFF',
    borderRadius: 1,
  },
})
