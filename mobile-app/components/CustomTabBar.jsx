import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Home,
  BookOpen,
  MapPin,
  Map,
  UtensilsCrossed,
  Newspaper,
  Landmark,
} from 'lucide-react-native'
import { COLORS, FONTS, POSTER, SHADOW, SHADOW_LG } from '../constants/theme'

const TABS = [
  { name: 'tarihce', label: 'Tarihçe', Icon: BookOpen },
  { name: 'rotalar', label: 'Rotalar', Icon: MapPin },
  { name: 'harita', label: 'Harita', Icon: Map },
  { name: 'index', label: 'Ana Sayfa', Icon: Home, center: true },
  { name: 'rehber', label: 'Rehber', Icon: UtensilsCrossed },
  { name: 'haberler', label: 'Haberler', Icon: Newspaper },
  { name: 'eserler', label: 'Eserler', Icon: Landmark },
]

export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets()
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 4)

  return (
    <View style={[styles.bar, { paddingBottom: bottomPad }]}>
      <View style={styles.row}>
        {TABS.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name)
          if (routeIndex < 0) return null

          const route = state.routes[routeIndex]
          const { options } = descriptors[route.key]
          const focused = state.index === routeIndex
          const color = focused ? COLORS.PRIMARY : '#B8B0A8'
          const Icon = tab.Icon

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          if (tab.center) {
            return (
              <TouchableOpacity
                key={tab.name}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel || tab.label}
                onPress={onPress}
                style={styles.centerWrap}
                activeOpacity={0.85}
              >
                <View style={[styles.centerBtn, focused && styles.centerBtnOn]}>
                  <Icon size={26} color={COLORS.WHITE} strokeWidth={2.2} />
                </View>
                <Text style={[styles.centerLabel, focused && styles.labelOn]}>{tab.label}</Text>
              </TouchableOpacity>
            )
          }

          return (
            <TouchableOpacity
              key={tab.name}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || tab.label}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.75}
            >
              <Icon size={20} color={color} strokeWidth={focused ? 2.4 : 2} />
              <Text style={[styles.label, focused && styles.labelOn, { color }]} numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: POSTER.PAPER,
    borderTopWidth: 1,
    borderTopColor: POSTER.PAPER_EDGE,
    paddingTop: 6,
    ...SHADOW,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 4,
    minHeight: 46,
  },
  label: {
    fontFamily: FONTS.bodySemi,
    fontSize: 8,
    marginTop: 3,
    color: '#B8B0A8',
  },
  labelOn: {
    color: COLORS.PRIMARY,
    fontFamily: FONTS.bodyBold,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    marginTop: -22,
  },
  centerBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: POSTER.BG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: POSTER.PAPER,
    ...SHADOW_LG,
  },
  centerBtnOn: {
    backgroundColor: COLORS.PRIMARY,
  },
  centerLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 8,
    marginTop: 4,
    color: '#B8B0A8',
  },
})
