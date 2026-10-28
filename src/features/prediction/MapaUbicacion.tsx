import { useEffect } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import { CENTRO_LONDRES, LIMITES_LONDRES } from './opciones'
import type { Punto } from './ubicacion'
import styles from './MapaUbicacion.module.css'

const LIMITES: LatLngBoundsExpression = [
  [LIMITES_LONDRES.latMin, LIMITES_LONDRES.lngMin],
  [LIMITES_LONDRES.latMax, LIMITES_LONDRES.lngMax],
]

interface MapaUbicacionProps {
  // Punto marcado por el usuario (null si aún no hay ninguno).
  punto: Punto | null
  // Hacia dónde mover la vista, por ejemplo al elegir un barrio.
  centro: Punto
  onSelect: (punto: Punto) => void
}

export default function MapaUbicacion({ punto, centro, onSelect }: MapaUbicacionProps) {
  return (
    <MapContainer
      className={styles.mapa}
      center={[CENTRO_LONDRES.lat, CENTRO_LONDRES.lng]}
      zoom={11}
      minZoom={10}
      maxBounds={LIMITES}
      maxBoundsViscosity={1}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClicEnMapa onSelect={onSelect} />
      <Recentrar centro={centro} />
      {punto && (
        // CircleMarker no usa imágenes, así evitamos el problema del ícono por defecto de Leaflet con Vite.
        <CircleMarker
          center={[punto.lat, punto.lng]}
          radius={10}
          pathOptions={{ color: '#2176ff', fillColor: '#2176ff', fillOpacity: 0.5, weight: 3 }}
        />
      )}
    </MapContainer>
  )
}

function ClicEnMapa({ onSelect }: { onSelect: (punto: Punto) => void }) {
  useMapEvents({
    click: (e) => onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }),
  })
  return null
}

function Recentrar({ centro }: { centro: Punto }) {
  const map = useMap()
  useEffect(() => {
    // Al cargar se muestra todo Londres; solo se acerca cuando el centro cambia (al elegir un barrio).
    if (centro === CENTRO_LONDRES) return
    map.flyTo([centro.lat, centro.lng], Math.max(map.getZoom(), 13))
  }, [map, centro])
  return null
}
