import pika
import os
rabbit_host = os.getenv('RABBITMQ_HOST', 'localhost')

#Lógica de evento! (productor)
def evento (query: str, solution: list):
    try: 
        #inicialización
        connection = pika.BlockingConnection(pika.ConnectionParameters(host= rabbit_host))
        
        channel = connection.channel()

        #Creación de la cola
        channel.exchange_declare(exchange='eventos', exchange_type='fanout')

        message = f"query: {query}, solution: {solution}"

        #Publicación del mensaje
        channel.basic_publish(exchange='eventos', routing_key='', body=message)
        print(f" [x] Evento enviado: {message}")
        connection.close()
    except Exception:
        #En caso de que RabbitMQ no acepte nuestro mensaje, no provoque una caida global
        print (f"Error 77 {Exception}")

