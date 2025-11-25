import React, { useState } from "react";

const SEARCH_BASE = "/search-api"; // pasa por el proxy de Vite

export default function SearchMessagesView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();              // 👈 evita recargar la página
    setError("");
    setResults([]);

    if (!query.trim()) {
      setError("Debes escribir algo para buscar.");
      return;
    }

    setLoading(true);

    try {
      // endpoint según el swagger del search-service
      const url = `${SEARCH_BASE}/api/message/search_message?q=${encodeURIComponent(
        query
      )}`;

      console.log("Buscando mensajes en:", url); // 👈 para que lo veas en la consola

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Error buscando mensajes (${res.status})`);
      }

      const data = await res.json();
      console.log("Respuesta search:", data);

      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <h2>Búsqueda de Mensajes</h2>

      <form onSubmit={handleSearch} className="form">
        <input
          type="text"
          value={query}
          placeholder="Buscar mensajes..."
          className="input"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn primary" type="submit">
          Buscar
        </button>
      </form>

      {loading && <p className="info-text">Buscando...</p>}
      {error && <p className="error-text">{error}</p>}

      <section className="card">
        <h3>Resultados</h3>

        {results.length === 0 && !loading && (
          <p className="info-text">No hay resultados</p>
        )}

        <ul className="list">
          {results.map((msg) => (
            <li key={msg.id} className="list-item">
              <div className="list-title">
                {msg.content || "(sin contenido)"}
              </div>
              <div className="list-subtitle">
                ID: {msg.id} · Thread: {msg.thread_id} · Usuario: {msg.user_id}
              </div>
              <div className="list-subtitle">
                Tipo: {msg.type} · Fecha:{" "}
                {msg.created_at
                  ? new Date(msg.created_at).toLocaleString("es-ES")
                  : "–"}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
