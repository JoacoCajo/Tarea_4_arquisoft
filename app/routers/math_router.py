
from fastapi import HTTPException, BackgroundTasks, APIRouter

from app.schemas.math_schemas import MathQuery, MathResult, MathSolution

from app.services.basic_services import calculadora

from app.services.derivative_services import derivadas

from app.services.integrate_services import integrate_expression

from app.services.event_services import evento


router = APIRouter()








@router.post("/solve/", response_model=MathSolution)
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
    
@router.post("/integrate/", response_model=MathResult)
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
    
@router.post("/differentiate/", response_model=MathResult)
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