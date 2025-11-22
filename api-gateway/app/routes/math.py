from ariadne import QueryType
import httpx

query = QueryType()

API_CALC = "http://api:8000"  # Service de tu FastAPI en el cluster

@query.field("resolverEcuacion")
async def resolver_ecuacion(*_, query):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_CALC}/api/v1/solve/",
            json={"query": query},
            timeout=5.0,
        )
    data = resp.json()

    # data = { "query": "...", "solution": [...] }
    return {
        "query": data["query"],
        "solution": [str(s) for s in data["solution"]],
    }

@query.field("resolverIntegral")
async def resolver_integral(*_, query):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_CALC}/api/v1/integrate/",
            json={"query": query},
            timeout=5.0,
        )
    data = resp.json()
    return {
        "query": data["query"],
        "operation": data["operation"],
        "result": data["result"],
    }

@query.field("resolverDerivada")
async def resolver_derivada(*_, query):
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{API_CALC}/api/v1/differentiate/",
            json={"query": query},
            timeout=5.0,
        )
    data = resp.json()
    return {
        "query": data["query"],
        "operation": data["operation"],
        "result": data["result"],
    }
