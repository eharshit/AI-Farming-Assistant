import React, { useState } from 'react';
import { BookOpen, Droplets, Leaf, Shield, Tractor, ChevronRight, CheckCircle2, TrendingUp, MessageSquare, Moon } from 'lucide-react';

const guideTopics = [
    {
        id: 'recommendation',
        title: 'Step 1: Get Recommendations',
        icon: <Leaf size={24} />,
        content: (
            <div className="guide-content-section animate-fade-in">
                <h2>Finding the Perfect Crop</h2>
                <p>Start your journey by heading to the <strong>Crop Recommendation</strong> tool. Input your soil parameters (N, P, K levels), soil pH, and local weather conditions.</p>
                
                <h3>Procedures:</h3>
                <ul className="guide-list">
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Enter Data:</strong> Fill in the soil nutrients and environmental factors.</span></li>
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Analyze:</strong> Click "Predict Best Crop" to let our AI find the most suitable crop for your land.</span></li>
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Start Planting:</strong> Once you get a result, click the <strong>"Start Planting"</strong> button to add it to your live Dashboard.</span></li>
                </ul>
            </div>
        )
    },
    {
        id: 'dashboard',
        title: 'Step 2: Manage Your Farm',
        icon: <Tractor size={24} />,
        content: (
            <div className="guide-content-section animate-fade-in">
                <h2>Your Live Dashboard</h2>
                <p>The <strong>Dashboard</strong> is your central hub for tracking your farm's status and history.</p>
                
                <h3>Features:</h3>
                <ul className="guide-list">
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Current Activity:</strong> View your active crop, planting date, and growth progress.</span></li>
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Next Steps:</strong> Check the "Next Recommended Step" to know exactly what your farm needs right now.</span></li>
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>History:</strong> Revisit all your previous AI insights in the Timeline section.</span></li>
                </ul>
            </div>
        )
    },
    {
        id: 'maintenance',
        title: 'Step 3: AI Maintenance',
        icon: <Shield size={24} />,
        content: (
            <div className="guide-content-section animate-fade-in">
                <h2>Keep Your Crops Healthy</h2>
                <p>Use our specialized AI tools to maintain optimal health throughout the growing season.</p>
                
                <h3>Key Tools:</h3>
                <ul className="guide-list">
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Fertilizer Advice:</strong> Run the Fertilizer tool to get tailored nutrient recommendations. Click <strong>"Apply to Dashboard"</strong> to update your farm's schedule.</span></li>
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Disease ID:</strong> Upload a photo of any suspicious leaf spots to identify diseases instantly and get treatment tips.</span></li>
                </ul>
            </div>
        )
    },
    {
        id: 'price',
        title: 'Step 4: Market Prices',
        icon: <TrendingUp size={24} />,
        content: (
            <div className="guide-content-section animate-fade-in">
                <h2>Predict Commodity Prices</h2>
                <p>Maximize your profits by using the <strong>Market Price Prediction</strong> tool to forecast commodity prices up to 6 months in advance.</p>
                
                <h3>Procedures:</h3>
                <ul className="guide-list">
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Select Details:</strong> Choose your commodity, state, district, and APMC market.</span></li>
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Forecast:</strong> View the predicted modal prices for the upcoming 6 months to decide the best time to sell.</span></li>
                </ul>
            </div>
        )
    },
    {
        id: 'chatbot',
        title: 'Step 5: AI Assistant',
        icon: <MessageSquare size={24} />,
        content: (
            <div className="guide-content-section animate-fade-in">
                <h2>Your Conversational Farm Assistant</h2>
                <p>Have a question or need quick advice? The floating <strong>Chatbot Widget</strong> (bottom right) is always available to help.</p>
                
                <h3>Capabilities:</h3>
                <ul className="guide-list">
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Multi-Tool Orchestration:</strong> You can ask the bot directly to recommend crops or fertilizers by providing your soil data in the chat.</span></li>
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Image Diagnosis:</strong> Click the image icon to attach a picture of a diseased leaf directly in the chat, and the bot will identify the problem and suggest treatments.</span></li>
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Knowledge Base:</strong> Ask general farming questions—the bot is trained on all our documentation.</span></li>
                </ul>
            </div>
        )
    },
    {
        id: 'ui-tips',
        title: 'UI Tips: Customization',
        icon: <Moon size={24} />,
        content: (
            <div className="guide-content-section animate-fade-in">
                <h2>Personalize Your Experience</h2>
                <p>We've added features to make the platform comfortable for you to use at any time of day.</p>
                
                <h3>Features:</h3>
                <ul className="guide-list">
                    <li><CheckCircle2 size={18} color="var(--primary-color)" /> <span><strong>Global Dark Mode:</strong> Click the sun/moon icon in the top navigation bar to toggle Dark Mode. The entire dashboard, including the chat widget, will instantly adapt to a dark aesthetic.</span></li>
                </ul>
            </div>
        )
    }
];

