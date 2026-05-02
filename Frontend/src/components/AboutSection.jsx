import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Cpu, Sprout } from 'lucide-react';

const AboutSection = () => {
    return (
        <section className="section" style={{ padding: '80px 0', borderTop: '1px solid #eee' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '60px', alignItems: 'center' }}>

                    {/* Visual / Stats Side */}
                    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', gridRow: 'span 2' }}>
                            <Cpu size={48} color="var(--primary-color)" style={{ marginBottom: '15px' }} />
                            <h3 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '5px' }}>98%</h3>
                            <p style={{ color: '#666', fontWeight: '500' }}>Model Accuracy</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <Sprout size={32} style={{ margin: '0 auto 10px' }} />
                            <h4 style={{ margin: 0 }}>Smart Growth</h4>
                        </div>
                        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                            <Activity size={32} color="var(--primary-color)" style={{ margin: '0 auto 10px' }} />
                            <h4 style={{ margin: 0, color: 'var(--primary-dark)' }}>Real-time Data</h4>
                        </div>
                    </div>

                    {/* Text / CTA Side */}
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div style={{ display: 'inline-block', padding: '6px 16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '30px', fontWeight: '600', fontSize: '0.9rem', marginBottom: '20px' }}>
                            ABOUT KRISHI MITRA
                        </div>
                        <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-dark)', marginBottom: '20px', lineHeight: '1.2' }}>
                            Transforming agriculture with intelligent data.
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: '1.7', marginBottom: '30px' }}>
                            Krishi Mitra blends traditional farming wisdom with cutting-edge artificial intelligence.
                            Our deep learning models decode complex soil metrics and analyze crop imagery in milliseconds,
                            giving you actionable precision-farming advice right at your fingertips.
                        </p>

                        <Link to="/about" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            Learn more about our technology <ArrowRight size={20} />
                        </Link>
                    </div>

                </div>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    section .container > div {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default AboutSection;
