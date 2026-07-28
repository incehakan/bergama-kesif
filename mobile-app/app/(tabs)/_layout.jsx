import { Tabs } from 'expo-router'
import {
  Home,
  BookOpen,
  MapPin,
  UtensilsCrossed,
  Newspaper,
  Landmark,
} from 'lucide-react-native'
import { Platform } from 'react-native'
import { COLORS } from '../../constants/theme'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: '#CCCCCC',
        tabBarStyle: {
          backgroundColor: COLORS.WHITE,
          borderTopColor: COLORS.BORDER,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 62,
          paddingBottom: Platform.OS === 'ios' ? 26 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tarihce"
        options={{
          title: 'Tarihçe',
          tabBarIcon: ({ color }) => <BookOpen size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rotalar"
        options={{
          title: 'Rotalar',
          tabBarIcon: ({ color }) => <MapPin size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rehber"
        options={{
          title: 'Rehber',
          tabBarIcon: ({ color }) => <UtensilsCrossed size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="haberler"
        options={{
          title: 'Haberler',
          tabBarIcon: ({ color }) => <Newspaper size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="eserler"
        options={{
          title: 'Eserler',
          tabBarIcon: ({ color }) => <Landmark size={22} color={color} />,
        }}
      />
    </Tabs>
  )
}
