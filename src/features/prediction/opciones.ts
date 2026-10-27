// Opciones del formulario de predicción.
// `value` es el valor exacto del dataset (airprice_clean.csv del repo AirPrice): es lo que se envía a la API.
// `label` es el texto que ve el usuario.

export interface Opcion<T extends string = string> {
  value: T
  label: string
}

export const TIPOS_ALOJAMIENTO = [
  { value: 'Entire home/apt', label: 'Alojamiento completo' },
  { value: 'Private room', label: 'Habitación privada' },
  { value: 'Shared room', label: 'Habitación compartida' },
  { value: 'Hotel room', label: 'Habitación de hotel' },
] as const satisfies readonly Opcion[]

export type TipoAlojamiento = (typeof TIPOS_ALOJAMIENTO)[number]['value']

// Ordenados de más a menos frecuentes en el dataset.
// "OTHER" agrupa los tipos poco frecuentes que se juntaron en la limpieza.
export const TIPOS_PROPIEDAD = [
  { value: 'Entire rental unit', label: 'Apartamento completo' },
  { value: 'Private room in home', label: 'Habitación privada en casa' },
  { value: 'Private room in rental unit', label: 'Habitación privada en apartamento' },
  { value: 'Entire home', label: 'Casa completa' },
  { value: 'Entire condo', label: 'Condominio completo' },
  { value: 'Private room in condo', label: 'Habitación privada en condominio' },
  { value: 'Entire serviced apartment', label: 'Apartamento con servicios' },
  { value: 'Room in hotel', label: 'Habitación en hotel' },
  { value: 'Private room in townhouse', label: 'Habitación privada en casa adosada' },
  { value: 'Entire townhouse', label: 'Casa adosada completa' },
  { value: 'Private room in bed and breakfast', label: 'Habitación privada en B&B' },
  { value: 'Private room in guesthouse', label: 'Habitación privada en casa de huéspedes' },
  { value: 'Entire guesthouse', label: 'Casa de huéspedes completa' },
  { value: 'Entire loft', label: 'Loft completo' },
  { value: 'OTHER', label: 'Otro' },
] as const satisfies readonly Opcion[]

export type TipoPropiedad = (typeof TIPOS_PROPIEDAD)[number]['value']

export interface Barrio extends Opcion {
  // Centro aproximado (promedio de los alojamientos del barrio), para centrar el mapa.
  lat: number
  lng: number
}

// Los 33 barrios (boroughs) de Londres presentes en el dataset, en orden alfabético.
export const BARRIOS = [
  { value: 'Barking and Dagenham', label: 'Barking and Dagenham', lat: 51.5434, lng: 0.1238 },
  { value: 'Barnet', label: 'Barnet', lat: 51.5967, lng: -0.2073 },
  { value: 'Bexley', label: 'Bexley', lat: 51.4712, lng: 0.1398 },
  { value: 'Brent', label: 'Brent', lat: 51.55, lng: -0.2469 },
  { value: 'Bromley', label: 'Bromley', lat: 51.3996, lng: 0.0176 },
  { value: 'Camden', label: 'Camden', lat: 51.5342, lng: -0.1423 },
  { value: 'City of London', label: 'City of London', lat: 51.5143, lng: -0.091 },
  { value: 'Croydon', label: 'Croydon', lat: 51.3786, lng: -0.0939 },
  { value: 'Ealing', label: 'Ealing', lat: 51.5157, lng: -0.2974 },
  { value: 'Enfield', label: 'Enfield', lat: 51.6374, lng: -0.0852 },
  { value: 'Greenwich', label: 'Greenwich', lat: 51.4829, lng: 0.0469 },
  { value: 'Hackney', label: 'Hackney', lat: 51.5455, lng: -0.0691 },
  { value: 'Hammersmith and Fulham', label: 'Hammersmith and Fulham', lat: 51.4912, lng: -0.2147 },
  { value: 'Haringey', label: 'Haringey', lat: 51.5889, lng: -0.1008 },
  { value: 'Harrow', label: 'Harrow', lat: 51.5879, lng: -0.3358 },
  { value: 'Havering', label: 'Havering', lat: 51.5687, lng: 0.1966 },
  { value: 'Hillingdon', label: 'Hillingdon', lat: 51.529, lng: -0.4442 },
  { value: 'Hounslow', label: 'Hounslow', lat: 51.476, lng: -0.3351 },
  { value: 'Islington', label: 'Islington', lat: 51.5425, lng: -0.109 },
  { value: 'Kensington and Chelsea', label: 'Kensington and Chelsea', lat: 51.4986, lng: -0.1884 },
  { value: 'Kingston upon Thames', label: 'Kingston upon Thames', lat: 51.4026, lng: -0.2847 },
  { value: 'Lambeth', label: 'Lambeth', lat: 51.4674, lng: -0.1191 },
  { value: 'Lewisham', label: 'Lewisham', lat: 51.4566, lng: -0.0261 },
  { value: 'Merton', label: 'Merton', lat: 51.4143, lng: -0.1976 },
  { value: 'Newham', label: 'Newham', lat: 51.5257, lng: 0.0239 },
  { value: 'Redbridge', label: 'Redbridge', lat: 51.5749, lng: 0.0699 },
  { value: 'Richmond upon Thames', label: 'Richmond upon Thames', lat: 51.4548, lng: -0.3034 },
  { value: 'Southwark', label: 'Southwark', lat: 51.4874, lng: -0.0803 },
  { value: 'Sutton', label: 'Sutton', lat: 51.3657, lng: -0.1855 },
  { value: 'Tower Hamlets', label: 'Tower Hamlets', lat: 51.5162, lng: -0.0442 },
  { value: 'Waltham Forest', label: 'Waltham Forest', lat: 51.5782, lng: -0.0125 },
  { value: 'Wandsworth', label: 'Wandsworth', lat: 51.458, lng: -0.1761 },
  { value: 'Westminster', label: 'Westminster', lat: 51.514, lng: -0.1607 },
] as const satisfies readonly Barrio[]

