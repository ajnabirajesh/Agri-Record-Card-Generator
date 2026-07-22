import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Shield, User, Loader2, Plus, AlertCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as signOutSecondary } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

interface UserData {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  freeCredits?: number;
  cardCount?: number;
  createdAt?: any;
}


const AdminUsers: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  // New User Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [addingUser, setAddingUser] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/admin');
      return;
    }

    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [user, isAdmin, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const usersCol = collection(db, 'users');
      const userSnapshot = await getDocs(usersCol);
      const userList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserData));
      
      const usersWithCounts = userList.map(u => ({
        ...u,
        cardCount: u.cardCount || 0
      })).sort((a, b) => {
        const timeA = a.createdAt?.seconds || (a.createdAt ? Date.now() / 1000 : 0);
        const timeB = b.createdAt?.seconds || (b.createdAt ? Date.now() / 1000 : 0);
        return timeB - timeA;
      });

      setUsers(usersWithCounts);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please check your permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (window.confirm(`Are you sure you want to delete the user record for ${email}?\n\nNote: This only deletes their role record. Their Google/Email login might still exist in Firebase Auth.`)) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(u => u.id !== userId));
      } catch (err: any) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user: " + err.message);
      }
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      console.error("Error updating role:", err);
      alert("Failed to update role: " + err.message);
    }
  };

  const handleCreditsChange = async (userId: string, credits: number) => {
    if (credits < 0) return;
    try {
      await updateDoc(doc(db, 'users', userId), { freeCredits: credits });
      setUsers(users.map(u => u.id === userId ? { ...u, freeCredits: credits } : u));
    } catch (err: any) {
      console.error("Error updating credits:", err);
      alert("Failed to update credits: " + err.message);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      setAddError("Email and password are required.");
      return;
    }

    setAddingUser(true);
    setAddError('');

    try {
      // Use a secondary Firebase app to create the user without logging out the current admin
      const secondaryApp = initializeApp(firebaseConfig, `SecondaryApp-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);
      
      const result = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        name: newName,
        role: newRole,
        freeCredits: 0,
        createdAt: serverTimestamp()
      });

      // Sign out the secondary instance to clean up
      await signOutSecondary(secondaryAuth);

      // Reset form
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setNewRole('user');
      setShowAddForm(false);
      
      // Refresh user list
      await fetchUsers();
    } catch (err: any) {
      console.error("Error adding user:", err);
      if (err.code === 'auth/email-already-in-use') {
         setAddError("This email is already in use.");
      } else if (err.code === 'auth/weak-password') {
         setAddError("Password should be at least 6 characters.");
      } else {
         setAddError(err.message || "Failed to create user.");
      }
    } finally {
      setAddingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const s = searchQuery.toLowerCase();
    return (u.name?.toLowerCase() || '').includes(s) || (u.email?.toLowerCase() || '').includes(s);
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Manage Users</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
             <input
               type="text"
               placeholder="Search by name or email..."
               value={searchQuery}
               onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setCurrentPage(1);
               }}
               className="w-full sm:w-64 border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
             />
             <Link 
               to="/admin/wallet"
               className="w-full sm:w-auto justify-center flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium"
             >
               Wallet Recharges
             </Link>
             <button 
               onClick={() => setShowAddForm(!showAddForm)}
               className="w-full sm:w-auto justify-center flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium"
             >
               <Plus className="w-4 h-4" />
               <span className="hidden sm:inline">{showAddForm ? 'Cancel' : 'Add User'}</span>
             </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {showAddForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Add New User</h2>
            {addError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                 <AlertCircle className="w-4 h-4" />
                 {addError}
              </div>
            )}
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="User Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="At least 6 chars"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select 
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as 'admin'|'user')}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <button 
                  type="submit" 
                  disabled={addingUser}
                  className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition flex items-center justify-center disabled:opacity-70"
                >
                  {addingUser ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm md:text-base">
                  <th className="p-4 font-semibold text-slate-600">Name</th>
                  <th className="p-4 font-semibold text-slate-600">Email</th>
                  <th className="p-4 font-semibold text-slate-600">Role</th>
                  <th className="p-4 font-semibold text-slate-600">Cards</th>
                  <th className="p-4 font-semibold text-slate-600">Wallet (Credits)</th>
                  <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="p-4 text-slate-800 font-medium whitespace-nowrap">
                        <input
                          type="text"
                          value={u.name || ''}
                          placeholder="No Name"
                          onChange={(e) => {
                            const newName = e.target.value;
                            setUsers(users.map(user => user.id === u.id ? { ...user, name: newName } : user));
                          }}
                          onBlur={async () => {
                            try {
                              await updateDoc(doc(db, 'users', u.id), { name: u.name || '' });
                            } catch (err) {
                              console.error("Error updating name:", err);
                            }
                          }}
                          className="w-32 px-2 py-1 border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded outline-none focus:ring-1 focus:ring-emerald-500 text-sm bg-transparent transition-colors"
                        />
                      </td>
                      <td className="p-4 text-slate-800">
                        <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold uppercase shrink-0">
                             {u.name ? u.name[0] : u.email.charAt(0)}
                           </div>
                           <span className="font-medium truncate">{u.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as 'user' | 'admin')}
                          className={`px-3 py-1 rounded-full text-xs font-semibold outline-none border focus:ring-2 focus:ring-emerald-500 cursor-pointer ${
                            u.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700 border-purple-200' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                          disabled={user?.uid === u.id} // prevent self-demotion
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 w-8 h-8 rounded-full font-medium text-sm">
                          {u.cardCount || 0}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={u.freeCredits || 0}
                            onChange={(e) => handleCreditsChange(u.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-slate-300 rounded outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
                          />
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={user?.uid === u.id} // prevent self-deletion
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-600 font-medium px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
