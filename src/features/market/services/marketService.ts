import mock from '../data/marketMock.json'
import type { EstadisticasMercado } from '../types'

/** VITE_API_URL es la base de la API; no contiene la ruta /stats. */
export async function obtenerEstadisticas(signal?: AbortSignal): Promise<EstadisticasMercado> {
  const base = import.meta.env.VITE_API_URL?.trim()
  if (!base) return mock as EstadisticasMercado

  try {
    const respuesta = await fetch(`${base.replace(/\/$/, '')}/stats`, { signal })
    if (!respuesta.ok) return mock as EstadisticasMercado
    const datos: unknown = await respuesta.json()
    if (!esEstadisticasMercado(datos))
      throw new Error('La API devolvió un formato de estadísticas no válido.')
    return datos
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    return mock as EstadisticasMercado
  }
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
