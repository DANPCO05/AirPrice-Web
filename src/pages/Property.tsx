import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Counter from '@/components/Counter'
import Input from '@/components/Input'
import Select from '@/components/Select'
import {
  esquemaPropiedad,
  sugerirTipoAlojamiento,
  VALORES_INICIALES,
  type FormularioPropiedad,
} from '@/features/prediction/esquemaPropiedad'
import {
  OPCIONES_SUPERHOST,
  SERVICIOS,
  TIPOS_ALOJAMIENTO,
  TIPOS_PROPIEDAD,
} from '@/features/prediction/opciones'
import { usePrediccion } from '@/features/prediction/prediccionContext'
import styles from './Property.module.css'

// Campo numérico opcional: vacío = undefined (la API usará su valor por defecto).
const numeroOpcional = (valor: string) => (valor === '' ? undefined : Number(valor))

const SERVICIOS_COMUNES = SERVICIOS.filter((s) => 'comun' in s && s.comun)
const SERVICIOS_EXTRA = SERVICIOS.filter((s) => !('comun' in s && s.comun))

export default function Property() {
  const navigate = useNavigate()
  const { ubicacion, propiedad, guardarPropiedad } = usePrediccion()

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormularioPropiedad>({
    resolver: zodResolver(esquemaPropiedad),
    defaultValues: (propiedad as Partial<FormularioPropiedad> | null) ?? VALORES_INICIALES,
  })

  if (!ubicacion) {
    return (
      <Card title="Primero indica la ubicación">
        <p className={styles.subtitulo}>
          Para clasificar el alojamiento necesitamos saber dónde está.{' '}
          <Link to="/ubicacion">Ir a ubicación →</Link>
        </p>
      </Card>
    )
  }

  const enviar = (datos: FormularioPropiedad) => {
    guardarPropiedad(datos)
    navigate('/resultado')
  }

  const renderServicio = (s: (typeof SERVICIOS)[number]) => (
    <label key={s.value} className={styles.servicio}>
      <input type="checkbox" value={s.value} {...register('amenities')} />
      {s.label}
    </label>
  )

  return (
    <form className={styles.pagina} onSubmit={handleSubmit(enviar)} noValidate>
      <header>
        <h1>Características del alojamiento</h1>
        <p className={styles.resumen}>
          📍 {ubicacion.neighbourhood_cleansed} · <Link to="/ubicacion">Cambiar ubicación</Link>
        </p>
      </header>

      <Card title="🏠 Propiedad">
        <div className={styles.grid2}>
          <Select
            label="Tipo de propiedad"
            options={TIPOS_PROPIEDAD}
            placeholder="Selecciona una opción"
            error={errors.property_type?.message}
            {...register('property_type', {
              onChange: (e) => {
                const sugerido = sugerirTipoAlojamiento(e.target.value)
                if (sugerido) setValue('room_type', sugerido, { shouldValidate: true })
              },
            })}
          />
          <Select
            label="Tipo de alojamiento"
            options={TIPOS_ALOJAMIENTO}
            placeholder="Selecciona una opción"
            hint="Se completa solo según el tipo de propiedad."
            error={errors.room_type?.message}
            {...register('room_type')}
          />
        </div>
      </Card>

      <Card title="🛏️ Capacidad y estancia">
        <div className={styles.campos}>
          <Controller
            control={control}
            name="accommodates"
            render={({ field }) => (
              <Counter
                label="Huéspedes"
                value={field.value}
                onChange={field.onChange}
                min={1}
                max={16}
              />
            )}
          />
          <div className={styles.grid3}>
            <Input
              label="Habitaciones"
              type="number"
              min={0}
              max={20}
              error={errors.bedrooms?.message}
              {...register('bedrooms', { valueAsNumber: true })}
            />
            <Input
              label="Camas"
              type="number"
              min={0}
              max={30}
              error={errors.beds?.message}
              {...register('beds', { valueAsNumber: true })}
            />
            <Input
              label="Baños"
              type="number"
              min={0}
              max={20}
              step={0.5}
              hint="Usa 0,5 para medio baño."
              error={errors.bathrooms_num?.message}
              {...register('bathrooms_num', { valueAsNumber: true })}
            />
          </div>
          <div className={styles.grid2}>
            <Input
              label="Noches mínimas"
              type="number"
              min={1}
              max={365}
              error={errors.minimum_nights?.message}
              {...register('minimum_nights', { valueAsNumber: true })}
            />
            {/* Controlado: registrado sin Controller, el navegador ignora el valor inicial y pone el punto medio. */}
            <Controller
              control={control}
              name="availability_365"
              render={({ field }) => (
                <div className={styles.rango}>
                  <label htmlFor="availability_365">
                    Disponibilidad anual <span>{field.value} días</span>
                  </label>
                  <input
                    id="availability_365"
                    type="range"
                    min={0}
                    max={365}
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    onBlur={field.onBlur}
                  />
                </div>
              )}
            />
          </div>
        </div>
      </Card>

      <Card title="✨ Servicios">
        <fieldset className={styles.servicios} aria-label="Servicios del alojamiento">
          {SERVICIOS_COMUNES.map(renderServicio)}
        </fieldset>
        <details className={styles.mas}>
          <summary>Ver más servicios ({SERVICIOS_EXTRA.length})</summary>
          <div className={styles.servicios}>{SERVICIOS_EXTRA.map(renderServicio)}</div>
        </details>
      </Card>

      <Card title="⭐ Reseñas y anfitrión (opcional)">
        <p className={styles.nota}>
          Si tu anuncio es nuevo, deja estos campos vacíos. Si ya tiene reseñas, completarlos mejora
          la precisión de la clasificación.
        </p>
        <div className={styles.grid3}>
          <Input
            label="Número de reseñas"
            type="number"
            min={0}
            error={errors.number_of_reviews?.message}
            {...register('number_of_reviews', { setValueAs: numeroOpcional })}
          />
          <Input
            label="Valoración media"
            type="number"
            min={0}
            max={5}
            step={0.01}
            hint="De 0 a 5."
            error={errors.review_scores_rating?.message}
            {...register('review_scores_rating', { setValueAs: numeroOpcional })}
          />
          <Select
            label="¿Eres superhost?"
            options={OPCIONES_SUPERHOST}
            {...register('host_is_superhost')}
          />
        </div>
      </Card>

      <div className={styles.acciones}>
        <Link to="/ubicacion" className={styles.atras}>
          ← Atrás
        </Link>
        <Button type="submit">✦ Clasificar alojamiento</Button>
      </div>
    </form>
  )
}
