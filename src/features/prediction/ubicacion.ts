import { BARRIOS, LIMITES_LONDRES } from './opciones'

type BarrioDataset = (typeof BARRIOS)[number]

export interface Punto {
  lat: number
  lng: number
}

export function estaEnLondres({ lat, lng }: Punto): boolean {
  const { latMin, latMax, lngMin, lngMax } = LIMITES_LONDRES
  return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax
}

// Barrio cuyo centro está más cerca del punto. Es una sugerencia: cerca de los límites
// entre barrios puede fallar, por eso el usuario siempre puede cambiarlo.
export function barrioMasCercano({ lat, lng }: Punto): BarrioDataset {
  // A la latitud de Londres, un grado de longitud mide ~0,62 veces un grado de latitud.
  const escalaLng = Math.cos((lat * Math.PI) / 180)
  let mejor: BarrioDataset = BARRIOS[0]
  let mejorDistancia = Infinity
  for (const barrio of BARRIOS) {
    const distancia = (barrio.lat - lat) ** 2 + ((barrio.lng - lng) * escalaLng) ** 2
    if (distancia < mejorDistancia) {
      mejor = barrio
      mejorDistancia = distancia
    }
  }
  return mejor
}
