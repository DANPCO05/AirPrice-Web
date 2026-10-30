# AirPrice Web

Interfaz web del proyecto **AirPrice**, un sistema inteligente para la clasificación del rango de precio de alojamientos Airbnb mediante técnicas de Machine Learning.

## Descripción

AirPrice Web permite ingresar las características de un alojamiento, como ubicación, capacidad, tipo de propiedad, habitaciones, baños, disponibilidad, servicios y valoraciones, para obtener una clasificación estimada dentro de uno de cuatro rangos:

- Económico
- Medio
- Alto
- Premium

## Funcionalidades actuales

- Página de inicio con acceso a todas las herramientas.
- Formulario de ubicación con mapa interactivo de Londres.
- Formulario de características del alojamiento, con opciones avanzadas.
- **Predicción individual**: etiqueta, confianza, probabilidades y advertencias.
- Descarga del resultado individual en CSV y JSON.
- **Predicción por lote** desde un CSV: validación, vista previa, procesamiento por partes de 50, progreso y descarga de resultados.
- Plantilla CSV descargable.
- **Evaluación del modelo**: métricas, matriz de confusión, curvas ROC, importancia de variables y comparación de modelos.
- **Datos y limpieza**: carga de CSV, vista de datos crudos, limpieza y descarga del dataset limpio.
- Dashboard de mercado.
- Manejo de errores `422`, `429`, `503` y de red.

## Tecnologías

- React + TypeScript (Vite)
- React Router
- react-hook-form + zod
- Leaflet / react-leaflet + OpenStreetMap
- oxlint + Prettier

## Cómo ejecutar

Requiere Node.js 22.12 o superior y la API de AirPrice en marcha.

### 1. API

Desde el repositorio `AirPrice`:

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

La API tarda unos segundos en cargar el modelo. Verifica `http://localhost:8000/health`.

### 2. Frontend

```bash
npm install
cp .env.example .env   # en PowerShell: Copy-Item .env.example .env
npm run dev
```

La app queda en http://localhost:5173.

Si Vite usa otro puerto, añade ese origen a `AIRPRICE_ALLOWED_ORIGINS` en el `.env` raíz de `AirPrice` y reinicia la API.

| Script                 | Qué hace                         |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Servidor de desarrollo           |
| `npm run build`        | Compila para producción          |
| `npm run lint`         | Revisa el código con oxlint      |
| `npm run typecheck`    | Revisa los tipos de TypeScript   |
| `npm run format`       | Da formato al código (Prettier)  |
| `npm run format:check` | Comprueba el formato (lo usa CI) |

## Dataset

Se utiliza el dataset **Inside Airbnb – London, Detailed Listings**.

Después del proceso de limpieza:

- 61.617 registros
- 32 variables
- 0 registros duplicados
- 0 valores faltantes
- 4 categorías de precio

## Estructura

```text
AirPrice-Web/
├── src/
│   ├── api/          # cliente HTTP y llamadas a la API
│   ├── lib/          # utilidades CSV y descargas
│   ├── types/        # tipos del contrato con la API
│   ├── components/   # UI reutilizable
│   ├── features/     # prediction/, market/, model/ y data/
│   ├── pages/        # Home, Location, Property, Result, Market, Batch, Model, Data
│   └── styles/       # variables de color y tipografía
├── legacy/           # prototipo HTML original (referencia)
└── .github/workflows # CI: lint, typecheck, formato y build
```

## Repositorio principal

El procesamiento de datos, análisis y modelos de Machine Learning se encuentran en:

https://github.com/DANPCO05/AirPrice

## Alcance

La aplicación incluye clasificación individual y por lote, evaluación del modelo, limpieza de datos y análisis de mercado en una sola interfaz.
