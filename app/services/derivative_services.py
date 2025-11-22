from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sympy import sympify, diff
from sympy.core.sympify import SympifyError


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
    