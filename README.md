Microservicio "Servicio de chatbot de cálculo" para la asignatura Arquitectura de computadores INF-326
Profesor: Rafik Mas''Ad Nasra
Nombres: Joaquin Viveros, Jorge Aceval

Roles: 202273586-4 y 202273513-9 respectivamente

Instrucciones de ejecución (Entrega 1):
1. Iniciar un virtual environment que contenga las siguientes librerias: pika, fastapi,pydantic,sympy, ASGI uvicorn

2. En el ambiente virtual, ejecutamos el siguiente comando para correr el microservicio: 
      uvicorn main:app --reload --port 8003

Instrucciones de ejecución (entrega 2):

1. Desde la carpeta "Tarea_4_arquisoft"
# Construir la imagen (API y Consumer)
docker build -t <usuario-dockerhub>/calculadora:1.0 .

# Subir la imagen al registry
docker push <usuario-dockerhub>/calculadora:1.0

2. Desde la carpeta del proyecto

kubectl apply -f k8s/

kubectl get svc api (para ver el puerto usado por NodePort (URL pública))

3. entrar a http://localhost:<Puerto-usado>/docs, en caso de que no funcione es posible usar: 
kubectl port-forward --address 0.0.0.0 svc/api 8003:8000 (para testing)

para después ingresar a http://localhost:8003/docs