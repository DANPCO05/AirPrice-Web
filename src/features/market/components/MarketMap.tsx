import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet'
import Card from '@/components/Card'
import { CENTRO_LONDRES } from '@/features/prediction/opciones'
import type { PuntoMercado } from '../types'
import styles from '@/pages/Market.module.css'

const moneda = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
export default function MarketMap({ listings }: { listings: PuntoMercado[] }) {
  const puntos = listings.filter(x => Number.isFinite(x.latitude) && Number.isFinite(x.longitude))
  return <Card title="Mapa del mercado · Londres">
    <p className={styles.secondary}>Muestra geográfica de alojamientos. Los puntos no representan la totalidad del mercado.</p>
    <div className={styles.map}>
      <MapContainer center={[CENTRO_LONDRES.lat, CENTRO_LONDRES.lng]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {puntos.map(p => <CircleMarker key={p.id} center={[p.latitude, p.longitude]} radius={6} pathOptions={{ color: '#2176ff', fillColor: '#2176ff', fillOpacity: .6 }}>
          <Popup><strong>{p.neighbourhood}</strong><div>{p.room_type}</div><div>{moneda.format(p.price)} / noche</div></Popup>
        </CircleMarker>)}
      </MapContainer>
    </div>
    {puntos.length === 0 && <p className={styles.secondary}>Todavía no se han cargado puntos de alojamientos.</p>}
  </Card>
}
