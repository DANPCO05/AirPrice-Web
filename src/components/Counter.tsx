import { useId } from 'react'
import styles from './Counter.module.css'

interface CounterProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

// Contador con botones − / +. Es controlado: con react-hook-form se usa dentro de <Controller />.
export default function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
}: CounterProps) {
  const labelId = useId()
  const change = (next: number) => onChange(Math.min(max, Math.max(min, next)))

  return (
    <div className={styles.field}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.counter} role="group" aria-labelledby={labelId}>
        <button
          type="button"
          className={styles.button}
          onClick={() => change(value - step)}
          disabled={value <= min}
          aria-label={`Disminuir ${label.toLowerCase()}`}
        >
          −
        </button>
        <output className={styles.value} aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          className={styles.button}
          onClick={() => change(value + step)}
          disabled={value >= max}
          aria-label={`Aumentar ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  )
}
