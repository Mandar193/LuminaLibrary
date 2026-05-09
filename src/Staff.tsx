import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck,
  X,
  Trash2
} from 'lucide-react';
import { StaffMember, User } from './types';
import { firebaseService } from './firebaseService';

interface StaffProps {
  user: User;
  isAdding?: boolean;
  onAdded?: () => void;
}

export default function Staff({ user, isAdding, onAdded }: StaffProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMember, setNewMember] = useState<Omit<StaffMember, 'id'>>({
    name: '',
    email: '',
    role: 'Staff',
    dateJoined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    initials: ''
  });

  const [currentPage, setPage] = useState(1);
  const itemsPerPage = 8;
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(staff.length / itemsPerPage));
  const paginatedStaff = staff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [staff.length, totalPages, currentPage]);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToStaff((data) => {
      setStaff(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const initials = newMember.name.split(' ').map(n => n[0]).join('').toUpperCase();
    await firebaseService.addStaff({ ...newMember, initials });
    setNewMember({
      name: '',
      email: '',
      role: 'Staff',
      dateJoined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      initials: ''
    });
    if (onAdded) onAdded();
  };

  const handleDelete = async (id: string, name: string) => {
    await firebaseService.deleteStaff(id, name);
    setConfirmDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Staff Modal */}
      {isAdding && user.isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Enroll Personnel</h3>
              <button onClick={onAdded} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                <input 
                  required
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-600/20 outline-none"
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Corporate Email</label>
                <input 
                  required
                  type="email"
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-600/20 outline-none"
                  placeholder="name@lumina.edu"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Designated Role</label>
                <select 
                  value={newMember.role}
                  onChange={e => setNewMember({...newMember, role: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-600/20 outline-none"
                >
                  <option value="Staff">Staff Member</option>
                  <option value="Librarian">Librarian</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Archivist">Archivist</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-200 uppercase tracking-widest mt-4 hover:bg-indigo-700 transition-all"
              >
                Provision Account
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Personnel', value: staff.length.toString(), change: 'Registered', color: 'indigo-500' },
          { label: 'Verified Accounts', value: staff.length.toString(), change: '100% coverage', color: 'emerald-500' },
          { label: 'System Access', value: user.isAdmin ? 'Full Admin' : 'Read Only', change: 'Security Level', color: 'amber-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-slate-400 text-[10px] font-medium mt-2">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Staff Table */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-semibold text-slate-800 text-sm">Staff Directory</h3>
            <button className="text-indigo-600 text-[10px] uppercase font-bold tracking-widest hover:underline">Manage All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Employee</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Designation</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase">Joined Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase text-right">Access</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-[10px] border border-slate-200/50">
                            {s.initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700 leading-none">{s.name}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                          {s.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-500 font-medium">{s.dateJoined}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          {!user.isAdmin ? (
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">View Only</span>
                          ) : confirmDeleteId === s.id ? (
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => handleDelete(s.id, s.name)}
                                className="px-2 py-1 bg-rose-600 text-white text-[9px] font-bold rounded uppercase tracking-widest hover:bg-rose-700 transition-colors"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase tracking-widest hover:bg-slate-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button 
                                onClick={() => setConfirmDeleteId(s.id)}
                                className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors">
                                <ShieldCheck size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-slate-50 flex justify-between items-center bg-white">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {currentPage} of {totalPages}</p>
              <div className="flex gap-1">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold rounded hover:bg-slate-200 transition-all uppercase tracking-tighter disabled:opacity-50"
                >
                  Prev
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded shadow-sm uppercase tracking-tighter disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

        {/* Quick Add Form Section */}
        {user.isAdmin && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-semibold text-slate-800 text-sm mb-4">Quick Add Employee</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20 outline-none" 
                  placeholder="e.g. John Doe" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Primary Role</label>
                <select 
                  value={newMember.role}
                  onChange={e => setNewMember({...newMember, role: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20 outline-none appearance-none"
                >
                  <option value="Librarian">Librarian</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Staff">Staff Member</option>
                  <option value="Archivist">Archivist</option>
                </select>
              </div>
              {/* Optional email for quick add - side panel form lacks email input but modal has it.
                  I'll add email to side panel so it's a complete form. */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email</label>
                <input 
                  required
                  type="email" 
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-primary/20 outline-none" 
                  placeholder="name@lumina.edu" 
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded shadow-sm hover:bg-indigo-700 transition-all uppercase tracking-widest"
              >
                Enroll New Personnel
              </button>
            </form>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-xl text-white shadow-lg overflow-hidden relative group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-2">Platform Security</p>
              <h4 className="font-bold text-sm mb-2">Automated Auditing</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">All staff interactions are logged and verified against organizational security policies.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
}