const FarmingGuide = () => {
    const [activeTopic, setActiveTopic] = useState(guideTopics[0].id);

    return (
        <div className="container section animate-fade-in pb-8">
            <div className="text-center" style={{ marginBottom: '40px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <BookOpen color="var(--primary-color)" size={36} /> How to Use Krishi Mitra
                </h1>
                <p className="hero-subtitle">A quick guide to mastering your AI-powered farm management dashboard.</p>
            </div>

            <div className="guide-layout">
                {/* Sidebar Navigation */}
                <div className="guide-sidebar glass-panel">
                    <h3 style={{ padding: '0 15px 15px', color: 'var(--primary-dark)', borderBottom: '1px solid #eee', marginBottom: '15px' }}>
                        Topics
                    </h3>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {guideTopics.map(topic => (
                            <button 
                                key={topic.id}
                                onClick={() => setActiveTopic(topic.id)}
                                className={`guide-nav-btn ${activeTopic === topic.id ? 'active' : ''}`}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {topic.icon} {topic.title}
                                </span>
                                {activeTopic === topic.id && <ChevronRight size={18} />}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="guide-content glass-panel" style={{ minHeight: '400px' }}>
                    {guideTopics.find(t => t.id === activeTopic)?.content}
                </div>
            </div>

            <style jsx>{`
                .guide-layout {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 30px;
                    align-items: start;
                }
                
                @media (max-width: 768px) {
                    .guide-layout {
                        grid-template-columns: 1fr;
                    }
                }

                .guide-sidebar {
                    padding: 20px;
                }

                .guide-content {
                    padding: 40px;
                }

                .guide-nav-btn {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    padding: 12px 15px;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    text-align: left;
                    font-size: 1rem;
                    color: var(--text-color);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .guide-nav-btn:hover {
                    background: rgba(76, 175, 80, 0.05);
                    color: var(--primary-color);
                }

                .guide-nav-btn.active {
                    background: var(--primary-color);
                    color: white;
                    font-weight: 500;
                }
                
                .guide-nav-btn.active svg {
                    color: white !important;
                }

                .guide-content-section h2 {
                    color: var(--primary-dark);
                    margin-bottom: 20px;
                    font-size: 2rem;
                }

                .guide-content-section h3 {
                    margin-top: 30px;
                    margin-bottom: 15px;
                    font-size: 1.3rem;
                    color: #333;
                }

                .guide-content-section p {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #555;
                }

                .guide-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .guide-list li {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    font-size: 1.05rem;
                    line-height: 1.5;
                    color: #444;
                }

                .guide-list li svg {
                    flex-shrink: 0;
                    margin-top: 3px;
                }

                .guide-tip-box {
                    margin-top: 30px;
                    padding: 20px;
                    background: rgba(76, 175, 80, 0.1);
                    border-left: 4px solid var(--primary-color);
                    border-radius: 4px 8px 8px 4px;
                    color: #2e7d32;
                    font-size: 1.05rem;
                }
            `}</style>
        </div>
    );
};

export default FarmingGuide;
