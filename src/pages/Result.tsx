import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { esAbort } from '@/api/client'
import { predecir } from '@/api/prediction'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { CLASES, ETIQUETAS, RANGOS, porcentaje } from '@/features/prediction/clases'
import { usePrediccion } from '@/features/prediction/prediccionContext'
import { descargarCsv, descargarJson } from '@/lib/csv'
import type { ListingInput, PredictionResponse } from '@/types/api'
import styles from './Result.module.css'

function valorTexto(valor: unknown): string {
  if (valor === undefined || valor === null || valor === '') return 'No indicado'
  if (Array.isArray(valor)) return valor.length ? valor.join(', ') : 'Ninguno'
  return String(valor)
}

export default function Result() {
  const navigate = useNavigate()
  const { solicitud, reiniciar } = usePrediccion()
  const [resultado, setResultado] = useState<PredictionResponse | null>(null)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(Boolean(solicitud))
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!solicitud) return

    const controlador = new AbortController()

    predecir(solicitud, controlador.signal)
      .then((respuesta) => {
        if (!controlador.signal.aborted) setResultado(respuesta)
      })
      .catch((fallo: unknown) => {
        if (esAbort(fallo) || controlador.signal.aborted) return
        setError(fallo instanceof Error ? fallo.message : 'No se pudo obtener la predicción.')
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false)
      })

    return () => controlador.abort()
  }, [solicitud, intento])

  const reintentar = () => {
    setResultado(null)
    setError('')
    setCargando(true)
    setIntento((valor) => valor + 1)
  }

  if (!solicitud) {
    return (
      <Card title="Todavía no hay datos para predecir">
        <p className={styles.texto}>
          Completa la ubicación y las características del alojamiento para consultar el modelo.
        </p>
        <div className={styles.acciones}>
          <Link to="/ubicacion" className={styles.enlacePrincipal}>
            Empezar la clasificación →
          </Link>
          <Link to="/lote" className={styles.enlaceSecundario}>
            O probar con un CSV
          </Link>
        </div>
      </Card>
    )
  }

  if (cargando) {
    return (
      <Card title="Consultando el modelo…">
        <p role="status" className={styles.texto}>
          Estamos procesando las características del alojamiento. La primera consulta puede tardar
          unos segundos.
        </p>
        <div className={styles.esqueleto} aria-hidden="true" />
      </Card>
    )
  }

  if (error || !resultado) {
    return (
      <Card title="No se pudo completar la predicción">
        <p role="alert" className={styles.error}>
          {error || 'No se pudo obtener la clasificación en este momento.'}
        </p>
        <p className={styles.texto}>
          Vuelve a intentarlo en unos segundos. Si el problema continúa, revisa tu conexión o
          inténtalo más tarde.
        </p>
        <div className={styles.acciones}>
          <Button onClick={reintentar}>Reintentar</Button>
          <Link to="/propiedad" className={styles.enlaceSecundario}>
            Editar datos
          </Link>
          <Link to="/" className={styles.enlaceSecundario}>
            Volver al inicio
          </Link>
        </div>
      </Card>
    )
  }

  const { prediction, model, warnings } = resultado
  const confianza = prediction.confidence
  const fiable = prediction.reliable ?? confianza >= 0.5
  const limites = model.class_bounds?.[prediction.label] ?? RANGOS[prediction.label]
  const metricas = model.metrics
  const probabilidades = CLASES.map((clase) => ({
    clase,
    valor: prediction.probabilities[clase] ?? 0,
    activa: clase === prediction.label,
  }))
  const advertenciasCampos = warnings.filter((warning) =>
    warning.startsWith('Campos no proporcionados'),
  )

  const descargarResultadoCsv = () => {
    const entradas = Object.entries(solicitud)
    const headers = [
      ...entradas.map(([clave]) => clave),
      'prediction_label',
      'prediction_index',
      'confidence',
      'prob_ECONOMICO',
      'prob_MEDIO',
      'prob_ALTO',
      'prob_PREMIUM',
    ]
    const fila = [
      ...entradas.map(([, valor]) => (Array.isArray(valor) ? valor.join(';') : valor)),
      prediction.label,
      prediction.index,
      confianza,
      prediction.probabilities.ECONOMICO,
      prediction.probabilities.MEDIO,
      prediction.probabilities.ALTO,
      prediction.probabilities.PREMIUM,
    ]
    descargarCsv('airprice-prediccion.csv', headers, [fila])
  }

  const nuevaPrediccion = () => {
    reiniciar()
    navigate('/ubicacion')
  }

  const camposResumen: Array<[string, keyof ListingInput]> = [
    ['Barrio', 'neighbourhood_cleansed'],
    ['Tipo de propiedad', 'property_type'],
    ['Tipo de alojamiento', 'room_type'],
    ['Huéspedes', 'accommodates'],
    ['Habitaciones', 'bedrooms'],
    ['Camas', 'beds'],
    ['Baños', 'bathrooms_num'],
    ['Noches mínimas', 'minimum_nights'],
    ['Disponibilidad anual', 'availability_365'],
    ['Número de reseñas', 'number_of_reviews'],
    ['Valoración media', 'review_scores_rating'],
    ['Servicios', 'amenities'],
  ]

  return (
    <div className={styles.pagina}>
      <header className={styles.encabezado}>
        <div>
          <span className={styles.eyebrow}>Resultado de la clasificación</span>
          <h1>
            Rango estimado:{' '}
            <span className={`${styles.clase} ${styles[prediction.label.toLowerCase()]}`}>
              {ETIQUETAS[prediction.label]}
            </span>
          </h1>
          <p>
            El alojamiento se clasifica en esta categoría según sus características y su ubicación
            en Londres.
          </p>
        </div>

        <div className={styles.confianzaCard}>
          <span>Confianza del modelo</span>
          <strong>{porcentaje(confianza)}</strong>
          <div className={styles.track} aria-hidden="true">
            <div className={styles.fill} style={{ width: `${Math.min(confianza * 100, 100)}%` }} />
          </div>
          <small className={fiable ? styles.fiable : styles.pocoFiable}>
            {fiable ? 'Predicción fiable' : 'Confianza baja: interpreta con cautela'}
          </small>
        </div>
      </header>

      {!fiable && (
        <p className={styles.aviso} role="alert">
          La confianza es menor al 50 %. La categoría puede ser una aproximación: revisa las
          probabilidades y, si puedes, completa las opciones avanzadas para mejorar la señal.
        </p>
      )}

      <div className={styles.grid}>
        <Card title="Probabilidades por clase">
          <div className={styles.probabilidades}>
            {probabilidades.map(({ clase, valor, activa }) => (
              <div className={styles.probRow} key={clase}>
                <div className={styles.probLabel}>
                  <span className={activa ? styles.probActiva : undefined}>
                    {ETIQUETAS[clase]}
                    {activa && ' · predicha'}
                  </span>
                  <strong>{porcentaje(valor)}</strong>
                </div>
                <div
                  className={styles.track}
                  role="img"
                  aria-label={`${ETIQUETAS[clase]}: ${porcentaje(valor)}`}
                >
                  <div
                    className={`${styles.fill} ${styles[`barra${clase}`]}`}
                    style={{ width: `${Math.min(valor * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Rango de precio asociado">
          <p className={styles.rango}>
            {new Intl.NumberFormat('en-GB', {
              style: 'currency',
              currency: 'GBP',
              maximumFractionDigits: 0,
            }).format(limites.min)}{' '}
            –{' '}
            {new Intl.NumberFormat('en-GB', {
              style: 'currency',
              currency: 'GBP',
              maximumFractionDigits: 0,
            }).format(limites.max)}
          </p>
          <p className={styles.texto}>
            Rango de precio asociado a la categoría <strong>{ETIQUETAS[prediction.label]}</strong>{' '}
            para alojamientos de Londres.
          </p>
        </Card>
      </div>

      <Card title="Calidad del modelo">
        <div className={styles.metricas}>
          <div>
            <strong>{porcentaje(metricas.accuracy ?? 0)}</strong>
            <span>Accuracy exacta</span>
          </div>
          <div>
            <strong>{porcentaje(metricas.accuracy_adjacent ?? 0)}</strong>
            <span>Accuracy adyacente (±1)</span>
          </div>
          <div>
            <strong>{(metricas.qwk ?? 0).toFixed(3)}</strong>
            <span>QWK ordinal</span>
          </div>
        </div>
        <p className={styles.nota}>
          Métricas calculadas sobre el conjunto de evaluación. La accuracy adyacente considera un
          acierto cuando la categoría predicha coincide con la real o con la inmediatamente vecina.
        </p>
      </Card>

      <Card title="Datos usados en la predicción">
        <dl className={styles.resumen}>
          {camposResumen.map(([etiqueta, campo]) => (
            <div key={campo}>
              <dt>{etiqueta}</dt>
              <dd>{valorTexto(solicitud[campo])}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.accionesSecundarias}>
          <Link to="/propiedad" className={styles.enlaceSecundario}>
            Editar características
          </Link>
          <Link to="/ubicacion" className={styles.enlaceSecundario}>
            Cambiar ubicación
          </Link>
        </p>
      </Card>

      {advertenciasCampos.length > 0 && (
        <Card title="Campos completados automáticamente">
          <p className={styles.texto}>
            Algunos campos se completaron automáticamente con valores de referencia porque no se
            indicaron en el formulario.
          </p>
          <details className={styles.mas}>
            <summary>Ver campos completados</summary>
            <ul className={styles.lista}>
              {advertenciasCampos.map((warning) => (
                <li key={warning}>
                  {warning.replace(
                    'Campos no proporcionados; se usaron defaults de entrenamiento: ',
                    'Campos completados: ',
                  )}
                </li>
              ))}
            </ul>
          </details>
        </Card>
      )}

      <div className={styles.acciones}>
        <Link to="/" className={styles.enlaceSecundario}>
          ← Volver al inicio
        </Link>
        <div className={styles.botones}>
          <Button onClick={descargarResultadoCsv}>Descargar CSV</Button>
          <button
            type="button"
            className={styles.botonSecundario}
            onClick={() => descargarJson('airprice-prediccion.json', { solicitud, resultado })}
          >
            Descargar JSON
          </button>
          <button type="button" className={styles.botonSecundario} onClick={nuevaPrediccion}>
            Nueva predicción
          </button>
        </div>
      </div>
    </div>
  )
}
