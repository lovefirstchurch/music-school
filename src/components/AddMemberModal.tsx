'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, instrument: string) => void;
}

export default function AddMemberModal({ isOpen, onClose, onSubmit }: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [instrument, setInstrument] = useState('');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName('');
      setInstrument('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !instrument.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    onSubmit(name.trim(), instrument.trim());
  };

  return (
    <>
      {/* Dark backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 max-w-md mx-auto transition-opacity"
        onClick={onClose}
      />

      {/* Native Bottom Sheet container */}
      <div className="fixed bottom-0 inset-x-0 z-50 mx-auto max-w-md bg-white rounded-t-2xl border-t border-gray-200 shadow-xl p-4 animate-slide-up flex flex-col">
        {/* Notch indicator */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-1.5">
              <UserPlus className="w-5 h-5 text-gray-700" />
              Add Band Member
            </h3>
            <p className="text-sm text-gray-500 font-medium">Add a new student directly to this band</p>
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Student Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="student-name" className="text-sm font-semibold text-gray-700">
              Student Name
            </label>
            <input
              id="student-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dave Grohl"
              className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 placeholder-gray-400 font-medium min-h-[48px]"
            />
          </div>

          {/* Instrument */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="instrument" className="text-sm font-semibold text-gray-700">
              Instrument
            </label>
            <input
              id="instrument"
              type="text"
              required
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              placeholder="e.g. Drums"
              className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 placeholder-gray-400 font-medium min-h-[48px]"
            />
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
              Add Member
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
