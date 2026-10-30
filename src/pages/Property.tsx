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
  OPCIONES_IDENTIDAD,
  OPCIONES_SUPERHOST,
  SERVICIOS,
  TIPOS_ALOJAMIENTO,
  TIPOS_PROPIEDAD,
} from '@/features/prediction/opciones'
import { usePrediccion } from '@/features/prediction/prediccionContext'
import styles from './Property.module.css'

// Campo numérico opcional: vacío = undefined (se usará un valor de referencia).
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

      <Card title="⚙️ Opciones avanzadas (opcional)">
        <p className={styles.nota}>
          Estos campos mejoran la precisión del modelo, pero no son obligatorios. Si no los conoces,
          déjalos vacíos: se usarán valores de referencia.
        </p>
        <details className={styles.mas}>
          <summary>Mostrar campos avanzados</summary>
          <div className={styles.campos}>
            <div className={styles.grid3}>
              <Input
                label="Noches máximas"
                type="number"
                min={1}
                max={2000}
                error={errors.maximum_nights?.message}
                {...register('maximum_nights', { setValueAs: numeroOpcional })}
              />
              <Input
                label="Anuncios del anfitrión"
                type="number"
                min={0}
                max={1000}
                error={errors.host_listings_count?.message}
                {...register('host_listings_count', { setValueAs: numeroOpcional })}
              />
              <Input
                label="Anuncios calculados"
                type="number"
                min={0}
                max={1000}
                error={errors.calculated_host_listings_count?.message}
                {...register('calculated_host_listings_count', { setValueAs: numeroOpcional })}
              />
            </div>

            <div className={styles.grid3}>
              <Input
                label="Disponibilidad 30 días"
                type="number"
                min={0}
                max={30}
                error={errors.availability_30?.message}
                {...register('availability_30', { setValueAs: numeroOpcional })}
              />
              <Input
                label="Disponibilidad 60 días"
                type="number"
                min={0}
                max={60}
                error={errors.availability_60?.message}
                {...register('availability_60', { setValueAs: numeroOpcional })}
              />
              <Input
                label="Disponibilidad 90 días"
                type="number"
                min={0}
                max={90}
                error={errors.availability_90?.message}
                {...register('availability_90', { setValueAs: numeroOpcional })}
              />
            </div>

            <div className={styles.grid3}>
              <Input
                label="Reseñas últimos 12 meses"
                type="number"
                min={0}
                max={10000}
                error={errors.number_of_reviews_ltm?.message}
                {...register('number_of_reviews_ltm', { setValueAs: numeroOpcional })}
              />
              <Input
                label="Reseñas últimos 30 días"
                type="number"
                min={0}
                max={10000}
                error={errors.number_of_reviews_l30d?.message}
                {...register('number_of_reviews_l30d', { setValueAs: numeroOpcional })}
              />
              <Input
                label="Reseñas último año"
                type="number"
                min={0}
                max={10000}
                error={errors.number_of_reviews_ly?.message}
                {...register('number_of_reviews_ly', { setValueAs: numeroOpcional })}
              />
            </div>

            <div className={styles.grid3}>
              <Input
                label="Reseñas por mes"
                type="number"
                min={0}
                max={100}
                step={0.01}
                error={errors.reviews_per_month?.message}
                {...register('reviews_per_month', { setValueAs: numeroOpcional })}
              />
              <Input
                label="Texto de baños"
                placeholder="Ej. 1 private bath"
                error={errors.bathrooms_text?.message}
                {...register('bathrooms_text', {
                  setValueAs: (valor: string | undefined) => valor?.trim() || undefined,
                })}
              />
              <Select
                label="Identidad verificada"
                options={OPCIONES_IDENTIDAD}
                error={errors.host_identity_verified?.message}
                {...register('host_identity_verified')}
              />
            </div>
          </div>
        </details>
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
