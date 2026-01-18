import { useState, useRef, useEffect } from 'react';

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
        <div className="multiselect-dropdown absolute z-50 mt-1 w-full rounded-md max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-3 text-sm text-text-secondary">No options available</div>
          ) : (
            <ul>
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => toggleOption(option.value)}
                      className={isSelected ? 'selected' : ''}
                    >
                      {/* Checkbox */}
                      <div
                        style={{
                          width: '1rem',
                          height: '1rem',
                          border: `2px solid ${isSelected ? '#ffffff' : '#e3f2fd'}`,
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
