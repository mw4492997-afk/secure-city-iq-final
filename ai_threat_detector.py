"""
AI Threat Detection Module for Secure City IQ
Advanced machine learning-based threat detection system
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow import keras
import joblib
import threading
import time
import json
import os
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIThreatDetector:
    """
    Advanced AI-powered threat detection system using multiple ML approaches
    """

    def __init__(self, model_path="models/"):
        self.model_path = model_path
        self.isolation_forest = None
        self.rf_classifier = None
        self.neural_network = None
        self.scaler = StandardScaler()
        self.training_data = []
        self.threat_patterns = {}
        self.anomaly_threshold = 0.95
        self.is_trained = False

        # Create models directory if it doesn't exist
        os.makedirs(model_path, exist_ok=True)

        # Load existing models if available
        self.load_models()

    def load_models(self):
        """Load pre-trained models if they exist"""
        try:
            if os.path.exists(f"{self.model_path}isolation_forest.pkl"):
                self.isolation_forest = joblib.load(f"{self.model_path}isolation_forest.pkl")
                logger.info("Loaded Isolation Forest model")

            if os.path.exists(f"{self.model_path}rf_classifier.pkl"):
                self.rf_classifier = joblib.load(f"{self.model_path}rf_classifier.pkl")
                logger.info("Loaded Random Forest classifier")

            if os.path.exists(f"{self.model_path}neural_network.h5"):
                self.neural_network = keras.models.load_model(f"{self.model_path}neural_network.h5")
                logger.info("Loaded Neural Network model")

            if os.path.exists(f"{self.model_path}scaler.pkl"):
                self.scaler = joblib.load(f"{self.model_path}scaler.pkl")
                logger.info("Loaded data scaler")

            self.is_trained = True

        except Exception as e:
            logger.warning(f"Could not load existing models: {e}")
            self.is_trained = False

    def extract_features(self, packet_data):
        """
        Extract relevant features from network packet data for ML analysis

        Args:
            packet_data (dict): Packet information

        Returns:
            list: Feature vector
        """
        features = []

        # Basic packet features
        features.append(packet_data.get('packet_size', 0))
        features.append(packet_data.get('src_port', 0))
        features.append(packet_data.get('dst_port', 0))
        features.append(packet_data.get('protocol', 0))

        # Timing features
        current_time = time.time()
        features.append(current_time)

        # Connection features
        features.append(packet_data.get('connection_count', 0))
        features.append(packet_data.get('bytes_sent', 0))
        features.append(packet_data.get('bytes_received', 0))

        # Statistical features
        features.append(packet_data.get('packet_rate', 0))
        features.append(packet_data.get('byte_rate', 0))

        return features

    def train_models(self, training_data_path=None):
        """
        Train ML models on historical network data

        Args:
            training_data_path (str): Path to training data CSV
        """
        logger.info("Starting model training...")

        # Generate synthetic training data if none provided
        if training_data_path is None or not os.path.exists(training_data_path):
            logger.info("Generating synthetic training data...")
            self.training_data = self.generate_synthetic_data(10000)
        else:
            # Load real training data
            df = pd.read_csv(training_data_path)
            self.training_data = df.values

        # Prepare features and labels
        X = self.training_data[:, :-1]  # Features
        y = self.training_data[:, -1]   # Labels (0=normal, 1=threat)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train Isolation Forest for anomaly detection
        logger.info("Training Isolation Forest...")
        self.isolation_forest = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            random_state=42
        )
        self.isolation_forest.fit(X_train_scaled)

        # Train Random Forest Classifier
        logger.info("Training Random Forest Classifier...")
        self.rf_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.rf_classifier.fit(X_train_scaled, y_train)

        # Train Neural Network
        logger.info("Training Neural Network...")
        self.neural_network = keras.Sequential([
            keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(32, activation='relu'),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(16, activation='relu'),
            keras.layers.Dense(1, activation='sigmoid')
        ])

        self.neural_network.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )

        self.neural_network.fit(
            X_train_scaled, y_train,
            epochs=50,
            batch_size=32,
            validation_split=0.2,
            verbose=0
        )

        # Save models
        self.save_models()

        self.is_trained = True
        logger.info("Model training completed!")

    def generate_synthetic_data(self, n_samples=10000):
        """
        Generate synthetic network traffic data for training

        Args:
            n_samples (int): Number of samples to generate

        Returns:
            np.array: Synthetic training data
        """
        np.random.seed(42)

        data = []

        for _ in range(n_samples):
            # Normal traffic patterns
            if np.random.random() > 0.1:  # 90% normal traffic
                packet_size = np.random.normal(500, 200)
                src_port = np.random.choice([80, 443, 22, 21, 25, 53])
                dst_port = np.random.choice([80, 443, 22, 21, 25, 53])
                protocol = np.random.choice([6, 17])  # TCP/UDP
                connection_count = np.random.poisson(5)
                bytes_sent = np.random.normal(1000, 500)
                bytes_received = np.random.normal(2000, 1000)
                packet_rate = np.random.normal(10, 5)
                byte_rate = np.random.normal(5000, 2000)
                label = 0  # Normal
            else:
                # Threat patterns
                packet_size = np.random.normal(1500, 500)
                src_port = np.random.randint(1024, 65535)
                dst_port = np.random.choice([80, 443, 22, 3389, 445])
                protocol = np.random.choice([6, 17])
                connection_count = np.random.poisson(50)
                bytes_sent = np.random.normal(50000, 20000)
                bytes_received = np.random.normal(10000, 5000)
                packet_rate = np.random.normal(100, 50)
                byte_rate = np.random.normal(100000, 50000)
                label = 1  # Threat

            # Ensure non-negative values
            features = [
                max(0, packet_size),
                max(0, src_port),
                max(0, dst_port),
                protocol,
                time.time(),
                max(0, connection_count),
                max(0, bytes_sent),
                max(0, bytes_received),
                max(0, packet_rate),
                max(0, byte_rate),
                label
            ]

            data.append(features)

        return np.array(data)

    def save_models(self):
        """Save trained models to disk"""
        try:
            joblib.dump(self.isolation_forest, f"{self.model_path}isolation_forest.pkl")
            joblib.dump(self.rf_classifier, f"{self.model_path}rf_classifier.pkl")
            joblib.dump(self.scaler, f"{self.model_path}scaler.pkl")
            self.neural_network.save(f"{self.model_path}neural_network.h5")
            logger.info("Models saved successfully")
        except Exception as e:
            logger.error(f"Error saving models: {e}")

    def predict_threat(self, packet_data):
        """
        Predict if a packet represents a threat using ensemble ML approach

        Args:
            packet_data (dict): Packet information

        Returns:
            dict: Threat analysis results
        """
        if not self.is_trained:
            return {
                'threat_score': 0.0,
                'is_threat': False,
                'confidence': 0.0,
                'method': 'untrained'
            }

        try:
            # Extract features
            features = self.extract_features(packet_data)
            features_scaled = self.scaler.transform([features])

            # Get predictions from all models
            isolation_score = self.isolation_forest.decision_function(features_scaled)[0]
            rf_prediction = self.rf_classifier.predict_proba(features_scaled)[0][1]
            nn_prediction = self.neural_network.predict(features_scaled, verbose=0)[0][0]

            # Ensemble scoring (weighted average)
            weights = {'isolation': 0.3, 'rf': 0.4, 'nn': 0.3}
            threat_score = (
                weights['isolation'] * (1 - isolation_score) +  # Convert to threat score
                weights['rf'] * rf_prediction +
                weights['nn'] * nn_prediction
            )

            # Determine if it's a threat
            is_threat = threat_score > self.anomaly_threshold

            # Calculate confidence
            confidence = min(threat_score / self.anomaly_threshold, 1.0) if is_threat else 1 - threat_score

            return {
                'threat_score': float(threat_score),
                'is_threat': bool(is_threat),
                'confidence': float(confidence),
                'method': 'ensemble_ml',
                'details': {
                    'isolation_score': float(isolation_score),
                    'rf_prediction': float(rf_prediction),
                    'nn_prediction': float(nn_prediction)
                }
            }

        except Exception as e:
            logger.error(f"Error in threat prediction: {e}")
            return {
                'threat_score': 0.5,
                'is_threat': False,
                'confidence': 0.0,
                'method': 'error',
                'error': str(e)
            }

    def analyze_behavioral_patterns(self, traffic_history, time_window=300):
        """
        Analyze behavioral patterns over time for advanced threat detection

        Args:
            traffic_history (list): List of recent packet data
            time_window (int): Time window in seconds

        Returns:
            dict: Behavioral analysis results
        """
        if len(traffic_history) < 10:
            return {'behavioral_threat': False, 'patterns': []}

        # Extract features from recent traffic
        recent_features = []
        current_time = time.time()

        for packet in traffic_history:
            if current_time - packet.get('timestamp', 0) <= time_window:
                features = self.extract_features(packet)
                recent_features.append(features)

        if len(recent_features) < 5:
            return {'behavioral_threat': False, 'patterns': []}

        recent_features = np.array(recent_features)

        # Analyze patterns
        patterns = []

        # Check for sudden spikes in traffic
        packet_rates = recent_features[:, 8]  # packet_rate column
        mean_rate = np.mean(packet_rates)
        std_rate = np.std(packet_rates)

        if std_rate > mean_rate * 2:
            patterns.append('traffic_spike')

        # Check for unusual port combinations
        src_ports = recent_features[:, 1]
        dst_ports = recent_features[:, 2]
        unusual_ports = []

        for src, dst in zip(src_ports, dst_ports):
            if src > 1024 and dst in [80, 443, 22, 3389, 445]:
                unusual_ports.append((src, dst))

        if len(unusual_ports) > len(recent_features) * 0.3:
            patterns.append('unusual_port_combinations')

        # Check for connection flooding
        connection_counts = recent_features[:, 5]
        if np.max(connection_counts) > 100:
            patterns.append('connection_flood')

        behavioral_threat = len(patterns) > 0

        return {
            'behavioral_threat': behavioral_threat,
            'patterns': patterns,
            'severity': len(patterns)
        }

    def update_threat_patterns(self, new_threat_data):
        """
        Update threat patterns database with new detected threats

        Args:
            new_threat_data (dict): New threat information
        """
        threat_id = f"{new_threat_data.get('src_ip', 'unknown')}_{int(time.time())}"

        self.threat_patterns[threat_id] = {
            'timestamp': time.time(),
            'threat_data': new_threat_data,
            'pattern_type': new_threat_data.get('pattern_type', 'unknown'),
            'severity': new_threat_data.get('severity', 'medium')
        }

        # Keep only recent patterns (last 24 hours)
        cutoff_time = time.time() - 86400
        self.threat_patterns = {
            k: v for k, v in self.threat_patterns.items()
            if v['timestamp'] > cutoff_time
        }

    def get_predictive_score(self, ip_address, recent_activity):
        """
        Generate predictive threat score based on IP history and patterns

        Args:
            ip_address (str): IP address to analyze
            recent_activity (list): Recent activity for this IP

        Returns:
            float: Predictive threat score (0-1)
        """
        base_score = 0.0

        # Check if IP has been involved in threats recently
        threat_history = [
            pattern for pattern in self.threat_patterns.values()
            if pattern['threat_data'].get('src_ip') == ip_address
        ]

        if threat_history:
            # Increase score based on recent threat history
            recent_threats = len([
                t for t in threat_history
                if time.time() - t['timestamp'] < 3600  # Last hour
            ])
            base_score += min(recent_threats * 0.2, 0.5)

        # Analyze recent activity patterns
        if recent_activity:
            activity_features = [self.extract_features(packet) for packet in recent_activity]
            if activity_features:
                activity_array = np.array(activity_features)
                avg_packet_rate = np.mean(activity_array[:, 8])
                avg_byte_rate = np.mean(activity_array[:, 9])

                # High traffic rates increase suspicion
                if avg_packet_rate > 50:
                    base_score += 0.3
                if avg_byte_rate > 50000:
                    base_score += 0.3

        return min(base_score, 1.0)

# Global instance for easy access
ai_detector = AIThreatDetector()

def initialize_ai_detector():
    """Initialize and train the AI threat detector"""
    global ai_detector

    def training_thread():
        try:
            logger.info("Initializing AI Threat Detection System...")
            ai_detector.train_models()
            logger.info("AI Threat Detection System ready!")
        except Exception as e:
            logger.error(f"Failed to initialize AI detector: {e}")

    # Start training in background thread
    thread = threading.Thread(target=training_thread, daemon=True)
    thread.start()

if __name__ == "__main__":
    # Test the AI detector
    initialize_ai_detector()

    # Wait for training to complete
    time.sleep(5)

    # Test prediction
    test_packet = {
        'packet_size': 1500,
        'src_port': 12345,
        'dst_port': 80,
        'protocol': 6,
        'connection_count': 10,
        'bytes_sent': 50000,
        'bytes_received': 10000,
        'packet_rate': 100,
        'byte_rate': 100000
    }

    result = ai_detector.predict_threat(test_packet)
    print(f"Threat Analysis Result: {result}")
