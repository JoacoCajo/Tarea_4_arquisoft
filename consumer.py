import pika
import os

def callback(ch, method, properties, body):
    print (f" evento recibido: {body.decode()}")

def start_consumer ():
    rabbit_host = os.getenv("RABBITMQ_HOST", "localhost")
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbit_host))

    channel = connection.channel()

    channel.exchange_declare(exchange="eventos", exchange_type="fanout")

    result= channel.queue_declare(queue="", exclusive=True)
    queue_name = result.method.queue

    channel.queue_bind(exchange="eventos", queue=queue_name)


    print("Esperando...")

    channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

    channel.start_consuming()

    if __name__ == "__main__":
        start_consumer 