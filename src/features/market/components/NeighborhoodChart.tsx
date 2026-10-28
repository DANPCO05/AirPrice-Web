import Card from '@/components/Card'
import type { EstadisticaBarrio } from '../types'
import styles from '@/pages/Market.module.css'

const moneda = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})
export default function NeighborhoodChart({ data }: { data: EstadisticaBarrio[] }) {
  const barrios = [...data].sort((a, b) => b.average_price - a.average_price).slice(0, 10)
  const maximo = Math.max(1, ...barrios.map((x) => x.average_price))
  return (
    <Card title="Precio medio por barrio · Top 10">
      {barrios.length === 0 ? (
        <p className={styles.secondary}>No hay estadísticas de barrios disponibles.</p>
      ) : (
        <div className={styles.bars}>
          {barrios.map((x) => (
            <div className={styles.barRow} key={x.neighbourhood}>
              <div className={styles.barLabel}>
                <span>{x.neighbourhood}</span>
                <strong>{moneda.format(x.average_price)}</strong>
              </div>
              <div
                className={styles.track}
                role="img"
                aria-label={`${x.neighbourhood}: ${moneda.format(x.average_price)} de precio medio`}
              >
                <div
                  className={`${styles.fill} ${styles.fillBlue}`}
                  style={{ width: `${Math.max(0, (x.average_price / maximo) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
