'use client';

import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { Student } from '@/data/mockData';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSubmit: (rating: number, notes: string) => void;
}

export default function RatingModal({ isOpen, onClose, student, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  // Reset fields when student changes or modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRating(0);
      setNotes('');
    }
  }, [isOpen, student]);

  if (!isOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a star rating.');
      return;
    }
    onSubmit(rating, notes);
  };

  return (
    <>
      {/* Dark backdrop overlay - matches native sheet overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 max-w-md mx-auto transition-opacity"
        onClick={onClose}
      />

      {/* Native Bottom Sheet container */}
      <div className="fixed bottom-0 inset-x-0 z-50 mx-auto max-w-md bg-white rounded-t-2xl border-t border-gray-200 shadow-xl p-4 animate-slide-up flex flex-col">
        {/* Notch indicator for iOS style bottom sheet */}
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Rate Performance</h3>
            <p className="text-sm text-gray-500 font-medium">Student: {student.name}</p>
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
          {/* Star selector */}
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-sm font-medium text-gray-600">Select Rating (1-5 stars)</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isActive = (hoveredRating || rating) >= starValue;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-2 rounded-lg text-gray-300 active:scale-95 transition-transform min-h-[48px] min-w-[48px] flex items-center justify-center"
                    aria-label={`Rate ${starValue} stars`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isActive
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <span className="text-sm font-semibold text-yellow-600">
                {rating === 1 && 'Needs Improvement'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent!'}
              </span>
            )}
          </div>

          {/* Optional notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-sm font-semibold text-gray-700">
              Instructor Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide constructive feedback, lesson progress, or homework assignments..."
              className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 placeholder-gray-400 resize-none font-medium"
            />
          </div>

          {/* Action buttons with high-contrast native colors */}
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
              disabled={rating === 0}
              className={`flex-1 py-3 text-center text-sm font-semibold rounded-lg text-white shadow-sm min-h-[48px] ${
                rating === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-black active:bg-gray-800'
              }`}
            >
              Submit Rating
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
