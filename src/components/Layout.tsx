import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

export default function Layout() {
  const { pathname } = useLocation()

  // Cada página empieza arriba (sin esto se conserva el scroll de la página anterior).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

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
