import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search } from 'lucide-react';

// Inject shared styles once
if (typeof document !== 'undefined' && !document.getElementById('custom-select-styles')) {
    const style = document.createElement('style');
    style.id = 'custom-select-styles';
    style.textContent = `
        @keyframes customSelectFadeIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .cs-options::-webkit-scrollbar { width: 6px; }
        .cs-options::-webkit-scrollbar-track { background: transparent; }
        .cs-options::-webkit-scrollbar-thumb {
            background: rgba(46,125,50,0.25);
            border-radius: 3px;
        }
    `;
    document.head.appendChild(style);
}

const CustomSelect = ({ id, name, value, options, onChange, placeholder, required, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [highlightIdx, setHighlightIdx] = useState(-1);
    const containerRef = useRef(null);
    const listRef = useRef(null);
    const searchRef = useRef(null);

    const filtered = search
        ? options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
        : options;

    const displayValue = value || placeholder || '-- Select --';

    const close = useCallback(() => {
        setIsOpen(false);
        setSearch('');
        setHighlightIdx(-1);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) close();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [close]);

    useEffect(() => {
        if (isOpen && searchRef.current) searchRef.current.focus();
    }, [isOpen]);

    useEffect(() => {
        if (highlightIdx >= 0 && listRef.current) {
            const el = listRef.current.children[highlightIdx];
            if (el) el.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightIdx]);

    const select = (val) => {
        onChange({ target: { name, value: val } });
        close();
    };

    const handleKeyDown = (e) => {
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
                setHighlightIdx(i => Math.min(i + 1, filtered.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightIdx(i => Math.max(i - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightIdx >= 0 && filtered[highlightIdx]) select(filtered[highlightIdx]);
                break;
            case 'Escape':
                e.preventDefault();
                close();
                break;
        }
    };

    return (
        <div ref={containerRef} style={{ position: 'relative' }} onKeyDown={handleKeyDown}>
            {/* Trigger */}
            <button
                type="button"
                id={id}
                tabIndex={0}
                onClick={() => setIsOpen(o => !o)}
                style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: isOpen ? '1px solid var(--primary-color)' : '1px solid #ddd',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    textAlign: 'left',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    outline: 'none',
                    boxShadow: isOpen ? '0 0 0 3px rgba(46,125,50,0.1)' : 'none',
                    color: value ? '#1a1a1a' : '#999',
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {displayValue}
                </span>
                <ChevronDown
                    size={16}
                    style={{
                        flexShrink: 0,
                        transition: 'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: '#888'
                    }}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(46,125,50,0.15)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                    animation: 'customSelectFadeIn 0.15s ease-out',
                }}>
                    {/* Search */}
                    {options.length > 8 && (
                        <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: 'rgba(0,0,0,0.03)',
                                border: '1px solid rgba(0,0,0,0.06)',
                            }}>
                                <Search size={14} color="#999" />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setHighlightIdx(0); }}
                                    placeholder="Type to search..."
                                    style={{
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        fontSize: '0.88rem',
                                        width: '100%',
                                        color: '#333',
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Options */}
                    <div
                        ref={listRef}
                        className="cs-options"
                        style={{
                            maxHeight: '220px',
                            overflowY: 'auto',
                            padding: '6px',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(46,125,50,0.3) transparent',
                        }}
                    >
                        {placeholder && (
                            <div
                                onClick={() => select('')}
                                style={{
                                    padding: '9px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.92rem',
                                    color: '#999',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {placeholder}
                            </div>
                        )}
                        {filtered.length === 0 && (
                            <div style={{ padding: '12px', textAlign: 'center', color: '#aaa', fontSize: '0.88rem' }}>
                                No results found
                            </div>
                        )}
                        {filtered.map((item, idx) => {
                            const isSelected = item === value;
                            const isHighlighted = idx === highlightIdx;
                            return (
                                <div
                                    key={item}
                                    onClick={() => select(item)}
                                    onMouseEnter={() => setHighlightIdx(idx)}
                                    style={{
                                        padding: '9px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.92rem',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                        background: isSelected
                                            ? 'rgba(46,125,50,0.1)'
                                            : isHighlighted
                                                ? 'rgba(0,0,0,0.04)'
                                                : 'transparent',
                                        color: isSelected ? 'var(--primary-dark)' : '#333',
                                        fontWeight: isSelected ? 600 : 400,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    {item}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
