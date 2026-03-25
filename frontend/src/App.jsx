import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ObraDetallePage from './pages/ObraDetallePage'
import AdminObrasPage from './pages/AdminObrasPage'
import InventarioPage from './pages/InventarioPage'

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div style={{ padding: '1.5rem 2rem' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/obras/:id" element={<ObraDetallePage />} />

          <Route path="/admin/obras" element={
            <ProtectedRoute roles={['ADMIN_TI', 'ADMIN_ACADEMICO']}>
              <AdminObrasPage />
            </ProtectedRoute>
          } />

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