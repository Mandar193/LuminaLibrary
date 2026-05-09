import React, { useEffect, useState } from 'react';
import { firebaseService } from './firebaseService';
import { Book, Activity, Page } from './types';

interface DashboardProps {
  onNavigate?: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubBooks = firebaseService.subscribeToBooks(setBooks);
    const unsubActivities = firebaseService.subscribeToActivities(setActivities);
    setIsLoading(false);
    return () => {
      unsubBooks();
      unsubActivities();
    };
  }, []);

  const metrics = [
    { label: 'Total Volumes', value: books.length.toLocaleString(), change: '+2% vs last week', changeType: 'positive' },
    { label: 'Active Circulation', value: books.filter(b => b.status === 'Loaned').length.toString(), change: 'Stable', changeType: 'positive' },
    { label: 'Missing Rate', value: `${((books.filter(b => b.status === 'Missing').length / (books.length || 1)) * 100).toFixed(1)}%`, progress: (books.filter(b => b.status === 'Missing').length / (books.length || 1)) * 100 },
    { label: 'Avg Loan Time', value: '12 Days', desc: 'Target: 14 Days' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-slate-900">{m.value}</p>
            </div>
            {m.change && (
              <p className={`text-xs font-medium mt-2 ${m.changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {m.change}
              </p>
            )}
            {m.progress !== undefined && (
              <div className="w-full bg-slate-100 h-1 rounded-full mt-4">
                <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${m.progress}%` }}></div>
              </div>
            )}
            {m.desc && <p className="text-indigo-600 text-xs font-medium mt-2">{m.desc}</p>}
          </div>
        ))}
      </div>

      {/* Main Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 text-sm">Live Activity</h3>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase font-bold tracking-tighter">Live Update</span>
          </div>
          <div className="p-4 space-y-4 flex-1">
            {activities
              .filter(a => a.user.toLowerCase() !== 'mandara gagan')
              .map((a, i) => (
              <div key={i} className="flex gap-3 items-start group">
                <div className={`w-2 h-2 rounded-full ${a.color} mt-1.5 shrink-0 group-hover:scale-125 transition-transform`}></div>
                <div>
                  <p className="text-xs text-slate-800 leading-normal">
                    <strong className="font-semibold">{a.user}</strong> {a.action}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {a.timestamp?.toDate ? a.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-50">
            <button className="w-full text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest text-center">View All Stream</button>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 text-sm">Recently Modified Volumes</h3>
            <button 
              onClick={() => onNavigate?.('inventory')}
              className="text-indigo-600 text-[10px] uppercase font-bold tracking-widest hover:underline"
            >
              Full Catalog
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Book</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Author</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Identifier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.slice(0, 4).map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs border border-slate-200/50 group-hover:bg-white transition-colors overflow-hidden">
                          {b.cover ? <img src={b.cover} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" /> : b.title.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{b.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{b.author}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                        b.status === 'Loaned' ? 'bg-indigo-50 text-indigo-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">
                      {b.isbn.slice(-5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
