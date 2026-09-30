# AirPrice Web

Interfaz web del proyecto **AirPrice**, un sistema inteligente para la clasificación del rango de precio de alojamientos Airbnb mediante técnicas de Machine Learning.

## Descripción

AirPrice Web permite ingresar las características de un alojamiento, como ubicación, capacidad, tipo de propiedad, habitaciones, baños, disponibilidad, servicios y valoraciones, para obtener una clasificación estimada dentro de uno de cuatro rangos:

- Económico
- Medio
- Alto
- Premium

## Funcionalidades actuales

- Página de inicio.
- Formulario de características del alojamiento.
- Mapa interactivo de Londres.
- Selección de ubicación y coordenadas.
- Visualización del resultado de clasificación.
- Nivel de confianza de la predicción.
- Variables que influyen en el resultado.
- Dashboard de análisis del dataset.

## Tecnologías

- HTML5
- CSS3
- JavaScript
- Leaflet
- OpenStreetMap

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
├── index.html
└── README.md
```

## Repositorio principal

El procesamiento de datos, análisis y modelos de Machine Learning se encuentran en:

https://github.com/DANPCO05/AirPrice

## Estado del proyecto

Actualmente el proyecto se encuentra en fase de **diseño y desarrollo del prototipo web**.

Las predicciones mostradas en la interfaz son demostrativas. Posteriormente se realizará la integración con el modelo de Machine Learning entrenado en AirPrice.