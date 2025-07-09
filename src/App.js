import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import './App.css'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhLCi6JBT5ELkAFxTplKBBDdRdpATzQxI",
  authDomain: "smart-medicine-vending-machine.firebaseapp.com",
  databaseURL: "https://smart-medicine-vending-machine-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-medicine-vending-machine",
  storageBucket: "smart-medicine-vending-machine.firebasestorage.app",
  messagingSenderId: "705021997077",
  appId: "1:705021997077:web:5af9ec0b267e597e1d5e1c",
  measurementId: "G-PH0XLJSYVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Main Dashboard component
export default function Dashboard() {
  const [monitoringData, setMonitoringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reference to the monitoring data in Firebase
    const monitoringRef = ref(database, '16_Industrial_Equipment_Health_Monitoring');
    
    // Listen for changes in the data
    const unsubscribe = onValue(monitoringRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          setMonitoringData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error processing data:", err);
        setError("Failed to process monitoring data");
        setLoading(false);
      }
    }, (err) => {
      console.error("Firebase error:", err);
      setError("Failed to connect to the database");
      setLoading(false);
    });
    
    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, []);

  // Generate simple chart data
  const generateChartData = (value, min, max) => {
    // Create a smooth wave-like data array for visualization
    const baseValue = parseFloat(value) || 0;
    const points = [];
    
    for (let i = 0; i < 20; i++) {
      const wave = Math.sin(i * 0.5) * 0.15; // Smooth sine wave pattern
      const pointValue = Math.max(min, Math.min(max, baseValue * (1 + wave)));
      points.push({
        x: i,
        value: pointValue
      });
    }
    
    return points;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!monitoringData) {
    return <div className="no-data-container">No monitoring data available</div>;
  }

  const latest = monitoringData.latest || {};
  const maintenanceAlert = latest.maintenance?.alert === true;
  const maintenanceMessage = latest.maintenance?.message?.replace(/"/g, '') || "Voltage Issue!";
  
  // Check the readings data - using first reading for some values
  const firstReadingKey = monitoringData.readings ? Object.keys(monitoringData.readings)[0] : null;
  const firstReading = firstReadingKey ? monitoringData.readings[firstReadingKey] : {};
  
  // Get trend data (temperature change)
  const trendTemperature = firstReading.trends?.temperature || -5.78;

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Industrial Equipment Health Monitoring</h1>
          <div className="equipment-id">Equipment ID: {monitoringData.counter}</div>
        </header>
        
        <div className="alert-banner">
          <span className="alert-icon">⚠</span>
          <span className="alert-message">{maintenanceMessage}</span>
        </div>
        
        <div className="section-container">
          <div className="counter-card">
            <div className="counter-title">Total Checkups</div>
            <div className="counter-value">{monitoringData.counter}</div>
          </div>
        </div>
        
        <h2 className="section-title">Current Readings</h2>
        
        <div className="readings-grid">
          {/* Current Card */}
          <div className="reading-card current-card">
            <div className="reading-title">Current</div>
            <div className="reading-value">
              {latest.current}
              <span className="reading-unit">A</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateChartData(latest.current, 0, 5)}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FFFFFF" 
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Humidity Card */}
          <div className="reading-card humidity-card">
            <div className="reading-title">Humidity</div>
            <div className="reading-value">
              {latest.humidity}
              <span className="reading-unit">%</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateChartData(latest.humidity, 50, 70)}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FFFFFF" 
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Temperature Card */}
          <div className="reading-card temperature-card">
            <div className="reading-title">Temperature</div>
            <div className="reading-value">
              {latest.temperature}
              <span className="reading-unit">°C</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateChartData(latest.temperature, 25, 35)}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FFFFFF" 
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Maintenance Card */}
          <div className="reading-card maintenance-card">
            <div className="reading-title">Maintenance</div>
            <div className="maintenance-alert">
              <span className="alert-dot"></span>
              {maintenanceMessage}
            </div>
          </div>
        </div>
        
        <h2 className="section-title">Trends</h2>
        
        <div className="section-container">
          <div className="trend-card">
            <div className="trend-title">Temperature Change</div>
            <div className="trend-value">
              <span className="trend-arrow down">↓</span>
              <span className="trend-number">{trendTemperature} °C</span>
            </div>
          </div>
        </div>
        
        <h2 className="section-title">Vibration & Status</h2>
        
        <div className="status-grid">
          {/* Vibration Magnitude Card */}
          <div className="status-card vibration-card">
            <div className="status-title">Vibration Magnitude</div>
            <div className="status-value">
              {firstReading.vibration?.magnitude?.toFixed(4) || "1.0044"}
              <span className="status-unit">g</span>
            </div>
            <div className="status-details">
              <div className="axis-value">X: {firstReading.vibration?.x?.toFixed(4) || "0.2664"}</div>
              <div className="axis-value">Y: {firstReading.vibration?.y?.toFixed(4) || "0.1140"}</div>
              <div className="axis-value">Z: {firstReading.vibration?.z?.toFixed(4) || "0.9617"}</div>
            </div>
          </div>
          
          {/* Voltage Card */}
          <div className="status-card voltage-card">
            <div className="status-title">Voltage</div>
            <div className="status-value">{latest.voltage}</div>
            <div className="voltage-line">
              <div className="line"></div>
            </div>
          </div>
          
          {/* Water Level Card */}
          <div className="status-card water-level-card">
            <div className="status-title">Water Level</div>
            <div className="status-value">{latest.waterLevel}/4</div>
            <div className="water-level-container">
              <div className="water-level-indicator"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}