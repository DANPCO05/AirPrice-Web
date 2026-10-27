import { useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import Select from '@/components/Select'
import MapaUbicacion from '@/features/prediction/MapaUbicacion'
import { BARRIOS, CENTRO_LONDRES, type NombreBarrio } from '@/features/prediction/opciones'
import { barrioMasCercano, estaEnLondres, type Punto } from '@/features/prediction/ubicacion'
import styles from './Location.module.css'

export default function Location() {
  const navigate = useNavigate()
  const [punto, setPunto] = useState<Punto | null>(null)
  const [barrio, setBarrio] = useState<NombreBarrio | ''>('')
  const [centro, setCentro] = useState<Punto>(CENTRO_LONDRES)
  const [error, setError] = useState<string>()

  const seleccionarPunto = (nuevo: Punto) => {
    if (!estaEnLondres(nuevo)) {
      setError('Ese punto está fuera de la zona que conoce el modelo. Elige uno dentro de Londres.')
      return
    }
    setError(undefined)
    setPunto(nuevo)
    setBarrio(barrioMasCercano(nuevo).value)
  }

  const seleccionarBarrio = (e: ChangeEvent<HTMLSelectElement>) => {
    const elegido = BARRIOS.find((b) => b.value === e.target.value)
    setBarrio(elegido?.value ?? '')
    if (elegido) setCentro({ lat: elegido.lat, lng: elegido.lng })
  }

  const continuar = () => {
    if (!punto || !barrio) {
      setError('Marca en el mapa dónde está el alojamiento.')
      return
    }
    // TODO: guardar { latitude, longitude, neighbourhood_cleansed } en el Context del formulario (paso 2).
    navigate('/propiedad')
  }

  return (
    <div className={styles.pagina}>
      <header>
        <h1>¿Dónde está el alojamiento?</h1>
        <p className={styles.subtitulo}>
          Haz clic en el mapa para marcar la ubicación. Te sugerimos el barrio según el punto.
        </p>
      </header>

      <div className={styles.contenido}>
        <Card title="📍 Ubicación">
          <div className={styles.campos}>
            <Select
              label="Barrio"
              options={BARRIOS}
              placeholder="Selecciona un barrio"
              value={barrio}
              onChange={seleccionarBarrio}
              hint={punto ? 'Sugerido según el punto. Cámbialo si no es correcto.' : undefined}
            />
            <div className={styles.coordenadas}>
              <Input label="Latitud" value={punto ? punto.lat.toFixed(4) : ''} readOnly />
              <Input label="Longitud" value={punto ? punto.lng.toFixed(4) : ''} readOnly />
            </div>
            {error && (
              <p role="alert" style={{ color: 'var(--pink)', fontWeight: 600, fontSize: 13 }}>
                {error}
              </p>
            )}
          </div>
        </Card>

        <MapaUbicacion punto={punto} centro={centro} onSelect={seleccionarPunto} />
      </div>

      <div className={styles.acciones}>
        <Link to="/" className={styles.atras}>
          ← Atrás
        </Link>
        <Button onClick={continuar}>Continuar →</Button>
      </div>
    </div>
  )
}
