import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  PrediccionContext,
  type DatosPropiedad,
  type DatosUbicacion,
  type PrediccionContextValue,
} from './prediccionContext'

const CLAVE = 'airprice:prediccion'

interface Estado {
  ubicacion: DatosUbicacion | null
  propiedad: DatosPropiedad | null
}

const VACIO: Estado = { ubicacion: null, propiedad: null }

// sessionStorage conserva los datos si el usuario recarga la página, y se borra al cerrar la pestaña.
// Puede fallar (modo privado, almacenamiento bloqueado): en ese caso se sigue sin guardar.
function leerGuardado(): Estado {
  try {
    const texto = sessionStorage.getItem(CLAVE)
    return texto ? { ...VACIO, ...(JSON.parse(texto) as Estado) } : VACIO
  } catch {
    return VACIO
  }
}

export default function PrediccionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(leerGuardado)

  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      // Sin almacenamiento disponible: los datos viven solo en memoria.
    }
  }, [estado])

  const valor = useMemo<PrediccionContextValue>(
    () => ({
      ...estado,
      solicitud:
        estado.ubicacion && estado.propiedad ? { ...estado.ubicacion, ...estado.propiedad } : null,
      guardarUbicacion: (ubicacion) => setEstado((previo) => ({ ...previo, ubicacion })),
      guardarPropiedad: (propiedad) => setEstado((previo) => ({ ...previo, propiedad })),
      reiniciar: () => setEstado(VACIO),
    }),
    [estado],
  )

  return <PrediccionContext.Provider value={valor}>{children}</PrediccionContext.Provider>
}
