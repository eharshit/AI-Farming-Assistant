import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, TestTube, CloudSun, BookOpen, Bug, TrendingUp } from 'lucide-react';

const featureList = [
    {
        title: 'Crop Recommendation',
        description: 'Find the best crops to plant based on your soil NPK, pH, and climate data.',
        icon: <Sprout size={32} color="var(--primary-color)" />,
        path: '/recommend-crop'
    },
    {
        title: 'Disease Identification',
        description: 'Upload a leaf photo and instantly diagnose plant diseases using our CNN model.',
        icon: <Bug size={32} color="var(--primary-color)" />,
        path: '/identify-disease'
    },
    {
        title: 'Fertilizer Advisor',
        description: 'Get tailored fertilizer suggestions based on soil quality to boost yield.',
        icon: <TestTube size={32} color="var(--primary-color)" />,
        path: '/recommend-fertilizer'
    },
    {
        title: 'Price Prediction',
        description: 'Forecast commodity market prices for the next 6 months using ML models.',
        icon: <TrendingUp size={32} color="var(--primary-color)" />,
        path: '/predict-price'
    },
    {
        title: 'Weather Forecast',
        description: 'Real-time temperature and humidity updates helps you plan field activities.',
        icon: <CloudSun size={32} color="var(--primary-color)" />,
        path: '/weather'
    },
    {
        title: 'Smart Farming Guide',
        description: 'Comprehensive guidelines for crop management and disease treatment.',
        icon: <BookOpen size={32} color="var(--primary-color)" />,
        path: '/guide'
    }
];

const Features = () => {
    return (
        <section className="features-section section bg-light">
            <div className="container">
                <div className="section-header text-center animate-fade-in">
                    <h2>Our Smart Solutions</h2>
                    <p>Everything you need to maximize your harvest</p>
                </div>

                <div className="features-grid">
                    {featureList.map((feature, idx) => (
                        <div key={idx} className="feature-card glass-panel animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div className="feature-icon-wrapper">
                                {feature.icon}
                            </div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                            <Link to={feature.path} className="feature-link">
                                Try it now &rarr;
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
