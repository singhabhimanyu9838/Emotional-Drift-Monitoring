import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import VoiceCall from "./components/VoiceCall";
import WellnessPath from "./components/WellnessPath";
import Journal from "./components/Journal";
import Auth from "./components/Auth";
import About from "./components/About";
import Footer from "./components/Footer";

import { Message, UserContext, JournalEntry } from "./types";

/* ================= MAIN APP ================= */

const AppContent: React.FC = () => {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("sonia_auth") === "true"
  );

  const [user, setUser] = useState<any>(() =>
    JSON.parse(localStorage.getItem("sonia_user") || "null")
  );

  const [messages, setMessages] = useState<Message[]>(() =>
    JSON.parse(localStorage.getItem("sonia_messages") || "[]")
  );

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() =>
    JSON.parse(localStorage.getItem("sonia_journal") || "[]")
  );

  const [userContext, setUserContext] = useState<UserContext>(() =>
    JSON.parse(
      localStorage.getItem("sonia_context") ||
        '{"role":"Office worker","language":"English"}'
    )
  );

  /* ================= PERSIST ================= */

  useEffect(() => {
    localStorage.setItem("sonia_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("sonia_journal", JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem("sonia_context", JSON.stringify(userContext));
  }, [userContext]);

  useEffect(() => {
    localStorage.setItem("sonia_auth", isAuthenticated.toString());
    if (user) localStorage.setItem("sonia_user", JSON.stringify(user));
  }, [isAuthenticated, user]);

  /* ================= HANDLERS ================= */

  const handleSendMessage = (msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleAddJournalEntry = (entry: JournalEntry) => {
    setJournalEntries((prev) => [...prev, entry]);
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("sonia_auth");
    localStorage.removeItem("sonia_user");
  };

  /* Close sidebar on route change (mobile) */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex text-slate-100 font-['Geist'] bg-[#020617] relative">

      {/* ============ MOBILE SIDEBAR OVERLAY ============ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 bg-[#0f172a] shadow-xl">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>

          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* ============ DESKTOP SIDEBAR ============ */}
      <div className="hidden md:block md:w-64 fixed inset-y-0 left-0 border-r border-white/5 bg-[#020617] z-30">
        <Sidebar />
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-64">

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-white"
          >
            ☰
          </button>

          <h1 className="text-lg font-semibold">Sonia AI</h1>

          <div className="w-6" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-8 py-4">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  messages={messages}
                  userContext={userContext}
                  onLogout={handleLogout}
                />
              }
            />

            {/* OPTIONAL LOGIN */}
            <Route path="/login" element={<Auth onLogin={handleLogin} />} />

            <Route
              path="/chat"
              element={
                <Chat
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  userContext={userContext}
                />
              }
            />

            <Route
              path="/journal"
              element={
                <Journal
                  entries={journalEntries}
                  onAddEntry={handleAddJournalEntry}
                  onDeleteEntry={handleDeleteJournalEntry}
                  userContext={userContext}
                />
              }
            />

            <Route
              path="/voice"
              element={
                <VoiceCall
                  language={userContext.language}
                  context={userContext.role}
                />
              }
            />

            <Route
              path="/wellness"
              element={
                <WellnessPath
                  messages={messages}
                  journalEntries={journalEntries}
                  userContext={userContext}
                />
              }
            />

            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Footer */}
        <div className="mt-auto border-t border-white/5">
          <Footer />
        </div>
      </main>
    </div>
  );
};

/* ================= ROUTER WRAPPER ================= */

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
