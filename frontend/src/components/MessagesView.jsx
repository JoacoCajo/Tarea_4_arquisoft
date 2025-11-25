import React, { useEffect, useState } from "react";
import { THREADS_BASE } from "../apiConfig";

/**
 * Vista de MENSAJES
 * - Depende de selectedThread (prop)
 * - Muestra título y datos del thread
 * - Usa los mensajes que vengan en selectedThread.messages
 *   o vuelve a cargar el thread por si no trae mensajes.
 * - Permite enviar mensaje con POST /message/message-on-thread
 */
function MessagesView({ selectedThread }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Cargar mensajes cuando cambia el thread
  useEffect(() => {
    if (!selectedThread) return;

    const loadMessages = async () => {
      setError("");

      // Si el thread ya trae mensajes, los usamos directo
      if (selectedThread.messages && Array.isArray(selectedThread.messages)) {
        setMessages(selectedThread.messages);
        return;
      }

      // Si no, volvemos a consultar el thread:
      setLoading(true);
      try {
        const res = await fetch(
          `${THREADS_BASE}/threads/${selectedThread.id}`
        );
        if (!res.ok) {
          throw new Error("No se pudieron cargar los mensajes del thread");
        }
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.message);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedThread]);

  if (!selectedThread) {
    return (
      <div className="view-container">
        <h2>Mensajes</h2>
        <p className="info-text">
          Selecciona un thread en la pestaña de <strong>Threads</strong> o
          desde <strong>Canales</strong>.
        </p>
      </div>
    );
  }

  // Enviar mensaje: POST /message/message-on-thread
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${THREADS_BASE}/message/message-on-thread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Ajusta a la estructura exacta esperada por el swagger
        body: JSON.stringify({
          thread_id: selectedThread.id,
          content: newMessage,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al enviar mensaje");
      }

      const created = await res.json();

      // Agregamos el nuevo mensaje a la lista local
      setMessages((prev) => [
        ...prev,
        created || {
          id: Date.now(),
          content: newMessage,
          author: "Tú",
          created_at: new Date().toISOString(),
        },
      ]);

      setNewMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <h2>Mensajes del Thread</h2>

      <section className="card">
        <h3>{selectedThread.title}</h3>
        <p className="hint-text">
          ID: <code>{selectedThread.id}</code>
        </p>
      </section>

      {loading && <p className="info-text">Procesando...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* Lista de mensajes */}
      <section className="card">
        <h3>Mensajes</h3>
        {messages.length === 0 && (
          <p className="info-text">Este thread aún no tiene mensajes.</p>
        )}
        <ul className="list">
          {messages.map((m) => (
            <li key={m.id || `${m.author}-${m.created_at}`} className="list-item">
              <div className="list-title">{m.content}</div>
              <div className="list-subtitle">
                {m.author && <span>{m.author}</span>}{" "}
                {m.created_at && (
                  <span>
                    · {new Date(m.created_at).toLocaleString("es-CL")}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Formulario para nuevo mensaje */}
      <section className="card">
        <h3>Enviar mensaje</h3>
        <form onSubmit={handleSendMessage} className="form">
          <textarea
            className="input textarea"
            placeholder="Escribe tu mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn primary">
            Enviar
          </button>
        </form>
      </section>
    </div>
  );
}

export default MessagesView;
