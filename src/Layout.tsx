import React from 'react';
import { 
  LayoutDashboard, 
  LibraryBig, 
  Users, 
  Settings, 
  LogOut, 
  Plus,
  Search,
  Bell,
  CircleHelp,
  User as UserIcon
} from 'lucide-react';
import { Page, User } from './types';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  user: User;
  onLogout: () => void;
  onAdd?: () => void;
}

export default function Layout({ 
  children, 
  currentPage, 
  setCurrentPage, 
  user,
  onLogout,
  onAdd
}: LayoutProps) {
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as Page, label: 'Collection', icon: LibraryBig },
    { id: 'staff' as Page, label: 'Personnel', icon: Users },
    { id: 'settings' as Page, label: 'Configuration', icon: Settings, adminOnly: true },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || user.role?.toLowerCase() === 'administrator' || user.email === "mandaras936@gmail.com"
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-[#0f172a] flex flex-col shrink-0 overflow-hidden">
        <div className="p-8 pb-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-900/40">
            <LibraryBig size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg leading-tight tracking-tight">Lumina Library</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none mt-1">Vantage Core</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Main Navigation</p>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} />
                <span className="text-sm font-semibold">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="ml-auto w-1 h-4 bg-indigo-400 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
          <div className="p-4 rounded-xl relative overflow-hidden group">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shadow-sm">
                <UserIcon size={18} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-xs font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-tighter mt-0.5">Administrator</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen relative">
        {/* Header Navigation */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm shadow-slate-100/50">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-r border-slate-100 pr-6 mr-6 hidden sm:block">
              {currentPage.replace('-', ' ')}
            </h2>
            
            <div className="relative group">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Find anything..." 
                className="bg-slate-50 border-none text-xs rounded-lg py-2 pl-10 pr-4 w-64 focus:bg-white focus:ring-1 focus:ring-indigo-600/20 outline-none transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 border-r border-slate-100 pr-4 mr-1">
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                <CircleHelp size={18} />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            
            <button 
              onClick={onAdd}
              className="px-4 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 uppercase tracking-widest flex items-center gap-2"
            >
              <Plus size={14} />
              Add Record
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, scale: 0.995, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.005, y: -4 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
