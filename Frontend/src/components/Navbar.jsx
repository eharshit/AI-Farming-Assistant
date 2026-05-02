import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Menu, Moon, Sun } from 'lucide-react';

const Navbar = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <header className="navbar glass-panel">
            <div className="container nav-content">
                <Link to="/" className="brand">
                    <Leaf className="brand-icon" size={28} color="var(--primary-color)" />
                    <h1 className="brand-title">Krishi Mitra</h1>
                </Link>
                <nav className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/features" className="nav-link">Features</Link>
                    <Link to="/guide" className="nav-link">How to Use</Link>
                    <Link to="/about" className="nav-link">About Us</Link>
                </nav>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', padding: '5px' }} title="Toggle Theme">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <button className="mobile-menu-btn">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
