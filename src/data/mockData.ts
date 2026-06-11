export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor';
}

export interface Band {
  id: string;
  name: string;
  genre: string;
  schedule: string;
  room: string;
  instructorId: string;
}

export interface Student {
  id: string;
  name: string;
  instrument: string;
  bandId: string;
}

export interface AttendanceRecord {
  studentId: string;
  bandId: string;
  date: string;
  status: 'present' | 'absent';
}

export interface StudentRating {
  id: string;
  studentId: string;
  bandId: string;
  instructorId: string;
  rating: number; // 1 to 5
  notes?: string;
  date: string;
}

export const mockUsers: User[] = [
  { id: 'u-1', name: 'Sarah Jenkins', email: 'sarah.j@lovefirstchurch.com', role: 'instructor' },
  { id: 'u-2', name: 'Marcus Miller', email: 'marcus.m@lovefirstchurch.com', role: 'instructor' },
  { id: 'u-3', name: 'Alice Smith', email: 'alice.s@lovefirstchurch.com', role: 'admin' },
];

export const mockBands: Band[] = [
  { id: 'b-1', name: 'The Garage Rockers', genre: 'Rock', schedule: 'Saturdays (Time TBD)', room: 'Room A (Studio)', instructorId: 'u-1' },
  { id: 'b-2', name: 'Blue Note Collective', genre: 'Jazz', schedule: 'Saturdays (Time TBD)', room: 'Room C (Ensemble)', instructorId: 'u-1' },
  { id: 'b-3', name: 'Acoustic Fusion', genre: 'Acoustic/Folk', schedule: 'Sundays (Time TBD)', room: 'Room B (Acoustic)', instructorId: 'u-2' },
  { id: 'b-4', name: 'Heavy Metal Juniors', genre: 'Metal', schedule: 'Sundays (Time TBD)', room: 'Room A (Studio)', instructorId: 'u-2' },
];

export const mockStudents: Student[] = [
  // Garage Rockers (b-1)
  { id: 's-1', name: 'Liam Gallagher', instrument: 'Vocals', bandId: 'b-1' },
  { id: 's-2', name: 'Noel Gallagher', instrument: 'Lead Guitar', bandId: 'b-1' },
  { id: 's-3', name: 'Paul McGuigan', instrument: 'Bass', bandId: 'b-1' },
  { id: 's-4', name: 'Tony McCarroll', instrument: 'Drums', bandId: 'b-1' },
  
  // Blue Note Collective (b-2)
  { id: 's-5', name: 'Miles Davis', instrument: 'Trumpet', bandId: 'b-2' },
  { id: 's-6', name: 'John Coltrane', instrument: 'Tenor Sax', bandId: 'b-2' },
  { id: 's-7', name: 'Bill Evans', instrument: 'Piano', bandId: 'b-2' },
  { id: 's-8', name: 'Paul Chambers', instrument: 'Double Bass', bandId: 'b-2' },
  
  // Acoustic Fusion (b-3)
  { id: 's-9', name: 'Joni Mitchell', instrument: 'Acoustic Guitar/Vocals', bandId: 'b-3' },
  { id: 's-10', name: 'Bob Dylan', instrument: 'Harmonica/Vocals', bandId: 'b-3' },
  { id: 's-11', name: 'Jacopo Pastorius', instrument: 'Fretless Bass', bandId: 'b-3' },

  // Heavy Metal Juniors (b-4)
  { id: 's-12', name: 'Ozzy Osbourne', instrument: 'Vocals', bandId: 'b-4' },
  { id: 's-13', name: 'Tony Iommi', instrument: 'Guitar', bandId: 'b-4' },
  { id: 's-14', name: 'Geezer Butler', instrument: 'Bass', bandId: 'b-4' },
  { id: 's-15', name: 'Bill Ward', instrument: 'Drums', bandId: 'b-4' },
];

// Helper functions for mock persistence (Session Storage or Local Storage)
const IS_BROWSER = typeof window !== 'undefined';

export function getStoredData() {
  if (!IS_BROWSER) {
    return {
      attendance: [] as AttendanceRecord[],
      ratings: [] as StudentRating[],
      bands: mockBands,
      users: mockUsers,
      students: mockStudents,
    };
  }

  const attendance = JSON.parse(localStorage.getItem('ms_attendance') || '[]') as AttendanceRecord[];
  const ratings = JSON.parse(localStorage.getItem('ms_ratings') || '[]') as StudentRating[];
  
  // Custom bands/users created by admin
  const bands = JSON.parse(localStorage.getItem('ms_bands') || JSON.stringify(mockBands)) as Band[];
  const users = JSON.parse(localStorage.getItem('ms_users') || JSON.stringify(mockUsers)) as User[];
  const students = JSON.parse(localStorage.getItem('ms_students') || JSON.stringify(mockStudents)) as Student[];

  return { attendance, ratings, bands, users, students };
}

export function saveAttendance(studentId: string, bandId: string, date: string, status: 'present' | 'absent') {
  if (!IS_BROWSER) return;
  const { attendance } = getStoredData();
  
  // Update or insert
  const filtered = attendance.filter((r: AttendanceRecord) => !(r.studentId === studentId && r.date === date));
  filtered.push({ studentId, bandId, date, status });
  
  localStorage.setItem('ms_attendance', JSON.stringify(filtered));
}

export function saveStudent(name: string, instrument: string, bandId: string) {
  if (!IS_BROWSER) return;
  const { students } = getStoredData();
  
  const newStudent: Student = {
    id: `s-${Date.now()}`,
    name,
    instrument,
    bandId
  };
  
  students.push(newStudent);
  localStorage.setItem('ms_students', JSON.stringify(students));
  return newStudent;
}

export function updateBand(bandId: string, name: string, genre: string, schedule: string, room: string, instructorId: string) {
  if (!IS_BROWSER) return;
  const { bands } = getStoredData();
  
  const updatedBands = bands.map((b: Band) => {
    if (b.id === bandId) {
      return { ...b, name, genre, schedule, room, instructorId };
    }
    return b;
  });
  
  localStorage.setItem('ms_bands', JSON.stringify(updatedBands));
}

export function saveRating(studentId: string, bandId: string, instructorId: string, rating: number, notes?: string) {
  if (!IS_BROWSER) return;
  const { ratings } = getStoredData();
  
  const newRating: StudentRating = {
    id: `r-${Date.now()}`,
    studentId,
    bandId,
    instructorId,
    rating,
    notes,
    date: new Date().toISOString().split('T')[0]
  };
  
  ratings.push(newRating);
  localStorage.setItem('ms_ratings', JSON.stringify(ratings));
}

export function resetLocalStorage() {
  if (!IS_BROWSER) return;
  localStorage.removeItem('ms_attendance');
  localStorage.removeItem('ms_ratings');
  localStorage.removeItem('ms_bands');
  localStorage.removeItem('ms_users');
  localStorage.removeItem('ms_students');
  localStorage.removeItem('ms_current_user');
}

export function getCurrentUser(): User | null {
  if (!IS_BROWSER) return null;
  const userStr = localStorage.getItem('ms_current_user');
  return userStr ? JSON.parse(userStr) as User : null;
}

export function setCurrentUser(user: User | null) {
  if (!IS_BROWSER) return;
  if (user) {
    localStorage.setItem('ms_current_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('ms_current_user');
  }
}
