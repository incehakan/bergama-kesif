import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { COLORS, SHADOW } from '../constants/theme'

export default function ContentCard({
  title,
  subtitle,
  meta,
  imageUri,
  onPress,
  compact = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.compact,
        pressed && { opacity: 0.75 },
      ]}
      accessibilityRole="button"
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={[styles.thumb, compact && styles.thumbSm]} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, compact && styles.thumbSm]} />
      )}
      <View style={styles.body}>
        {title ? (
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.sub} numberOfLines={compact ? 2 : 3}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    ...SHADOW,
  },
  compact: {
    marginBottom: 8,
  },
  thumb: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.BORDER,
  },
  thumbSm: {
    width: 72,
    height: 72,
  },
  thumbPlaceholder: {
    backgroundColor: COLORS.CREAM,
  },
  body: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT_1,
  },
  sub: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.TEXT_2,
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.TEXT_3,
  },
})
