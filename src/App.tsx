/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TunerWidget } from './components/TunerWidget';
import { MetronomeWidget } from './components/MetronomeWidget';
import { ChordVisualizer } from './components/ChordVisualizer';
import { YouTubeConverter } from './components/YouTubeConverter';
import { 
  Music2, 
  GraduationCap, 
  MessageSquare, 
  Settings, 
  LayoutDashboard,
  Mic2,
  Users,
  Library,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, testSupabaseConnection } from './lib/supabase';
import { User as AppUser } from './types';

type View = 'practice' | 'education' | 'chat';

export default function App() {
  const [activeView, setActiveView] = useState<View>('practice');
  const [user, setUser] = useState<AppUser | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'ok' | 'error'>('testing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    // Test Connection
    testSupabaseConnection().then(res => {
      console.log('Supabase Connection Test:', res);
      setConnectionStatus(res.success ? 'ok' : 'error');
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // In a real app we'd fetch profile here
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'User',
          email: session.user.email || '',
          role: 'teacher' // Defaulting for demo
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'User',
          email: session.user.email || '',
          role: 'teacher'
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: window.location.origin,
          skipBrowserRedirect: false
        }
      });
      if (error) throw error;
      console.log('Login shift initiated:', data);
    } catch (err: any) {
      console.error('Login error:', err.message);
      alert('Login error: ' + err.message);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log('Password login success:', data);
    } catch (err: any) {
      console.error('Password login error:', err.message);
      setLoginError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0c0d0e] p-4">
        <div className="hardware-card p-10 flex flex-col items-center gap-6 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-[#00FF9C] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,156,0.2)]">
            <Music2 className="text-black" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">MusicBridge</h1>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Console Access</p>
          </div>

          <form onSubmit={handlePasswordLogin} className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[8px] font-mono text-gray-600 uppercase ml-1">Terminal.ID</label>
              <input 
                type="email" 
                placeholder="email@access.key"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1a1b1e] border border-gray-800 rounded p-3 text-xs font-mono focus:border-[#00FF9C] outline-none transition-all text-white"
              />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[8px] font-mono text-gray-600 uppercase ml-1">Access.Code</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1a1b1e] border border-gray-800 rounded p-3 text-xs font-mono focus:border-[#00FF9C] outline-none transition-all text-white"
              />
            </div>

            {loginError && (
              <div className="text-[10px] font-mono text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">
                ERROR: {loginError.toUpperCase()}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading || connectionStatus !== 'ok'}
              className={`w-full py-3 rounded font-bold transition-all font-mono text-xs uppercase tracking-wider
                ${connectionStatus === 'ok' 
                  ? 'bg-[#00FF9C] text-black hover:bg-[#00FF9C]/80' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
              `}
            >
              {isLoading ? 'Verifying...' : 'Initialize Session'}
            </button>
          </form>

          <div className="w-full flex items-center gap-4 py-2">
            <div className="h-[1px] bg-gray-800 flex-1" />
            <span className="text-[8px] font-mono text-gray-700 uppercase">External Sync</span>
            <div className="h-[1px] bg-gray-800 flex-1" />
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={connectionStatus !== 'ok'}
            className="w-full flex items-center justify-center gap-2 py-2 border border-gray-800 rounded font-mono text-[10px] uppercase tracking-wider hover:bg-white/5 transition-all text-gray-400"
          >
            <LogIn size={14} /> {connectionStatus === 'testing' ? 'Wait...' : 'Sso Google'}
          </button>

          <div className="flex items-center gap-2 justify-center">
            <div className={`w-1 h-1 rounded-full ${
              connectionStatus === 'ok' ? 'bg-[#00FF9C] led-glow' : 
              connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
            <p className="text-[9px] text-gray-600 font-mono uppercase tracking-tighter">
              {connectionStatus === 'ok' ? 'System Online' : 
               connectionStatus === 'error' ? 'Link Failure' : 'Link Testing'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0c0d0e] text-white overflow-hidden font-sans">
      {/* Navigation Rail */}
      <nav className="w-20 flex flex-col items-center py-8 border-right border-gray-800/50 bg-[#0c0d0e] z-50">
        <div className="w-10 h-10 bg-[#00FF9C] rounded-xl flex items-center justify-center mb-12 shadow-[0_0_20px_rgba(0,255,156,0.3)]">
          <Music2 className="text-black" size={24} />
        </div>

        <div className="flex flex-col gap-8 flex-1">
          <NavItem 
            icon={<LayoutDashboard size={22} />} 
            active={activeView === 'practice'} 
            onClick={() => setActiveView('practice')}
            label="Practice"
          />
          <NavItem 
            icon={<GraduationCap size={22} />} 
            active={activeView === 'education'} 
            onClick={() => setActiveView('education')}
            label="Learn"
          />
          <NavItem 
            icon={<MessageSquare size={22} />} 
            active={activeView === 'chat'} 
            onClick={() => setActiveView('chat')}
            label="Chat"
          />
        </div>

        <div className="mt-auto flex flex-col gap-8 pb-4">
          <NavItem icon={<Settings size={22} />} active={false} onClick={() => {}} label="Setup" />
          <div className="flex flex-col gap-4 items-center">
             <button 
               onClick={handleSignOut}
               className="p-2 text-gray-600 hover:text-red-500 transition-colors"
               title="Sign Out"
             >
                <LogIn size={20} className="rotate-180" />
             </button>
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 border border-gray-600 flex items-center justify-center overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="User" />
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-10 py-12">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[10px] font-mono uppercase tracking-[3px] text-[#00FF9C]">
              <div className="w-1 h-1 rounded-full bg-[#00FF9C]" />
              System Status: Optimal
            </div>
            <h1 className="text-5xl font-bold tracking-tighter">
              {activeView === 'practice' && "Practice Studio"}
              {activeView === 'education' && "Academy Dashboard"}
              {activeView === 'chat' && "Direct Messenger"}
            </h1>
          </div>
          <div className="flex gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Latency</span>
                <span className="text-sm font-mono text-[#00FF9C]">1.2ms</span>
             </div>
             <div className="flex flex-col items-end border-l border-gray-800 pl-4">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Identity</span>
                <span className="text-sm font-mono">Teacher</span>
             </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeView === 'practice' && (
            <motion.div 
              key="practice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-8"
            >
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                <TunerWidget />
                <MetronomeWidget />
              </div>
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                 <YouTubeConverter />
                 <ChordVisualizer />
              </div>
            </motion.div>
          )}

          {activeView === 'education' && (
            <motion.div 
              key="education"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-8"
            >
               <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                  <div className="hardware-card overflow-hidden">
                    <div className="p-4 border-b border-gray-800 bg-gray-900/20 flex justify-between items-center">
                       <span className="text-[10px] font-mono uppercase tracking-[2px]">Managed Classes</span>
                       <button className="text-[10px] font-mono text-[#00FF9C] uppercase">+ New Class</button>
                    </div>
                    <div className="p-0">
                       <ClassRow title="Guitar Fundamentals" students={12} level="Beginner" />
                       <ClassRow title="Advanced Harmonic Theory" students={8} level="Advanced" />
                       <ClassRow title="Improvisation Masterclass" students={15} level="Intermediate" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <StatCard icon={<Users />} label="Total Students" value="35" color="#00FF9C" />
                     <StatCard icon={<Library />} label="Materials Shared" value="128" color="#3b82f6" />
                  </div>
               </div>

               <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                  <div className="hardware-card p-6">
                     <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-6 font-bold underline decoration-[#00FF9C]">Recent Feedback</h3>
                     <div className="flex flex-col gap-4">
                        <FeedbackItem student="Alice" task="Blues Scale Solo" date="2h ago" />
                        <FeedbackItem student="Bob" task="Jazz Standards" date="5h ago" />
                        <FeedbackItem student="Charlie" task="Tuner Calibration" date="1d ago" />
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeView === 'chat' && (
             <motion.div 
               key="chat"
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="hardware-card h-[600px] flex flex-col overflow-hidden"
             >
                <div className="p-4 border-b border-gray-800 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-gray-700" />
                   <div>
                      <h4 className="font-bold text-sm">Alice Johnson</h4>
                      <p className="text-[10px] text-[#00FF9C] font-mono uppercase">Online</p>
                   </div>
                </div>
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                   <ChatMessage text="Hey teacher, can you check my recording?" side="left" />
                   <ChatMessage text="Sure Alice! Just send it through the portal." side="right" />
                   <ChatMessage text="Is my pitch correction working well on the G string?" side="left" />
                </div>
                <div className="p-4 border-t border-gray-800 bg-gray-900/20">
                   <input 
                     type="text" 
                     placeholder="Type a secure message..." 
                     className="w-full bg-black border border-gray-800 rounded-lg p-3 text-sm focus:border-[#00FF9C] outline-none" 
                   />
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative group p-3 rounded-xl transition-all duration-300 ${active ? 'text-[#00FF9C]' : 'text-gray-500 hover:text-white'}`}
    >
      {icon}
      {active && (
        <motion.div 
          layoutId="activeNav"
          className="absolute -right-10 w-1 h-8 bg-[#00FF9C] rounded-full shadow-[0_0_10px_#00FF9C]"
        />
      )}
      <div className="absolute left-16 px-2 py-1 bg-gray-900 border border-gray-800 text-[10px] font-mono uppercase pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
        {label}
      </div>
    </button>
  );
}

