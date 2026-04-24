import React, { useState, useEffect } from 'react';
import { getFarmStatus, getRecommendationHistory, resetFarmStatus, updateFarmStatus } from '../services/api';
import { LayoutDashboard, Sprout, Calendar, ArrowRight, Trash2, History, AlertCircle, ArrowUpCircle } from 'lucide-react';
import './Dashboard.css';

const FARMING_STAGES = [
    { label: 'Soil Preparation', action: 'Prepare land, clear weeds, and plow.', link: null, linkText: null },
    { label: 'Sowing & Planting', action: 'Plant seeds/saplings based on AI recommendations.', link: '/recommend-crop', linkText: '🌱 Get Crop Recommendation' },
    { label: 'Watering & Growth', action: 'Maintain regular irrigation and monitor.', link: '/weather', linkText: '🌦️ Check Weather Forecast' },
    { label: 'Fertilizer Application', action: 'Apply recommended nutrients.', link: '/recommend-fertilizer', linkText: '🧪 Get Fertilizer Plan' },
    { label: 'Harvesting', action: 'Collect mature crops.', link: '/identify-disease', linkText: '🔍 Scan for Post-Harvest Diseases' },
    { label: 'Market & Selling', action: 'Sell produce to market.', link: null, linkText: null }
];

const Dashboard = () => {
    const [status, setStatus] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statusData, historyData] = await Promise.all([
                getFarmStatus(),
                getRecommendationHistory()
            ]);
            setStatus(statusData.active ? statusData : null);
            setHistory(historyData || []);
        } catch (err) {
            setError("Failed to load dashboard data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (window.confirm("Are you sure you want to reset your farm status? This will clear your currently planted crop data.")) {
            try {
                await resetFarmStatus();
                setStatus(null);
            } catch (err) {
                alert("Failed to reset");
            }
        }
    };

    const calculateDaysPlanted = (date) => {
        const start = new Date(date);
        const today = new Date();
        const diffTime = Math.abs(today - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleAdvanceStage = async () => {
        if (!status) return;
        
        // Find current stage index based on status.status string
        let currentIndex = FARMING_STAGES.findIndex(stage => stage.label === status.status);
        if (currentIndex === -1) currentIndex = 0; // Default to first stage if unknown
        
        if (currentIndex < FARMING_STAGES.length - 1) {
            const nextStage = FARMING_STAGES[currentIndex + 1];
            try {
                await updateFarmStatus({
                    crop_name: status.crop_name,
                    date_planted: status.date_planted,
                    status: nextStage.label,
                    next_step: nextStage.action
                });
                // Refresh data
                fetchData();
            } catch (err) {
                alert("Failed to advance stage");
            }
        } else {
            alert("Crop has already reached the final stage!");
        }
    };

    const getCurrentStageIndex = () => {
        if (!status) return 0;
        const index = FARMING_STAGES.findIndex(stage => stage.label === status.status);
        return index !== -1 ? index : 0;
    };

    const getProgressPercentage = () => {
        const index = getCurrentStageIndex();
        return Math.round((index / (FARMING_STAGES.length - 1)) * 100);
    };

    if (loading) return (
        <div className="container section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="loader">Loading Dashboard...</div>
        </div>
    );

    return (
        <div className="container section animate-fade-in">
            <div className="dashboard-header">
                <h1><LayoutDashboard /> Farm Management Dashboard</h1>
                <p className="hero-subtitle">Monitor your crops, track progress, and view latest AI insights.</p>
            </div>

            <div className="dashboard-grid">
                {/* Current Status Card */}
                <div className="glass-panel status-card">
                    <div className="card-header">
                        <h2>Current Activity</h2>
                        {status && (
                            <button onClick={handleReset} className="btn-icon text-error" title="Reset Dashboard">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>

                    {status ? (
                        <div className="status-content">
                            <div className="crop-badge animate-pulse">
                                <Sprout size={40} />
                                <div>
                                    <h3>{status.crop_name}</h3>
                                    <span className="status-tag">{status.status}</span>
                                </div>
                            </div>
                            <div className="status-details">
                                <div className="detail-item">
                                    <Calendar size={18} />
                                    <span>Planted on: {status.date_planted} ({calculateDaysPlanted(status.date_planted)} days ago)</span>
                                </div>
                                <div className="detail-item">
                                    <AlertCircle size={18} />
                                    <span><strong>Next Step:</strong> {status.next_step}</span>
                                </div>
                            </div>
                            <div className="progress-container">
                                <div className="progress-label">
                                    <span>Stage {getCurrentStageIndex() + 1}: {FARMING_STAGES[getCurrentStageIndex()].label}</span>
                                    <span>{getProgressPercentage()}%</span>
                                </div>
                                <div className="progress-bar" style={{ marginBottom: '15px' }}>
                                    <div className="progress-fill" style={{ width: `${getProgressPercentage()}%` }}></div>
                                </div>
                                
                                {getCurrentStageIndex() < FARMING_STAGES.length - 1 && (
                                    <button onClick={handleAdvanceStage} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                        <ArrowUpCircle size={18} /> Advance to Next Stage
                                    </button>
                                )}
                                
                                {FARMING_STAGES[getCurrentStageIndex()].link && (
                                    <a href={FARMING_STAGES[getCurrentStageIndex()].link} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                                        {FARMING_STAGES[getCurrentStageIndex()].linkText}
                                    </a>
                                )}
                                
                                {getCurrentStageIndex() === FARMING_STAGES.length - 1 && (
                                    <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(76, 175, 80, 0.1)', color: 'var(--primary-dark)', borderRadius: '8px', fontWeight: 'bold' }}>
                                        Cycle Complete! Ready for the next season.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Sprout size={48} opacity={0.3} />
                            <p>No active crop detected.</p>
                            <a href="/recommend-crop" className="btn btn-primary btn-sm">Recommend a Crop</a>
                        </div>
                    )}
                </div>

                {/* Quick Actions / Integration Info */}
                <div className="glass-panel info-card">
                    <h2>Smart Farming Tools</h2>
                    <div className="action-links">
                        <a href="/weather" className="action-item">
                            <div className="action-icon weather">🌦️</div>
                            <div className="action-text">
                                <h4>Check Weather</h4>
                                <p>Plan irrigation based on forecast</p>
                            </div>
                            <ArrowRight size={16} />
                        </a>
                        <a href="/identify-disease" className="action-item">
                            <div className="action-icon disease">🔍</div>
                            <div className="action-text">
                                <h4>Identify Disease</h4>
                                <p>Upload leaf images for diagnosis</p>
                            </div>
                            <ArrowRight size={16} />
                        </a>
                        <a href="/recommend-fertilizer" className="action-item">
                            <div className="action-icon fertilizer">🧪</div>
                            <div className="action-text">
                                <h4>Optimise Nutrients</h4>
                                <p>Get fertilizer recommendations</p>
                            </div>
                            <ArrowRight size={16} />
                        </a>
                    </div>
                </div>

                {/* Fertilizers Used Card */}
                <div className="glass-panel history-card" style={{ gridColumn: 'span 1' }}>
                    <div className="card-header">
                        <h2><History size={20} /> Fertilizers Recommended</h2>
                    </div>
                    {history.filter(i => i.type.toLowerCase() === 'fertilizer').length > 0 ? (
                        <div className="history-list">
                            {history.filter(i => i.type.toLowerCase() === 'fertilizer').slice(0, 5).map((item) => (
                                <div key={item.id} className="history-item">
                                    <div className="type-dot fertilizer"></div>
                                    <div className="history-info">
                                        <span className="history-result" style={{ fontSize: '1.1rem' }}>{item.result}</span>
                                    </div>
                                    <span className="history-time">{item.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>No fertilizer history yet.</p>
                    )}
                </div>

                {/* Diseases Identified Card */}
                <div className="glass-panel history-card" style={{ gridColumn: 'span 1' }}>
                    <div className="card-header">
                        <h2><History size={20} /> Diseases Identified</h2>
                    </div>
                    {history.filter(i => i.type.toLowerCase() === 'disease').length > 0 ? (
                        <div className="history-list">
                            {history.filter(i => i.type.toLowerCase() === 'disease').slice(0, 5).map((item) => (
                                <div key={item.id} className="history-item">
                                    <div className="type-dot disease"></div>
                                    <div className="history-info">
                                        <span className="history-result" style={{ fontSize: '1.1rem' }}>{item.result.replace(/___/g, " - ").replace(/_/g, " ")}</span>
                                    </div>
                                    <span className="history-time">{item.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>No disease history yet.</p>
                    )}
                </div>

                {/* General History List (Crops) */}
                <div className="glass-panel history-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <h2><History size={20} /> Crop Recommendations</h2>
                    </div>
                    {history.filter(i => i.type.toLowerCase() === 'crop').length > 0 ? (
                        <div className="history-list">
                            {history.filter(i => i.type.toLowerCase() === 'crop').map((item) => (
                                <div key={item.id} className="history-item">
                                    <div className="type-dot crop"></div>
                                    <div className="history-info">
                                        <span className="history-result">{item.result}</span>
                                    </div>
                                    <span className="history-time">{item.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>No crop recommendation history available yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
