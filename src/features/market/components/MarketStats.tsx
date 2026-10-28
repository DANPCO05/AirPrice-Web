import Card from '@/components/Card'
import type { EstadisticasMercado } from '../types'
import styles from '@/pages/Market.module.css'

const moneda = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

export default function MarketStats({ data }: { data: EstadisticasMercado }) {
  const masOferta = [...data.by_neighbourhood].sort((a, b) => b.count - a.count)[0]
  const masClase = [...data.by_class].sort((a, b) => b.count - a.count)[0]
  const tarjetas = [
    { nombre: 'Alojamientos', valor: data.total_listings.toLocaleString('en-GB') },
    {
      nombre: 'Precio promedio',
      valor: data.average_price === null ? 'Sin datos' : moneda.format(data.average_price),
    },
    { nombre: 'Barrio con más oferta', valor: masOferta?.neighbourhood ?? 'Sin datos' },
    { nombre: 'Clase predominante', valor: masClase?.clase ?? 'Sin datos' },
  ]
  return (
    <div className={styles.stats}>
      {tarjetas.map((t) => (
        <Card key={t.nombre}>
          <p className={styles.secondary}>{t.nombre}</p>
          <p className={styles.metric}>{t.valor}</p>
        </Card>
      ))}
    </div>
  )
}
