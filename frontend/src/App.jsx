import React, { useState } from "react";
import ChannelsView from "./components/ChannelsView";
import ThreadsView from "./components/ThreadsView";
import MessagesView from "./components/MessagesView";
import SearchMessagesView from "./components/SearchMessagesView";
import UsersView from "./components/UsersView";  // 👈 IMPORTANTE

import "./App.css";

export default function App() {
  const [activeTab, setActiveTab] = useState("channels");

  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);

  const [channelThreads, setChannelThreads] = useState([]);

  return (
    <div className="app-container">

      <div className="tabs">
        <button
          className={activeTab === "channels" ? "tab active" : "tab"}
          onClick={() => setActiveTab("channels")}
        >
          Canales
        </button>

        <button
          className={activeTab === "threads" ? "tab active" : "tab"}
          onClick={() => setActiveTab("threads")}
        >
          Threads
        </button>

        <button
          className={activeTab === "messages" ? "tab active" : "tab"}
          onClick={() => setActiveTab("messages")}
        >
          Mensajes
        </button>

        <button
          className={activeTab === "search" ? "tab active" : "tab"}
          onClick={() => setActiveTab("search")}
        >
          Buscar Mensajes
        </button>

        {/* 👇 NUEVO TAB */}
        <button
          className={activeTab === "users" ? "tab active" : "tab"}
          onClick={() => setActiveTab("users")}
        >
          Usuarios
        </button>
      </div>

      <div className="view-wrapper">
        {activeTab === "channels" && (
          <ChannelsView
            selectedChannel={selectedChannel}
            onSelectChannel={(ch) => {
              setSelectedChannel(ch);
              setSelectedThread(null);
            }}
            onThreadsLoaded={(threads) => {
              setChannelThreads(threads);
            }}
          />
        )}

        {activeTab === "threads" && (
          <ThreadsView
            selectedChannel={selectedChannel}
            channelThreads={channelThreads}
            onSelectThread={(th) => setSelectedThread(th)}
          />
        )}

        {activeTab === "messages" && (
          <MessagesView selectedThread={selectedThread} />
        )}

        {activeTab === "search" && <SearchMessagesView />}

        {/* 👇 NUEVA VISTA */}
        {activeTab === "users" && <UsersView />}
      </div>
    </div>
  );
}