import { ImageBackground, Text, StyleSheet, View, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '../constants/theme'

export default function HeroCard({ title, subtitle, imageUri, height = 220, children, onPress }) {
  const Wrapper = onPress ? Pressable : View
  const inner = (
    <>
      <View style={styles.overlay} />
      <View style={styles.content}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        {children}
      </View>
    </>
  )

  if (imageUri) {
    return (
      <Wrapper
        style={[styles.card, { height }]}
        onPress={onPress}
        accessibilityRole={onPress ? 'button' : undefined}
      >
        <ImageBackground source={{ uri: imageUri }} style={styles.bg} imageStyle={styles.img}>
          {inner}
        </ImageBackground>
      </Wrapper>
    )
  }

  return (
    <Wrapper
      style={[styles.card, { height }]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <LinearGradient
        colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.gradientInner}>{inner}</View>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  gradientInner: { flex: 1, justifyContent: 'flex-end' },
  bg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  img: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    padding: 20,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 26,
    fontWeight: '800',
  },
  sub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    marginTop: 6,
  },
})
