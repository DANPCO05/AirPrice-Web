import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerEvaluacion, obtenerInfoModelo } from '@/api/model'
import Card from '@/components/Card'
import RocChart from '@/features/model/RocChart'
import { EVALUACION_SIMULADA } from '@/features/model/datosSimulados'
import type { EvaluationResponse } from '@/features/model/types'
import { ETIQUETAS, porcentaje } from '@/features/prediction/clases'
import type { ModelInfo, PriceRange } from '@/types/api'
import styles from './Model.module.css'

export default function Model() {
  const [info, setInfo] = useState<ModelInfo | null>(null)
  const [evaluacion, setEvaluacion] = useState<EvaluationResponse>(EVALUACION_SIMULADA)
  const [cargando, setCargando] = useState(true)
  const [celdaActiva, setCeldaActiva] = useState<{
    real: PriceRange
    predicha: PriceRange
    valor: number
  } | null>(null)

  useEffect(() => {
    const controlador = new AbortController()

    Promise.allSettled([
      obtenerInfoModelo(controlador.signal),
      obtenerEvaluacion(controlador.signal),
    ]).then(([resInfo, resEvaluacion]) => {
      if (controlador.signal.aborted) return

      if (resInfo.status === 'fulfilled') setInfo(resInfo.value)
      if (resEvaluacion.status === 'fulfilled') setEvaluacion(resEvaluacion.value)

      setCargando(false)
    })

    return () => controlador.abort()
  }, [])

  const metricas = info?.metrics ?? evaluacion.metrics
  const matriz = evaluacion.confusion_matrix
  const maximoMatriz = Math.max(1, ...matriz.matrix.flat())
  const totalMatriz = matriz.matrix.reduce(
    (suma, fila) => suma + fila.reduce((s, valor) => s + valor, 0),
    0,
  )
  const mejorAccuracy = evaluacion.model_comparison.length
    ? Math.max(...evaluacion.model_comparison.map((m) => m.accuracy))
    : 0
  const maxImportancia = Math.max(1, ...evaluacion.feature_importance.map((f) => f.importance))

  return (
    <div className={styles.pagina}>
      <header className={styles.encabezado}>
        <div>
          <span className={styles.eyebrow}>Evaluación del modelo</span>
          <h1>Rendimiento, matriz de confusión y variables</h1>
          <p>
            Métricas sobre el conjunto de evaluación, comparación de los cuatro modelos y análisis
            de las variables que más influyen en la clasificación.
          </p>
        </div>
      </header>

      {cargando && (
        <p role="status" className={styles.aviso}>
          Cargando la evaluación del modelo…
        </p>
      )}

      <div className={styles.kpis}>
        <Card>
          <p className={styles.kpiLabel}>Accuracy exacta</p>
          <p className={styles.kpiValor}>{porcentaje(metricas.accuracy ?? 0)}</p>
          <p className={styles.kpiNota}>Acierto en las 4 clases</p>
        </Card>
        <Card>
          <p className={styles.kpiLabel}>Accuracy adyacente</p>
          <p className={styles.kpiValor}>{porcentaje(metricas.accuracy_adjacent ?? 0)}</p>
          <p className={styles.kpiNota}>Acierto exacto o ±1 clase</p>
        </Card>
        <Card>
          <p className={styles.kpiLabel}>F1 macro</p>
          <p className={styles.kpiValor}>{porcentaje(metricas.f1_macro ?? 0)}</p>
          <p className={styles.kpiNota}>Equilibrio entre clases</p>
        </Card>
        <Card>
          <p className={styles.kpiLabel}>QWK</p>
          <p className={styles.kpiValor}>{(metricas.qwk ?? 0).toFixed(3)}</p>
          <p className={styles.kpiNota}>Acuerdo ordinal</p>
        </Card>
      </div>

      <div className={styles.grid}>
        <Card title="Matriz de confusión">
          <div className={styles.tablaWrap}>
            <table className={styles.matriz}>
              <thead>
                <tr>
                  <th>Real \ Predicho</th>
                  {matriz.labels.map((label) => (
                    <th key={label}>{ETIQUETAS[label]}</th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {matriz.matrix.map((fila, i) => (
                  <tr key={matriz.labels[i]}>
                    <th scope="row">{ETIQUETAS[matriz.labels[i]]}</th>
                    {fila.map((valor, j) => {
                      const intensidad = maximoMatriz > 0 ? valor / maximoMatriz : 0
                      const alfa = 0.08 + intensidad * 0.55
                      const diagonal = i === j
                      const activa =
                        celdaActiva?.real === matriz.labels[i] &&
                        celdaActiva?.predicha === matriz.labels[j]
                      const seleccionar = () =>
                        setCeldaActiva({
                          real: matriz.labels[i],
                          predicha: matriz.labels[j],
                          valor,
                        })
                      return (
                        <td
                          key={`${i}-${j}`}
                          className={[
                            diagonal ? styles.celdaDiagonal : '',
                            activa ? styles.celdaActiva : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={{
                            backgroundColor: diagonal
                              ? `rgba(36, 166, 106, ${alfa})`
                              : `rgba(33, 118, 255, ${alfa * 0.75})`,
                            color: alfa > 0.4 ? 'white' : 'var(--text)',
                          }}
                          title={`Real ${ETIQUETAS[matriz.labels[i]]}, predicho ${ETIQUETAS[matriz.labels[j]]}: ${valor}`}
                          role="button"
                          tabIndex={0}
                          onClick={seleccionar}
                          onKeyDown={(evento) => {
                            if (evento.key === 'Enter' || evento.key === ' ') {
                              evento.preventDefault()
                              seleccionar()
                            }
                          }}
                        >
                          {valor}
                        </td>
                      )
                    })}
                    <td className={styles.total}>
                      {fila.reduce((suma, valor) => suma + valor, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {celdaActiva && (
            <p className={styles.seleccion}>
              Real <strong>{ETIQUETAS[celdaActiva.real]}</strong> → predicho{' '}
              <strong>{ETIQUETAS[celdaActiva.predicha]}</strong>:{' '}
              {celdaActiva.valor.toLocaleString('en-GB')} filas (
              {porcentaje(totalMatriz > 0 ? celdaActiva.valor / totalMatriz : 0)} del total
              evaluado).
            </p>
          )}
          <p className={styles.nota}>
            {totalMatriz.toLocaleString('en-GB')} alojamientos evaluados. La diagonal son los
            aciertos exactos; las celdas vecinas son los aciertos con tolerancia ordinal. Haz clic
            en una celda para ver su detalle.
          </p>
        </Card>

        <Card title="Métricas por clase">
          <div className={styles.tablaWrap}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th>Clase</th>
                  <th>Precisión</th>
                  <th>Recall</th>
                  <th>F1</th>
                  <th>Soporte</th>
                </tr>
              </thead>
              <tbody>
                {evaluacion.per_class.map((clase) => (
                  <tr key={clase.label}>
                    <th scope="row">{ETIQUETAS[clase.label]}</th>
                    <td>{porcentaje(clase.precision)}</td>
                    <td>{porcentaje(clase.recall)}</td>
                    <td>{porcentaje(clase.f1)}</td>
                    <td>{clase.support.toLocaleString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.nota}>
            Las clases están balanceadas: cada una aporta aproximadamente 25 % del conjunto
            evaluado.
          </p>
        </Card>
      </div>

      <div className={styles.grid}>
        <Card title="Curvas ROC (one-vs-rest)">
          <RocChart roc={evaluacion.roc} />
          <p className={styles.nota}>
            AUC por clase. Un valor cercano a 1 indica buena separación frente al resto.
          </p>
        </Card>

        <Card title="Importancia de variables">
          <div className={styles.barras}>
            {evaluacion.feature_importance.map((variable) => (
              <div className={styles.barraRow} key={variable.feature}>
                <div className={styles.barraLabel}>
                  <span>{variable.feature}</span>
                  <strong>{variable.importance.toLocaleString('en-GB')}</strong>
                </div>
                <div className={styles.track}>
                  <div
                    className={styles.fill}
                    style={{ width: `${(variable.importance / maxImportancia) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className={styles.nota}>
            Importancia de uso del modelo LightGBM. La distancia al vecino y la ubicación son las
            señales más fuertes.
          </p>
        </Card>
      </div>

      <Card title="Comparación de los cuatro modelos">
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Accuracy</th>
                <th>F1 macro</th>
                <th>Adyacente</th>
                <th>QWK</th>
                <th>MAE ordinal</th>
              </tr>
            </thead>
            <tbody>
              {evaluacion.model_comparison.map((modeloComparado) => (
                <tr
                  key={modeloComparado.model}
                  className={modeloComparado.accuracy === mejorAccuracy ? styles.mejor : undefined}
                >
                  <th scope="row">{modeloComparado.model}</th>
                  <td>{porcentaje(modeloComparado.accuracy)}</td>
                  <td>{porcentaje(modeloComparado.f1_macro)}</td>
                  <td>{porcentaje(modeloComparado.accuracy_adjacent)}</td>
                  <td>{modeloComparado.qwk.toFixed(3)}</td>
                  <td>{modeloComparado.mae_ordinal.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.nota}>
          LightGBM extendido obtiene el mejor resultado. Las diferencias con XGBoost y Random Forest
          son pequeñas; el ordinal logístico queda por detrás en accuracy exacta.
        </p>
      </Card>

      <Card title="Interpretación de las métricas">
        <p className={styles.texto}>
          <strong>Accuracy exacta:</strong> {evaluacion.metric_notes.accuracy_exact}
        </p>
        <p className={styles.texto}>
          <strong>Accuracy adyacente:</strong> {evaluacion.metric_notes.accuracy_adjacent}
        </p>
        <p className={styles.texto}>
          <strong>QWK:</strong> {evaluacion.metric_notes.qwk}
        </p>
      </Card>

      <Card title="Limitaciones y uso previsto">
        <ul className={styles.limitaciones}>
          {evaluacion.limitations.map((limitacion) => (
            <li key={limitacion}>{limitacion}</li>
          ))}
        </ul>
        <p className={styles.nota}>
          Uso recomendado: segmentar alojamientos y priorizar análisis comercial.
        </p>
      </Card>

      <div className={styles.acciones}>
        <Link to="/lote" className={styles.enlace}>
          Probar predicción por lote →
        </Link>
      </div>
    </div>
  )
}
