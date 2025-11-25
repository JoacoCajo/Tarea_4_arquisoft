import React, { useState } from "react";
import { registerUser, loginUser, getProfile, updateProfile } from "../api/users";

export default function UsersView() {
  const [token, setToken] = useState("");
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  const [reg, setReg] = useState({
    email: "",
    username: "",
    password: "",
    full_name: ""
  });

  const [login, setLogin] = useState({
    username_or_email: "",
    password: ""
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser(reg);
      alert("Usuario registrado con éxito");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { access_token } = await loginUser(login);
      setToken(access_token);

      const profile = await getProfile(access_token);
      setMe(profile);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateProfile(token, { full_name: me.full_name });
      setMe(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="view-container">
      <h2>Usuarios</h2>
      {error && <p className="error-text">{error}</p>}

      {/* Registro */}
      <section className="card">
        <h3>Registro</h3>
        <form onSubmit={handleRegister} className="form">
          {["email", "username", "full_name", "password"].map((f) => (
            <input
              key={f}
              className="input"
              type={f === "password" ? "password" : "text"}
              placeholder={f}
              onChange={(e) => setReg({ ...reg, [f]: e.target.value })}
            />
          ))}
          <button className="btn primary" type="submit">Registrarse</button>
        </form>
      </section>

      {/* Login */}
      <section className="card">
        <h3>Login</h3>
        <form onSubmit={handleLogin} className="form">
          <input
            className="input"
            placeholder="Email o Username"
            onChange={(e) =>
              setLogin({ ...login, username_or_email: e.target.value })
            }
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setLogin({ ...login, password: e.target.value })
            }
          />
          <button className="btn primary" type="submit">Ingresar</button>
        </form>
      </section>

      {/* Perfil */}
      {me && (
        <section className="card">
          <h3>Mi Perfil</h3>
          <p>Email: {me.email}</p>
          <p>Username: {me.username}</p>
          <input
          className="input"
          defaultValue={me.full_name}
          onChange={(e) => setMe({ ...me, full_name: e.target.value })}
        />
        <button className="btn" onClick={handleUpdate}>Actualizar</button>

        </section>
      )}
    </div>
  );
}