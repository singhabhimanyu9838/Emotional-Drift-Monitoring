import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import VoiceCall from './components/VoiceCall';
import WellnessPath from './components/WellnessPath';
import Journal from './components/Journal';
import Auth from './components/Auth';
import About from './components/About';
import Footer from './components/Footer';
import { useNavigate } from "react-router-dom";

import { Message, UserContext, JournalEntry } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('sonia_auth') === 'true'
  );

  const [user, setUser] = useState<any>(
    () => JSON.parse(localStorage.getItem('sonia_user') || 'null')
  );

  const [messages, setMessages] = useState<Message[]>(
    () => JSON.parse(localStorage.getItem('sonia_messages') || '[]')
  );

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(
    () => JSON.parse(localStorage.getItem('sonia_journal') || '[]')
  );

  const [userContext, setUserContext] = useState<UserContext>(
    () =>
      JSON.parse(
        localStorage.getItem('sonia_context') ||
          '{"role": "Office worker", "language": "English"}'
      )
  );

  /* ===== Persist ===== */

  useEffect(() => {
    localStorage.setItem('sonia_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('sonia_journal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('sonia_context', JSON.stringify(userContext));
  }, [userContext]);

  useEffect(() => {
    localStorage.setItem('sonia_auth', isAuthenticated.toString());
    if (user) localStorage.setItem('sonia_user', JSON.stringify(user));
  }, [isAuthenticated, user]);

  /* ===== Handlers ===== */

  const handleSendMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const handleAddJournalEntry = (entry: JournalEntry) => {
    setJournalEntries(prev => [...prev, entry]);
  };

  const handleDeleteJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateContext = (newContext: Partial<UserContext>) => {
    setUserContext(prev => ({ ...prev, ...newContext }));
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('sonia_auth');
    localStorage.removeItem('sonia_user');
  };

  /* ===== Route Guard ===== */

  const Protected = ({ children }: { children: React.ReactNode }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div className="flex h-screen text-slate-100 overflow-hidden font-['Geist']">
        <Sidebar />

        <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#020617] flex flex-col">
          <div className="flex-1">
            <Routes>

              {/* 🌍 Home */}
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

            
              <Route path="/login" element={<Auth onLogin={handleLogin} />} />

             
              <Route
                path="/chat"
                element={
                  <Protected>
                    <Chat
                      messages={messages}
                      onSendMessage={handleSendMessage}
                      userContext={userContext}
                    />
                  </Protected>
                }
              />

              <Route
                path="/journal"
                element={
                  <Protected>
                    <Journal
                      entries={journalEntries}
                      onAddEntry={handleAddJournalEntry}
                      onDeleteEntry={handleDeleteJournalEntry}
                      userContext={userContext}
                    />
                  </Protected>
                }
              />

              <Route
                path="/voice"
                element={
                  <Protected>
                    <VoiceCall
                      language={userContext.language}
                      context={userContext.role}
                    />
                  </Protected>
                }
              />

              <Route
                path="/wellness"
                element={
                  <Protected>
                    <WellnessPath
                      messages={messages}
                      journalEntries={journalEntries}
                      userContext={userContext}
                    />
                  </Protected>
                }
              />

              <Route path="/about" element={<About />} />

              {/* fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </div>

          <Footer />
        </main>
      </div>
    </Router>
  );
};

export default App;
