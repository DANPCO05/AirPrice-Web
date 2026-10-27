import type { ComponentProps } from 'react'
import styles from './Card.module.css'

interface CardProps extends ComponentProps<'section'> {
  title?: string
}

export default function Card({ title, className, children, ...props }: CardProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')} {...props}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {children}
    </section>
  )
}
