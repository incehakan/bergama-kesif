import { Tabs } from 'expo-router'
import CustomTabBar from '../../components/CustomTabBar'

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Ana Sayfa' }} />
      <Tabs.Screen name="tarihce" options={{ title: 'Tarihçe' }} />
      <Tabs.Screen name="rotalar" options={{ title: 'Rotalar' }} />
      <Tabs.Screen name="harita" options={{ title: 'Harita' }} />
      <Tabs.Screen name="rehber" options={{ title: 'Rehber' }} />
      <Tabs.Screen name="haberler" options={{ title: 'Haberler' }} />
      <Tabs.Screen name="eserler" options={{ title: 'Eserler' }} />
    </Tabs>
  )
}
