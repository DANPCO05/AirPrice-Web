import { useId, type ComponentProps } from 'react'
import styles from './Field.module.css'

interface InputProps extends ComponentProps<'input'> {
  label: string
  hint?: string
  error?: string
}

// Funciona con react-hook-form: <Input label="Camas" {...register('beds')} />
export default function Input({ label, hint, error, id, className, ...props }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`

  return (
    <div className={styles.field}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={[styles.control, error && styles.invalid, className].filter(Boolean).join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        {...props}
      />
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
