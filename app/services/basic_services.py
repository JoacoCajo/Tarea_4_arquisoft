
from sympy import solve, sympify
from sympy.core.sympify import SympifyError




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