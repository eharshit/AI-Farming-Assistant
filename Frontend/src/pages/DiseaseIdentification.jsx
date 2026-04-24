import React, { useState } from 'react';
import { predictDisease } from '../services/api';
import { Bug, Upload, Loader2, AlertCircle, CheckCircle, Leaf } from 'lucide-react';

const DiseaseIdentification = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            setResult(null);
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError("Please select an image first.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await predictDisease(selectedFile);
            setResult(response);
        } catch (err) {
            setError(err.detail || "Failed to process image");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container section animate-fade-in">
            <div className="text-center" style={{ marginBottom: '40px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Bug color="var(--primary-color)" /> Disease Identification
                </h1>
                <p className="hero-subtitle">Upload a close-up photo of a plant leaf for instant detection via CNN.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px' }}>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

                    <div style={{
                        width: '100%', padding: '40px', border: '2px dashed #ccc',
                        borderRadius: '12px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.5)',
                        cursor: 'pointer', position: 'relative'
                    }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                        {preview ? (
                            <img src={preview} alt="Leaf Preview" style={{ maxHeight: '300px', borderRadius: '8px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ color: 'var(--text-light)' }}>
                                <Upload size={48} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                <h3>Click or drag image to upload</h3>
                                <p>Supports PNG, JPG, JPEG</p>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading || !selectedFile} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '1.2rem', marginTop: '10px' }}>
                        {loading ? <><Loader2 className="animate-spin" /> Analyzing Image...</> : "Scan for Diseases"}
                    </button>
                </form>

                {error && (
                    <div style={{ marginTop: '20px', padding: '15px', background: '#ffebee', color: '#c62828', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle /> {error}
                    </div>
                )}

                {result && (
                    <div className="animate-fade-in" style={{ marginTop: '30px', padding: '30px', background: 'rgba(76, 175, 80, 0.1)', border: '2px solid var(--primary-color)', borderRadius: '12px', textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--primary-dark)', marginBottom: '5px' }}>Diagnosis Complete</h3>

                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-dark)', margin: '15px 0' }}>
                            {result.disease_class.replace(/___/g, " - ").replace(/_/g, " ")}
                        </div>

                        <div style={{ display: 'inline-block', padding: '5px 15px', background: 'var(--primary-color)', color: 'white', borderRadius: '50px', fontWeight: '600' }}>
                            Confidence: {(result.confidence * 100).toFixed(2)}%
                        </div>
                        
                        {result.suggestions && result.suggestions.length > 0 && (
                            <div style={{ marginTop: '25px', textAlign: 'left', background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-dark)', marginBottom: '15px', fontSize: '1.2rem' }}>
                                    {result.disease_class.includes('healthy') ? <Leaf size={20} /> : <CheckCircle size={20} />}
                                    {result.disease_class.includes('healthy') ? 'Maintenance Plan' : 'Actionable Treatment Plan'}
                                </h4>
                                <ul style={{ padding: 0, margin: 0 }}>
                                    {result.suggestions.map((suggestion, idx) => (
                                        <li key={idx} style={{ 
                                            display: 'flex', 
                                            alignItems: 'flex-start', 
                                            gap: '10px', 
                                            marginBottom: '12px',
                                            color: 'var(--text-dark)',
                                            lineHeight: '1.5'
                                        }}>
                                            <div style={{ 
                                                minWidth: '24px', 
                                                height: '24px', 
                                                borderRadius: '50%', 
                                                background: 'rgba(76, 175, 80, 0.1)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                color: 'var(--primary-color)',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}>
                                                {idx + 1}
                                            </div>
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default DiseaseIdentification;
