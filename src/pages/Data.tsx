import { useState, type ChangeEvent } from 'react'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { limpiarDataset, type ResultadoLimpieza } from '@/features/data/limpieza'
import { CSV_EJEMPLO } from '@/features/data/muestra'
import { CLASES, ETIQUETAS } from '@/features/prediction/clases'
import { descargarCsv, parseCsv, type CsvTabla } from '@/lib/csv'
import styles from './Data.module.css'

const MAX_BYTES = 10 * 1024 * 1024

function analizarCrudo(tabla: CsvTabla) {
  let nulos = 0
  for (const fila of tabla.rows) {
    for (const header of tabla.headers) {
      if (!fila[header]) nulos += 1
    }
  }

  const vistos = new Set<string>()
  let duplicados = 0
  for (const fila of tabla.rows) {
    const clave = JSON.stringify(fila)
    if (vistos.has(clave)) duplicados += 1
    else vistos.add(clave)
  }

  return { nulos, duplicados }
}

export default function Data() {
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [tabla, setTabla] = useState<CsvTabla | null>(null)
  const [resultado, setResultado] = useState<ResultadoLimpieza | null>(null)
  const [error, setError] = useState('')
  const [errorLimpieza, setErrorLimpieza] = useState('')

  const cargarTabla = (csv: CsvTabla, nombre: string) => {
    setTabla(csv)
    setNombreArchivo(nombre)
    setResultado(null)
    setError('')
    setErrorLimpieza('')
  }

  const seleccionarArchivo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return

    setError('')
    setErrorLimpieza('')
    setResultado(null)

    if (archivo.size > MAX_BYTES) {
      setTabla(null)
      setError('El archivo supera el límite de 10 MB.')
      return
    }

    try {
      const texto = await archivo.text()
      cargarTabla(parseCsv(texto), archivo.name)
    } catch (fallo) {
      setTabla(null)
      setError(fallo instanceof Error ? fallo.message : 'No se pudo leer el CSV.')
    }
  }

  const cargarEjemplo = () => {
    try {
      cargarTabla(parseCsv(CSV_EJEMPLO), 'airprice-ejemplo.csv')
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : 'No se pudo cargar el ejemplo.')
    }
  }

  const ejecutarLimpieza = () => {
    if (!tabla) return
    try {
      setResultado(limpiarDataset(tabla))
      setErrorLimpieza('')
    } catch (fallo) {
      setResultado(null)
      setErrorLimpieza(fallo instanceof Error ? fallo.message : 'No se pudo limpiar el dataset.')
    }
  }

  const descargarLimpio = () => {
    if (!resultado) return
    const filas = resultado.rows.map((fila) =>
      resultado.headers.map((header) => fila[header] ?? ''),
    )
    descargarCsv('airprice_clean.csv', resultado.headers, filas)
  }

  const analisis = tabla ? analizarCrudo(tabla) : null
  const totalClases = resultado
    ? Object.values(resultado.resumen.distribucionClases).reduce((suma, valor) => suma + valor, 0)
    : 0

  return (
    <div className={styles.pagina}>
      <header className={styles.encabezado}>
        <span className={styles.eyebrow}>Datos y limpieza</span>
        <h1>Carga, explora y limpia un dataset de Airbnb</h1>
        <p>
          Sube un CSV con datos crudos para ver su estructura, ejecutar una limpieza y descargar el
          resultado.
        </p>
      </header>

      <Card title="1. Carga un archivo CSV">
        <div className={styles.subida}>
          <label className={styles.archivo} htmlFor="archivo-datos">
            <span>Seleccionar CSV</span>
            <input
              id="archivo-datos"
              type="file"
              accept=".csv,text/csv"
              onChange={seleccionarArchivo}
            />
          </label>
          <button type="button" className={styles.botonSecundario} onClick={cargarEjemplo}>
            Cargar dataset de ejemplo
          </button>
        </div>
        <p className={styles.nota}>
          Para Excel, exporta primero la hoja a CSV. Columnas mínimas: <code>id</code>,{' '}
          <code>price</code> o <code>price_clean</code>, <code>latitude</code>,{' '}
          <code>longitude</code>, <code>accommodates</code>, <code>room_type</code>,{' '}
          <code>property_type</code> y <code>neighbourhood_cleansed</code>.
        </p>
        {nombreArchivo && <p className={styles.archivoNombre}>Archivo: {nombreArchivo}</p>}
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </Card>

      {tabla && analisis && (
        <Card title="2. Datos crudos">
          <div className={styles.resumen}>
            <div>
              <strong>{tabla.rows.length.toLocaleString('en-GB')}</strong>
              <span>filas</span>
            </div>
            <div>
              <strong>{tabla.headers.length}</strong>
              <span>columnas</span>
            </div>
            <div>
              <strong>{analisis.nulos.toLocaleString('en-GB')}</strong>
              <span>valores vacíos</span>
            </div>
            <div>
              <strong>{analisis.duplicados}</strong>
              <span>filas duplicadas</span>
            </div>
          </div>

          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  {tabla.headers.slice(0, 9).map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tabla.rows.slice(0, 8).map((fila, indice) => (
                  <tr key={indice}>
                    {tabla.headers.slice(0, 9).map((header) => (
                      <td key={header}>{fila[header] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.nota}>
            Vista previa de {Math.min(8, tabla.rows.length)} filas y las primeras 9 columnas de{' '}
            {tabla.headers.length}.
          </p>

          <div className={styles.acciones}>
            <Button onClick={ejecutarLimpieza}>Ejecutar limpieza</Button>
            <span className={styles.texto}>
              Se eliminarán precios inválidos, IDs duplicados, outliers, capacidades y coordenadas
              fuera de Londres.
            </span>
          </div>
          {errorLimpieza && (
            <p role="alert" className={styles.error}>
              {errorLimpieza}
            </p>
          )}
        </Card>
      )}

      {resultado && (
        <Card title="3. Resultado de la limpieza">
          <div className={styles.resumen}>
            <div>
              <strong>{resultado.resumen.filasDespues.toLocaleString('en-GB')}</strong>
              <span>filas finales</span>
            </div>
            <div>
              <strong>{resultado.resumen.columnasDespues}</strong>
              <span>columnas finales</span>
            </div>
            <div>
              <strong>{resultado.resumen.nulosDespues}</strong>
              <span>vacíos restantes</span>
            </div>
            <div>
              <strong>{resultado.resumen.filasAntes - resultado.resumen.filasDespues}</strong>
              <span>filas eliminadas</span>
            </div>
          </div>

          <div className={styles.columnas}>
            <div>
              <h3>Registros eliminados</h3>
              <ul className={styles.lista}>
                <li>Precio inválido: {resultado.resumen.eliminados.precioInvalido}</li>
                <li>IDs duplicados: {resultado.resumen.eliminados.idsDuplicados}</li>
                <li>Outliers de precio: {resultado.resumen.eliminados.outliersPrecio}</li>
                <li>Capacidad inválida: {resultado.resumen.eliminados.capacidadInvalida}</li>
                <li>Coordenadas inválidas: {resultado.resumen.eliminados.coordenadasInvalidas}</li>
              </ul>
            </div>

            <div>
              <h3>Distribución de clases</h3>
              <div className={styles.barras}>
                {CLASES.map((clase) => {
                  const conteo = resultado.resumen.distribucionClases[clase]
                  return (
                    <div className={styles.barraRow} key={clase}>
                      <div className={styles.barraLabel}>
                        <span>{ETIQUETAS[clase]}</span>
                        <strong>{conteo.toLocaleString('en-GB')}</strong>
                      </div>
                      <div className={styles.track}>
                        <div
                          className={`${styles.fill} ${styles[`barra${clase}`]}`}
                          style={{
                            width: `${totalClases > 0 ? (conteo / totalClases) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  {resultado.headers.slice(0, 9).map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultado.rows.slice(0, 8).map((fila, indice) => (
                  <tr key={indice}>
                    {resultado.headers.slice(0, 9).map((header) => (
                      <td key={header}>{fila[header] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.nota}>
            Vista previa de las primeras {Math.min(8, resultado.rows.length)} filas limpias.
          </p>

          <div className={styles.acciones}>
            <Button onClick={descargarLimpio}>Descargar dataset limpio</Button>
            <a
              className={styles.enlace}
              href="https://insideairbnb.com/get-the-data/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Descargar datos originales ↗
            </a>
          </div>
        </Card>
      )}

      <p className={styles.aviso}>
        La limpieza aplica reglas de precio válido, IDs únicos, outliers de precio P0,5–P99,5,
        capacidad y coordenadas dentro de Londres.
      </p>
    </div>
  )
}
