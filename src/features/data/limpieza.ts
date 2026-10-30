import { numeroDesdeTexto, type CsvTabla } from '@/lib/csv'
import type { PriceRange } from '@/types/api'

export const COLUMNAS_LIMPIAS = [
  'id',
  'neighbourhood_cleansed',
  'latitude',
  'longitude',
  'property_type',
  'room_type',
  'accommodates',
  'bathrooms_num',
  'bedrooms',
  'beds',
  'minimum_nights',
  'availability_365',
  'number_of_reviews',
  'reviews_per_month',
  'review_scores_rating',
  'has_reviews',
  'host_is_superhost',
  'host_identity_verified',
  'instant_bookable',
  'host_response_rate_num',
  'host_acceptance_rate_num',
  'amenities_count',
  'price_clean',
  'bathrooms_num_missing',
  'bedrooms_missing',
  'beds_missing',
  'minimum_nights_missing',
  'reviews_per_month_missing',
  'review_scores_rating_missing',
  'host_response_rate_num_missing',
  'host_acceptance_rate_num_missing',
  'price_range',
] as const

export interface ResumenLimpieza {
  filasAntes: number
  filasDespues: number
  columnasAntes: number
  columnasDespues: number
  eliminados: {
    precioInvalido: number
    idsDuplicados: number
    outliersPrecio: number
    capacidadInvalida: number
    coordenadasInvalidas: number
  }
  distribucionClases: Record<PriceRange, number>
  nulosDespues: number
}

export interface ResultadoLimpieza {
  headers: string[]
  rows: Record<string, string>[]
  resumen: ResumenLimpieza
}

function texto(fila: Record<string, string>, ...nombres: string[]): string {
  for (const nombre of nombres) {
    const valor = fila[nombre]
    if (valor !== undefined && valor.trim() !== '') return valor.trim()
  }
  return ''
}

function mediana(valores: number[]): number | undefined {
  if (valores.length === 0) return undefined
  const ordenados = [...valores].sort((a, b) => a - b)
  const mitad = Math.floor(ordenados.length / 2)
  return ordenados.length % 2 === 0
    ? (ordenados[mitad - 1] + ordenados[mitad]) / 2
    : ordenados[mitad]
}

function clasePrecio(precio: number): PriceRange {
  if (precio < 100) return 'ECONOMICO'
  if (precio < 180) return 'MEDIO'
  if (precio < 299.5) return 'ALTO'
  return 'PREMIUM'
}

function numeroDeFila(fila: Record<string, string>, ...nombres: string[]): number | undefined {
  return numeroDesdeTexto(texto(fila, ...nombres))
}

function cadenaNumero(valor: number | undefined): string {
  if (valor === undefined || !Number.isFinite(valor)) return '0'
  return Number.isInteger(valor) ? String(valor) : String(Number(valor.toFixed(4)))
}

