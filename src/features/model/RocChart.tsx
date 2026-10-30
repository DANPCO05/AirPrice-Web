import type { RocData } from './types'
import styles from '@/pages/Model.module.css'

const COLORES: Record<string, string> = {
  ECONOMICO: '#24a66a',
  MEDIO: '#2176ff',
  ALTO: '#f6a21a',
  PREMIUM: '#8d62e9',
}

export default function RocChart({ roc }: { roc: RocData }) {
  return (
    <div className={styles.rocWrap}>
      <svg className={styles.rocSvg} viewBox="-10 -4 120 116" role="img" aria-label="Curvas ROC">
        {[0, 25, 50, 75, 100].map((valor) => (
          <g key={valor}>
            <line x1={valor} y1={0} x2={valor} y2={100} stroke="#e4edf6" strokeWidth={0.5} />
            <line x1={0} y1={valor} x2={100} y2={valor} stroke="#e4edf6" strokeWidth={0.5} />
          </g>
        ))}
        <line
          x1={0}
          y1={100}
          x2={100}
          y2={0}
          stroke="#b9c8d9"
          strokeDasharray="2 2"
          strokeWidth={0.7}
        />
        {roc.labels.map((label) => {
          const fpr = roc.fpr[label] ?? []
          const tpr = roc.tpr[label] ?? []
          const puntos = fpr
            .map((x, indice) => `${x * 100},${100 - (tpr[indice] ?? 0) * 100}`)
            .join(' ')
          return (
            <polyline
              key={label}
              points={puntos}
              fill="none"
              stroke={COLORES[label] ?? '#2176ff'}
              strokeWidth={1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
        <text x={50} y={110} textAnchor="middle" fontSize={4.5} fill="#6e7d93">
          Tasa de falsos positivos
        </text>
        <text
          x={-5}
          y={50}
          textAnchor="middle"
          fontSize={4.5}
          fill="#6e7d93"
          transform="rotate(-90 -5 50)"
        >
          Tasa de verdaderos positivos
        </text>
      </svg>

      <ul className={styles.rocLegend}>
        {roc.labels.map((label) => (
          <li key={label}>
            <span className={styles.punto} style={{ background: COLORES[label] }} />
            {label}
            <strong>{roc.auc[label]?.toFixed(2) ?? '—'}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
