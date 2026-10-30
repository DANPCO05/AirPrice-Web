import type { Flag, ListingInput, RoomType } from '@/types/api'
import { BARRIOS, TIPOS_ALOJAMIENTO, TIPOS_PROPIEDAD } from './opciones'
import { numeroDesdeTexto } from '@/lib/csv'

const LIMITES = {
  latMin: 51.2,
  latMax: 51.7,
  lngMin: -0.6,
  lngMax: 0.3,
}

export const CABECERAS_OBLIGATORIAS = [
  'room_type',
  'property_type',
  'neighbourhood_cleansed',
  'latitude',
  'longitude',
  'accommodates',
] as const

export interface FilaLote {
  indice: number
  original: Record<string, string>
  datos?: ListingInput
  errores: string[]
}

function valor(fila: Record<string, string>, ...nombres: string[]): string {
  for (const nombre of nombres) {
    const encontrado = fila[nombre]
    if (encontrado !== undefined && encontrado.trim() !== '') return encontrado.trim()
  }
  return ''
}

function opcionalNumero(
  fila: Record<string, string>,
  campo: string,
  etiqueta: string,
  min: number,
  max: number,
  errores: string[],
  entero = true,
): number | undefined {
  const crudo = fila[campo]?.trim()
  if (!crudo) return undefined
  const numero = numeroDesdeTexto(crudo)
  if (numero === undefined) {
    errores.push(`${etiqueta} no es un número válido`)
    return undefined
  }
  if (entero && !Number.isInteger(numero)) {
    errores.push(`${etiqueta} debe ser un número entero`)
    return undefined
  }
  if (numero < min || numero > max) {
    errores.push(`${etiqueta} debe estar entre ${min} y ${max}`)
    return undefined
  }
  return numero
}

function bandera(crudo: string, etiqueta: string, errores: string[]): Flag {
  const texto = crudo.trim().toLowerCase()
  if (!texto || texto === 'unknown' || texto === 'no lo sé' || texto === 'no lo se')
    return 'UNKNOWN'
  if (['t', 'true', '1', 'sí', 'si', 'yes'].includes(texto)) return 't'
  if (['f', 'false', '0', 'no'].includes(texto)) return 'f'
  errores.push(`${etiqueta} debe ser t, f o UNKNOWN`)
  return 'UNKNOWN'
}