function ClassRow({ title, students, level }: { title: string, students: number, level: string }) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-[#00FF9C] transition-colors">
          <Mic2 size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm">{title}</h4>
          <span className="text-[10px] font-mono text-gray-500 uppercase">{students} Students Enrolled</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700">
          {level}
        </span>
        <button className="text-[#00FF9C] opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 text-xs font-bold uppercase tracking-wider">
          Manage
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="hardware-card p-6 flex items-center gap-6">
      <div className="p-4 rounded-xl bg-gray-900 text-gray-400" style={{ color: color }}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-mono tracking-tighter" style={{ color: color }}>{value}</div>
        <div className="text-[10px] font-mono uppercase text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function FeedbackItem({ student, task, date }: { student: string, task: string, date: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800/30 last:border-0 hover:translate-x-1 transition-transform cursor-pointer group">
       <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[10px] font-bold text-[#00FF9C]">
             {student[0]}
          </div>
          <div>
             <h5 className="text-[11px] font-bold group-hover:text-[#00FF9C]">{student}</h5>
             <p className="text-[9px] font-mono text-gray-500 uppercase">{task}</p>
          </div>
       </div>
       <span className="text-[9px] font-mono text-gray-600">{date}</span>
    </div>
  );
}

function ChatMessage({ text, side }: { text: string, side: 'left' | 'right' }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
        side === 'right' 
          ? 'bg-[#00FF9C] text-black rounded-tr-none' 
          : 'bg-gray-800 text-white rounded-tl-none'
      }`}>
        {text}
      </div>
    </div>
  );
}
