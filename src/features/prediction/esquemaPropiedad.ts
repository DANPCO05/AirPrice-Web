import { z } from 'zod'
import type { RoomType } from '@/types/api'
import {
  OPCIONES_IDENTIDAD,
  OPCIONES_SUPERHOST,
  SERVICIOS,
  TIPOS_ALOJAMIENTO,
  TIPOS_PROPIEDAD,
  type Opcion,
} from './opciones'

const valores = <T extends string>(opciones: readonly Opcion<T>[]) =>
  opciones.map((o) => o.value) as [T, ...T[]]

// Rangos tomados de GET /api/v1/schema → bounds.
const entero = (min: number, max: number) =>
  z
    .number({ error: 'Escribe un número' })
    .int('Debe ser un número entero')
    .min(min, `Debe ser ${min} o más`)
    .max(max, `Debe ser ${max} o menos`)

const enteroOpcional = (min: number, max: number) => entero(min, max).optional()

export const esquemaPropiedad = z.object({
  property_type: z.enum(valores(TIPOS_PROPIEDAD), { error: 'Elige el tipo de propiedad' }),
  room_type: z.enum(valores(TIPOS_ALOJAMIENTO), { error: 'Elige el tipo de alojamiento' }),
  accommodates: entero(1, 16),
  bedrooms: entero(0, 20),
  beds: entero(0, 30),
  bathrooms_num: z
    .number({ error: 'Escribe un número' })
    .min(0, 'Debe ser 0 o más')
    .max(20, 'Debe ser 20 o menos')
    .multipleOf(0.5, 'Usa saltos de 0,5 (por ejemplo 1,5)'),
  minimum_nights: entero(1, 365),
  availability_365: entero(0, 365),
  amenities: z.array(z.enum(valores(SERVICIOS))),
  // Opcionales: si el anuncio es nuevo se dejan vacíos y la API usa sus valores por defecto.
  number_of_reviews: entero(0, 10000).optional(),
  review_scores_rating: z
    .number({ error: 'Escribe un número' })
    .min(0, 'Debe ser entre 0 y 5')
    .max(5, 'Debe ser entre 0 y 5')
    .optional(),
  host_is_superhost: z.enum(valores(OPCIONES_SUPERHOST)),
  // Opciones avanzadas: mejoran la precisión del modelo si se conocen.
  maximum_nights: enteroOpcional(1, 2000),
  host_listings_count: enteroOpcional(0, 1000),
  calculated_host_listings_count: enteroOpcional(0, 1000),
  availability_30: enteroOpcional(0, 30),
  availability_60: enteroOpcional(0, 60),
  availability_90: enteroOpcional(0, 90),
  number_of_reviews_ltm: enteroOpcional(0, 10000),
  number_of_reviews_l30d: enteroOpcional(0, 10000),
  number_of_reviews_ly: enteroOpcional(0, 10000),
  reviews_per_month: z
    .number({ error: 'Escribe un número' })
    .min(0, 'Debe ser 0 o más')
    .max(100, 'Debe ser 100 o menos')
    .optional(),
  bathrooms_text: z.string().max(120, 'Máximo 120 caracteres').optional(),
  host_identity_verified: z.enum(valores(OPCIONES_IDENTIDAD), {
    error: 'Elige una opción',
  }),
})

export type FormularioPropiedad = z.infer<typeof esquemaPropiedad>

export const VALORES_INICIALES: Partial<FormularioPropiedad> = {
  accommodates: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms_num: 1,
  minimum_nights: 2,
  availability_365: 180,
  amenities: [],
  host_is_superhost: 'UNKNOWN',
  host_identity_verified: 'UNKNOWN',
}

// El tipo de propiedad casi siempre determina el tipo de alojamiento; se sugiere para ahorrar un paso.
export function sugerirTipoAlojamiento(tipoPropiedad: string): RoomType | undefined {
  if (tipoPropiedad.startsWith('Entire')) return 'Entire home/apt'
  if (tipoPropiedad.startsWith('Private room')) return 'Private room'
  if (tipoPropiedad === 'Room in hotel') return 'Hotel room'
  return undefined
}
