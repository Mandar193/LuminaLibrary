import { 
  collection, 
  getDocs, 
  getDoc,
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Book, StaffMember, Activity, Admin } from './types';
import { handleFirestoreError, OperationType } from './firebaseUtils';

export const firebaseService = {
  // Books
  subscribeToBooks: (callback: (books: Book[]) => void) => {
    const q = query(collection(db, 'books'), orderBy('updatedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
      callback(books);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'books');
    });
  },

  addBook: async (book: Omit<Book, 'id'>) => {
    try {
      await addDoc(collection(db, 'books'), {
        ...book,
        updatedAt: serverTimestamp()
      });
      await firebaseService.logActivity(`Added new book: ${book.title}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'books');
    }
  },

  updateBook: async (id: string, updates: Partial<Book>) => {
    try {
      const bookRef = doc(db, 'books', id);
      await updateDoc(bookRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `books/${id}`);
    }
  },

  deleteBook: async (id: string, title: string) => {
    try {
      await deleteDoc(doc(db, 'books', id));
      await firebaseService.logActivity(`Deleted book: ${title}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `books/${id}`);
    }
  },

  // Staff
  subscribeToStaff: (callback: (staff: StaffMember[]) => void) => {
    return onSnapshot(collection(db, 'staff'), (snapshot) => {
      const staff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StaffMember));
      callback(staff);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'staff');
    });
  },

  addStaff: async (member: Omit<StaffMember, 'id'>) => {
    try {
      await addDoc(collection(db, 'staff'), member);
      await firebaseService.logActivity(`Added staff member: ${member.name}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'staff');
    }
  },

  deleteStaff: async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'staff', id));
      await firebaseService.logActivity(`Removed staff member: ${name}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `staff/${id}`);
    }
  },

  // Activities
  subscribeToActivities: (callback: (activities: Activity[]) => void) => {
    const q = query(collection(db, 'activities'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Activity));
      callback(activities);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'activities');
    });
  },

  logActivity: async (action: string) => {
    try {
      await addDoc(collection(db, 'activities'), {
        user: auth.currentUser?.displayName || auth.currentUser?.email || 'Unknown',
        action,
        timestamp: serverTimestamp(),
        color: 'bg-indigo-500'
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  },

  // Admins
  subscribeToAdmins: (callback: (admins: Admin[]) => void) => {
    return onSnapshot(collection(db, 'admins'), (snapshot) => {
      const admins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Admin));
      callback(admins);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'admins');
    });
  },

  addAdmin: async (uid: string, email: string) => {
    try {
      await setDoc(doc(db, 'admins', uid), {
        email,
        addedAt: serverTimestamp()
      });
      await firebaseService.logActivity(`Added new administrator: ${email}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `admins/${uid}`);
    }
  },

  removeAdmin: async (uid: string, email: string) => {
    try {
      await deleteDoc(doc(db, 'admins', uid));
      await firebaseService.logActivity(`Removed administrator: ${email}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${uid}`);
    }
  },

  checkAndBootstrapAdmin: async () => {
    const user = auth.currentUser;
    if (user && user.email === "ssnhtr1980@gmail.com") {
      try {
        const adminRef = doc(db, 'admins', user.uid);
        const adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
          await setDoc(adminRef, {
            email: user.email,
            addedAt: serverTimestamp()
          });
          console.log("Bootstrap: Added current user to admins collection");
        }
      } catch (error) {
        console.error("Failed to bootstrap admin:", error);
      }
    }
  },

  isUserAdmin: async (uid: string): Promise<boolean> => {
    try {
      const adminRef = doc(db, 'admins', uid);
      const adminSnap = await getDoc(adminRef);
      return adminSnap.exists();
    } catch (error) {
      // If we can't even get our own doc, we're definitely not an admin
      console.log("Admin check failed:", error);
      return false;
    }
  },

  seedInitialData: async () => {
    const booksSnapshot = await getDocs(collection(db, 'books'));
    if (booksSnapshot.empty) {
      const initialBooks = [
        { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', status: 'Available', category: 'Fiction', year: 1925 },
        { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', status: 'Loaned', category: 'Classic', year: 1960 },
        { title: 'The Silent Patient', author: 'Alex Michaelides', isbn: '9781250301697', status: 'Available', category: 'Thriller', year: 2019 }
      ];
      for (const book of initialBooks) {
        await addDoc(collection(db, 'books'), { ...book, updatedAt: serverTimestamp() });
      }
    }

    const staffSnapshot = await getDocs(collection(db, 'staff'));
    if (staffSnapshot.empty) {
      const initialStaff = [
        { name: 'Eleanor Martin', email: 'eleanor.m@lumina.edu', role: 'Head Librarian', dateJoined: 'Oct 12, 2021', initials: 'EM' },
        { name: 'Julian Chen', email: 'j.chen@lumina.edu', role: 'Archivist', dateJoined: 'Jan 05, 2022', initials: 'JC' }
      ];
      for (const member of initialStaff) {
        await addDoc(collection(db, 'staff'), member);
      }
    }
  }
};
