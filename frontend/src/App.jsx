import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ObraDetallePage from './pages/ObraDetallePage'
import AdminObrasPage from './pages/AdminObrasPage'
import InventarioPage from './pages/InventarioPage'
import GestionUsuariosPage from './pages/GestionUsuariosPage'

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div style={{ padding: '15px 20px' }}>
        <Routes>
          {/* Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/obras/:id" element={<ObraDetallePage />} />

          {/* Admin obras: ADMIN_TI y ADMIN_ACADEMICO */}
          <Route path="/admin/obras" element={
            <ProtectedRoute roles={['ADMIN_TI', 'ADMIN_ACADEMICO']}>
              <AdminObrasPage />
            </ProtectedRoute>
          } />

          {/* Gestión usuarios: solo ADMIN_TI */}
          <Route path="/admin/usuarios" element={
            <ProtectedRoute roles={['ADMIN_TI']}>
              <GestionUsuariosPage />
            </ProtectedRoute>
          } />

          {/* Inventario: GESTOR_INVENTARIO y ADMIN_TI */}
          <Route path="/inventario" element={
            <ProtectedRoute roles={['GESTOR_INVENTARIO', 'ADMIN_TI']}>
              <InventarioPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}