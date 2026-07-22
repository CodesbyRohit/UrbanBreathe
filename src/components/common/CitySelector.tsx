import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import type { City } from '../../types';

interface CitySelectorProps {
  cities: City[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function CitySelector({ cities, selectedId, onSelect }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedCity = cities.find(c => c.id === selectedId);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    const el = listRef.current?.children[highlightedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  // Reset highlighted when opening
  useEffect(() => {
    if (isOpen) {
      const idx = cities.findIndex(c => c.id === selectedId);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, cities, selectedId]);

  const selectOption = useCallback((id: string) => {
    onSelect(id);
    setIsOpen(false);
    triggerRef.current?.focus();
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < cities.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : cities.length - 1));
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIndex(cities.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < cities.length) {
          selectOption(cities[highlightedIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
    }
  }, [isOpen, cities, highlightedIndex, selectOption]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        id="city-selector"
        aria-label="Select a city"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="city-listbox"
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={handleKeyDown}
        className={`
          flex items-center gap-1.5 text-sm font-medium
          bg-transparent border-none outline-none cursor-pointer
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600
          rounded-md transition-colors
          text-slate-700
          px-2 py-1 -ml-2
          hover:bg-slate-100
        `}
      >
        <MapPin size={14} className="text-slate-400 shrink-0" />
        <span className={selectedCity ? '' : 'text-slate-400'}>
          {selectedCity ? `${selectedCity.name}, ${selectedCity.state}` : 'Select city'}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id="city-listbox"
          role="listbox"
          aria-label="Cities"
          aria-activedescendant={highlightedIndex >= 0 ? `city-option-${highlightedIndex}` : undefined}
          tabIndex={-1}
          className={`
            absolute left-0 top-full mt-1 z-50
            w-64 max-h-72 overflow-auto
            rounded-lg border shadow-lg
            bg-white border-slate-200
            py-1
            animate-scale-in origin-top
          `}
        >
          {cities.map((city, index) => {
            const isSelected = city.id === selectedId;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={city.id}
                id={`city-option-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => selectOption(city.id)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  px-3 py-2 text-sm cursor-pointer flex items-center justify-between
                  transition-colors duration-100
                  ${isSelected
                    ? 'bg-blue-600 text-white'
                    : isHighlighted
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-700'
                  }
                `}
              >
                <span className="truncate">
                  {city.name}, {city.state}
                </span>
                {isSelected && (
                  <svg className="w-4 h-4 shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </li>
            );
          })}
          {cities.length === 0 && (
            <li className="px-3 py-4 text-sm text-slate-400 text-center" role="status">
              No cities available
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
