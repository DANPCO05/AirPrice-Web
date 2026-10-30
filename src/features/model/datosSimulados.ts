import { CLASES, RANGOS } from '@/features/prediction/clases'
import type {
  EvaluationResponse,
  FeatureImportance,
  ModelComparison,
  PerClassMetric,
} from './types'

// Matriz de confusión simulada, coherente con las métricas del modelo real:
// accuracy exacta ~72,7 %, accuracy adyacente ~97,8 %, MAE ordinal ~0,30.
const MATRIZ = [
  [1680, 533, 77, 21],
  [570, 1680, 40, 20],
  [21, 570, 1680, 40],
  [21, 40, 570, 1680],
]

const TOTAL = MATRIZ.reduce((suma, fila) => suma + fila.reduce((s, v) => s + v, 0), 0)
const ACIERTOS = MATRIZ.reduce((suma, fila, i) => suma + fila[i], 0)

const POR_CLASE: PerClassMetric[] = CLASES.map((label, i) => {
  const verdaderosPositivos = MATRIZ[i][i]
  const falsosPositivos = MATRIZ.reduce((suma, fila, j) => (j === i ? suma : suma + fila[i]), 0)
  const falsosNegativos = MATRIZ[i].reduce((suma, valor, j) => (j === i ? suma : suma + valor), 0)
  const precision = verdaderosPositivos / (verdaderosPositivos + falsosPositivos)
  const recall = verdaderosPositivos / (verdaderosPositivos + falsosNegativos)
  const f1 = (2 * precision * recall) / (precision + recall)
  return {
    label,
    precision,
    recall,
    f1,
    support: MATRIZ[i].reduce((suma, valor) => suma + valor, 0),
  }
})

const EXACTITUD = ACIERTOS / TOTAL
const EXACTITUD_ADYACENTE =
  MATRIZ.reduce(
    (suma, fila, i) =>
      suma + fila.reduce((s, valor, j) => (Math.abs(i - j) <= 1 ? s + valor : s), 0),
    0,
  ) / TOTAL
const MAE_ORDINAL =
  MATRIZ.reduce(
    (suma, fila, i) => suma + fila.reduce((s, valor, j) => s + Math.abs(i - j) * valor, 0),
    0,
  ) / TOTAL
const F1_MACRO = POR_CLASE.reduce((suma, c) => suma + c.f1, 0) / POR_CLASE.length
const F1_WEIGHTED = POR_CLASE.reduce((suma, c) => suma + c.f1 * c.support, 0) / TOTAL
const BALANCED = POR_CLASE.reduce((suma, c) => suma + c.recall, 0) / POR_CLASE.length

const FPR = [0, 0.02, 0.05, 0.1, 0.2, 0.35, 0.5, 0.7, 1]

const ROC = {
  labels: [...CLASES],
  fpr: {
    ECONOMICO: FPR,
    MEDIO: FPR,
    ALTO: FPR,
    PREMIUM: FPR,
  },
  tpr: {
    ECONOMICO: [0, 0.35, 0.55, 0.72, 0.85, 0.92, 0.96, 0.99, 1],
    MEDIO: [0, 0.3, 0.5, 0.68, 0.82, 0.9, 0.95, 0.98, 1],
    ALTO: [0, 0.28, 0.47, 0.65, 0.8, 0.88, 0.94, 0.98, 1],
    PREMIUM: [0, 0.4, 0.6, 0.76, 0.88, 0.94, 0.97, 0.99, 1],
  },
  auc: {
    ECONOMICO: 0.93,
    MEDIO: 0.92,
    ALTO: 0.91,
    PREMIUM: 0.95,
  },
}

const IMPORTANCIA: FeatureImportance[] = [
  { rank: 1, feature: 'distancia_vecino_km', importance: 2692 },
  { rank: 2, feature: 'distancia_landmark_km', importance: 2559 },
  { rank: 3, feature: 'availability_365', importance: 2503 },
  { rank: 4, feature: 'latitude', importance: 2456 },
  { rank: 5, feature: 'distancia_hyde_park_km', importance: 2446 },
  { rank: 6, feature: 'amenities_count', importance: 2392 },
  { rank: 7, feature: 'availability_eoy', importance: 2371 },
  { rank: 8, feature: 'distancia_metro_km', importance: 2231 },
  { rank: 9, feature: 'distancia_min_poi_km', importance: 2217 },
  { rank: 10, feature: 'vecinos_1km', importance: 2183 },
  { rank: 11, feature: 'distancia_kings_cross_km', importance: 2137 },
  { rank: 12, feature: 'distancia_aeropuerto_km', importance: 2117 },
  { rank: 13, feature: 'distancia_centro_km', importance: 2075 },
  { rank: 14, feature: 'dias_desde_ultimo_review', importance: 2035 },
  { rank: 15, feature: 'minimum_nights_avg_ntm', importance: 1980 },
]