export type NombreBarrio = (typeof BARRIOS)[number]['value']

// Centro inicial del mapa (Trafalgar Square).
export const CENTRO_LONDRES = { lat: 51.5074, lng: -0.1278 }

// Límites de las coordenadas del dataset. Un punto fuera de aquí está fuera de lo que el modelo conoce.
export const LIMITES_LONDRES = {
  latMin: 51.29,
  latMax: 51.69,
  lngMin: -0.5,
  lngMax: 0.28,
}

export interface Servicio extends Opcion {
  // Los comunes se muestran siempre; el resto, al pulsar "Ver más servicios".
  comun?: boolean
}

// Vocabulario de amenidades que acepta la API (GET /api/v1/schema → allowed_values.amenities).
export const SERVICIOS = [
  { value: 'wifi', label: 'Wi-Fi', comun: true },
  { value: 'kitchen', label: 'Cocina', comun: true },
  { value: 'heating', label: 'Calefacción', comun: true },
  { value: 'washer', label: 'Lavadora', comun: true },
  { value: 'air_conditioning', label: 'Aire acondicionado', comun: true },
  { value: 'tv', label: 'Televisión', comun: true },
  { value: 'workspace', label: 'Espacio de trabajo', comun: true },
  { value: 'free_parking', label: 'Parking gratuito', comun: true },
  { value: 'elevator', label: 'Ascensor', comun: true },
  { value: 'self_checkin', label: 'Llegada autónoma', comun: true },
  { value: 'dryer', label: 'Secadora', comun: true },
  { value: 'dishwasher', label: 'Lavavajillas', comun: true },
  { value: 'balcony', label: 'Balcón' },
  { value: 'bathtub', label: 'Bañera' },
  { value: 'bed_linens', label: 'Ropa de cama' },
  { value: 'breakfast', label: 'Desayuno' },
  { value: 'coffee_maker', label: 'Cafetera' },
  { value: 'concierge', label: 'Conserjería' },
  { value: 'crib', label: 'Cuna' },
  { value: 'doorman', label: 'Portero' },
  { value: 'essentials', label: 'Artículos básicos' },
  { value: 'events', label: 'Se permiten eventos' },
  { value: 'extra_pillows', label: 'Almohadas extra' },
  { value: 'fireplace', label: 'Chimenea' },
  { value: 'garden', label: 'Jardín' },
  { value: 'gym', label: 'Gimnasio' },
  { value: 'hair_dryer', label: 'Secador de pelo' },
  { value: 'hangers', label: 'Perchas' },
  { value: 'hot_tub', label: 'Jacuzzi' },
  { value: 'iron', label: 'Plancha' },
  { value: 'long_term', label: 'Estancias largas' },
  { value: 'microwave', label: 'Microondas' },
  { value: 'oven', label: 'Horno' },
  { value: 'parking', label: 'Parking (de pago)' },
  { value: 'patio', label: 'Patio' },
  { value: 'pets', label: 'Se admiten mascotas' },
  { value: 'pool', label: 'Piscina' },
  { value: 'private_entrance', label: 'Entrada privada' },
  { value: 'private_pool', label: 'Piscina privada' },
  { value: 'refrigerator', label: 'Nevera' },
  { value: 'rooftop', label: 'Azotea' },
  { value: 'sauna', label: 'Sauna' },
  { value: 'shampoo', label: 'Champú' },
  { value: 'shared_pool', label: 'Piscina compartida' },
  { value: 'smart_lock', label: 'Cerradura inteligente' },
  { value: 'smoking', label: 'Se permite fumar' },
  { value: 'stove', label: 'Fogón' },
  { value: 'view', label: 'Vistas' },
  { value: 'waterfront', label: 'Junto al agua' },
] as const satisfies readonly Servicio[]

export type CodigoServicio = (typeof SERVICIOS)[number]['value']

export const OPCIONES_SUPERHOST = [
  { value: 'UNKNOWN', label: 'No lo sé' },
  { value: 't', label: 'Sí' },
  { value: 'f', label: 'No' },
] as const satisfies readonly Opcion[]
