// Contrato con la API de AirPrice.
// Fuente: app/docs/REACT_INTEGRATION.md del repo AirPrice (rama feat/app).
// Si la API cambia, actualizar aquí primero: TypeScript marcará lo que haya que ajustar.

export type PriceRange = 'ECONOMICO' | 'MEDIO' | 'ALTO' | 'PREMIUM'

export type RoomType = 'Entire home/apt' | 'Private room' | 'Shared room' | 'Hotel room'

export type Flag = 't' | 'f' | 'UNKNOWN'

// Cuerpo de POST /api/v1/predict. Solo los 6 primeros campos son obligatorios;
// los que no se envían los completa la API con valores por defecto (y lo avisa en `warnings`).
export interface ListingInput {
  room_type: RoomType
  property_type: string
  neighbourhood_cleansed: string
  latitude: number
  longitude: number
  accommodates: number
  bedrooms?: number
  beds?: number
  bathrooms_num?: number
  bathrooms_text?: string
  minimum_nights?: number
  maximum_nights?: number
  host_listings_count?: number
  calculated_host_listings_count?: number
  amenities?: string[]
  availability_365?: number
  availability_30?: number
  availability_60?: number
  availability_90?: number
  number_of_reviews?: number
  number_of_reviews_ltm?: number
  number_of_reviews_l30d?: number
  number_of_reviews_ly?: number
  reviews_per_month?: number
  review_scores_rating?: number
  host_is_superhost?: Flag
  host_identity_verified?: Flag
}

// Respuesta de POST /api/v1/predict.
export interface PredictionResponse {
  request_id: string
  model: {
    name: string
    version: string
    trained_at: string
    classes: PriceRange[]
    n_features: number
    metrics: Record<string, number>
  }
  prediction: {
    label: PriceRange
    index: number
    confidence: number
    probabilities: Record<PriceRange, number>
  }
  warnings: string[]
}

// Formato de los errores 4xx/5xx.
export interface ApiError {
  detail: string
  request_id?: string
}
