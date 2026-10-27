import { createContext, useContext } from 'react'
import type { ListingInput } from '@/types/api'

// Lo que se llena en /ubicacion.
export type DatosUbicacion = Pick<ListingInput, 'latitude' | 'longitude' | 'neighbourhood_cleansed'>

// Lo que se llena en /propiedad.
export type DatosPropiedad = Omit<ListingInput, keyof DatosUbicacion>

export interface PrediccionContextValue {
  ubicacion: DatosUbicacion | null
  propiedad: DatosPropiedad | null
  // Cuerpo listo para POST /api/v1/predict, o null si falta algún paso.
  solicitud: ListingInput | null
  guardarUbicacion: (datos: DatosUbicacion) => void
  guardarPropiedad: (datos: DatosPropiedad) => void
  reiniciar: () => void
}

export const PrediccionContext = createContext<PrediccionContextValue | null>(null)

// Uso: const { solicitud, guardarPropiedad } = usePrediccion()
export function usePrediccion(): PrediccionContextValue {
  const contexto = useContext(PrediccionContext)
  if (!contexto) {
    throw new Error('usePrediccion debe usarse dentro de <PrediccionProvider>')
  }
  return contexto
}
