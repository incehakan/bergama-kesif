import { CameraView, useCameraPermissions } from 'expo-camera'
import { useState, useRef } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { getEserByQR } from '../lib/api'
import { COLORS } from '../constants/theme'

const FRAME = 240
const L = 20
const T = 2

function CornerScanner() {
  const bar = { position: 'absolute', backgroundColor: COLORS.WHITE }
  return (
    <View style={{ width: FRAME, height: FRAME, position: 'relative' }}>
      <View style={[bar, { top: 0, left: 0, width: L, height: T }]} />
      <View style={[bar, { top: 0, left: 0, width: T, height: L }]} />
      <View style={[bar, { top: 0, right: 0, width: L, height: T }]} />
      <View style={[bar, { top: 0, right: 0, width: T, height: L }]} />
      <View style={[bar, { bottom: 0, left: 0, width: L, height: T }]} />
      <View style={[bar, { bottom: 0, left: 0, width: T, height: L }]} />
      <View style={[bar, { bottom: 0, right: 0, width: L, height: T }]} />
      <View style={[bar, { bottom: 0, right: 0, width: T, height: L }]} />
    </View>
  )
}

export default function QRScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanning, setScanning] = useState(true)
  const lastScan = useRef(0)

  const chrome = (body) => (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>{body}</View>
    </SafeAreaView>
  )

  if (!permission) {
    return chrome(
      <View style={styles.center}>
        <Text style={styles.muted}>Kamera izni kontrol ediliyor...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return chrome(
      <View style={styles.center}>
        <Text style={styles.muted}>Kamera erişimi gerekiyor</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission} activeOpacity={0.75}>
          <Text style={styles.permBtnTxt}>İzin Ver</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const handleBarCodeScanned = async ({ data }) => {
    const now = Date.now()
    if (!scanning || now - lastScan.current < 2000) return
    lastScan.current = now
    setScanning(false)
    try {
      const parts = data.split('/')
      const qrKodu = parts[parts.length - 1]
      const eser = await getEserByQR(qrKodu)
      if (eser && eser.id) {
        router.replace({
          pathname: '/eser/[id]',
          params: { id: eser.id, eserData: JSON.stringify(eser) },
        })
      } else {
        Alert.alert('Hata', 'Bu QR kod tanınamadı')
        setTimeout(() => setScanning(true), 2000)
      }
    } catch {
      Alert.alert('Hata', 'Bu QR kod tanınamadı')
      setTimeout(() => setScanning(true), 2000)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarCodeScanned}
        />
        <SafeAreaView style={styles.overlay} edges={['bottom']} pointerEvents="box-none">
          <View style={styles.topBand}>
            <Text style={styles.topTitle}>QR Kod Tara</Text>
          </View>
          <View style={styles.centerBox}>
            <CornerScanner />
          </View>
          <View style={styles.bottomBand}>
            <Text style={styles.bottomTxt}>Eserin yanındaki QR kodu kameranıza gösterin</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} activeOpacity={0.75}>
            <Text style={styles.closeTxt}>Kapat</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: COLORS.DARK,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  muted: { color: COLORS.WHITE, fontSize: 16, marginBottom: 16, textAlign: 'center' },
  permBtn: { backgroundColor: COLORS.WHITE, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  permBtnTxt: { color: COLORS.TEXT_1, fontWeight: '800', fontSize: 16 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topBand: {
    backgroundColor: 'rgba(44,44,44,0.85)',
    padding: 16,
    alignItems: 'center',
  },
  topTitle: { color: COLORS.WHITE, fontWeight: '800', fontSize: 16 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bottomBand: {
    backgroundColor: 'rgba(44,44,44,0.85)',
    padding: 14,
  },
  bottomTxt: { color: COLORS.WHITE, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  closeBtn: {
    alignSelf: 'center',
    marginBottom: Platform.OS === 'ios' ? 20 : 14,
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  closeTxt: { color: COLORS.TEXT_1, fontWeight: '800', fontSize: 15 },
})
