'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Music, 
  Calendar, 
  ChevronRight, 
  Trash2, 
  UserPlus, 
  RotateCcw,
  Star,
  LogOut,
  Mail,
  Lock,
  LayoutDashboard,
  User as UserIcon
} from 'lucide-react';
import { 
  User, 
  Band, 
  getStoredData, 
  resetLocalStorage, 
  Student, 
  StudentRating,
  getCurrentUser,
  setCurrentUser
} from '@/data/mockData';

export default function Home() {
  // Authentication states
  const [currentUser, setCurrentUserSession] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState(''); // Simulated password
  
  // Dashboard navigation tab state
  const [activeTab, setActiveTab] = useState<string>('');

  // Database states
  const [users, setUsers] = useState<User[]>([]);
  const [bands, setBands] = useState<Band[]>([]);
  const [ratings, setRatings] = useState<StudentRating[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  // Admin form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'instructor' | 'admin'>('instructor');
  
  const [newBandName, setNewBandName] = useState('');
  const [newBandGenre, setNewBandGenre] = useState('');
  const [newBandSchedule, setNewBandSchedule] = useState('');
  const [newBandRoom, setNewBandRoom] = useState('');
  const [newBandInstructorId, setNewBandInstructorId] = useState('');

  // Load state from local storage
  const loadData = () => {
    const data = getStoredData();
    setUsers(data.users);
    setBands(data.bands);
    setRatings(data.ratings);
    setStudents(data.students);
    
    const loggedUser = getCurrentUser();
    setCurrentUserSession(loggedUser);
    
    if (loggedUser) {
      // Set default tab based on role if not set
      if (!activeTab) {
        if (loggedUser.role === 'admin') {
          setActiveTab('dashboard');
        } else {
          setActiveTab('bands');
        }
      }
    } else {
      setActiveTab('');
    }

    if (data.users.length > 0 && !newBandInstructorId) {
      const firstInst = data.users.find(u => u.role === 'instructor');
      if (firstInst) {
        setNewBandInstructorId(firstInst.id);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all mock database changes? This will log you out and clear attendance/ratings.')) {
      resetLocalStorage();
      setCurrentUser(null);
      setCurrentUserSession(null);
      setActiveTab('');
      loadData();
    }
  };

  // Login handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      alert('Please enter your email.');
      return;
    }

    const matchedUser = users.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    if (!matchedUser) {
      alert('Email not found. Use a demo account or register an account in Admin view.');
      return;
    }

    setCurrentUser(matchedUser);
    setCurrentUserSession(matchedUser);
    setLoginEmail('');
    setLoginPassword('');
    setActiveTab(matchedUser.role === 'admin' ? 'dashboard' : 'bands');
  };

  const handleQuickLogin = (demoUser: User) => {
    setCurrentUser(demoUser);
    setCurrentUserSession(demoUser);
    setActiveTab(demoUser.role === 'admin' ? 'dashboard' : 'bands');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserSession(null);
    setActiveTab('');
  };

  // Add User handler (Admin)
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Please fill out all user fields.');
      return;
    }
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('ms_users', JSON.stringify(updatedUsers));
    
    setNewUserName('');
    setNewUserEmail('');
    
    if (newUser.role === 'instructor' && !newBandInstructorId) {
      setNewBandInstructorId(newUser.id);
    }
  };

  // Delete User handler (Admin)
  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('ms_users', JSON.stringify(updatedUsers));
  };

  // Add Band handler (Admin)
  const handleAddBand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBandName.trim() || !newBandGenre.trim() || !newBandSchedule.trim() || !newBandRoom.trim() || !newBandInstructorId) {
      alert('Please fill out all band fields.');
      return;
    }
    const newBand: Band = {
      id: `b-${Date.now()}`,
      name: newBandName,
      genre: newBandGenre,
      schedule: newBandSchedule,
      room: newBandRoom,
      instructorId: newBandInstructorId
    };
    const updatedBands = [...bands, newBand];
    setBands(updatedBands);
    localStorage.setItem('ms_bands', JSON.stringify(updatedBands));
    
    setNewBandName('');
    setNewBandGenre('');
    setNewBandSchedule('');
    setNewBandRoom('');
  };

  // Delete Band handler (Admin)
  const handleDeleteBand = (id: string) => {
    const updatedBands = bands.filter(b => b.id !== id);
    setBands(updatedBands);
    localStorage.setItem('ms_bands', JSON.stringify(updatedBands));
  };

  // Helper to count students in a band
  const getStudentCount = (bandId: string) => {
    return students.filter(s => s.bandId === bandId).length;
  };

  // Helper to get average rating for band
  const getBandAverageRating = (bandId: string) => {
    const bandRatings = ratings.filter(r => r.bandId === bandId);
    if (bandRatings.length === 0) return null;
    const sum = bandRatings.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / bandRatings.length).toFixed(1);
  };

  // Auth Guard view (Not logged in)
  if (!currentUser) {
    // Demo accounts list
    const demoInstructors = users.filter(u => u.role === 'instructor');
    const demoAdmins = users.filter(u => u.role === 'admin');

    return (
      <div className="flex flex-col min-h-screen bg-gray-50 px-4 py-8 justify-center">
        {/* App Title Banner */}
        <div className="flex flex-col items-center text-center mb-8">
          <Image 
            src="/lovefirst-logo.jpg" 
            alt="LoveFirst Church Logo" 
            width={128}
            height={128}
            className="w-32 h-32 object-contain rounded-xl mb-4 border border-gray-200"
          />
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">LoveFirst Church</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Mobile Portal for Admins & Instructors</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold text-gray-900">Sign In to Your Session</h2>
          
          <div className="flex flex-col gap-1">
            <label htmlFor="login-email" className="text-xs font-bold text-gray-600 uppercase">Church Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                id="login-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. sarah.j@musicschool.com"
                className="w-full pl-10 pr-3 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 font-medium"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="login-password" className="text-xs font-bold text-gray-600 uppercase">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="•••••••• (Any password works)"
                className="w-full pl-10 pr-3 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-black hover:bg-gray-800 active:bg-gray-700 text-white text-sm font-semibold rounded-lg shadow-sm min-h-[48px] mt-2 transition-all"
          >
            Log In
          </button>
        </form>

        {/* Quick Demo Login Drawer */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Quick Demo Login</h3>
          
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase px-1">Instructors</span>
            {demoInstructors.map((inst) => (
              <button
                key={inst.id}
                onClick={() => handleQuickLogin(inst)}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 active:bg-gray-150 hover:bg-gray-100 transition-colors text-left text-xs font-semibold text-gray-700 min-h-[44px]"
              >
                <span>{inst.name} ({inst.email})</span>
                <span className="text-[10px] uppercase font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                  Instructor
                </span>
              </button>
            ))}

            <span className="text-[10px] font-bold text-gray-500 uppercase px-1 mt-2">Admins</span>
            {demoAdmins.map((adm) => (
              <button
                key={adm.id}
                onClick={() => handleQuickLogin(adm)}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50 active:bg-gray-150 hover:bg-gray-100 transition-colors text-left text-xs font-semibold text-gray-700 min-h-[44px]"
              >
                <span>{adm.name} ({adm.email})</span>
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Reset Option */}
        <button
          onClick={handleReset}
          className="mt-6 text-center text-xs font-bold text-gray-400 hover:text-gray-600 active:underline flex items-center justify-center gap-1 py-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Mock Database
        </button>
      </div>
    );
  }

  // Active Session Layout
  const isInstructor = currentUser.role === 'instructor';
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image 
            src="/lovefirst-logo.jpg" 
            alt="LoveFirst Logo" 
            width={36}
            height={36}
            className="w-9 h-9 object-contain rounded-lg border border-gray-150"
          />
          <div>
            <span className="text-[9px] font-bold text-red-650 tracking-wider uppercase block">LoveFirst Church</span>
            <h1 className="text-sm font-bold text-gray-900 tracking-tight leading-none mt-0.5">{currentUser.name}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-full border border-gray-200 text-gray-400 bg-white hover:text-gray-600 active:bg-gray-100 flex items-center justify-center min-h-[36px] min-w-[36px]"
            title="Reset database to initial mock state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full border border-red-200 text-red-600 bg-white hover:bg-red-50 active:bg-red-100 flex items-center justify-center min-h-[36px] min-w-[36px]"
            title="Log out session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Tab Panel Content Area */}
      <div className="flex-1 px-4 py-4 pb-20">
        
        {/* INSTRUCTOR TABS */}
        {isInstructor && (
          <>
            {/* Tab: Bands */}
            {activeTab === 'bands' && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">My Assigned Bands</h2>
                {bands.filter(b => b.instructorId === currentUser.id).length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm">
                    No bands currently assigned to your instructor profile.
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                    {bands.filter(b => b.instructorId === currentUser.id).map((band) => (
                      <Link
                        key={band.id}
                        href={`/band/${band.id}`}
                        className="flex items-center justify-between p-4 active:bg-gray-50 transition-colors group min-h-[56px]"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-baseline gap-2">
                            <h4 className="font-bold text-gray-900 text-base leading-tight group-hover:text-red-600 transition-colors">
                              {band.name}
                            </h4>
                            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">
                              {band.genre}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5 mt-1.5 text-xs text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {band.schedule}
                            </span>
                            <span className="flex items-center gap-1.5 mt-0.5">
                              <Users className="w-3.5 h-3.5 text-gray-400" />
                              {getStudentCount(band.id)} members
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getBandAverageRating(band.id) && (
                            <div className="flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {getBandAverageRating(band.id)}
                            </div>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ADMIN TABS */}
        {isAdmin && (
          <>
            {/* Tab: Dashboard Summary Overview */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">School Overview</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-3.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Bands</span>
                    <span className="text-2xl font-bold text-gray-900 mt-1 block">{bands.length}</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Students</span>
                    <span className="text-2xl font-bold text-gray-900 mt-1 block">{students.length}</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Instructors</span>
                    <span className="text-2xl font-bold text-gray-900 mt-1 block">
                      {users.filter(u => u.role === 'instructor').length}
                    </span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Ratings</span>
                    <span className="text-2xl font-bold text-gray-900 mt-1 block">{ratings.length}</span>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase px-1">Quick Links</span>
                  <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                    <button 
                      onClick={() => setActiveTab('bands')}
                      className="w-full flex items-center justify-between p-3.5 active:bg-gray-50 text-left min-h-[48px]"
                    >
                      <span className="text-sm font-semibold text-gray-700">Manage Bands ({bands.length})</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="w-full flex items-center justify-between p-3.5 active:bg-gray-50 text-left min-h-[48px]"
                    >
                      <span className="text-sm font-semibold text-gray-700">Manage Users ({users.length})</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Manage Bands */}
            {activeTab === 'bands' && (
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manage Bands</h2>
                  <span className="text-xs font-semibold text-gray-500">{bands.length} total</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                  {bands.map((b) => {
                    const inst = users.find(u => u.id === b.instructorId);
                    return (
                      <div key={b.id} className="flex items-center justify-between p-4 min-h-[56px]">
                        <div>
                          <Link href={`/band/${b.id}`} className="font-bold text-gray-900 text-sm hover:underline block leading-tight">
                            {b.name}
                          </Link>
                          <span className="text-xs text-gray-500 font-medium block mt-1">
                            Instructor: {inst ? inst.name : 'Unassigned'}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5 block">
                            {b.genre} • {b.room} • {getStudentCount(b.id)} Members
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/band/${b.id}`}
                            className="p-1 text-gray-400 hover:text-black active:bg-gray-100 rounded"
                            title="View band members list and attendance"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </Link>
                          {b.id !== 'b-1' && b.id !== 'b-2' && b.id !== 'b-3' && b.id !== 'b-4' && (
                            <button
                              onClick={() => handleDeleteBand(b.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 active:bg-gray-100 rounded"
                              aria-label={`Delete ${b.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Band Form */}
                <form onSubmit={handleAddBand} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-gray-500" />
                    Create New Band
                  </h4>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Band Name (e.g. Jazz Band B)"
                      value={newBandName}
                      onChange={(e) => setNewBandName(e.target.value)}
                      className="w-full p-2 text-sm bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Genre"
                        value={newBandGenre}
                        onChange={(e) => setNewBandGenre(e.target.value)}
                        className="p-2 text-sm bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                      />
                      <input
                        type="text"
                        placeholder="Room"
                        value={newBandRoom}
                        onChange={(e) => setNewBandRoom(e.target.value)}
                        className="p-2 text-sm bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Schedule (e.g. Saturdays (Time TBD))"
                      value={newBandSchedule}
                      onChange={(e) => setNewBandSchedule(e.target.value)}
                      className="w-full p-2 text-sm bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">Assign Instructor</label>
                      <select
                        value={newBandInstructorId}
                        onChange={(e) => setNewBandInstructorId(e.target.value)}
                        className="w-full p-2 text-sm bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-gray-500"
                      >
                        {users.filter(u => u.role === 'instructor').map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 active:bg-gray-700 min-h-[38px] mt-1"
                    >
                      Scaffold Band
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab: Manage Users */}
            {activeTab === 'users' && (
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Manage Users</h2>
                  <span className="text-xs font-semibold text-gray-500">{users.length} total</span>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3.5 min-h-[48px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">{u.name}</span>
                        <span className="text-xs text-gray-500 font-medium">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          u.role === 'admin' 
                            ? 'bg-blue-50 border-blue-200 text-blue-700' 
                            : 'bg-green-50 border-green-200 text-green-700'
                        }`}>
                          {u.role}
                        </span>
                        {u.id !== 'u-1' && u.id !== 'u-2' && u.id !== 'u-3' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1 text-gray-400 hover:text-red-600 active:bg-gray-100 rounded"
                            aria-label={`Delete ${u.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add User Form */}
                <form onSubmit={handleAddUser} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-800 uppercase flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-gray-500" />
                    Add New User
                  </h4>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full p-2 text-sm bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full p-2 text-sm bg-white border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as 'instructor' | 'admin')}
                        className="flex-1 p-2 text-sm bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-gray-500"
                      >
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="submit"
                        className="px-4 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 active:bg-gray-700 min-h-[36px]"
                      >
                        Add User
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        {/* PROFILE TAB (Shared Tab) */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">User Account Details</h2>
            
            {/* Account Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  currentUser.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{currentUser.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded block w-fit mt-1 ${
                    currentUser.role === 'admin' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-green-50 border-green-200 text-green-700'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2.5 text-sm font-medium">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase block">Email Address</span>
                  <span className="text-gray-800">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase block">User ID</span>
                  <span className="text-gray-800 font-mono text-xs">{currentUser.id}</span>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-semibold rounded-lg shadow-sm min-h-[48px] flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Session
            </button>
          </div>
        )}
      </div>

      {/* iOS/Android style bottom navigation tab bar */}
      <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-md bg-white border-t border-gray-200 h-[56px] flex items-center justify-around z-20 shadow-sm">
        {/* INSTRUCTOR BOTTOM TABS */}
        {isInstructor && (
          <>
            <button
              onClick={() => setActiveTab('bands')}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 focus:outline-none ${
                activeTab === 'bands' ? 'text-black' : 'text-gray-400'
              }`}
            >
              <Music className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold tracking-tight">My Bands</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 focus:outline-none ${
                activeTab === 'profile' ? 'text-black' : 'text-gray-400'
              }`}
            >
              <UserIcon className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold tracking-tight">Profile</span>
            </button>
          </>
        )}

        {/* ADMIN BOTTOM TABS */}
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 focus:outline-none ${
                activeTab === 'dashboard' ? 'text-black' : 'text-gray-400'
              }`}
            >
              <LayoutDashboard className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold tracking-tight">Summary</span>
            </button>

            <button
              onClick={() => setActiveTab('bands')}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 focus:outline-none ${
                activeTab === 'bands' ? 'text-black' : 'text-gray-400'
              }`}
            >
              <Music className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold tracking-tight">Bands</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 focus:outline-none ${
                activeTab === 'users' ? 'text-black' : 'text-gray-400'
              }`}
            >
              <Users className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold tracking-tight">Users</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 focus:outline-none ${
                activeTab === 'profile' ? 'text-black' : 'text-gray-400'
              }`}
            >
              <UserIcon className="w-5.5 h-5.5" />
              <span className="text-[10px] font-bold tracking-tight">Profile</span>
            </button>
          </>
        )}
      </nav>
    </div>
  );
}
