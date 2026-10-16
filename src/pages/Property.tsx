import { useState } from 'react'
import Card from '@/components/Card'
import Counter from '@/components/Counter'
import Input from '@/components/Input'
import Select from '@/components/Select'
import { TIPOS_ALOJAMIENTO, TIPOS_PROPIEDAD } from '@/features/prediction/opciones'

// Vista previa de los componentes. Se reemplaza por el formulario con react-hook-form + zod.
export default function Property() {
  const [huespedes, setHuespedes] = useState(2)

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 640 }}>
      <h1>Características</h1>
      <Card title="🏠 Propiedad">
        <div style={{ display: 'grid', gap: 14 }}>
          <Select
            label="Tipo de propiedad"
            options={TIPOS_PROPIEDAD}
            placeholder="Selecciona una opción"
          />
          <Select label="Tipo de alojamiento" options={TIPOS_ALOJAMIENTO} />
          <Counter label="Huéspedes" value={huespedes} onChange={setHuespedes} min={1} max={16} />
          <Input label="Habitaciones" type="number" min={0} max={20} defaultValue={1} />
          <Input
            label="Camas"
            type="number"
            hint="Número total de camas"
            min={0}
            defaultValue={-1}
            error="Debe ser 0 o más"
          />
        </div>
      </Card>
    </div>
  )
}
