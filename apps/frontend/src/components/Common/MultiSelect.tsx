import { useState, useRef, useEffect } from 'react';
import styles from './MultiSelect.module.css';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, selectedValues, onChange, placeholder = 'Select...' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectedLabels = options
    .filter(opt => selectedValues.includes(opt.value))
    .map(opt => opt.label);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 border border-default rounded-md bg-secondary text-primary focus:ring-2 focus:ring-accent-primary focus:border-transparent min-w-[150px] text-left flex items-center justify-between"
      >
        <span className="truncate">
          {selectedValues.length > 0 ? `${selectedValues.length} selected` : placeholder}
        </span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Selected count badge */}
      {selectedValues.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-accent-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {selectedValues.length}
        </span>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            marginTop: '0.25rem',
            width: '100%',
            backgroundColor: '#1e3a5f',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: '#1e4976',
            borderRadius: '0.375rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 8px 32px rgba(0, 0, 0, 0.4)',
            maxHeight: '15rem',
            overflowY: 'auto',
          }}
        >
          {options.length === 0 ? (
            <div style={{ padding: '0.75rem', color: '#90caf9', fontSize: '0.875rem' }}>No options available</div>
          ) : (
            <ul style={{ backgroundColor: '#1e3a5f', padding: '0.25rem 0', margin: 0, listStyle: 'none' }}>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <li key={option.value} style={{ backgroundColor: '#1e3a5f' }}>
                    <button
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: isSelected ? '#06b6d4' : '#132f4c',
                        color: isSelected ? '#ffffff' : '#e3f2fd',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#2c5282';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#132f4c';
                        }
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        style={{
                          width: '1rem',
                          height: '1rem',
                          borderWidth: '2px',
                          borderStyle: 'solid',
                          borderColor: isSelected ? '#ffffff' : '#e3f2fd',
                          borderRadius: '0.25rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          backgroundColor: isSelected ? '#ffffff' : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <svg
                            width="12"
                            height="12"
                            fill="none"
                            stroke="#06b6d4"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span>{option.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
