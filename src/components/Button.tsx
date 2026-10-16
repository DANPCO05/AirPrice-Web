import type { ButtonHTMLAttributes } from 'react'

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        background: 'var(--blue)',
        color: 'white',
        border: 'none',
        borderRadius: 12,
        padding: '10px 20px',
        cursor: 'pointer',
        ...props.style,
      }}
    />
  )
}
