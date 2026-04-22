import React, { useState } from 'react';
import { predictFertilizer, getFarmStatus, updateFarmStatus } from '../services/api';
import { Sprout, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const availableCropTypes = [
    'Maize', 'Sugarcane', 'Cotton', 'Tobacco', 'Paddy', 'Barley', 'Wheat',
    'Millets', 'Oil seeds', 'Pulses', 'Ground Nuts'
];

const availableSoilTypes = [
    'Sandy', 'Loamy', 'Black', 'Red', 'Clayey'
];

const FertilizerRecommendation = () => {
    const [formData, setFormData] = useState({
        temperature: '',
        humidity: '',
        moisture: '',
        soil_type: availableSoilTypes[0],
        crop_type: availableCropTypes[0],
        nitrogen: '',
        potassium: '',
        phosphorus: ''
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [featureImportance, setFeatureImportance] = useState(null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        setFeatureImportance(null);

        // Convert strings to floats for numerical inputs
        const processedData = {
            temperature: parseFloat(formData.temperature),
            humidity: parseFloat(formData.humidity),
            moisture: parseFloat(formData.moisture),
            soil_type: formData.soil_type,
            crop_type: formData.crop_type,
            nitrogen: parseFloat(formData.nitrogen),
            potassium: parseFloat(formData.potassium),
            phosphorus: parseFloat(formData.phosphorus)
        };

        try {
            const response = await predictFertilizer(processedData);
            setResult(response.recommended_fertilizer);
            setAnalysis(response.analysis);

            // Fallback feature importance calculation if backend doesn't provide it
            let importance = response.feature_importance;
            if (!importance) {
                // Heuristic based on numeric values only
                const numericOnly = {
                    temperature: processedData.temperature,
                    humidity: processedData.humidity,
                    moisture: processedData.moisture,
                    nitrogen: processedData.nitrogen,
                    potassium: processedData.potassium,
                    phosphorus: processedData.phosphorus
                };
                const total = Object.values(numericOnly).reduce((a, b) => a + b, 0);
                importance = {};
                Object.entries(numericOnly).forEach(([k, v]) => {
                    importance[k] = v / (total || 1);
                });
            }
            setFeatureImportance(importance);

        } catch (err) {
            setError(err.detail || "Failed to get recommendation");
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFertilizer = async () => {
        setSaving(true);
        try {
            const status = await getFarmStatus();
            if (!status.active) {
                setError("No active crop found on dashboard. Please recommend and start a crop first.");
                return;
            }
            
            await updateFarmStatus({
                crop_name: status.crop_name,
                date_planted: status.date_planted,
                status: "Growing",
                next_step: `Apply ${result} fertilizer`
            });
            navigate('/dashboard');
        } catch (err) {
            setError("Failed to update dashboard: " + (err.detail || "Unknown error"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container section animate-fade-in">
            <div className="text-center" style={{ marginBottom: '40px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Sprout color="var(--primary-color)" /> Fertilizer Recommendation
                </h1>
                <p className="hero-subtitle">Enter soil parameters and crop details to receive tailored fertilizer recommendations.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600' }}>Temperature (°C)</label>
                        <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600' }}>Humidity (%)</label>
                        <input type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600' }}>Moisture (%)</label>
                        <input type="number" step="0.1" name="moisture" value={formData.moisture} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600' }}>Soil Type</label>
                        <select name="soil_type" value={formData.soil_type} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: 'white' }}>
                            {availableSoilTypes.map(soil => (
                                <option key={soil} value={soil}>{soil}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600' }}>Crop Type</label>
                        <select name="crop_type" value={formData.crop_type} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: 'white' }}>
                            {availableCropTypes.map(crop => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600' }}>Nitrogen (N)</label>
                        <input type="number" step="0.1" name="nitrogen" value={formData.nitrogen} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600' }}>Phosphorus (P)</label>
                        <input type="number" step="0.1" name="phosphorus" value={formData.phosphorus} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600' }}>Potassium (K)</label>
                        <input type="number" step="0.1" name="potassium" value={formData.potassium} onChange={handleChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '20px' }}>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1.2rem' }}>
                            {loading ? <><Loader2 className="animate-spin" /> Analyzing...</> : "Predict Best Fertilizer"}
                        </button>
                    </div>
                </form>

                {error && (
                    <div style={{ marginTop: '20px', padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {result && !loading && (
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '10px' }}>
                        <div style={{ padding: '30px', background: 'rgba(76, 175, 80, 0.05)', border: '2px solid var(--primary-color)', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ color: 'var(--primary-dark)', marginBottom: '5px' }}>Top Recommendation</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'capitalize', lineHeight: '1.1', marginBottom: '20px' }}>
                                {result}
                            </div>
                            
                            <button 
                                onClick={handleApplyFertilizer} 
                                disabled={saving}
                                className="btn btn-secondary" 
                                style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> Apply to Farm</>}
                            </button>
                            <button onClick={() => setResult(null)} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>New Prediction</button>
                        </div>

                        <div className="glass-panel" style={{ padding: '30px', background: 'white' }}>
                            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Nutrient Analysis</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {analysis && analysis.length > 0 ? analysis.map((insight, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                        <div style={{ minWidth: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-color)', marginTop: '6px' }}></div>
                                        <p style={{ margin: 0, fontSize: '1rem', color: '#444' }}>{insight}</p>
                                    </div>
                                )) : (
                                    <p style={{ color: '#666' }}>This fertilizer provides the optimal N-P-K balance required for the growth stage of your selected crop.</p>
                                )}
                            </div>
                            
                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Parameter Influence</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {featureImportance && Object.entries(featureImportance).map(([name, val]) => (
                                        <div key={name}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                                                <span style={{ textTransform: 'capitalize', color: '#555' }}>{name.replace('_', ' ')}</span>
                                                <span style={{ fontWeight: '600' }}>{(val * 100).toFixed(0)}%</span>
                                            </div>
                                            <div style={{ width: '100%', height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${(val / Math.max(...Object.values(featureImportance))) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #4CAF50, #81C784)', borderRadius: '3px' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '30px', padding: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', fontSize: '0.8rem', color: '#888' }}>
                                <strong>Explainability:</strong> Scores represent the relative weight assigned to each parameter when selecting the optimal fertilizer.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FertilizerRecommendation;
