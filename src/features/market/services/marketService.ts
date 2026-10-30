import mock from '../data/marketMock.json'
import type { EstadisticasMercado } from '../types'

export interface ResultadoMercado {
  datos: EstadisticasMercado
  origen: 'api' | 'mock'
}

/**
 * Intenta el endpoint nuevo (/api/v1/market/stats) y el antiguo (/stats).
 * Si ninguno existe, devuelve el mock y lo marca como datos de muestra.
 */
export async function obtenerEstadisticas(signal?: AbortSignal): Promise<ResultadoMercado> {
  const base = import.meta.env.VITE_API_URL?.trim()
  if (!base) return { datos: mock as EstadisticasMercado, origen: 'mock' }

  const raiz = base.replace(/\/$/, '')
  const rutas = [`${raiz}/api/v1/market/stats`, `${raiz}/stats`]

  for (const url of rutas) {
    try {
      const respuesta = await fetch(url, { signal })
      if (respuesta.status === 404) continue
      if (!respuesta.ok) break
      const datos: unknown = await respuesta.json()
      if (!esEstadisticasMercado(datos))
        throw new Error('Las estadísticas de mercado no tienen un formato válido.')
      return { datos, origen: 'api' }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      break
    }
  }

  return { datos: mock as EstadisticasMercado, origen: 'mock' }
}

function esRegistro(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function esEstadisticasMercado(x: unknown): x is EstadisticasMercado {
  if (!esRegistro(x)) return false
  return (
    typeof x.total_listings === 'number' &&
    Number.isFinite(x.total_listings) &&
    x.total_listings >= 0 &&
    (x.average_price === null ||
      (typeof x.average_price === 'number' && Number.isFinite(x.average_price))) &&
    x.currency === 'GBP' &&
    Array.isArray(x.by_class) &&
    Array.isArray(x.by_neighbourhood) &&
    Array.isArray(x.listings) &&
    x.by_class.every(
      (v: unknown) =>
        esRegistro(v) &&
        ['ECONOMICO', 'MEDIO', 'ALTO', 'PREMIUM'].includes(String(v.clase)) &&
        typeof v.count === 'number' &&
        Number.isFinite(v.count) &&
        v.count >= 0,
    ) &&
    x.by_neighbourhood.every(
      (v: unknown) =>
        esRegistro(v) &&
        typeof v.neighbourhood === 'string' &&
        typeof v.count === 'number' &&
        Number.isFinite(v.count) &&
        v.count >= 0 &&
        typeof v.average_price === 'number' &&
        Number.isFinite(v.average_price),
    ) &&
    x.listings.every(
      (v: unknown) =>
        esRegistro(v) &&
        (typeof v.id === 'number' || typeof v.id === 'string') &&
        typeof v.latitude === 'number' &&
        Number.isFinite(v.latitude) &&
        Math.abs(v.latitude) <= 90 &&
        typeof v.longitude === 'number' &&
        Number.isFinite(v.longitude) &&
        Math.abs(v.longitude) <= 180 &&
        typeof v.price === 'number' &&
        Number.isFinite(v.price) &&
        typeof v.neighbourhood === 'string' &&
        typeof v.room_type === 'string',
    )
  )
}
