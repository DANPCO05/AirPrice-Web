import styles from '@/pages/Market.module.css'
export default function MarketFilters({
  barrios,
  barrio,
  onBarrioChange,
}: {
  barrios: string[]
  barrio: string
  onBarrioChange: (v: string) => void
}) {
  return (
    <div className={styles.filters}>
      <label htmlFor="market-barrio">Filtrar muestra del mapa por barrio</label>
      <select id="market-barrio" value={barrio} onChange={(e) => onBarrioChange(e.target.value)}>
        <option value="">Todos los barrios</option>
        {barrios.map((nombre) => (
          <option key={nombre} value={nombre}>
            {nombre}
          </option>
        ))}
      </select>
    </div>
  )
}
