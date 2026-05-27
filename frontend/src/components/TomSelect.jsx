// Custom select dropdown — accessible replacement for native <select>.
// Features: trigger button with chevron arrow (rotates on open),
// dropdown with highlighted selected option, click-outside and Escape handling.
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function MinimalSelect({ id, value, onChange, options, placeholder, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`minimal-select ${className || ''}`} ref={containerRef}>
      <button
        type="button"
        className="minimal-select__trigger"
        onClick={() => setIsOpen(prev => !prev)}
        id={id}
      >
        <span className={`minimal-select__text ${!selectedOption ? 'minimal-select__text--placeholder' : ''}`}>
          {selectedOption ? selectedOption.text : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`minimal-select__arrow ${isOpen ? 'minimal-select__arrow--open' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="minimal-select__dropdown">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`minimal-select__option ${opt.value === value ? 'minimal-select__option--selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