export function validarLote(filas: Record<string, string>[]): FilaLote[] {
  return filas.map((original, indice) => {
    const errores: string[] = []

    const roomType = valor(original, 'room_type')
    const propertyType = valor(original, 'property_type')
    const barrio = valor(original, 'neighbourhood_cleansed', 'neighbourhood')
    const latitude = numeroDesdeTexto(valor(original, 'latitude'))
    const longitude = numeroDesdeTexto(valor(original, 'longitude'))
    const accommodates = numeroDesdeTexto(valor(original, 'accommodates'))

    if (!roomType) errores.push('Falta room_type')
    else if (!TIPOS_ALOJAMIENTO.some((opcion) => opcion.value === roomType)) {
      errores.push(`room_type no válido: "${roomType}"`)
    }

    if (!propertyType) errores.push('Falta property_type')
    else if (!TIPOS_PROPIEDAD.some((opcion) => opcion.value === propertyType)) {
      errores.push(`property_type no válido: "${propertyType}"`)
    }

    if (!barrio) errores.push('Falta neighbourhood_cleansed')
    else if (!BARRIOS.some((opcion) => opcion.value === barrio)) {
      errores.push(`Barrio no reconocido: "${barrio}"`)
    }

    if (latitude === undefined) errores.push('latitude no es un número válido')
    else if (latitude < LIMITES.latMin || latitude > LIMITES.latMax) {
      errores.push(`latitude debe estar entre ${LIMITES.latMin} y ${LIMITES.latMax}`)
    }

    if (longitude === undefined) errores.push('longitude no es un número válido')
    else if (longitude < LIMITES.lngMin || longitude > LIMITES.lngMax) {
      errores.push(`longitude debe estar entre ${LIMITES.lngMin} y ${LIMITES.lngMax}`)
    }

    if (accommodates === undefined) errores.push('accommodates no es un número válido')
    else if (!Number.isInteger(accommodates) || accommodates < 1 || accommodates > 16) {
      errores.push('accommodates debe ser un entero entre 1 y 16')
    }

    const bedrooms = opcionalNumero(original, 'bedrooms', 'bedrooms', 0, 20, errores)
    const beds = opcionalNumero(original, 'beds', 'beds', 0, 30, errores)
    const bathrooms = opcionalNumero(
      original,
      'bathrooms_num',
      'bathrooms_num',
      0,
      20,
      errores,
      false,
    )
    const minimumNights = opcionalNumero(
      original,
      'minimum_nights',
      'minimum_nights',
      1,
      365,
      errores,
    )
    const maximumNights = opcionalNumero(
      original,
      'maximum_nights',
      'maximum_nights',
      1,
      2000,
      errores,
    )
    const hostListings = opcionalNumero(
      original,
      'host_listings_count',
      'host_listings_count',
      0,
      1000,
      errores,
    )
    const calculatedHostListings = opcionalNumero(
      original,
      'calculated_host_listings_count',
      'calculated_host_listings_count',
      0,
      1000,
      errores,
    )
    const availability365 = opcionalNumero(
      original,
      'availability_365',
      'availability_365',
      0,
      365,
      errores,
    )
    const availability30 = opcionalNumero(
      original,
      'availability_30',
      'availability_30',
      0,
      30,
      errores,
    )
    const availability60 = opcionalNumero(
      original,
      'availability_60',
      'availability_60',
      0,
      60,
      errores,
    )
    const availability90 = opcionalNumero(
      original,
      'availability_90',
      'availability_90',
      0,
      90,
      errores,
    )
    const reviews = opcionalNumero(
      original,
      'number_of_reviews',
      'number_of_reviews',
      0,
      10000,
      errores,
    )
    const reviewsLtm = opcionalNumero(
      original,
      'number_of_reviews_ltm',
      'number_of_reviews_ltm',
      0,
      10000,
      errores,
    )
    const reviewsL30d = opcionalNumero(
      original,
      'number_of_reviews_l30d',
      'number_of_reviews_l30d',
      0,
      10000,
      errores,
    )
    const reviewsLy = opcionalNumero(
      original,
      'number_of_reviews_ly',
      'number_of_reviews_ly',
      0,
      10000,
      errores,
    )
    const reviewsPerMonth = opcionalNumero(
      original,
      'reviews_per_month',
      'reviews_per_month',
      0,
      100,
      errores,
      false,
    )
    const rating = opcionalNumero(
      original,
      'review_scores_rating',
      'review_scores_rating',
      0,
      5,
      errores,
      false,
    )

    const bathroomsText = original.bathrooms_text?.trim() ?? ''
    if (bathroomsText.length > 120) {
      errores.push('bathrooms_text no puede superar 120 caracteres')
    }

    const amenities = valor(original, 'amenities')
      .split(/[;|]/)
      .map((item) => item.trim())
      .filter(Boolean)

    const hostSuperhost = bandera(
      valor(original, 'host_is_superhost'),
      'host_is_superhost',
      errores,
    )
    const hostVerified = bandera(
      valor(original, 'host_identity_verified'),
      'host_identity_verified',
      errores,
    )

    if (errores.length > 0) return { indice, original, errores }

    const datos: ListingInput = {
      room_type: roomType as RoomType,
      property_type: propertyType,
      neighbourhood_cleansed: barrio,
      latitude: latitude as number,
      longitude: longitude as number,
      accommodates: accommodates as number,
      bedrooms,
      beds,
      bathrooms_num: bathrooms,
      bathrooms_text: bathroomsText || undefined,
      minimum_nights: minimumNights,
      maximum_nights: maximumNights,
      host_listings_count: hostListings,
      calculated_host_listings_count: calculatedHostListings,
      amenities,
      availability_365: availability365,
      availability_30: availability30,
      availability_60: availability60,
      availability_90: availability90,
      number_of_reviews: reviews,
      number_of_reviews_ltm: reviewsLtm,
      number_of_reviews_l30d: reviewsL30d,
      number_of_reviews_ly: reviewsLy,
      reviews_per_month: reviewsPerMonth,
      review_scores_rating: rating,
      host_is_superhost: hostSuperhost,
      host_identity_verified: hostVerified,
    }

    return { indice, original, datos, errores }
  })
}

export function cabecerasFaltantes(headers: string[]): string[] {
  const normalizadas = new Set(headers)
  return CABECERAS_OBLIGATORIAS.filter((cabecera) => {
    if (cabecera === 'neighbourhood_cleansed') {
      return !normalizadas.has('neighbourhood_cleansed') && !normalizadas.has('neighbourhood')
    }
    return !normalizadas.has(cabecera)
  })
}
