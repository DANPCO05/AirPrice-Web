// Contrato con la API de AirPrice.
// Fuente: app/docs/REACT_INTEGRATION.md del repo AirPrice.
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

export interface ClassBound {
  min: number
  max: number
}

export interface ModelInfo {
  name: string
  version: string
  trained_at: string
  classes: PriceRange[]
  n_features: number
  metrics: Record<string, number>
  key_fields_benchmark?: Record<string, unknown> | null
  // Campos aditivos previstos para la siguiente versión de la API.
  target?: string
  class_bounds?: Partial<Record<PriceRange, ClassBound>>
  limitations?: string[]
}

export interface Prediction {
  label: PriceRange
  index: number
  confidence: number
  probabilities: Record<PriceRange, number>
  // La API actual no los devuelve; el frontend los calcula como respaldo.
  reliable?: boolean
  confidence_threshold?: number
}

// Respuesta de POST /api/v1/predict.
export interface PredictionResponse {
  request_id: string
  model: ModelInfo
  prediction: Prediction
  warnings: string[]
}

// Respuesta de POST /api/v1/predict/batch.
export interface BatchPredictionResponse {
  request_id: string
  model: ModelInfo
  predictions: Prediction[]
  warnings: string[][]
}

// Respuesta de GET /health.
export interface HealthResponse {
  status: 'ok' | 'degraded'
  model_loaded: boolean
  version: string
  loaded_at: string | null
  evaluation_loaded?: boolean
  market_stats_loaded?: boolean
}

// Formato de los errores 4xx/5xx.
export interface ApiErrorBody {
  detail: string | unknown[]
  request_id?: string
  errors?: unknown[]
}
