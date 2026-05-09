import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Printer, 
  Book,
  MoreVertical,
  X,
  Trash2
} from 'lucide-react';
import { Book as BookType } from './types';
import { firebaseService } from './firebaseService';

interface InventoryProps {
  isAdding?: boolean;
  onAdded?: () => void;
}

export default function Inventory({ isAdding, onAdded }: InventoryProps) {
  const [books, setBooks] = useState<BookType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBook, setNewBook] = useState<Omit<BookType, 'id'>>({
    title: '',
    author: '',
    isbn: '',
    status: 'Available',
    category: 'General',
    year: new Date().getFullYear(),
    cover: ''
  });

  const [currentPage, setPage] = useState(1);
  const itemsPerPage = 8;
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToBooks((data) => {
      setBooks(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const totalPages = Math.max(1, Math.ceil(books.length / itemsPerPage));
  const paginatedBooks = books.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [books.length, totalPages, currentPage]);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    await firebaseService.addBook(newBook);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      status: 'Available',
      category: 'General',
      year: new Date().getFullYear(),
      cover: ''
    });
    if (onAdded) onAdded();
  };

  const handleDelete = async (id: string, title: string) => {
    await firebaseService.deleteBook(id, title);
    setConfirmDeleteId(null);
  };

  const stats = [
    { label: 'Total Collection', value: books.length.toLocaleString(), sub: 'In system', color: 'indigo-500' },
    { label: 'Active Loans', value: books.filter(b => b.status === 'Loaned').length.toString(), sub: 'Items currently out', color: 'emerald-500' },
    { label: 'Missing Items', value: books.filter(b => b.status === 'Missing').length.toString(), sub: 'Requires audit', color: 'amber-500' },
    { label: 'Estimated Value', value: `$${(books.length * 45).toLocaleString()}`, sub: 'Market estimate', color: 'indigo-600' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Book Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Register New Volume</h3>
              <button onClick={onAdded} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Title</label>
                <input 
                  required
                  value={newBook.title}
                  onChange={e => setNewBook({...newBook, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-600/20 outline-none transition-all"
                  placeholder="e.g. Sapiens"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Author</label>
                  <input 
                    required
                    value={newBook.author}
                    onChange={e => setNewBook({...newBook, author: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-600/20 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">ISBN</label>
                  <input 
                    required
                    value={newBook.isbn}
                    onChange={e => setNewBook({...newBook, isbn: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-600/20 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Status</label>
                  <select 
                    value={newBook.status}
                    onChange={e => setNewBook({...newBook, status: e.target.value as BookType['status']})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-600/20 outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Loaned">Loaned</option>
                    <option value="Missing">Missing</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Category</label>
                  <input 
                    value={newBook.category}
                    onChange={e => setNewBook({...newBook, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-600/20 outline-none"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-200 uppercase tracking-widest mt-4 hover:bg-indigo-700 transition-all"
              >
                Commit to Database
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-primary/30">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-slate-400 text-[10px] font-medium mt-2">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Inventory Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-slate-800 text-sm">Cataloged Volumes</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input 
                type="text" 
                placeholder="Find in list..." 
                className="bg-slate-50 border-none text-[12px] rounded-md py-1.5 pl-9 pr-3 w-48 focus:ring-1 focus:ring-primary/30 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-all">
              <Filter size={16} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-all">
              <Printer size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Book Title</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">ISBN</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBooks.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group cursor-default">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0 border border-slate-200/50 overflow-hidden">
                        {b.cover ? (
                          <img src={b.cover} className="w-full h-full object-cover" alt={b.title} referrerPolicy="no-referrer" />
                        ) : (
                          <Book size={16} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 leading-none">{b.title}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{b.category} • {b.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{b.author}</td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{b.isbn}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'Available' ? 'bg-emerald-50 text-emerald-700' :
                      b.status === 'Loaned' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-rose-50 text-rose-700'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {confirmDeleteId === b.id ? (
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleDelete(b.id, b.title)}
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
                          <button className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                          <button 
                            onClick={() => setConfirmDeleteId(b.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 size={16} />
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
    </div>
  );
}

