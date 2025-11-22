
from pydantic import BaseModel





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
