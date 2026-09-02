import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { TOKEN_KEY } from './lib/api.js'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tarihce from './pages/Tarihce.jsx'
import Baskan from './pages/Baskan.jsx'
import Iletisim from './pages/Iletisim.jsx'
import YemeIcme from './pages/YemeIcme.jsx'
import Rotalar from './pages/Rotalar.jsx'
import Etkinlikler from './pages/Etkinlikler.jsx'
import Haberler from './pages/Haberler.jsx'
import TarihiEserler from './pages/TarihiEserler.jsx'
import VRIcerikler from './pages/VRIcerikler.jsx'

function HomeRedirect() {
  const token = localStorage.getItem(TOKEN_KEY)
  return <Navigate to={token ? '/dashboard' : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tarihce" element={<Tarihce />} />
            <Route path="/baskan" element={<Baskan />} />
            <Route path="/iletisim" element={<Iletisim />} />
            <Route path="/yeme-icme" element={<YemeIcme />} />
            <Route path="/rotalar" element={<Rotalar />} />
            <Route path="/etkinlikler" element={<Etkinlikler />} />
            <Route path="/haberler" element={<Haberler />} />
            <Route path="/eserler" element={<TarihiEserler />} />
            <Route path="/vr" element={<VRIcerikler />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
