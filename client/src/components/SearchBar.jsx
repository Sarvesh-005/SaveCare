// client/src/components/SearchBar.jsx
import { useState } from 'react';
import { MdSearch, MdClose } from 'react-icons/md';

export default function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  onClear,
  suggestions = [],
  onSelectSuggestion,
  disabled = false
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>
      <div className="search-bar" style={{
        background: 'var(--bg-secondary)',
        border: `1.5px solid ${isFocused ? 'var(--accent-teal)' : 'var(--border-color)'}`,
        boxShadow: isFocused ? '0 0 0 4px rgba(15, 185, 129, 0.1)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <MdSearch size={18} style={{ color: isFocused ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(!!value);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          disabled={disabled}
          style={{
            fontWeight: 500,
            fontSize: 14
          }}
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              onClear?.();
            }}
            className="btn btn-ghost"
            style={{ padding: '4px 8px' }}
          >
            <MdClose size={16} />
          </button>
        )}
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          marginTop: 8,
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          animation: 'slideUp 0.2s ease-out'
        }}>
          {filteredSuggestions.slice(0, 8).map((suggestion, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectSuggestion?.(suggestion);
                onChange(suggestion);
                setShowSuggestions(false);
              }}
              style={{
                padding: '12px 16px',
                borderBottom: idx < filteredSuggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--text-secondary)',
                fontWeight: 500,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-primary)';
                e.currentTarget.style.color = 'var(--accent-teal)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
