#Calculadora, resuelve ecuaciones, utilizaremos SymPy para esto.

#SymPy recibe un string y lo convierte en una expresión matematica para resolverla, y devuelve el resultado en una variable.


'''
pre: creamos un venv, en el instalamos la libreria fastapi, pydantic, sympy, pika (para la emisión de eventos)
1. Instalamos la libreria sympy y el ASGI uvicorn con el comando:
    pip install fastapi "uvicorn[standard]" sympy | sudo apt install uvicorn respectivamente
2. movemos el archivo main a .venv/bin
3. ejecutamos a través de la consola con el siguiente comando: 
    uvicorn main:app --reload --port 8003

POST: Nos dirigimos a test_main.py para hacer tests.

'''

import pika
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sympy import solve, sympify
from sympy.core.sympify import SympifyError
import os
rabbit_host = os.getenv('RABBITMQ_HOST', 'localhost')


#Lógica de evento!
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
        print (f"Error {Exception}")






'''
NOMBRE: Calculadora
RESUMEN: La función recibirá una ecuación, en forma de string, y encontrará la incognita, devuelta en forma de lista.
INPUT: string
OUTPUT: list

'''
def calculadora(query: str) -> list:
    try:
        expr = sympify(query) #Convierte el string en expresion matematica.
        variables = expr.free_symbols #Identifica variables
        
        if len(variables) == 0:
            #Caso en que no hayan variables (por ejemplo en una suma simple)
            return [expr.evalf()]

        solucion = solve(expr)
        return [float(s) if s.is_number else str(s) for s in solucion]
    
    #Manejo de errores
    except SympifyError:
        raise ValueError("Expresión no válida")
    
    except Exception:
        raise ValueError(f"Error, no se pudo resolver la ecuación {Exception}")
    



'''

Sección para configuración de la API.

'''
app= FastAPI(
    title="ChatBot de ayuda matematica",
    description= "Un chatbot que resuelve ecuaciones matematicas.",
    version="1.0.0"
)

#Esquema, para realizar posteriormente la validación de la estructura de la petición entrante.
class MathQuery(BaseModel):
    query: str

#Esquema, para la respuesta
class MathSolution(BaseModel):
    query: str
    solution: list


'''
Lógica de API, implementación del ENDPOINT
'''

@app.post("/api/v1/solve/", response_model=MathSolution)
async def api_solve_equation(request: MathQuery, background_tasks: BackgroundTasks):

    try:
        #Llama a la función creada anteriormente, con los datos contenidos en 'query'
        solution = calculadora(request.query)

        #Evento
        background_tasks.add_task(evento, request.query, solution)



        #construcción de la respuesta para el posterior envio al cliente en forma de JSON
        return MathSolution(query=request.query, solution=solution)
    

    #Manejo de errores
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")