const COMPARACION: ModelComparison[] = [
  {
    model: 'lightgbm_ext',
    scenario: 'extendido',
    accuracy: 0.7297414259439576,
    balanced_accuracy: 0.7294381549725375,
    f1_macro: 0.7288117290128767,
    f1_weighted: 0.7290748197683603,
    accuracy_adjacent: 0.9783620036784594,
    mae_ordinal: 0.2955750297522449,
    qwk: 0.8593328822032051,
  },
  {
    model: 'xgboost_ext',
    scenario: 'extendido',
    accuracy: 0.7242237368819647,
    balanced_accuracy: 0.7239262544563793,
    f1_macro: 0.7239443961157994,
    f1_weighted: 0.7242064520494005,
    accuracy_adjacent: 0.9787947636048902,
    mae_ordinal: 0.300659958887807,
    qwk: 0.8568016700477864,
  },
  {
    model: 'random_forest_ext',
    scenario: 'extendido',
    accuracy: 0.7116736990154712,
    balanced_accuracy: 0.711359104809254,
    f1_macro: 0.7101390363174263,
    f1_weighted: 0.7103910255658701,
    accuracy_adjacent: 0.9713296548739587,
    mae_ordinal: 0.3231634750622092,
    qwk: 0.8393129027597827,
  },
  {
    model: 'ordinal_logistic_ext',
    scenario: 'extendido',
    accuracy: 0.6738072054527751,
    balanced_accuracy: 0.6735814219507457,
    f1_macro: 0.6767799450183634,
    f1_weighted: 0.6770495729824779,
    accuracy_adjacent: 0.9772801038623824,
    mae_ordinal: 0.35183382018825055,
    qwk: 0.8319650626627215,
  },
]

const LIMITACIONES = [
  'Accuracy exacta de 4 clases ~0.73; accuracy adyacente ~0.98.',
  'Las categorías se definieron a partir de rangos de precio.',
  'Algunos campos se completan con valores de referencia.',
  'El dataset no incluye imágenes ni texto de descripción.',
]

export const EVALUACION_SIMULADA: EvaluationResponse = {
  schema_version: '1.0',
  generated_at: '2026-10-30T00:00:00Z',
  model: {
    name: 'lightgbm_ext',
    version: '1.0.0',
    trained_at: '2026-10-24',
    classes: [...CLASES],
    n_features: 151,
    target: 'price_range',
    class_bounds: { ...RANGOS },
    metrics: {
      accuracy: EXACTITUD,
      balanced_accuracy: BALANCED,
      f1_macro: F1_MACRO,
      f1_weighted: F1_WEIGHTED,
      accuracy_adjacent: EXACTITUD_ADYACENTE,
      mae_ordinal: MAE_ORDINAL,
      qwk: 0.8593328822032051,
    },
    limitations: LIMITACIONES,
  },
  dataset: {
    target: 'price_range',
    split: '70/15/15',
    seed: 42,
    n_train: 43131,
    n_val: 9243,
    n_test: TOTAL,
  },
  metrics: {
    accuracy: EXACTITUD,
    balanced_accuracy: BALANCED,
    f1_macro: F1_MACRO,
    f1_weighted: F1_WEIGHTED,
    accuracy_adjacent: EXACTITUD_ADYACENTE,
    mae_ordinal: MAE_ORDINAL,
    qwk: 0.8593328822032051,
  },
  per_class: POR_CLASE,
  confusion_matrix: {
    labels: [...CLASES],
    matrix: MATRIZ,
  },
  roc: ROC,
  feature_importance: IMPORTANCIA,
  model_comparison: COMPARACION,
  metric_notes: {
    accuracy_exact: '72,97 % de acierto exacto en las 4 clases.',
    accuracy_adjacent:
      '97,84 % de acierto exacto o en la clase vecina (±1). Es la métrica principal del problema ordinal.',
    qwk: '0,859 de acuerdo ordinal (Quadratic Weighted Kappa).',
  },
  limitations: LIMITACIONES,
}
