import React, { useEffect, useState } from "react";
import { THREADS_BASE, CHANNELS_BASE } from "../apiConfig";

/**
 * Vista de Canales:
 * - GET /channel/channels
 * - Click canal → GET /channel/get_threads?channel_id={id}
 * - Opcional: POST /v1/channels
 */
function ChannelsView({ selectedChannel, onSelectChannel, onThreadsLoaded }) {
  const [channels, setChannels] = useState([]);
  const [channelThreads, setChannelThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newChannelName, setNewChannelName] = useState("");

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${THREADS_BASE}/channel/channels`);
        if (!res.ok) throw new Error("No se pudieron cargar los canales");
        const data = await res.json();
        const list =
          Array.isArray(data) ? data : data.channels || data.items || [];
        setChannels(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const fetchThreadsOfChannel = async (channel) => {
  setLoading(true);
  setError("");
  onSelectChannel(channel);

  try {
    // GET /channel/get_threads?channel_id={_id}
    const res = await fetch(
      `${THREADS_BASE}/channel/get_threads?channel_id=${channel._id}`
    );

    if (!res.ok) {
      throw new Error("No se pudieron cargar los threads del canal");
    }

    const raw = await res.json();
    console.log("get_threads respuesta:", raw);

    // El swagger dice que viene así:
    // [
    //   { "thread_id": "...", "title": "...", "created_by": "...", "channel_id": "..." }
    // ]
    const listBase = Array.isArray(raw) ? raw : raw.items || [];
    const list = listBase.map((t) => ({
      id: t.thread_id,
      title: t.title,
      channel_id: t.channel_id,
      created_by: t.created_by,
    }));

    setChannelThreads(list);
    onThreadsLoaded(list); // se los pasamos a ThreadsView
  } catch (err) {
    console.error(err);
    setError(err.message);
    setChannelThreads([]);
  } finally {
    setLoading(false);
  }
};

  const handleCreateChannel = async (e) => {
  e.preventDefault();
  if (!newChannelName.trim()) return;

  setLoading(true);
  setError("");

  try {
    const res = await fetch(`${CHANNELS_BASE}/v1/channels/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel_type: "public",      // según swagger
        name: newChannelName,        // lo que escribes en el input
        owner_id: "owner123",        // de ejemplo, puedes cambiarlo luego
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error al crear canal (${res.status}): ${text}`);
    }

    const created = await res.json();

    // normalizamos a algo simple que el resto de la app entiende
    const normalized = {
      _id: created._id,
      name: created.name,
      is_active: created.is_active,
    };

    setChannels((prev) => [...prev, normalized]);
    setNewChannelName("");
  } catch (err) {
    console.error("Error creando canal:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="view-container">
      <h2>Canales</h2>

      {loading && <p className="info-text">Cargando...</p>}
      {error && <p className="error-text">{error}</p>}

      <section className="card">
        <h3>Listado de canales</h3>
        {channels.length === 0 && (
          <p className="info-text">No hay canales para mostrar.</p>
        )}
        <ul className="list">
          {channels.map((ch) => (
            <li key={ch._id}>
                <button
                className={
                    selectedChannel && selectedChannel._id === ch._id
                    ? "list-button list-button-active"
                    : "list-button"
                }
                onClick={() => fetchThreadsOfChannel(ch)}
                >
                <span className="list-title">{ch.name}</span>
                {ch.description && (
                    <span className="list-subtitle">{ch.description}</span>
                )}
                </button>
            </li>
            ))}
        </ul>
      </section>

      <section className="card">
        <h3>Threads del canal seleccionado</h3>
        {!selectedChannel && (
          <p className="info-text">Selecciona un canal para ver sus threads.</p>
        )}
        {selectedChannel && channelThreads.length === 0 && (
          <p className="info-text">
            El canal <strong>{selectedChannel.name}</strong> no tiene threads.
          </p>
        )}
        {selectedChannel && channelThreads.length > 0 && (
  <ul className="list">
    {channelThreads.map((th) => (
      <li key={th.id} className="list-item">
        <div className="list-title">{th.title}</div>
        <div className="list-subtitle">
          ID: {th.id} · Canal: {th.channel_id}
        </div>
      </li>
    ))}
  </ul>
)}
      </section>

      <section className="card">
        <h3>Crear canal (opcional)</h3>
        <form onSubmit={handleCreateChannel} className="form">
          <input
            type="text"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="Nombre del canal"
            className="input"
          />
          <button type="submit" className="btn primary">
            Crear canal
          </button>
        </form>
      </section>
    </div>
  );
}

export default ChannelsView;
