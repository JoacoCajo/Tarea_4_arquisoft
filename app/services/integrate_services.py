
from sympy import sympify,symbols
from sympy.core.sympify import SympifyError





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
