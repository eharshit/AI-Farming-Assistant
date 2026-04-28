import React, { useState } from 'react';
import axios from 'axios';
import { TrendingUp, MapPin, Package, Loader2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const PricePrediction = () => {
    const [formData, setFormData] = useState({
        commodity_name: '',
        state: '',
        district: '',
        market: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post(`${API_BASE_URL}/predict/price`, formData);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to fetch price predictions");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section animate-fade-in">
            <div className="text-center" style={{ marginBottom: '40px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <TrendingUp color="var(--primary-color)" /> Market Price Prediction
                </h1>
                <p className="hero-subtitle">Forecast agricultural commodity prices for the next 6 months using Machine Learning.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Package size={16}/> Commodity Name
                        </label>
                        <input type="text" name="commodity_name" placeholder="e.g., Rice, Wheat, Apple" value={formData.commodity_name} onChange={handleChange} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={16}/> State
                        </label>
                        <input type="text" name="state" placeholder="e.g., Gujarat, Maharashtra" value={formData.state} onChange={handleChange} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={16}/> District
                        </label>
                        <input type="text" name="district" placeholder="e.g., Amreli" value={formData.district} onChange={handleChange} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={16}/> Market
                        </label>
                        <input type="text" name="market" placeholder="Local market name" value={formData.market} onChange={handleChange} required style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} />
                    </div>

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ gridColumn: 'span 2', justifyContent: 'center', fontSize: '1.2rem', marginTop: '10px' }}>
                        {loading ? <><Loader2 className="animate-spin" /> Forecasting...</> : "Predict Market Trends"}
                    </button>
                </form>

                {error && (
                    <div style={{ marginTop: '20px', padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle /> {error}
                    </div>
                )}

                {result && (
                    <div className="animate-fade-in" style={{ marginTop: '40px' }}>
                        <h3 style={{ color: 'var(--primary-dark)', marginBottom: '20px', textAlign: 'center' }}>
                            6-Month Forecast for {result.commodity}
                        </h3>
                        
                        <div style={{ height: '400px', width: '100%', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={result.predictions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#666'}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#666'}} dx={-10} tickFormatter={(val) => `₹${val}`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`₹${value}`, 'Modal Price']}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="price" 
                                        stroke="var(--primary-color)" 
                                        strokeWidth={4}
                                        dot={{ r: 6, fill: 'var(--primary-color)', strokeWidth: 2, stroke: 'white' }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricePrediction;
