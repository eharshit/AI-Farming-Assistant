import React from 'react';
import { Target, Lightbulb, Users, Globe2, Leaf, Cpu } from 'lucide-react';

const AboutUs = () => {
    return (
        <div className="animate-fade-in pb-8">
            {/* Hero Section */}
            <section className="section bg-light text-center" style={{ padding: '80px 20px' }}>
                <div className="container">
                    <h1 style={{ fontSize: '3rem', color: 'var(--primary-dark)', marginBottom: '20px' }}>
                        Empowering Farmers with <span style={{ color: 'var(--primary-color)' }}>AI Innovation</span>
                    </h1>
                    <p className="hero-subtitle" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem', color: 'var(--text-light)' }}>
                        Krishi Mitra is dedicated to revolutionizing agriculture. By bridging the gap between state-of-the-art machine learning
                        and traditional farming practices, we build tools that enhance yield, reduce waste, and build sustainable futures.
                    </p>
                </div>
            </section>

            {/* Our Story / Problem & Solution */}
            <section className="section container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'stretch' }}>
                    <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Globe2 color="var(--primary-color)" size={32} /> The Global Challenge
                        </h2>
                        <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--text-dark)' }}>
                            Modern agriculture faces unprecedented challenges. Unpredictable climate patterns, soil degradation,
                            and rapidly spreading crop diseases threaten global food security. Traditional farming often relies on
                            guesswork and generalized advice, leading to suboptimal yields and the overuse of harmful chemicals.
                        </p>
                    </div>
                    <div className="glass-panel" style={{ padding: '40px', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ color: 'var(--primary-dark)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Cpu color="var(--primary-color)" size={32} /> The Krishi Mitra Solution
                        </h2>
                        <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: 'var(--text-dark)' }}>
                            We believe data is the new fertilizer. Krishi Mitra utilizes powerful Convolutional Neural Networks (CNNs)
                            and Random Forest algorithms to analyze millions of data points instantly. From diagnosing a subtle leaf
                            blight from a smartphone photo to pinpointing the exact NPK ratio your specific soil type needs—we bring
                            precision agriculture to everyone.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="section bg-light" style={{ padding: '60px 0' }}>
                <div className="container">
                    <div className="section-header text-center mb-8">
                        <h2>Our Core Values</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                        <div className="glass-panel text-center" style={{ padding: '40px 20px' }}>
                            <div style={{ background: 'rgba(76, 175, 80, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Target size={40} color="var(--primary-color)" />
                            </div>
                            <h3>Precision</h3>
                            <p style={{ color: 'var(--text-light)', marginTop: '10px', lineHeight: '1.5' }}>
                                Delivering highly accurate, data-driven recommendations tailored to your specific microclimate and soil chemistry.
                            </p>
                        </div>

                        <div className="glass-panel text-center" style={{ padding: '40px 20px' }}>
                            <div style={{ background: 'rgba(76, 175, 80, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Leaf size={40} color="var(--primary-color)" />
                            </div>
                            <h3>Sustainability</h3>
                            <p style={{ color: 'var(--text-light)', marginTop: '10px', lineHeight: '1.5' }}>
                                Promoting practices that protect our environment, reduce chemical runoff, and preserve soil health for the next generation.
                            </p>
                        </div>

                        <div className="glass-panel text-center" style={{ padding: '40px 20px' }}>
                            <div style={{ background: 'rgba(76, 175, 80, 0.1)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Users size={40} color="var(--primary-color)" />
                            </div>
                            <h3>Accessibility</h3>
                            <p style={{ color: 'var(--text-light)', marginTop: '10px', lineHeight: '1.5' }}>
                                Making enterprise-grade agricultural AI available to smallholder farmers through an intuitive, easy-to-use platform.
                            </p>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
