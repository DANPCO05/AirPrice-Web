// Utilidades CSV compartidas por la predicción por lote y la página de datos.
// Parser propio para no añadir dependencias y controlar comillas, saltos de línea
// y delimitadores habituales (coma, punto y coma o tabulador).

export interface CsvTabla {
  headers: string[]
  rows: Record<string, string>[]
  delimiter: string
}

function detectarDelimitador(texto: string): string {
  const primeraLinea = texto.split(/\r?\n/, 1)[0] ?? ''
  const candidatos = [',', ';', '\t']
  let mejor = ','
  let mejorConteo = -1
  for (const candidato of candidatos) {
    let conteo = 0
    let enComillas = false
    for (const caracter of primeraLinea) {
      if (caracter === '"') enComillas = !enComillas
      else if (!enComillas && caracter === candidato) conteo += 1
    }
    if (conteo > mejorConteo) {
      mejor = candidato
      mejorConteo = conteo
    }
  }
  return mejor
}

function cabecerasUnicas(cabeceras: string[]): string[] {
  const vistas = new Map<string, number>()
  return cabeceras.map((cabeceraOriginal, indice) => {
    const base = cabeceraOriginal.trim() || `columna_${indice + 1}`
    const conteo = vistas.get(base) ?? 0
    vistas.set(base, conteo + 1)
    return conteo === 0 ? base : `${base}_${conteo + 1}`
  })
}

export function parseCsv(texto: string): CsvTabla {
  const limpio = texto.replace(/^\uFEFF/, '')
  if (!limpio.trim()) throw new Error('El archivo CSV está vacío.')

  const delimiter = detectarDelimitador(limpio)
  const filas: string[][] = []
  let fila: string[] = []
  let campo = ''
  let enComillas = false

  for (let i = 0; i < limpio.length; i += 1) {
    const caracter = limpio[i]

    if (enComillas) {
      if (caracter === '"') {
        if (limpio[i + 1] === '"') {
          campo += '"'
          i += 1
        } else {
          enComillas = false
        }
      } else {
        campo += caracter
      }
      continue
    }

    if (caracter === '"') {
      enComillas = true
    } else if (caracter === delimiter) {
      fila.push(campo)
      campo = ''
    } else if (caracter === '\n') {
      fila.push(campo)
      campo = ''
      filas.push(fila)
      fila = []
    } else if (caracter !== '\r') {
      campo += caracter
    }
  }

  if (campo.length > 0 || fila.length > 0) {
    fila.push(campo)
    filas.push(fila)
  }

  const filasUtiles = filas.filter((f) => f.some((valor) => valor.trim() !== ''))
  if (filasUtiles.length === 0) throw new Error('El archivo CSV no tiene filas.')

  const [cabecerasRaw, ...datosRaw] = filasUtiles
  const headers = cabecerasUnicas(cabecerasRaw)
  const rows = datosRaw.map((valores) => {
    const filaObjeto: Record<string, string> = {}
    headers.forEach((cabecera, indice) => {
      filaObjeto[cabecera] = (valores[indice] ?? '').trim()
    })
    return filaObjeto
  })

  return { headers, rows, delimiter }
}

function escaparCelda(valor: unknown): string {
  const texto = valor === null || valor === undefined ? '' : String(valor)
  return /[",\n\r;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

export function toCsv(
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
): string {
  const lineas = [
    headers.map(escaparCelda).join(','),
    ...rows.map((fila) => fila.map(escaparCelda).join(',')),
  ]
  return `\uFEFF${lineas.join('\r\n')}`
}

export function descargarTexto(nombre: string, contenido: string, mime: string): void {
  const blob = new Blob([contenido], { type: mime })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

export function descargarCsv(
  nombre: string,
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
): void {
  descargarTexto(nombre, toCsv(headers, rows), 'text/csv;charset=utf-8')
}

export function descargarJson(nombre: string, datos: unknown): void {
  descargarTexto(nombre, JSON.stringify(datos, null, 2), 'application/json;charset=utf-8')
}

export function numeroDesdeTexto(valor: string | undefined): number | undefined {
  if (valor === undefined) return undefined
  const limpio = valor.trim().replace(/[£$%,\s]/g, '')
  if (!limpio) return undefined
  const numero = Number(limpio)
  return Number.isFinite(numero) ? numero : undefined
}
