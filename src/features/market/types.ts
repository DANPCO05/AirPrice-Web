export type ClasePrecio = 'ECONOMICO' | 'MEDIO' | 'ALTO' | 'PREMIUM'

export interface ConteoClase {
  clase: ClasePrecio
  count: number
}

export interface EstadisticaBarrio {
  neighbourhood: string
  count: number
  average_price: number
}

export interface PuntoMercado {
  id: number | string
  latitude: number
  longitude: number
  price: number
  neighbourhood: string
  room_type: string
  clase?: ClasePrecio
}

// Contrato provisional. Se debe acordar con el backend antes de conectar la API.
export interface EstadisticasMercado {
  total_listings: number
  average_price: number | null
  currency: 'GBP'
  by_class: ConteoClase[]
  by_neighbourhood: EstadisticaBarrio[]
  listings: PuntoMercado[]
}
