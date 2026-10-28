import Card from '@/components/Card'
import type { ConteoClase } from '../types'
import styles from '@/pages/Market.module.css'

const CLASES = ['ECONOMICO', 'MEDIO', 'ALTO', 'PREMIUM'] as const
export default function ClassChart({ data }: { data: ConteoClase[] }) {
  const registros = CLASES.map(clase => ({ clase, count: data.find(x => x.clase === clase)?.count ?? 0 }))
  const total = registros.reduce((s, v) => s + v.count, 0)
  return <Card title="Distribución por clase de precio">
    {total === 0 ? <p className={styles.secondary}>No hay estadísticas de clases disponibles.</p> :
      <div className={styles.bars}>{registros.map(x => <div className={styles.barRow} key={x.clase}>
        <div className={styles.barLabel}><span>{x.clase}</span><strong>{x.count.toLocaleString('en-GB')}</strong></div>
        <div className={styles.track} role="img" aria-label={`${x.clase}: ${x.count} alojamientos`}>
          <div className={styles.fill} style={{ width: `${(x.count / total) * 100}%` }} />
        </div>
      </div>)}</div>}
  </Card>
}
