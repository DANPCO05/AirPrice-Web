// CSV de ejemplo para probar la carga y la limpieza sin depender de un archivo externo.
// Incluye casos válidos y errores típicos: precio vacío, ID duplicado, outlier,
// coordenadas fuera de Londres y capacidad inválida.

export const CSV_EJEMPLO = `id,price,latitude,longitude,accommodates,room_type,property_type,neighbourhood_cleansed,bedrooms,beds,bathrooms_num,minimum_nights,availability_365,number_of_reviews,reviews_per_month,review_scores_rating,host_is_superhost,host_identity_verified,instant_bookable,amenities,amenities_count,host_response_rate_num,host_acceptance_rate_num
11551,$120.00,51.46095,-0.11758,2,Entire home/apt,Entire rental unit,Lambeth,1,1,1,2,330,196,0.99,4.55,t,t,UNKNOWN,wifi;kitchen;heating,43,100,95
13913,$95.50,51.56861,-0.11270,1,Private room,Private room in rental unit,Islington,1,1,1,1,351,57,0.30,4.86,f,t,UNKNOWN,wifi;kitchen,44,100,90
13913,$150.00,51.56861,-0.11270,1,Private room,Private room in rental unit,Islington,1,1,1,1,351,57,0.30,4.86,f,t,UNKNOWN,wifi;kitchen,44,100,90
20001,,51.50740,-0.12780,2,Entire home/apt,Entire rental unit,Westminster,1,1,1,2,180,20,0.50,4.70,t,t,UNKNOWN,wifi;heating,20,100,100
20002,$5000.00,51.50740,-0.12780,2,Entire home/apt,Entire rental unit,Westminster,1,1,1,2,180,20,0.50,4.70,t,t,UNKNOWN,wifi;heating,20,100,100
20003,$180.00,10.00000,-0.12780,2,Entire home/apt,Entire rental unit,Westminster,1,1,1,2,180,20,0.50,4.70,t,t,UNKNOWN,wifi;heating,20,100,100
20004,$180.00,51.50740,-0.12780,0,Entire home/apt,Entire rental unit,Westminster,1,1,1,2,180,20,0.50,4.70,t,t,UNKNOWN,wifi;heating,20,100,100
20005,$350.00,51.53800,-0.14260,4,Entire home/apt,Entire condo,Camden,2,2,2,3,220,80,1.20,4.90,t,t,UNKNOWN,wifi;kitchen;balcony;gym,60,100,100
20006,$75.00,51.51400,-0.09100,1,Shared room,Private room in home,City of London,1,1,1,1,300,10,0.20,4.50,f,f,UNKNOWN,wifi,10,100,80
20007,$210.00,51.48740,-0.08030,3,Entire home/apt,Entire townhouse,Southwark,2,3,2,2,200,120,1.80,4.75,t,t,t,wifi;kitchen;garden;parking,50,100,100
`
