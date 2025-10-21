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
from sympy import solve, sympify, diff, integrate, symbols
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

def derivadas(query: str) -> str:
    try:
        expr = sympify(query) #Convierte el string en expresion matematica.
        variables = expr.free_symbols #Identifica variables
        
        if len(variables) == 0:
            #Caso derivada de una cte
            return 0
        var= list(variables)[0]
        derivate = diff(expr, var)
        return str(derivate)
    #Manejo de errores
    except SympifyError:
        raise ValueError ("Expresión no válida")
    except Exception:
        raise ValueError(f"error al integrarr {Exception}")
    
def integrate_expression(query: str) -> str:
    """
    Calcula la integral indefinida de una expresión.
    """
    try:
        expr = sympify(query)
        variables = expr.free_symbols
        
        if not variables:
            # Integral de una constante (ej. "5")
            var = symbols('x') # Asume 'x'
            # CORRECCIÓN: Usamos el método .integrate()
            integral = expr.integrate(var)
            return str(integral)
            
        # Integra con respecto a la primera variable que encuentre
        var = list(variables)[0] 
        # CORRECCIÓN: Usamos el método .integrate()
        integral = expr.integrate(var)
        
        return str(integral)
        
    except SympifyError:
        raise ValueError("Expresión matemática no válida.")
    except Exception as e:
        # Esto nos dará más detalles en la terminal si vuelve a fallar
        print(f"Error original de SymPy: {e}") 
        raise ValueError(f"Error al integrar: {str(e)}")


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

#Para las integrales y las derivadas (que tienen otro formato de respuesta)
class MathResult(BaseModel):
    query:str
    operation:str
    result:str


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
    
@app.post("/api/v1/integrate/", response_model=MathResult)
async def api_integrate(request: MathQuery, background_tasks: BackgroundTasks):
    """
    Endpoint de la API para calcular una integral indefinida.
    Emite un evento de la transacción en segundo plano.
    """
    try:
        # 1. Llama al "motor" de integrales
        result_str = integrate_expression(request.query)
        
        # 2. Emite el evento
        background_tasks.add_task(evento, request.query, result_str)
        
        # 3. Devuelve la respuesta
        return MathResult(query=request.query, operation="integral", result=result_str)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")
    
@app.post("/api/v1/differentiate/", response_model=MathResult)
async def api_derivadas(request: MathQuery, background_tasks: BackgroundTasks):
    """
    Endpoint de la API para calcular una derivada.
    Emite un evento de la transacción en segundo plano.
    """
    try:
        # 1. Llama al "motor" de derivadas
        result_str = derivadas(request.query)
        
        # 2. Emite el evento
        background_tasks.add_task(evento, request.query, result_str)
        
        # 3. Devuelve la respuesta
        return MathResult(query=request.query, operation="derivative", result=result_str)
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")