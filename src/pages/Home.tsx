import { Link } from 'react-router-dom'
import styles from './Home.module.css'

const beneficios = [
  {
    icono: '▤',
    titulo: 'Datos reales de Airbnb',
    detalle: 'Análisis de 61.617 alojamientos de Londres',
  },
  { icono: '✦', titulo: 'Machine Learning', detalle: 'Clasificación en cuatro rangos de precio' },
  { icono: '▥', titulo: 'Análisis de mercado', detalle: 'Explora precios y barrios de Londres' },
]

const cifras = [
  { valor: '61.617', titulo: 'Alojamientos analizados' },
  { valor: '32', titulo: 'Variables del dataset' },
  { valor: '4', titulo: 'Categorías de precio' },
  { valor: 'Londres', titulo: 'Ciudad de referencia' },
]

const herramientas = [
  {
    ruta: '/lote',
    icono: '▦',
    titulo: 'Predicción por lote',
    detalle: 'Sube un CSV, valida las filas y descarga las predicciones.',
  },
  {
    ruta: '/modelo',
    icono: '▤',
    titulo: 'Evaluación del modelo',
    detalle: 'Métricas, matriz de confusión, ROC e importancia de variables.',
  },
  {
    ruta: '/datos',
    icono: '⌁',
    titulo: 'Datos y limpieza',
    detalle: 'Carga datos crudos, revisa su estructura y limpia el dataset.',
  },
  {
    ruta: '/mercado',
    icono: '▥',
    titulo: 'Mercado de Londres',
    detalle: 'Explora precios, barrios y clases del mercado de Airbnb.',
  },
]

const pasos = [
  {
    numero: '1',
    titulo: 'Ingresar características',
    detalle: 'Selecciona la ubicación y describe el alojamiento.',
  },
  {
    numero: '2',
    titulo: 'Analizar con ML',
    detalle: 'El modelo analiza los atributos y estima el rango de precio.',
  },
  {
    numero: '3',
    titulo: 'Obtener clasificación',
    detalle: 'Consulta la categoría Económico, Medio, Alto o Premium.',
  },
  {
    numero: '4',
    titulo: 'Explorar el mercado',
    detalle: 'Compara las categorías y los barrios de Londres.',
  },
]

export default function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="titulo-inicio">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            ▥ Machine Learning para un mercado más transparente
          </span>
          <h1 id="titulo-inicio">
            Clasificación inteligente de alojamientos <span>Airbnb</span>
          </h1>
          <p>
            Utilizamos técnicas de Machine Learning para clasificar alojamientos en cuatro rangos de
            precio: Económico, Medio, Alto y Premium.
          </p>
          <div className={styles.actions}>
            <Link to="/ubicacion" className={styles.primary}>
              → Clasificar alojamiento
            </Link>
            <Link to="/mercado" className={styles.secondary}>
              ▥ Ver análisis del mercado
            </Link>
          </div>
        </div>
        <aside className={styles.floatingCard} aria-label="Ejemplo ilustrativo de alojamiento">
          <img
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
            alt="Interior de un apartamento moderno"
            loading="lazy"
          />
          <div className={styles.priceLine}>
            <div>
              <strong>
                Apartamento moderno
                <br />
                en Westminster
              </strong>
              <small>📍 Londres, Reino Unido</small>
            </div>
            <div className={styles.price}>£142</div>
          </div>
          <div className={styles.example}>Alojamiento de ejemplo en Londres</div>
        </aside>
      </section>

      <section className={styles.featureStrip} aria-label="Beneficios de AirPrice">
        {beneficios.map((item) => (
          <article className={styles.miniFeature} key={item.titulo}>
            <span className={styles.icon} aria-hidden="true">
              {item.icono}
            </span>
            <div>
              <strong>{item.titulo}</strong>
              <small>{item.detalle}</small>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.stats} aria-label="Datos del proyecto AirPrice">
        {cifras.map((item) => (
          <article className={styles.stat} key={item.titulo}>
            <strong>{item.valor}</strong>
            <small>{item.titulo}</small>
          </article>
        ))}
      </section>

      <section aria-labelledby="titulo-herramientas">
        <div className={styles.sectionHead}>
          <span>HERRAMIENTAS</span>
          <h2 id="titulo-herramientas">Todo el flujo, en un solo lugar</h2>
          <p>
            Clasificación individual, procesamiento por lote, evaluación del modelo y limpieza de
            datos.
          </p>
        </div>
        <div className={styles.tools}>
          {herramientas.map((herramienta) => (
            <Link to={herramienta.ruta} className={styles.toolCard} key={herramienta.ruta}>
              <span className={styles.toolIcon} aria-hidden="true">
                {herramienta.icono}
              </span>
              <strong>{herramienta.titulo}</strong>
              <small>{herramienta.detalle}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.process} aria-labelledby="titulo-proceso">
        <div className={styles.sectionHead}>
          <span>PROCESO</span>
          <h2 id="titulo-proceso">¿Cómo funciona AirPrice?</h2>
          <p>
            Conoce el recorrido desde las características del alojamiento hasta su clasificación de
            precio y el análisis del mercado.
          </p>
        </div>
        <div className={styles.steps}>
          {pasos.map((item) => (
            <article className={styles.step} key={item.numero}>
              <span className={styles.stepNum}>{item.numero}</span>
              <h3>{item.titulo}</h3>
              <p>{item.detalle}</p>
            </article>
          ))}
        </div>
        <p className={styles.footnote}>
          Clasifica un alojamiento, procesa varios desde un archivo o explora el mercado de Londres
          desde un mismo lugar.
        </p>
      </section>
    </div>
  )
}
