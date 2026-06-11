'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit3 } from 'lucide-react';
import { Band, User } from '@/data/mockData';

interface EditBandModalProps {
  isOpen: boolean;
  onClose: () => void;
  band: Band;
  instructors: User[];
  onSubmit: (name: string, genre: string, schedule: string, room: string, instructorId: string) => void;
}

export default function EditBandModal({ isOpen, onClose, band, instructors, onSubmit }: EditBandModalProps) {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [schedule, setSchedule] = useState('');
  const [room, setRoom] = useState('');
  const [instructorId, setInstructorId] = useState('');

  useEffect(() => {
    if (isOpen && band) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(band.name);
      setGenre(band.genre);
      setSchedule(band.schedule);
      setRoom(band.room);
      setInstructorId(band.instructorId);
    }
  }, [isOpen, band]);

  if (!isOpen || !band) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !genre.trim() || !schedule.trim() || !room.trim() || !instructorId) {
      alert('Please fill out all fields.');
      return;
    }
    onSubmit(name.trim(), genre.trim(), schedule.trim(), room.trim(), instructorId);
  };

  return (
    <>
      {/* Dark backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 max-w-md mx-auto transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet container */}
      <div className="fixed bottom-0 inset-x-0 z-50 mx-auto max-w-md bg-white rounded-t-2xl border-t border-gray-200 shadow-xl p-4 animate-slide-up flex flex-col">
        {/* Notch */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-1.5">
              <Edit3 className="w-5 h-5 text-gray-700" />
              Edit Band Details
            </h3>
            <p className="text-sm text-gray-500 font-medium">Update band info, schedules, or room</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-gray-400 hover:text-gray-600 active:bg-gray-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Band Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="band-name" className="text-xs font-bold text-gray-600 uppercase">Band Name</label>
            <input
              id="band-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Garage Rockers"
              className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 font-medium min-h-[42px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Genre */}
            <div className="flex flex-col gap-1">
              <label htmlFor="band-genre" className="text-xs font-bold text-gray-600 uppercase">Genre</label>
              <input
                id="band-genre"
                type="text"
                required
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Rock"
                className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 font-medium min-h-[42px]"
              />
            </div>
            {/* Room */}
            <div className="flex flex-col gap-1">
              <label htmlFor="band-room" className="text-xs font-bold text-gray-600 uppercase">Room</label>
              <input
                id="band-room"
                type="text"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Room A"
                className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 font-medium min-h-[42px]"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="flex flex-col gap-1">
            <label htmlFor="band-schedule" className="text-xs font-bold text-gray-600 uppercase">Schedule</label>
            <input
              id="band-schedule"
              type="text"
              required
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="e.g. Saturdays 10:00 AM - 11:30 AM"
              className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 font-medium min-h-[42px]"
            />
          </div>

          {/* Instructor Assignment */}
          <div className="flex flex-col gap-1">
            <label htmlFor="band-instructor" className="text-xs font-bold text-gray-600 uppercase">Assigned Instructor</label>
            <select
              id="band-instructor"
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="w-full p-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 font-medium min-h-[42px]"
            >
              {instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.role})
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-center text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg active:bg-gray-100 min-h-[48px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-center text-sm font-semibold rounded-lg text-white bg-black hover:bg-gray-800 active:bg-gray-750 shadow-sm min-h-[48px]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
