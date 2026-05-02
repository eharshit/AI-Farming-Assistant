import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import CropRecommendation from './pages/CropRecommendation';
import DiseaseIdentification from './pages/DiseaseIdentification';
import WeatherForecast from './pages/WeatherForecast';
import FertilizerRecommendation from './pages/FertilizerRecommendation';
import FarmingGuide from './pages/FarmingGuide';
import AboutUs from './pages/AboutUs';
import Dashboard from './pages/Dashboard';
import PricePrediction from './pages/PricePrediction';
import AboutSection from './components/AboutSection';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/guide" element={<FarmingGuide />} />
            <Route path="/about" element={<AboutUs />} />
            {/* Feature Specific Routes */}
            <Route path="/recommend-crop" element={<CropRecommendation />} />
            <Route path="/identify-disease" element={<DiseaseIdentification />} />
            <Route path="/recommend-fertilizer" element={<FertilizerRecommendation />} />
            <Route path="/weather" element={<WeatherForecast />} />
            <Route path="/predict-price" element={<PricePrediction />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>

        <ChatWidget />

        <footer style={{ background: 'var(--primary-dark)', color: 'white', padding: '40px 20px', textAlign: 'center', marginTop: '60px' }}>
          <div className="container">
            <h2 style={{ color: 'white', marginBottom: '15px' }}>Krishi Mitra AI</h2>
            <p style={{ opacity: 0.8, maxWidth: '600px', margin: '0 auto 20px' }}>Empowering agriculture with state-of-the-art machine learning models for disease prediction and crop optimization.</p>
            <p>&copy; 2026 Krishi Mitra AI Platform. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

const Home = () => (
  <>
    <Hero />
    <Features />
    <AboutSection />
  </>
);

const FeaturesPage = () => (
  <div style={{ minHeight: '60vh', padding: '40px 0' }}>
    <Features />
  </div>
);

const PlaceholderPage = ({ title }) => (
  <div className="container section animate-fade-in" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="glass-panel text-center" style={{ padding: '60px', width: '100%', maxWidth: '800px' }}>
      <h1>{title}</h1>
      <p className="hero-subtitle" style={{ marginTop: '20px' }}>This module is currently being migrated to the new React architecture.</p>
    </div>
  </div>
);

export default App;
