// Cliente HTTP único para la API de AirPrice.
// Centraliza la URL base, los timeouts y la traducción de errores de FastAPI.

const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/+$/, '')

export const API_BASE = BASE

export class ApiError extends Error {
  readonly status: number
  readonly requestId?: string
  readonly retryAfter?: number

  constructor(status: number, mensaje: string, requestId?: string, retryAfter?: number) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.requestId = requestId
    this.retryAfter = retryAfter
  }
}

export function esAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

function extraerDetalle(datos: unknown): string {
  if (typeof datos === 'string' && datos.trim()) return datos
  if (!esRegistro(datos)) return ''

  const detalle = datos.detail
  if (typeof detalle === 'string') return detalle
  if (Array.isArray(detalle)) {
    return detalle
      .map((item) => {
        if (!esRegistro(item)) return String(item)
        const loc = Array.isArray(item.loc)
          ? item.loc.filter((parte) => parte !== 'body').join('.')
          : ''
        const msg = typeof item.msg === 'string' ? item.msg : 'Valor inválido'
        return loc ? `${loc}: ${msg}` : msg
      })
      .join('; ')
  }

  const error = datos.error
  if (typeof error === 'string') return error
  return ''
}

function extraerRequestId(datos: unknown): string | undefined {
  if (!esRegistro(datos)) return undefined
  return typeof datos.request_id === 'string' ? datos.request_id : undefined
}

function mensajePorEstado(status: number, detalle: string): string {
  if (status === 422) return detalle || 'Los datos enviados no son válidos.'
  if (status === 429) return 'Demasiadas solicitudes. Espera un minuto e inténtalo de nuevo.'
  if (status === 503) {
    return 'El servicio no está disponible en este momento. Inténtalo de nuevo en unos segundos.'
  }
  if (status === 404) return 'La información solicitada no está disponible.'
  if (status >= 500) return 'Ocurrió un error al procesar la solicitud. Inténtalo más tarde.'
  return detalle || `No se pudo completar la solicitud (${status}).`
}

interface OpcionesSolicitud extends RequestInit {
  timeoutMs?: number
}

export async function solicitar<T>(ruta: string, opciones: OpcionesSolicitud = {}): Promise<T> {
  const { timeoutMs = 20000, signal, headers, ...resto } = opciones
  const controlador = new AbortController()
  let agotado = false
  const temporizador = setTimeout(() => {
    agotado = true
    controlador.abort()
  }, timeoutMs)

  const abortar = () => controlador.abort()
  signal?.addEventListener('abort', abortar)

  try {
    const respuesta = await fetch(`${BASE}${ruta}`, {
      ...resto,
      signal: controlador.signal,
      headers: { Accept: 'application/json', ...headers },
    })

    const texto = await respuesta.text()
    let datos: unknown = null
    if (texto) {
      try {
        datos = JSON.parse(texto)
      } catch {
        datos = texto
      }
    }

    if (!respuesta.ok) {
      const retryAfter = Number(respuesta.headers.get('Retry-After')) || undefined
      throw new ApiError(
        respuesta.status,
        mensajePorEstado(respuesta.status, extraerDetalle(datos)),
        extraerRequestId(datos),
        retryAfter,
      )
    }

    return datos as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (signal?.aborted) throw new DOMException('Solicitud cancelada', 'AbortError')
    if (agotado) {
      throw new Error('La consulta tardó demasiado. Inténtalo de nuevo.')
    }
    throw new Error('No se pudo conectar con el servicio. Revisa tu conexión e inténtalo de nuevo.')
  } finally {
    clearTimeout(temporizador)
    signal?.removeEventListener('abort', abortar)
  }
}

export function getJson<T>(ruta: string, signal?: AbortSignal): Promise<T> {
  return solicitar<T>(ruta, { signal })
}

export function postJson<T>(ruta: string, cuerpo: unknown, signal?: AbortSignal): Promise<T> {
  return solicitar<T>(ruta, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
    signal,
  })
}
