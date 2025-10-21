import pytest #pip install pytest httpx
from fastapi.testclient import TestClient
from main import app 


client = TestClient(app)


def test_solve_ecuacion_lineal():

    response = client.post(
        "/solve/",
        json={"query": "2*x - 10"}
    )
    
    assert response.status_code == 200
    

    assert response.json() == {
        "query": "2*x - 10",
        "solution": [5.0]
    }

def test_solve_ecuacion_cuadratica():
    response = client.post(
        "/solve/",
        json={"query": "x**2 - 9"}
    )
    
    assert response.status_code == 200
    data = response.json() 
    
    
    assert data["query"] == "x**2 - 9"
    

    assert set(data["solution"]) == {-3.0, 3.0}

def test_peticion_invalida():
    
    response = client.post(
        "/solve/",
        json={"query": "hola esto no es una ecuacion"}
    )
    

    assert response.status_code == 400
    
    assert "Expresión matemática no válida" in response.json()["detail"]