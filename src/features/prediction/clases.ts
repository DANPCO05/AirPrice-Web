import type { PriceRange } from '@/types/api'

export const CLASES: readonly PriceRange[] = ['ECONOMICO', 'MEDIO', 'ALTO', 'PREMIUM']

export const ETIQUETAS: Record<PriceRange, string> = {
  ECONOMICO: 'Económico',
  MEDIO: 'Medio',
  ALTO: 'Alto',
  PREMIUM: 'Premium',
}

// Rangos de precio usados por el modelo. La API los expondrá en
// /api/v1/model/info → class_bounds; hasta entonces se usan como respaldo.
export const RANGOS: Record<PriceRange, { min: number; max: number }> = {
  ECONOMICO: { min: 29.87, max: 100 },
  MEDIO: { min: 100, max: 180 },
  ALTO: { min: 180, max: 299.5 },
  PREMIUM: { min: 299.5, max: 2007 },
}

export function esPriceRange(valor: string): valor is PriceRange {
  return (CLASES as readonly string[]).includes(valor)
}

export function porcentaje(valor: number): string {
  return `${(valor * 100).toFixed(1)}%`
}

export function rangoTexto(clase: PriceRange): string {
  const rango = RANGOS[clase]
  const formato = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  })
  return `${formato.format(rango.min)} – ${formato.format(rango.max)}`
}
