import pytest
import httpx
import os
import pytest_asyncio

pytest_plugins = ('pytest_asyncio',)

BASE_URL = os.getenv("API_URL", "http://localhost:8002")



#PRUEBAS DE RESOLUCIÓN DE ECUACIONES, DERIVADAS E INTEGRALES
'''
DOS TIPOS DE PRUEBAS:
1. Pruebas de éxito: Verifican que la API resuelve correctamente ecuaciones
2. Pruebas de error: Verifican que la API maneja adecuadamente entradas inválidas
'''
#Primero, van las pruebas de ecuaciones.
@pytest_asyncio.fixture
async def client():
    """Cliente HTTP para conectarse al servicio desplegado"""
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        yield client

@pytest.mark.asyncio
async def test_ecuacion_lineal_true(client):
    
    response = await client.post(
        "/api/v1/solve/",
        json={"query": "2*x - 10"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "2*x - 10"
    assert "5" in str(data["solution"])

@pytest.mark.asyncio
async def test_ecuacion_cuadratica(client):
    response = await client.post(
        "/api/v1/solve/",
        json={"query": "x**2 - 9"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "x**2 - 9"
    solutions = [str(s) for s in data["solution"]]
    assert "-3" in str(solutions) and "3" in str(solutions)


@pytest.mark.asyncio
async def test_ecuacion_false(client):
    
    response = await client.post(
        "/api/v1/solve/",
        json={"query": "hola mundo"}
    )
    assert response.status_code == 400
    data = response.json()
    
    assert "Expresión no válida" in str(data["detail"])
    




#Pruebas de derivadas
@pytest.mark.asyncio
async def test_derivada_simple_true(client):
    response = await client.post(
        "/api/v1/differentiate/",
        json={"query": "3*x**2 + 2*x + 1"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "3*x**2 + 2*x + 1"
    assert "6*x + 2" in str(data["result"])

@pytest.mark.asyncio
async def test_derivada_simple_false(client):
    response = await client.post(
        "/api/v1/differentiate/",
        json={"query": "3**2 + "}
    )
    
    assert response.status_code == 400
    data = response.json()
    
    assert "Expresión no válida" in str(data["detail"])

#Pruebas de integrales
@pytest.mark.asyncio
async def test_integral_simple_true(client):
    response = await client.post(
        "/api/v1/integrate/",
        json={"query": "2*x"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "2*x"
    assert "x**2" in str(data["result"])

@pytest.mark.asyncio
async def test_integral_simple_false(client):
    response = await client.post(
        "/api/v1/integrate/",
        json={"query": "2*x + "}
    )
    
    assert response.status_code == 400
    data = response.json()
    
    assert "Expresión matemática no válida." in str(data["detail"])