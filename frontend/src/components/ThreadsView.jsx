import React, { useState, useEffect } from "react";
import { THREADS_BASE } from "../apiConfig";

function ThreadsView({
  selectedChannel,
  knownThreads,
  onThreadsChange,
  selectedThread,
  onSelectThread,
}) {
  const [threads, setThreads] = useState(knownThreads || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [manualChannelId, setManualChannelId] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    setThreads(knownThreads || []);
  }, [knownThreads]);

  const updateThreads = (newList) => {
    setThreads(newList);
    onThreadsChange(newList);
  };

  const handleCreateThread = async (e) => {
  e.preventDefault();

  if (!newTitle.trim()) {
    setError("El título no puede estar vacío");
    return;
  }

  if (!selectedChannel || !selectedChannel._id) {
    setError("Selecciona un canal antes de crear un thread");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // IMPORTANTE: usar /threads/ (con slash final)
    const url = `${THREADS_BASE}/threads/?channel_id=${selectedChannel._id}&thread_name=${newTitle}&user_id=test`;

    const res = await fetch(url, {
      method: "POST",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error al crear el thread (${res.status}): ${text}`);
    }

    const created = await res.json(); 
    // La API devuelve un string (el ID del thread)

    // Agregamos a la lista local
    const newThreadObject = {
      id: created,
      title: newTitle,
      channel_id: selectedChannel._id,
    };

    setThreads((prev) => [...prev, newThreadObject]);
    setNewTitle("");

  } catch (err) {
    console.error("Error creando thread:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleViewThread = async (threadId) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${THREADS_BASE}/threads/${threadId}`);
if (!res.ok) throw new Error("No se pudo obtener el thread");
const raw = await res.json();

const data =
  typeof raw === "string"
    ? { id: threadId, title: raw }
    : raw;

onSelectThread(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (thread) => {
    setEditingId(thread.id);
    setEditingTitle(thread.title);
    setEditingContent(thread.content || "");
  };

  const handleSaveEdit = async (threadId) => {
    setLoading(true);
    setError("");
    try {
                const res = await fetch(`${THREADS_BASE}/threads/${threadId}/edit`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: editingTitle,
                metadata: {},             // algo simple para que valide
            }),
            });
      if (!res.ok) throw new Error("Error al editar el thread");
await res.json(); // aunque sea string

const list = threads.map((t) =>
  t.id === threadId ? { ...t, title: editingTitle } : t
);
updateThreads(list);
setEditingId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm("¿Eliminar este thread?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${THREADS_BASE}/threads/${threadId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar el thread");
      const list = threads.filter((t) => t.id !== threadId);
      updateThreads(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <h2>Threads</h2>

      {loading && <p className="info-text">Procesando...</p>}
      {error && <p className="error-text">{error}</p>}

      <section className="card">
        <h3>Crear nuevo thread</h3>
        <form onSubmit={handleCreateThread} className="form">
          <input
            className="input"
            type="text"
            placeholder="Título"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="input textarea"
            placeholder="Contenido"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          {!selectedChannel && (
            <input
              className="input"
              type="text"
              placeholder="ID de canal (si no hay canal seleccionado)"
              value={manualChannelId}
              onChange={(e) => setManualChannelId(e.target.value)}
            />
          )}
          <button type="submit" className="btn primary">
            Crear thread
          </button>
        </form>
      </section>

      <section className="card">
        <h3>Threads conocidos</h3>
        {threads.length === 0 && (
          <p className="info-text">
            Aún no hay threads. Selecciona un canal o crea uno nuevo.
          </p>
        )}

        <ul className="list">
          {threads.map((t) => (
            <li key={t.id} className="list-item thread-item">
              {editingId === t.id ? (
                <div className="thread-edit">
                  <input
                    className="input"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                  />
                  <textarea
                    className="input textarea"
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                  />
                  <div className="button-row">
                    <button
                      type="button"
                      className="btn primary"
                      onClick={() => handleSaveEdit(t.id)}
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="list-title">{t.title}</div>
                  <div className="list-subtitle">
                    ID: {t.id}{" "}
                    {t.message_count != null && `· ${t.message_count} mensajes`}
                  </div>
                  <div className="button-row">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => handleViewThread(t.id)}
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => startEditing(t)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn danger"
                      onClick={() => handleDeleteThread(t.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      {selectedThread && (
        <section className="card">
          <h3>Último thread seleccionado</h3>
          <p>
            <strong>{selectedThread.title}</strong> (ID: {selectedThread.id})
          </p>
        </section>
      )}
    </div>
  );
}

export default ThreadsView;
