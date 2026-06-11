'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Check, 
  X, 
  Star, 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  AlertCircle,
  Plus,
  Edit3
} from 'lucide-react';
import { 
  getStoredData, 
  saveAttendance, 
  saveRating, 
  saveStudent,
  updateBand,
  getCurrentUser,
  Student, 
  Band, 
  User,
  AttendanceRecord,
  StudentRating
} from '@/data/mockData';
import RatingModal from '@/components/RatingModal';
import AddMemberModal from '@/components/AddMemberModal';
import EditBandModal from '@/components/EditBandModal';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function BandDetailsPage({ params, searchParams }: PageProps) {
  const router = useRouter();
  
  // Unwrap async params using React.use()
  const unwrappedParams = use(params);
  const unwrappedSearchParams = use(searchParams);
  const bandId = unwrappedParams.id;
  const instructorOverride = unwrappedSearchParams.instructor as string | undefined;

  const [band, setBand] = useState<Band | null>(null);
  const [instructorName, setInstructorName] = useState('Sarah Jenkins');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent'>>({});
  const [ratings, setRatings] = useState<StudentRating[]>([]);
  
  // Rating modal state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  // Add Member modal state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Edit Band modal state
  const [isEditBandOpen, setIsEditBandOpen] = useState(false);
  const [instructors, setInstructors] = useState<User[]>([]);
  
  // Selected date for attendance logging (default to today)
  const [currentDate, setCurrentDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const loadData = () => {
    const data = getStoredData();
    const currentBand = data.bands.find((b: Band) => b.id === bandId);
    
    if (currentBand) {
      setBand(currentBand);
      
      // Get instructor name
      const inst = data.users.find(u => u.id === currentBand.instructorId);
      if (inst) {
        setInstructorName(inst.name);
      } else if (instructorOverride) {
        setInstructorName(instructorOverride + ' Miller');
      }

      // Load available instructors for reassignment
      const allInstructors = data.users.filter(u => u.role === 'instructor');
      setInstructors(allInstructors);

      // Load students in this band
      const bandStudents = data.students.filter((s: Student) => s.bandId === bandId);
      setStudents(bandStudents);

      // Load attendance for this band on selected date
      const bandAttendance = data.attendance.filter(
        (r: AttendanceRecord) => r.bandId === bandId && r.date === currentDate
      );
      
      const attMap: Record<string, 'present' | 'absent'> = {};
      bandAttendance.forEach((r: AttendanceRecord) => {
        attMap[r.studentId] = r.status;
      });
      setAttendance(attMap);

      // Load ratings for this band
      const bandRatings = data.ratings.filter((r: StudentRating) => r.bandId === bandId);
      setRatings(bandRatings);
    }
  };

  useEffect(() => {
    const loggedUser = getCurrentUser();
    if (!loggedUser) {
      router.push('/');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bandId, currentDate]);

  const handleAttendance = (studentId: string, status: 'present' | 'absent') => {
    // If clicking already selected status, toggle it off (unmark)
    const newStatus = attendance[studentId] === status ? undefined : status;
    
    const updated = { ...attendance };
    if (newStatus) {
      updated[studentId] = newStatus;
      saveAttendance(studentId, bandId, currentDate, newStatus);
    } else {
      delete updated[studentId];
      // Remove from storage
      const data = getStoredData();
      const filtered = data.attendance.filter(
        (r: AttendanceRecord) => !(r.studentId === studentId && r.bandId === bandId && r.date === currentDate)
      );
      localStorage.setItem('ms_attendance', JSON.stringify(filtered));
    }
    setAttendance(updated);
  };

  const handleOpenRating = (student: Student) => {
    setSelectedStudent(student);
    setIsRatingOpen(true);
  };

  const handleSubmitRating = (ratingScore: number, notes: string) => {
    if (!selectedStudent) return;
    
    const instructorId = band?.instructorId || 'u-1';
    saveRating(selectedStudent.id, bandId, instructorId, ratingScore, notes);
    
    setIsRatingOpen(false);
    setSelectedStudent(null);
    
    // Refresh ratings in list
    loadData();
  };

  const handleAddMember = (name: string, instrument: string) => {
    saveStudent(name, instrument, bandId);
    setIsAddMemberOpen(false);
    loadData();
  };

  const handleEditBand = (name: string, genre: string, schedule: string, room: string, instructorId: string) => {
    updateBand(bandId, name, genre, schedule, room, instructorId);
    setIsEditBandOpen(false);
    loadData();
  };

  // Helper to count present/absent stats
  const getStats = () => {
    let present = 0;
    let absent = 0;
    students.forEach((s) => {
      if (attendance[s.id] === 'present') present++;
      if (attendance[s.id] === 'absent') absent++;
    });
    return { present, absent, total: students.length };
  };

  // Helper to get latest rating of a student in this band
  const getLatestStudentRating = (studentId: string) => {
    const studentRatings = ratings.filter(r => r.studentId === studentId);
    if (studentRatings.length === 0) return null;
    // Sort descending by date/id
    return studentRatings[studentRatings.length - 1];
  };

  if (!band) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
        <h2 className="text-lg font-bold text-gray-900">Band Not Found</h2>
        <Link href="/" className="mt-4 px-4 py-2 bg-black text-white rounded text-sm font-semibold">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const { present, absent, total } = getStats();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Native Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-3 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-gray-600 active:text-gray-900 py-1.5 -ml-1 pr-2 rounded min-h-[40px]"
        >
          <ChevronLeft className="w-5 h-5 text-gray-800" />
          <span className="text-sm font-semibold">Bands</span>
        </button>
        <h1 className="text-base font-bold text-gray-900 truncate max-w-[180px]">{band.name}</h1>
        <div className="w-16 text-right">
          {/* Empty spacer for alignment */}
        </div>
      </header>

      {/* Band Meta Information Banner */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200">
                {band.genre}
              </span>
              <button
                onClick={() => setIsEditBandOpen(true)}
                className="text-[10px] font-semibold text-gray-600 bg-white border border-gray-300 px-1.5 py-0.5 rounded hover:text-black flex items-center gap-1 min-h-[20px] transition-colors active:bg-gray-50"
              >
                <Edit3 className="w-2.5 h-2.5" />
                Edit Details
              </button>
            </div>
            <div className="flex items-center gap-1.5 mt-2.5 text-xs text-gray-600 font-semibold">
              <UserIcon className="w-3.5 h-3.5 text-gray-400" />
              <span>Instructor: {instructorName}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{band.schedule}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{band.room}</span>
            </div>
          </div>

          {/* Quick Stats Box */}
          <div className="bg-gray-100 border border-gray-200 rounded p-2 text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Attendance</span>
            <span className="text-sm font-bold text-gray-800 block">
              {present + absent} / {total}
            </span>
            <span className="text-[9px] font-semibold text-gray-500 block mt-0.5">
              {present} Pres. • {absent} Abs.
            </span>
          </div>
        </div>

        {/* Date Selector input (native styling) */}
        <div className="flex items-center justify-between gap-3 mt-2 pt-3 border-t border-gray-100">
          <label htmlFor="date-select" className="text-xs font-bold text-gray-500 uppercase">Session Date</label>
          <input
            id="date-select"
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="p-1.5 text-sm bg-white border border-gray-300 rounded font-semibold text-gray-800 focus:outline-none focus:border-gray-500"
          />
        </div>
      </div>

      {/* Students List Container */}
      <div className="flex-1 px-4 py-4">
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Band Members ({total})</h3>
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-red-600 active:text-red-800 bg-white border border-gray-300 px-2.5 py-1 rounded shadow-sm min-h-[30px]"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>
        
        {students.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500 text-sm">
            No students currently registered in this band.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {students.map((student) => {
              const status = attendance[student.id];
              const isLogged = status !== undefined;
              const latestRating = getLatestStudentRating(student.id);

              return (
                <div
                  key={student.id}
                  className={`flex items-center justify-between bg-white border rounded-lg transition-all ${
                    isLogged 
                      ? 'border-gray-200 bg-gray-50/75 opacity-70' 
                      : 'border-gray-300'
                  }`}
                >
                  {/* Student Info Button (Launches performance rating bottom sheet) */}
                  <button
                    onClick={() => handleOpenRating(student)}
                    className="flex-1 text-left p-3.5 focus:outline-none group active-tap rounded-l-lg min-h-[56px] flex flex-col justify-center"
                    title="Click name to rate student performance"
                  >
                    <span className="font-bold text-gray-900 text-sm group-hover:underline block leading-tight">
                      {student.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs text-gray-500 font-medium">
                        {student.instrument}
                      </span>
                      {latestRating && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-yellow-50 border border-yellow-200 text-yellow-700 px-1.5 py-0.2 rounded-full">
                          <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                          {latestRating.rating} ★
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Attendance Controls */}
                  <div className="flex items-center gap-2 px-3 border-l border-gray-100">
                    {/* Check icon (Present) */}
                    <button
                      onClick={() => handleAttendance(student.id, 'present')}
                      className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
                        status === 'present'
                          ? 'bg-green-600 border-green-600 text-white shadow-sm'
                          : 'bg-white border-gray-300 text-gray-400 active:bg-gray-100'
                      }`}
                      aria-label="Mark Present"
                    >
                      <Check className="w-5.5 h-5.5 stroke-[2.5]" />
                    </button>

                    {/* X icon (Absent) */}
                    <button
                      onClick={() => handleAttendance(student.id, 'absent')}
                      className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all ${
                        status === 'absent'
                          ? 'bg-red-600 border-red-600 text-white shadow-sm'
                          : 'bg-white border-gray-300 text-gray-400 active:bg-gray-100'
                      }`}
                      aria-label="Mark Absent"
                    >
                      <X className="w-5.5 h-5.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ratings History Section (Helpful validation display) */}
      {ratings.length > 0 && (
        <div className="px-4 pb-6 mt-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Recent Session Ratings</h3>
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200 overflow-hidden">
            {ratings.slice(-3).reverse().map((r) => {
              const stud = students.find(s => s.id === r.studentId);
              return (
                <div key={r.id} className="p-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-gray-800">{stud ? stud.name : 'Unknown Student'}</span>
                    <div className="flex gap-0.5 text-yellow-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  {r.notes && <p className="text-xs text-gray-600 mt-1 italic font-medium bg-gray-50 p-1.5 border border-gray-200 rounded">&quot;{r.notes}&quot;</p>}
                  <span className="text-[10px] text-gray-400 font-medium block mt-1">{r.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Native bottom-sheet rating modal */}
      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        student={selectedStudent}
        onSubmit={handleSubmitRating}
      />

      {/* Add Member bottom-sheet modal */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSubmit={handleAddMember}
      />

      {/* Edit Band bottom-sheet modal */}
      <EditBandModal
        isOpen={isEditBandOpen}
        onClose={() => setIsEditBandOpen(false)}
        band={band}
        instructors={instructors}
        onSubmit={handleEditBand}
      />
    </div>
  );
}
