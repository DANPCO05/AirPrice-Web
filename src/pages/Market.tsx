import { useEffect, useMemo, useState } from 'react'
import MarketStats from '@/features/market/components/MarketStats'
import ClassChart from '@/features/market/components/ClassChart'
import NeighborhoodChart from '@/features/market/components/NeighborhoodChart'
import MarketMap from '@/features/market/components/MarketMap'
import MarketFilters from '@/features/market/components/MarketFilters'
import { obtenerEstadisticas } from '@/features/market/services/marketService'
import type { EstadisticasMercado } from '@/features/market/types'
import styles from './Market.module.css'

export default function Market() {
  const [datos, setDatos] = useState<EstadisticasMercado | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [barrio, setBarrio] = useState('')

  useEffect(() => {
    const controlador = new AbortController()
    obtenerEstadisticas(controlador.signal)
      .then(setDatos)
      .catch((e: unknown) => {
        if (!controlador.signal.aborted)
          setError(e instanceof Error ? e.message : 'Error al cargar las estadísticas.')
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false)
      })
    return () => controlador.abort()
  }, [])

  const barrios = useMemo(
    () => [...new Set(datos?.listings.map((p) => p.neighbourhood) ?? [])].sort(),
    [datos],
  )
  const puntos = useMemo(
    () => (datos?.listings ?? []).filter((p) => !barrio || p.neighbourhood === barrio),
    [datos, barrio],
  )
  const datosFiltrados = useMemo((): EstadisticasMercado | null => {
    if (!datos) return null
    if (!barrio) return datos

    const precios = puntos.map((punto) => punto.price)
    const classes = ['ECONOMICO', 'MEDIO', 'ALTO', 'PREMIUM'] as const
    const by_class = classes.map((clase) => ({
      clase,
      count: puntos.filter((punto) => punto.clase === clase).length,
    }))
    const preciosBarrio = puntos.map((punto) => punto.price)

    return {
      ...datos,
      total_listings: puntos.length,
      average_price: preciosBarrio.length
        ? preciosBarrio.reduce((suma, precio) => suma + precio, 0) / preciosBarrio.length
        : null,
      by_class,
      by_neighbourhood: puntos.length
        ? [
            {
              neighbourhood: barrio,
              count: puntos.length,
              average_price: precios.reduce((suma, precio) => suma + precio, 0) / precios.length,
            },
          ]
        : [],
    }
  }, [datos, barrio, puntos])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Mercado de alojamientos</h1>
          <p>Explora los precios de Airbnb en Londres por clase y barrio.</p>
        </div>
      </header>
      {cargando && <p role="status">Cargando estadísticas del mercado…</p>}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {datosFiltrados && (
        <>
          {datosFiltrados.total_listings === 0 && (
            <p className={styles.notice}>
              Dashboard preparado. Todavía no hay estadísticas cargadas: configura VITE_API_URL o
              genera el JSON con los datos limpios de AirPrice.
            </p>
          )}
          <MarketStats data={datosFiltrados} />
          <div className={styles.charts}>
            <ClassChart data={datosFiltrados.by_class} />
            <NeighborhoodChart data={datosFiltrados.by_neighbourhood} />
          </div>
          <MarketFilters barrios={barrios} barrio={barrio} onBarrioChange={setBarrio} />
          <MarketMap listings={puntos} />
        </>
      )}
    </div>
  )
}
