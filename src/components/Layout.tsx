import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import styles from './Layout.module.css'

const enlaces = [
  { ruta: '/', texto: 'Inicio', exacto: true },
  { ruta: '/ubicacion', texto: 'Clasificar' },
  { ruta: '/lote', texto: 'Lote' },
  { ruta: '/mercado', texto: 'Mercado' },
  { ruta: '/modelo', texto: 'Modelo' },
  { ruta: '/datos', texto: 'Datos' },
]

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <header className={styles.header}>
        <div className={styles.contenedor}>
          <NavLink to="/" className={styles.marca}>
            <span className={styles.logo} aria-hidden="true">
              ⌂
            </span>
            <span>AirPrice</span>
          </NavLink>

          <a
            className={styles.github}
            href="https://github.com/DANPCO05/AirPrice-Web"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>

          <nav className={styles.nav} aria-label="Navegación principal">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.ruta}
                to={enlace.ruta}
                end={enlace.exacto}
                className={({ isActive }) => `${styles.enlace} ${isActive ? styles.activo : ''}`}
              >
                {enlace.texto}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  )
}
