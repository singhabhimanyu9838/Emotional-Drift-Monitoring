
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
import { Message, UserContext, JournalEntry } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('sonia_auth') === 'true');
  const [user, setUser] = useState<any>(() => JSON.parse(localStorage.getItem('sonia_user') || 'null'));
  const [messages, setMessages] = useState<Message[]>(() => JSON.parse(localStorage.getItem('sonia_messages') || '[]'));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => JSON.parse(localStorage.getItem('sonia_journal') || '[]'));
  const [userContext, setUserContext] = useState<UserContext>(() => JSON.parse(localStorage.getItem('sonia_context') || '{"role": "Office worker", "language": "English"}'));

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

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="flex h-screen text-slate-100 overflow-hidden font-['Geist']">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#020617] flex flex-col">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard messages={messages} userContext={userContext} onLogout={handleLogout} />} />
              <Route 
                path="/chat" 
                element={
                  <div className="h-full flex flex-col">
                    <Chat messages={messages} onSendMessage={handleSendMessage} userContext={userContext} />
                  </div>
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
                element={<VoiceCall language={userContext.language} context={userContext.role} />} 
              />
              <Route path="/wellness" element={<WellnessPath messages={messages} journalEntries={journalEntries} userContext={userContext} />} />
              <Route path="/about" element={<About />} />
              <Route path="/settings" element={
                <div className="p-10 max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-black text-white tracking-tight">System Settings</h1>
                    <button 
                      onClick={handleLogout}
                      className="px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Logout
                    </button>
                  </header>

                  <div className="glass-card p-10 rounded-[2.5rem] space-y-10">
                    <section>
                      <h3 className="font-black text-white mb-6 text-sm uppercase tracking-widest text-slate-400">Profile</h3>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-6">
                         <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 font-black text-xl">
                            {user?.name?.charAt(0)}
                         </div>
                         <div>
                            <p className="text-white font-black text-lg">{user?.name}</p>
                            <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
                         </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="font-black text-white mb-6 text-sm uppercase tracking-widest text-slate-400">Context Mode</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {['Student', 'Office worker', 'Personal life'].map((r) => (
                          <button
                            key={r}
                            onClick={() => handleUpdateContext({ role: r as any })}
                            className={`px-4 py-4 rounded-xl border transition-all text-xs font-black uppercase tracking-widest ${
                              userContext.role === r 
                                ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                                : 'border-white/5 bg-white/5 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="font-black text-white mb-6 text-sm uppercase tracking-widest text-slate-400">Language</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['English', 'Hindi'].map((l) => (
                          <button
                            key={l}
                            onClick={() => handleUpdateContext({ language: l as any })}
                            className={`px-4 py-4 rounded-xl border transition-all text-xs font-black uppercase tracking-widest ${
                              userContext.language === l 
                                ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                                : 'border-white/5 bg-white/5 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              } />
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
