import React, { useState, useMemo } from 'react';
import { predictPrice } from '../services/api';
import { TrendingUp, MapPin, Package, Loader2, AlertCircle, IndianRupee, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import locationMapping from '../data/locationMapping.json';
import CustomSelect from '../components/CustomSelect';

const availableCommodities = ["Ajwan", "Alasande+Gram", "Almond(Badam)", "Alsandikai", "Amaranthus", "Ambada+Seed", "Amla(Nelli+Kai)", "Amphophalus", "Antawala", "Apple", "Arhar+Dal(Tur+Dal)", "Ashgourd", "Avare+Dal", "Balekai", "Bamboo", "Banana", "Banana+-+Green", "Barley+(Jau)", "Beans", "Beaten+Rice", "Beetroot", "Betal+Leaves", "Bitter+gourd", "Black+pepper", "Bottle+gourd", "Bran", "Brinjal", "Broken+Rice", "Bull", "Bunch+Beans", "Butter", "Cabbage", "Calf", "Capsicum", "Cardamoms", "Carrot", "Cashewnuts", "Castor+Seed", "Cauliflower", "Chapparad+Avare", "Chennangi+Dal", "Cherry", "Chikoos(Sapota)", "Chili+Red", "Chilly+Capsicum", "Chow+Chow", "Chrysanthemum(Loose)", "Cloves", "Cluster+beans", "Coca", "Cock", "Cocoa", "Coconut", "Coconut+Oil", "Coconut+Seed", "Coffee", "Colacasia", "Copra", "Coriander(Leaves)", "Corriander+seed", "Cotton", "Cotton+Seed", "Cow", "Cowpea(Veg)", "Cucumbar(Kheera)", "Cummin+Seed(Jeera)", "Dalda", "Dhaincha", "Drumstick", "Dry+Chillies", "Dry+Fodder", "Dry+Grapes", "Duck", "Duster+Beans", "Egg", "Elephant+Yam+(Suran)", "Field+Pea", "Firewood", "Fish", "Galgal(Lemon)", "Garlic", "Ghee", "Gingelly+Oil", "Ginger(Dry)", "Ginger(Green)", "Goat", "Gram+Raw(Chholia)", "Gramflour", "Grapes", "Green+Avare+(W)", "Green+Chilli", "Green+Fodder", "Green+Peas", "Ground+Nut+Seed", "Groundnut", "Groundnut+(Split)", "Groundnut+pods+(raw)", "Guar", "Guava", "Gur(Jaggery)", "Gurellu", "He+Buffalo", "Hen", "Hippe+Seed", "Honge+seed", "Hybrid+Cumbu", "Indian+Beans+(Seam)", "Indian+Colza(Sarson)", "Isabgul+(Psyllium)", "Jack+Fruit", "Jamun(Narale+Hannu)", "Jasmine", "Jowar(Sorghum)", "Jute", "Karbuja(Musk+Melon)", "Kartali+(Kantola)", "Khoya", "Kinnow", "Knool+Khol", "Kodo+Millet(Varagu)", "Kulthi(Horse+Gram)", "Lak(Teora)", "Leafy+Vegetable", "Lemon", "Lime", "Linseed", "Lint", "Litchi", "Long+Melon(Kakri)", "Lotus+Sticks", "Lukad", "Mace", "Mahedi", "Mahua", "Maida+Atta", "Maize", "Mango", "Mango+(Raw-Ripe)", "Marigold(Calcutta)", "Marigold(loose)", "Mashrooms", "Masur+Dal", "Mataki", "Methi(Leaves)", "Methi+Seeds", "Millets", "Mint(Pudina)", "Moath+Dal", "Mousambi(Sweet+Lime)", "Mustard", "Mustard+Oil", "Myrobolan(Harad)", "Neem+Seed", "Niger+Seed+(Ramtil)", "Nutmeg", "Onion", "Onion+Green", "Orange", "Other+Pulses", "Ox", "Paddy(Dhan)(Basmati)", "Paddy(Dhan)(Common)", "Papaya", "Papaya+(Raw)", "Peach", "Pear(Marasebu)", "Peas(Dry)", "Peas+Wet", "Peas+cod", "Pepper+garbled", "Pepper+ungarbled", "Persimon(Japani+Fal)", "Pigs", "Pineapple", "Plum", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Ragi+(Finger+Millet)", "Rajgir", "Ram", "Rice", "Ridge+gourd(Tori)", "Ridgeguard(Tori)", "Rose(Local)", "Rose(Loose)", "Round+gourd", "Rubber", "Sabu+Dan", "Sabu+Dana", "Safflower", "Sajje", "Same/Savi", "Season+Leaves", "Seemebadnekai", "Seetafal", "Seetapal", "She+Buffalo", "She+Goat", "Sheep", "Siddota", "Snake+gourd", "Snakeguard", "Soanf", "Soji", "Soyabean", "Spinach", "Sponge+gourd", "Sugar", "Sugarcane", "Sunflower", "Sunhemp", "Surat+Beans+(Papadi)", "Suva+(Dill+Seed)", "Suvarna+Gadde", "Sweet+Potato", "Sweet+Pumpkin", "T.V.+Cumbu", "Tamarind+Fruit", "Tamarind+Seed", "Tapioca", "Taramira", "Tender+Coconut", "Thogrikai", "Thondekai", "Tinda", "Tobacco", "Tomato", "Toria", "Tube+Rose(Loose)", "Turmeric", "Turmeric+(raw)", "Turnip", "Unknown", "Walnut", "Water+Melon", "Wheat", "Wheat+Atta", "White+Peas", "White+Pumpkin", "Wood", "Yam", "Yam+(Ratalu)"];

const availableStates = Object.keys(locationMapping).sort();

const PricePrediction = () => {
    const [formData, setFormData] = useState({
        commodity_name: availableCommodities[0],
        state: availableStates[0],
        district: '',
        market: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(0);

    const availableDistricts = useMemo(() => {
        const stateData = locationMapping[formData.state];
        return stateData ? Object.keys(stateData).sort() : [];
    }, [formData.state]);

    const availableMarkets = useMemo(() => {
        const stateData = locationMapping[formData.state];
        if (!stateData || !formData.district) return [];
        return stateData[formData.district] || [];
    }, [formData.state, formData.district]);

    const steps = [
        "Analyzing market data...",
        "Evaluating regional trends...",
        "Processing seasonal patterns...",
        "Generating 6-month forecast..."
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'state') {
            setFormData({ ...formData, state: value, district: '', market: '' });
        } else if (name === 'district') {
            setFormData({ ...formData, district: value, market: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const isFormValid = formData.commodity_name && formData.state && formData.district && formData.market;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;
        setLoading(true);
        setError(null);
        setResult(null);
        setStep(0);

        const interval = setInterval(() => {
            setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 700);

        try {
            const response = await predictPrice(formData);
            setResult(response);
        } catch (err) {
            setError(err.detail || "Failed to fetch price predictions");
        } finally {
            clearInterval(interval);
            setLoading(false);
        }
    };

    const getStats = (predictions) => {
        if (!predictions || predictions.length === 0) return {};
        const prices = predictions.map(p => p.price);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const trend = prices[prices.length - 1] - prices[0];
        return { avg: avg.toFixed(2), min: min.toFixed(2), max: max.toFixed(2), trend: trend.toFixed(2) };
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'var(--bg-white)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(46,125,50,0.2)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.9rem' }}>{label}</p>
                    <p style={{ margin: '6px 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                        ₹{payload[0].value.toLocaleString()}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#999' }}>Modal Price / Quintal</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container section animate-fade-in">
            <div className="text-center" style={{ marginBottom: '40px' }}>
                <div className="badge" style={{ marginBottom: '16px' }}>
                    <BarChart3 size={16} /> ML-Powered Forecasting
                </div>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <TrendingUp color="var(--primary-color)" /> Market Price Prediction
                </h1>
                <p className="hero-subtitle">Forecast agricultural commodity prices for the next 6 months using our Random Forest model trained on 800K+ market records.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '960px', margin: '0 auto', padding: '40px' }}>

                {/* Form */}
                {!result && !loading && (
                    <form onSubmit={handleSubmit} className="prediction-form-grid">
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                                <Package size={16} color="var(--primary-color)" /> Commodity Name
                            </label>
                            <CustomSelect id="input-commodity" name="commodity_name" value={formData.commodity_name} onChange={handleChange} options={availableCommodities} required />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                                <MapPin size={16} color="var(--primary-color)" /> State
                            </label>
                            <CustomSelect id="input-state" name="state" value={formData.state} onChange={handleChange} options={availableStates} required />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                                <MapPin size={16} color="var(--primary-color)" /> District
                            </label>
                            <CustomSelect id="input-district" name="district" value={formData.district} onChange={handleChange} options={availableDistricts} placeholder="-- Select District --" required />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                                <MapPin size={16} color="var(--primary-color)" /> Market
                            </label>
                            <CustomSelect id="input-market" name="market" value={formData.market} onChange={handleChange} options={availableMarkets} placeholder="-- Select Market --" required />
                        </div>

                        <button id="btn-predict-price" type="submit" disabled={loading || !isFormValid} className="btn btn-primary" style={{ gridColumn: 'span 2', justifyContent: 'center', fontSize: '1.15rem', marginTop: '10px', padding: '14px', opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? 'pointer' : 'not-allowed' }}>
                            <TrendingUp size={20} /> Predict Market Trends
                        </button>
                    </form>
                )}

                {/* Loading Animation */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 20px', color: 'var(--primary-color)' }} />
                        <h3 style={{ marginBottom: '10px' }}>{steps[step]}</h3>
                        <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden', maxWidth: '350px', margin: '0 auto' }}>
                            <div style={{ width: `${((step + 1) / steps.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-color), var(--primary-light))', transition: 'width 0.5s ease', borderRadius: '4px' }}></div>
                        </div>
                        <p style={{ marginTop: '12px', color: '#999', fontSize: '0.85rem' }}>Querying trained model on 800K+ records...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ marginTop: '20px', padding: '16px 20px', background: '#ffebee', color: '#c62828', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle size={20} /> {error}
                        <button onClick={() => { setResult(null); setError(null); }} className="btn btn-secondary" style={{ marginLeft: 'auto', padding: '6px 16px', fontSize: '0.85rem' }}>Try Again</button>
                    </div>
                )}

                {/* Results */}
                {result && !loading && (() => {
                    const stats = getStats(result.predictions);
                    return (
                        <div className="animate-fade-in">
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: 'var(--primary-dark)' }}>
                                        {result.commodity}
                                    </h2>
                                    <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.9rem' }}>6-Month Price Forecast</p>
                                </div>
                                <button onClick={() => setResult(null)} className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                                    New Prediction
                                </button>
                            </div>

                            {/* Stat Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
                                <div style={{ background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Average</p>
                                    <p style={{ margin: '6px 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                                        <IndianRupee size={18} style={{ verticalAlign: 'middle' }} />{Number(stats.avg).toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Lowest</p>
                                    <p style={{ margin: '6px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#1565c0' }}>
                                        <IndianRupee size={18} style={{ verticalAlign: 'middle' }} />{Number(stats.min).toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Highest</p>
                                    <p style={{ margin: '6px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#e65100' }}>
                                        <IndianRupee size={18} style={{ verticalAlign: 'middle' }} />{Number(stats.max).toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ background: Number(stats.trend) >= 0 ? 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' : 'linear-gradient(135deg, #ffebee, #ffcdd2)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Trend</p>
                                    <p style={{ margin: '6px 0 0', fontSize: '1.5rem', fontWeight: 700, color: Number(stats.trend) >= 0 ? '#2e7d32' : '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                        {Number(stats.trend) >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                        ₹{Math.abs(Number(stats.trend)).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div style={{ height: '380px', width: '100%', background: 'var(--bg-white)', padding: '24px 20px 16px', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Forecast Trend</h4>
                                <ResponsiveContainer width="100%" height="90%">
                                    <AreaChart data={result.predictions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 13 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 13 }} dx={-10} tickFormatter={(val) => `₹${val.toLocaleString()}`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke="var(--primary-color)"
                                            strokeWidth={3}
                                            fill="url(#priceGradient)"
                                            dot={{ r: 5, fill: 'var(--primary-color)', strokeWidth: 2, stroke: 'white' }}
                                            activeDot={{ r: 7, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Data Table */}
                            <div style={{ background: 'var(--bg-white)', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                                <h4 style={{ margin: 0, padding: '18px 24px 12px', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Breakdown</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(46,125,50,0.05)' }}>
                                            <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>Month</th>
                                            <th style={{ textAlign: 'right', padding: '12px 24px', fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>Predicted Price (₹/Qt)</th>
                                            <th style={{ textAlign: 'right', padding: '12px 24px', fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.predictions.map((p, idx) => {
                                            const prev = idx > 0 ? result.predictions[idx - 1].price : p.price;
                                            const diff = p.price - prev;
                                            return (
                                                <tr key={idx} style={{ borderTop: '1px solid #f5f5f5', transition: 'background 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '14px 24px', fontWeight: 500 }}>{p.month}</td>
                                                    <td style={{ padding: '14px 24px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', fontSize: '1.05rem' }}>
                                                        ₹{p.price.toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                                        {idx === 0 ? (
                                                            <span style={{ color: '#999', fontSize: '0.85rem' }}>—</span>
                                                        ) : (
                                                            <span style={{ color: diff >= 0 ? '#2e7d32' : '#c62828', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                                {diff >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                                ₹{Math.abs(diff).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Disclaimer */}
                            <div style={{ marginTop: '20px', padding: '14px 20px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', fontSize: '0.8rem', color: '#999' }}>
                                <strong>Disclaimer:</strong> Predictions are generated by a Random Forest model trained on historical APMC market data. Actual prices may vary due to factors not captured by the model such as government policy changes, natural disasters, and international trade conditions.
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default PricePrediction;
