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

/* ================= APP CONTENT ================= */

const AppContent: React.FC = () => {
  const location = useLocation();

  /* ---------- UI STATE ---------- */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ---------- AUTH STATE ---------- */
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem("sonia_auth") === "true"
  );

  const [user, setUser] = useState<any>(() =>
    JSON.parse(localStorage.getItem("sonia_user") || "null")
  );

  /* ---------- DATA STATE ---------- */
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

  /* ---------- CLOSE SIDEBAR ON ROUTE CHANGE (MOBILE) ---------- */
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /* ================= PROTECTED ROUTE ================= */

  const Protected = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <div className="min-h-screen flex text-slate-100 font-['Geist'] bg-[#020617] relative">

      {/* ============ MOBILE SIDEBAR OVERLAY ============ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 h-screen bg-[#0f172a] shadow-xl overflow-y-auto">
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>

          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* ============ DESKTOP SIDEBAR (FIXED) ============ */}
      <div className="hidden md:block md:w-64 fixed inset-y-0 left-0 border-r border-white/5 bg-[#020617] z-30">
        <Sidebar />
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-64">

        {/* ---------- MOBILE TOP BAR ---------- */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#020617]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-2xl text-white"
          >
            ☰
          </button>

          <h1 className="text-lg font-semibold">Sonia AI</h1>

          <div className="w-6" />
        </div>

        {/* ---------- SCROLLABLE CONTENT ---------- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-8 py-4 pt-20 md:pt-6">

          <Routes>

            {/* DASHBOARD */}
            <Route
              path="/"
              element={
                <Dashboard
                  messages={messages}
                  userContext={userContext}
                  onLogout={handleLogout}
                  isAuthenticated={isAuthenticated}
                />
              }
            />

            {/* AUTH */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Auth onLogin={handleLogin} />
                )
              }
            />

            {/* PROTECTED ROUTES */}
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

        {/* ---------- FOOTER ---------- */}
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
