import React, { useState, useEffect } from 'react';
import { getFarmStatus, getRecommendationHistory, resetFarmStatus, updateFarmStatus } from '../services/api';
import { LayoutDashboard, Sprout, Calendar, ArrowRight, Trash2, History, AlertCircle, ArrowUpCircle, CloudSun, Search, FlaskConical, Leaf, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import './Dashboard.css';

const FARMING_STAGES = [
    { label: 'Soil Preparation', action: 'Prepare land, clear weeds, and plow.', link: null, linkText: null, linkIcon: null },
    { label: 'Sowing & Planting', action: 'Plant seeds/saplings based on AI recommendations.', link: '/recommend-crop', linkText: 'Get Crop Recommendation', linkIcon: Leaf },
    { label: 'Watering & Growth', action: 'Maintain regular irrigation and monitor.', link: '/weather', linkText: 'Check Weather Forecast', linkIcon: CloudSun },
    { label: 'Fertilizer Application', action: 'Apply recommended nutrients.', link: '/recommend-fertilizer', linkText: 'Get Fertilizer Plan', linkIcon: FlaskConical },
    { label: 'Harvesting', action: 'Collect mature crops.', link: '/identify-disease', linkText: 'Scan for Diseases', linkIcon: Search },
    { label: 'Market & Selling', action: 'Check market prices and sell produce.', link: '/predict-price', linkText: 'Predict Market Prices', linkIcon: TrendingUp }
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

    const handleStartSeason = async () => {
        try {
            await updateFarmStatus({
                crop_name: "Preparing Field",
                date_planted: new Date().toISOString().split('T')[0],
                status: "Soil Preparation",
                next_step: "Prepare land, clear weeds, and plow."
            });
            fetchData();
        } catch (err) {
            alert("Failed to start season");
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

    if (loading) return (
        <div className="container section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="loader">Loading Dashboard...</div>
        </div>
    );

    const currentStageIdx = getCurrentStageIndex();
    const currentStage = FARMING_STAGES[currentStageIdx];
    const StageIcon = currentStage.linkIcon;

    return (
        <div className="container section animate-fade-in">
            {/* Header */}
            <div className="dash-header">
                <div className="dash-header-text">
                    <h1>Dashboard</h1>
                    <p>Monitor crops, track progress, and access AI tools.</p>
                </div>
            </div>

            <div className="dash-grid">
                {/* ---- LEFT COLUMN ---- */}
                <div className="dash-left">
                    {/* Current Activity */}
                    <div className="dash-card">
                        <div className="dash-card-top">
                            <div className="dash-card-title">
                                <Sprout size={18} />
                                <span>Current Activity</span>
                            </div>
                            {status && (
                                <button onClick={handleReset} className="btn-icon text-error" title="Reset">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>

                        {status ? (
                            <>
                                {/* Crop info row */}
                                <div className="dash-crop-row">
                                    <div className="dash-crop-icon">
                                        <Sprout size={22} />
                                    </div>
                                    <div className="dash-crop-info">
                                        <h3>{status.crop_name}</h3>
                                        <span className="dash-stage-tag">{status.status}</span>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="dash-meta">
                                    <div className="dash-meta-item">
                                        <Calendar size={15} />
                                        <span>Planted {status.date_planted} &middot; {calculateDaysPlanted(status.date_planted)}d ago</span>
                                    </div>
                                    <div className="dash-meta-item">
                                        <AlertCircle size={15} />
                                        <span><strong>Next:</strong> {status.next_step}</span>
                                    </div>
                                </div>

                                {/* Stepper */}
                                <div className="dash-stepper">
                                    {FARMING_STAGES.map((stage, idx) => {
                                        const isCompleted = idx < currentStageIdx;
                                        const isActive = idx === currentStageIdx;
                                        return (
                                            <div key={idx} className={`dash-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                                <div className="dash-step-dot">
                                                    {isCompleted ? <CheckCircle2 size={14} /> : <span>{idx + 1}</span>}
                                                </div>
                                                <div className="dash-step-label">{stage.label}</div>
                                                {idx < FARMING_STAGES.length - 1 && <div className="dash-step-line" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Actions */}
                                <div className="dash-actions">
                                    {currentStageIdx < FARMING_STAGES.length - 1 && (
                                        <button onClick={handleAdvanceStage} className="dash-btn-primary">
                                            <ArrowUpCircle size={16} /> Mark Stage Complete
                                        </button>
                                    )}
                                    {currentStage.link && StageIcon && (
                                        <a href={currentStage.link} className="dash-btn-outline">
                                            <StageIcon size={16} /> {currentStage.linkText}
                                        </a>
                                    )}
                                    {currentStageIdx === FARMING_STAGES.length - 1 && (
                                        <div className="dash-complete-banner">
                                            <CheckCircle2 size={16} /> Cycle complete — ready for next season.
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="dash-empty">
                                <Sprout size={36} strokeWidth={1.5} />
                                <p>No active crop detected.</p>
                                <button onClick={handleStartSeason} className="dash-btn-primary">Start New Season</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ---- RIGHT COLUMN ---- */}
                <div className="dash-right">
                    {/* Tools */}
                    <div className="dash-card">
                        <div className="dash-card-top">
                            <div className="dash-card-title">
                                <LayoutDashboard size={18} />
                                <span>Quick Actions</span>
                            </div>
                        </div>
                        <div className="dash-tools">
                            <a href="/weather" className="dash-tool-item">
                                <div className="dash-tool-icon weather"><CloudSun size={20} /></div>
                                <div className="dash-tool-text">
                                    <h4>Weather</h4>
                                    <p>Irrigation planning</p>
                                </div>
                                <ArrowRight size={14} className="dash-tool-arrow" />
                            </a>
                            <a href="/identify-disease" className="dash-tool-item">
                                <div className="dash-tool-icon disease"><Search size={20} /></div>
                                <div className="dash-tool-text">
                                    <h4>Disease Scanner</h4>
                                    <p>Leaf image diagnosis</p>
                                </div>
                                <ArrowRight size={14} className="dash-tool-arrow" />
                            </a>
                            <a href="/recommend-fertilizer" className="dash-tool-item">
                                <div className="dash-tool-icon fertilizer"><FlaskConical size={20} /></div>
                                <div className="dash-tool-text">
                                    <h4>Nutrients</h4>
                                    <p>Fertilizer recommendations</p>
                                </div>
                                <ArrowRight size={14} className="dash-tool-arrow" />
                            </a>
                            <a href="/predict-price" className="dash-tool-item">
                                <div className="dash-tool-icon price"><TrendingUp size={20} /></div>
                                <div className="dash-tool-text">
                                    <h4>Market Prices</h4>
                                    <p>6-month forecasting</p>
                                </div>
                                <ArrowRight size={14} className="dash-tool-arrow" />
                            </a>
                        </div>
                    </div>

                    {/* Fertilizer History */}
                    <div className="dash-card">
                        <div className="dash-card-top">
                            <div className="dash-card-title">
                                <FlaskConical size={18} />
                                <span>Fertilizer History</span>
                            </div>
                        </div>
                        {history.filter(i => i.type.toLowerCase() === 'fertilizer').length > 0 ? (
                            <div className="dash-history-list">
                                {history.filter(i => i.type.toLowerCase() === 'fertilizer').slice(0, 4).map((item) => (
                                    <div key={item.id} className="dash-history-row">
                                        <div className="dash-dot fertilizer" />
                                        <span className="dash-history-name">{item.result}</span>
                                        <span className="dash-history-time"><Clock size={12} /> {item.timestamp}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="dash-muted">No fertilizer history yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom row — full width */}
            <div className="dash-bottom-row">
                {/* Disease History */}
                <div className="dash-card">
                    <div className="dash-card-top">
                        <div className="dash-card-title">
                            <Search size={18} />
                            <span>Diseases Identified</span>
                        </div>
                    </div>
                    {history.filter(i => i.type.toLowerCase() === 'disease').length > 0 ? (
                        <div className="dash-history-list">
                            {history.filter(i => i.type.toLowerCase() === 'disease').slice(0, 5).map((item) => (
                                <div key={item.id} className="dash-history-row">
                                    <div className="dash-dot disease" />
                                    <span className="dash-history-name">{item.result.replace(/___/g, " - ").replace(/_/g, " ")}</span>
                                    <span className="dash-history-time"><Clock size={12} /> {item.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="dash-muted">No disease history yet.</p>
                    )}
                </div>

                {/* Crop Recommendations */}
                <div className="dash-card">
                    <div className="dash-card-top">
                        <div className="dash-card-title">
                            <Leaf size={18} />
                            <span>Crop Recommendations</span>
                        </div>
                    </div>
                    {history.filter(i => i.type.toLowerCase() === 'crop').length > 0 ? (
                        <div className="dash-history-list">
                            {history.filter(i => i.type.toLowerCase() === 'crop').map((item) => (
                                <div key={item.id} className="dash-history-row">
                                    <div className="dash-dot crop" />
                                    <span className="dash-history-name">{item.result}</span>
                                    <span className="dash-history-time"><Clock size={12} /> {item.timestamp}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="dash-muted">No crop recommendations yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
