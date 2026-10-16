import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      <nav style={{ display: 'flex', gap: 16, padding: 16, background: 'var(--navy)' }}>
        <NavLink to="/" style={{ color: 'white' }}>
          Inicio
        </NavLink>
        <NavLink to="/ubicacion" style={{ color: 'white' }}>
          Predecir
        </NavLink>
        <NavLink to="/mercado" style={{ color: 'white' }}>
          Mercado
        </NavLink>
      </nav>
      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </>
  )
}