export function limpiarDataset(tabla: CsvTabla): ResultadoLimpieza {
  const requeridas = [
    'id',
    'latitude',
    'longitude',
    'accommodates',
    'room_type',
    'property_type',
    'neighbourhood_cleansed',
  ]
  const faltantes = requeridas.filter((columna) => !tabla.headers.includes(columna))
  if (!tabla.headers.includes('price') && !tabla.headers.includes('price_clean')) {
    faltantes.push('price o price_clean')
  }
  if (faltantes.length > 0) {
    throw new Error(`Faltan columnas para limpiar: ${faltantes.join(', ')}`)
  }

  let precioInvalido = 0
  let idsDuplicados = 0
  let outliersPrecio = 0
  let capacidadInvalida = 0
  let coordenadasInvalidas = 0

  const conPrecio: Record<string, string>[] = []
  for (const fila of tabla.rows) {
    const precio = numeroDeFila(fila, 'price_clean', 'price')
    if (precio === undefined || precio <= 0) {
      precioInvalido += 1
      continue
    }
    conPrecio.push({ ...fila, price_clean: String(precio) })
  }

  const ids = new Set<string>()
  const sinDuplicados: Record<string, string>[] = []
  for (const fila of conPrecio) {
    const id = texto(fila, 'id')
    if (!id || ids.has(id)) {
      idsDuplicados += 1
      continue
    }
    ids.add(id)
    sinDuplicados.push(fila)
  }

  const sinOutliers: Record<string, string>[] = []
  for (const fila of sinDuplicados) {
    const precio = Number(fila.price_clean)
    if (precio < 29.87 || precio > 2008.18335) {
      outliersPrecio += 1
      continue
    }
    sinOutliers.push(fila)
  }

  const conCapacidad: Record<string, string>[] = []
  for (const fila of sinOutliers) {
    const accommodates = numeroDeFila(fila, 'accommodates')
    if (
      accommodates === undefined ||
      !Number.isInteger(accommodates) ||
      accommodates < 1 ||
      accommodates > 16
    ) {
      capacidadInvalida += 1
      continue
    }
    conCapacidad.push(fila)
  }

  const limpios: Record<string, string>[] = []
  for (const fila of conCapacidad) {
    const latitud = numeroDeFila(fila, 'latitude')
    const longitud = numeroDeFila(fila, 'longitude')
    if (
      latitud === undefined ||
      longitud === undefined ||
      latitud < 51.2 ||
      latitud > 51.7 ||
      longitud < -0.6 ||
      longitud > 0.3
    ) {
      coordenadasInvalidas += 1
      continue
    }
    limpios.push(fila)
  }

  const medianaBathrooms = mediana(
    limpios
      .map((f) => numeroDeFila(f, 'bathrooms_num'))
      .filter((v): v is number => v !== undefined),
  )
  const medianaBedrooms = mediana(
    limpios.map((f) => numeroDeFila(f, 'bedrooms')).filter((v): v is number => v !== undefined),
  )
  const medianaBeds = mediana(
    limpios.map((f) => numeroDeFila(f, 'beds')).filter((v): v is number => v !== undefined),
  )
  const medianaMinimumNights = mediana(
    limpios
      .map((f) => numeroDeFila(f, 'minimum_nights'))
      .filter((v): v is number => v !== undefined),
  )
  const medianaAvailability = mediana(
    limpios
      .map((f) => numeroDeFila(f, 'availability_365'))
      .filter((v): v is number => v !== undefined),
  )
  const medianaReviews = mediana(
    limpios
      .map((f) => numeroDeFila(f, 'number_of_reviews'))
      .filter((v): v is number => v !== undefined),
  )
  const medianaReviewsPerMonth = mediana(
    limpios
      .map((f) => numeroDeFila(f, 'reviews_per_month'))
      .filter((v): v is number => v !== undefined),
  )
  const medianaRating = mediana(
    limpios
      .map((f) => numeroDeFila(f, 'review_scores_rating'))
      .filter((v): v is number => v !== undefined),
  )
  const medianaResponse = mediana(
    limpios
      .map((f) => numeroDeFila(f, 'host_response_rate_num'))
      .filter((v): v is number => v !== undefined),
  )
  const medianaAcceptance = mediana(
    limpios
      .map((f) => numeroDeFila(f, 'host_acceptance_rate_num'))
      .filter((v): v is number => v !== undefined),
  )

  const distribucionClases: Record<PriceRange, number> = {
    ECONOMICO: 0,
    MEDIO: 0,
    ALTO: 0,
    PREMIUM: 0,
  }

  const rows = limpios.map((fila) => {
    const precio = Number(fila.price_clean)
    const clase = clasePrecio(precio)
    distribucionClases[clase] += 1

    const bathrooms = numeroDeFila(fila, 'bathrooms_num')
    const bedrooms = numeroDeFila(fila, 'bedrooms')
    const beds = numeroDeFila(fila, 'beds')
    const minimumNights = numeroDeFila(fila, 'minimum_nights')
    const availability = numeroDeFila(fila, 'availability_365')
    const reviews = numeroDeFila(fila, 'number_of_reviews')
    const reviewsPerMonth = numeroDeFila(fila, 'reviews_per_month')
    const rating = numeroDeFila(fila, 'review_scores_rating')
    const response = numeroDeFila(fila, 'host_response_rate_num')
    const acceptance = numeroDeFila(fila, 'host_acceptance_rate_num')
    const amenities = texto(fila, 'amenities')
    const amenitiesCount =
      numeroDeFila(fila, 'amenities_count') ??
      (amenities ? amenities.split(/[,;|]/).filter(Boolean).length : 0)

    const salida: Record<string, string> = {
      id: texto(fila, 'id'),
      neighbourhood_cleansed: texto(fila, 'neighbourhood_cleansed', 'neighbourhood') || 'UNKNOWN',
      latitude: texto(fila, 'latitude'),
      longitude: texto(fila, 'longitude'),
      property_type: texto(fila, 'property_type') || 'UNKNOWN',
      room_type: texto(fila, 'room_type') || 'UNKNOWN',
      accommodates: texto(fila, 'accommodates'),
      bathrooms_num: cadenaNumero(bathrooms ?? medianaBathrooms),
      bedrooms: cadenaNumero(bedrooms ?? medianaBedrooms),
      beds: cadenaNumero(beds ?? medianaBeds),
      minimum_nights: cadenaNumero(minimumNights ?? medianaMinimumNights),
      availability_365: cadenaNumero(availability ?? medianaAvailability),
      number_of_reviews: cadenaNumero(reviews ?? medianaReviews),
      reviews_per_month: cadenaNumero(reviewsPerMonth ?? medianaReviewsPerMonth),
      review_scores_rating: cadenaNumero(rating ?? medianaRating),
      has_reviews: (reviews ?? 0) > 0 ? '1' : '0',
      host_is_superhost: texto(fila, 'host_is_superhost') || 'UNKNOWN',
      host_identity_verified: texto(fila, 'host_identity_verified') || 'UNKNOWN',
      instant_bookable: texto(fila, 'instant_bookable') || 'UNKNOWN',
      host_response_rate_num: cadenaNumero(response ?? medianaResponse),
      host_acceptance_rate_num: cadenaNumero(acceptance ?? medianaAcceptance),
      amenities_count: cadenaNumero(amenitiesCount),
      price_clean: precio.toFixed(2),
      bathrooms_num_missing: bathrooms === undefined ? '1' : '0',
      bedrooms_missing: bedrooms === undefined ? '1' : '0',
      beds_missing: beds === undefined ? '1' : '0',
      minimum_nights_missing: minimumNights === undefined ? '1' : '0',
      reviews_per_month_missing:
        reviewsPerMonth === undefined ? ((reviews ?? 0) > 0 ? '1' : '0') : '0',
      review_scores_rating_missing: rating === undefined ? '1' : '0',
      host_response_rate_num_missing: response === undefined ? '1' : '0',
      host_acceptance_rate_num_missing: acceptance === undefined ? '1' : '0',
      price_range: clase,
    }

    return salida
  })

  const nulosDespues = rows.reduce(
    (suma, fila) => suma + Object.values(fila).filter((valor) => valor === '').length,
    0,
  )

  return {
    headers: [...COLUMNAS_LIMPIAS],
    rows,
    resumen: {
      filasAntes: tabla.rows.length,
      filasDespues: rows.length,
      columnasAntes: tabla.headers.length,
      columnasDespues: COLUMNAS_LIMPIAS.length,
      eliminados: {
        precioInvalido,
        idsDuplicados,
        outliersPrecio,
        capacidadInvalida,
        coordenadasInvalidas,
      },
      distribucionClases,
      nulosDespues,
    },
  }
}
