import { useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { predecirLote } from '@/api/prediction'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { ETIQUETAS, porcentaje } from '@/features/prediction/clases'
import { cabecerasFaltantes, validarLote, type FilaLote } from '@/features/prediction/validacion'
import { descargarCsv, parseCsv, type CsvTabla } from '@/lib/csv'
import type { ListingInput, Prediction } from '@/types/api'
import styles from './Batch.module.css'

const TAMANO_LOTE = 50
const MAX_FILAS = 500
const MAX_BYTES = 10 * 1024 * 1024

interface ResultadoFila {
  indice: number
  original: Record<string, string>
  datos: ListingInput
  prediccion: Prediction
  warnings: string[]
}

function resumirAdvertencias(warnings: string[]): string {
  const partes: string[] = []
  if (warnings.some((warning) => warning.startsWith('Campos no proporcionados'))) {
    partes.push('Campos completados automáticamente')
  }
  if (warnings.some((warning) => warning.includes('Confianza menor'))) {
    partes.push('Confianza baja')
  }
  return partes.join(' · ') || '—'
}

const PLANTILLA_HEADERS = [
  'room_type',
  'property_type',
  'neighbourhood_cleansed',
  'latitude',
  'longitude',
  'accommodates',
  'bedrooms',
  'beds',
  'bathrooms_num',
  'bathrooms_text',
  'minimum_nights',
  'maximum_nights',
  'host_listings_count',
  'calculated_host_listings_count',
  'amenities',
  'availability_365',
  'availability_30',
  'availability_60',
  'availability_90',
  'number_of_reviews',
  'number_of_reviews_ltm',
  'number_of_reviews_l30d',
  'number_of_reviews_ly',
  'reviews_per_month',
  'review_scores_rating',
  'host_is_superhost',
  'host_identity_verified',
]

const PLANTILLA_EJEMPLO = [
  'Entire home/apt',
  'Entire rental unit',
  'Westminster',
  '51.5074',
  '-0.1278',
  '2',
  '1',
  '1',
  '1',
  '1 private bath',
  '2',
  '365',
  '12',
  '10',
  'wifi;kitchen;heating;elevator',
  '120',
  '20',
  '45',
  '70',
  '45',
  '18',
  '2',
  '30',
  '1.2',
  '4.8',
  't',
  't',
]

export default function Batch() {
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [tabla, setTabla] = useState<CsvTabla | null>(null)
  const [filas, setFilas] = useState<FilaLote[]>([])
  const [errorArchivo, setErrorArchivo] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [resultados, setResultados] = useState<ResultadoFila[]>([])
  const [errorProceso, setErrorProceso] = useState('')

  const validas = filas.filter((fila) => Boolean(fila.datos))
  const invalidas = filas.length - validas.length
  const numeroLotes = Math.ceil(validas.length / TAMANO_LOTE)

  const seleccionarArchivo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return

    setNombreArchivo(archivo.name)
    setErrorArchivo('')
    setErrorProceso('')
    setResultados([])
    setProgreso(0)

    if (archivo.size > MAX_BYTES) {
      setTabla(null)
      setFilas([])
      setErrorArchivo('El archivo supera el límite de 10 MB.')
      return
    }

    try {
      const texto = await archivo.text()
      const csv = parseCsv(texto)
      const faltantes = cabecerasFaltantes(csv.headers)
      if (faltantes.length > 0) {
        throw new Error(`Faltan columnas obligatorias: ${faltantes.join(', ')}`)
      }
      if (csv.rows.length === 0) {
        throw new Error('El CSV no contiene filas de datos.')
      }
      if (csv.rows.length > MAX_FILAS) {
        throw new Error(
          `El archivo tiene ${csv.rows.length} filas. El máximo permitido es ${MAX_FILAS}.`,
        )
      }
      setTabla(csv)
      setFilas(validarLote(csv.rows))
    } catch (fallo) {
      setTabla(null)
      setFilas([])
      setErrorArchivo(fallo instanceof Error ? fallo.message : 'No se pudo leer el CSV.')
    }
  }

  const procesar = async () => {
    if (validas.length === 0) {
      setErrorProceso('No hay filas válidas para procesar. Corrige los errores del CSV.')
      return
    }

    setProcesando(true)
    setErrorProceso('')
    setResultados([])
    setProgreso(0)

    const acumulados: ResultadoFila[] = []

    try {
      for (let inicio = 0; inicio < validas.length; inicio += TAMANO_LOTE) {
        const trozo = validas.slice(inicio, inicio + TAMANO_LOTE)
        const respuesta = await predecirLote(trozo.map((fila) => fila.datos as ListingInput))

        respuesta.predictions.forEach((prediccion, indice) => {
          const fila = trozo[indice]
          acumulados.push({
            indice: fila.indice,
            original: fila.original,
            datos: fila.datos as ListingInput,
            prediccion,
            warnings: respuesta.warnings[indice] ?? [],
          })
        })

        setResultados([...acumulados])
        setProgreso(Math.round(((inicio + trozo.length) / validas.length) * 100))
      }
    } catch (fallo) {
      setErrorProceso(fallo instanceof Error ? fallo.message : 'No se pudo procesar el archivo.')
    } finally {
      setProcesando(false)
    }
  }

  const descargarPlantilla = () => {
    descargarCsv('airprice-plantilla-lote.csv', PLANTILLA_HEADERS, [PLANTILLA_EJEMPLO])
  }

  const descargarResultados = () => {
    if (!tabla || resultados.length === 0) return
    const headers = [
      ...tabla.headers,
      'prediction_label',
      'prediction_index',
      'confidence',
      'prob_ECONOMICO',
      'prob_MEDIO',
      'prob_ALTO',
      'prob_PREMIUM',
      'warnings',
    ]
    const filasCsv = resultados.map((resultado) => [
      ...tabla.headers.map((header) => resultado.original[header] ?? ''),
      resultado.prediccion.label,
      resultado.prediccion.index,
      resultado.prediccion.confidence,
      resultado.prediccion.probabilities.ECONOMICO,
      resultado.prediccion.probabilities.MEDIO,
      resultado.prediccion.probabilities.ALTO,
      resultado.prediccion.probabilities.PREMIUM,
      resumirAdvertencias(resultado.warnings),
    ])
    descargarCsv('airprice-predicciones-lote.csv', headers, filasCsv)
  }

  return (
    <div className={styles.pagina}>
      <header className={styles.encabezado}>
        <span className={styles.eyebrow}>Predicción por lote</span>
        <h1>Clasifica muchos alojamientos desde un CSV</h1>
        <p>
          Sube un archivo con una fila por alojamiento. El sistema valida los datos, procesa el
          archivo por partes de {TAMANO_LOTE} y genera una clasificación para cada fila.
        </p>
      </header>

      <Card title="1. Sube tu archivo CSV">
        <div className={styles.subida}>
          <label className={styles.archivo} htmlFor="archivo-lote">
            <span>Seleccionar CSV</span>
            <input
              id="archivo-lote"
              type="file"
              accept=".csv,text/csv"
              onChange={seleccionarArchivo}
            />
          </label>
          <button type="button" className={styles.botonSecundario} onClick={descargarPlantilla}>
            Descargar plantilla
          </button>
        </div>
        <p className={styles.nota}>
          Columnas obligatorias: <code>room_type</code>, <code>property_type</code>,{' '}
          <code>neighbourhood_cleansed</code>, <code>latitude</code>, <code>longitude</code> y{' '}
          <code>accommodates</code>. Para varias amenidades usa punto y coma:{' '}
          <code>wifi;kitchen;heating</code>. Máximo: {MAX_FILAS} filas y 10 MB.
        </p>
        {nombreArchivo && <p className={styles.archivoNombre}>Archivo: {nombreArchivo}</p>}
        {errorArchivo && (
          <p role="alert" className={styles.error}>
            {errorArchivo}
          </p>
        )}
      </Card>

      {tabla && (
        <Card title="2. Revisa y valida los datos">
          <div className={styles.resumen}>
            <div>
              <strong>{filas.length}</strong>
              <span>filas leídas</span>
            </div>
            <div>
              <strong className={styles.ok}>{validas.length}</strong>
              <span>válidas</span>
            </div>
            <div>
              <strong className={invalidas > 0 ? styles.mal : undefined}>{invalidas}</strong>
              <span>con errores</span>
            </div>
            <div>
              <strong>{tabla.headers.length}</strong>
              <span>columnas</span>
            </div>
          </div>

          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Fila</th>
                  {tabla.headers.slice(0, 7).map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filas.slice(0, 8).map((fila) => (
                  <tr key={fila.indice}>
                    <td>{fila.indice + 2}</td>
                    {tabla.headers.slice(0, 7).map((header) => (
                      <td key={header}>{fila.original[header] ?? ''}</td>
                    ))}
                    <td>
                      {fila.datos ? (
                        <span className={styles.chipOk}>Válida</span>
                      ) : (
                        <span className={styles.chipMal} title={fila.errores.join(' · ')}>
                          {fila.errores[0] ?? 'Error'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filas.length > 8 && (
            <p className={styles.nota}>Vista previa de las primeras 8 filas de {filas.length}.</p>
          )}
          {invalidas > 0 && (
            <p className={styles.aviso}>
              Las filas con errores no se incluirán en el procesamiento. Corrige el CSV y vuelve a
              cargarlo si quieres incluirlas.
            </p>
          )}
        </Card>
      )}

      {tabla && (
        <Card title="3. Procesa el lote">
          <p className={styles.texto}>
            El archivo se procesará en <strong>{numeroLotes}</strong> parte(s) de hasta{' '}
            {TAMANO_LOTE} filas. Los archivos grandes pueden tardar unos segundos.
          </p>
          <div className={styles.acciones}>
            <Button onClick={procesar} disabled={procesando || validas.length === 0}>
              {procesando ? 'Procesando…' : `Predecir ${validas.length} alojamiento(s)`}
            </Button>
            {procesando && (
              <span role="status" className={styles.progresoTexto}>
                {progreso} %
              </span>
            )}
          </div>
          {procesando && (
            <div className={styles.progreso} aria-hidden="true">
              <div style={{ width: `${progreso}%` }} />
            </div>
          )}
          {errorProceso && (
            <p role="alert" className={styles.error}>
              {errorProceso}
            </p>
          )}
        </Card>
      )}

      {resultados.length > 0 && (
        <Card title="Resultados">
          <div className={styles.resumen}>
            <div>
              <strong>{resultados.length}</strong>
              <span>predicciones</span>
            </div>
            <div>
              <strong>{resultados.filter((r) => r.prediccion.label === 'PREMIUM').length}</strong>
              <span>premium</span>
            </div>
            <div>
              <strong>{resultados.filter((r) => r.prediccion.confidence < 0.5).length}</strong>
              <span>confianza baja</span>
            </div>
          </div>

          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Fila</th>
                  <th>Predicción</th>
                  <th>Confianza</th>
                  <th>Probabilidades</th>
                  <th>Advertencias</th>
                </tr>
              </thead>
              <tbody>
                {resultados.slice(0, 50).map((resultado) => (
                  <tr key={resultado.indice}>
                    <td>{resultado.indice + 2}</td>
                    <td>
                      <strong>{ETIQUETAS[resultado.prediccion.label]}</strong>
                    </td>
                    <td>{porcentaje(resultado.prediccion.confidence)}</td>
                    <td className={styles.probs}>
                      {Object.entries(resultado.prediccion.probabilities)
                        .map(([clase, valor]) => `${clase}: ${porcentaje(valor)}`)
                        .join(' · ')}
                    </td>
                    <td>{resumirAdvertencias(resultado.warnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {resultados.length > 50 && (
            <p className={styles.nota}>
              Se muestran las primeras 50 predicciones. El CSV descargable contiene todas.
            </p>
          )}

          <div className={styles.acciones}>
            <Button onClick={descargarResultados}>Descargar resultados CSV</Button>
            <Link to="/modelo" className={styles.enlace}>
              Ver evaluación del modelo
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
