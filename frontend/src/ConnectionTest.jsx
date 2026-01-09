import { useState, useEffect } from 'react';
import apiService from './services/api';

function ConnectionTest() {
    const [status, setStatus] = useState('testing');
    const [error, setError] = useState('');
    const [details, setDetails] = useState({});

    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        try {
            setStatus('testing');
            setError('');

            console.log('🔍 Testing backend connection...');

            // Test basic fetch to backend
            const response = await fetch('http://localhost:5000/api/test');
            const data = await response.json();

            setDetails({
                backendStatus: 'Connected',
                backendResponse: data,
                timestamp: new Date().toLocaleTimeString()
            });

            setStatus('connected');
            console.log('✅ Backend connection successful');

        } catch (error) {
            console.error('❌ Connection test failed:', error);
            setError(error.message);
            setStatus('failed');

            setDetails({
                backendStatus: 'Failed',
                error: error.message,
                timestamp: new Date().toLocaleTimeString()
            });
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'connected': return '#4CAF50';
            case 'failed': return '#f44336';
            case 'testing': return '#ff9800';
            default: return '#666';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'connected': return '✅ Connected';
            case 'failed': return '❌ Connection Failed';
            case 'testing': return '🔄 Testing...';
            default: return '⚪ Unknown';
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 9999,
            minWidth: '300px',
            fontSize: '0.9rem'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
            }}>
                <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor()
                }}></div>
                <strong>Backend Status: {getStatusText()}</strong>
            </div>

            {error && (
                <div style={{
                    color: '#f44336',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem'
                }}>
                    Error: {error}
                </div>
            )}

            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                <div>Backend URL: http://localhost:5000</div>
                <div>Frontend URL: http://localhost:5173</div>
                <div>Last Check: {details.timestamp}</div>
            </div>

            <button
                onClick={testConnection}
                style={{
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: '#f5f5f5',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                }}
            >
                🔄 Test Again
            </button>
        </div>
    );
}

export default ConnectionTest;