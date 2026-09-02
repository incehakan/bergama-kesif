import { Alert, Linking, Platform } from 'react-native'

function toCoords(lat, lng) {
  const la = Number(lat)
  const ln = Number(lng)
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null
  return { lat: la, lng: ln }
}

function buildUrls({ lat, lng, label }) {
  const coords = toCoords(lat, lng)
  const q = encodeURIComponent(label || 'Bergama')

  if (coords) {
    return {
      appleUrl: `https://maps.apple.com/?daddr=${coords.lat},${coords.lng}&dirflg=d`,
      googleUrl: `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
    }
  }

  return {
    appleUrl: `https://maps.apple.com/?q=${q}`,
    googleUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
  }
}

export async function haritaUygulamasindaAc({ lat, lng, label }) {
  const safeLabel = label && String(label).trim() ? `${String(label).trim()} Bergama` : 'Bergama'
  const { appleUrl, googleUrl } = buildUrls({ lat, lng, label: safeLabel })

  try {
    if (Platform.OS === 'ios') {
      Alert.alert('Haritada Aç', 'Hangi uygulamayla açmak istersiniz?', [
        { text: 'Apple Haritalar', onPress: () => Linking.openURL(appleUrl).catch(() => {}) },
        { text: 'Google Haritalar', onPress: () => Linking.openURL(googleUrl).catch(() => {}) },
        { text: 'İptal', style: 'cancel' },
      ])
      return
    }

    await Linking.openURL(googleUrl)
  } catch {
    /* */
  }
}
