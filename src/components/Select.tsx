import { useId, type ComponentProps } from 'react'
import type { Opcion } from '@/features/prediction/opciones'
import styles from './Field.module.css'

interface SelectProps extends ComponentProps<'select'> {
  label: string
  options: readonly Opcion[]
  placeholder?: string
  hint?: string
  error?: string
}

// Muestra `label` de cada opción y envía su `value`.
// Funciona con react-hook-form: <Select label="Barrio" options={BARRIOS} {...register('neighbourhood_cleansed')} />
export default function Select({
  label,
  options,
  placeholder,
  hint,
  error,
  id,
  className,
  ...props
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  const hintId = `${selectId}-hint`
  const errorId = `${selectId}-error`

  return (
    <div className={styles.field}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <select
        id={selectId}
        className={[styles.control, error && styles.invalid, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      ) : (
        hint && (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        )
      )}
    </div>
  )
}
