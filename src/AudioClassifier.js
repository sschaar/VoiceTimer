import React, { useState, useEffect } from 'react';
import { loadAudioClassifierModel } from './loadModel';
import * as tf from '@tensorflow/tfjs';

function AudioClassifier({ onCommand }) {
    const [model, setModel] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioContext, setAudioContext] = useState(null);
    const [prediction, setPrediction] = useState(null);

    // Modell laden
    useEffect(() => {
        const initializeModel = async () => {
            try {
                const loadedModel = await loadAudioClassifierModel();
                setModel(loadedModel);
                console.log('Model loaded:', loadedModel);
            } catch (err) {
                console.error('Error loading model:', err);
            }
        };
        initializeModel();
    }, []);

    // Audio-Daten klassifizieren
    const classifyAudio = async (audioData) => {
        if (model && audioData) {
            console.log("Verarbeite Audio-Daten:", audioData.slice(0, 10)); // Zeige die ersten 10 Werte an

            // Sicherstellen, dass audioData die erwartete Länge hat
            if (audioData.length < 43 * 232) {
                console.log("Daten sind zu kurz. Erwarten: ", 43 * 232);
                return;
            }

            const reshapedData = new Float32Array(43 * 232);
            reshapedData.set(audioData.slice(0, 43 * 232));

            const inputTensor = tf.tensor(reshapedData, [1, 43, 232, 1]);
            console.log('Tensor-Daten:', inputTensor);

            const predictionTensor = model.predict(inputTensor);
            const predictionData = predictionTensor.dataSync();
            predictionTensor.dispose();

            console.log('Prediction:', predictionData);

            // Vorhersage auswerten
            const maxIndex = predictionData.indexOf(Math.max(...predictionData));
            if (maxIndex === 0) {
                onCommand('Stop');
                setPrediction('Stop');
            } else if (maxIndex === 1) {
                onCommand('Start');
                setPrediction('Start');
            }
        }
    };

    // Aufnahme starten
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Mikrofonzugriff erfolgreich");
            const audioCtx = new AudioContext();
            const analyserNode = audioCtx.createAnalyser();
            analyserNode.fftSize = 1024;

            const sourceNode = audioCtx.createMediaStreamSource(stream);
            sourceNode.connect(analyserNode);

            setAudioContext(audioCtx);

            const bufferLength = analyserNode.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);

            const updateAudioData = () => {
                if (!isRecording) return;
                analyserNode.getFloatFrequencyData(dataArray);

                // Überprüfe, ob tatsächlich Daten im Array sind
                console.log("Aktuelle Audio-Daten:", dataArray.slice(0, 10)); // Zeige die ersten 10 Werte an

                classifyAudio(dataArray);
                requestAnimationFrame(updateAudioData);
            };

            updateAudioData();
        } catch (err) {
            console.error('Fehler beim Zugriff auf das Mikrofon:', err);
        }
    };

    // Aufnahme stoppen
    const stopRecording = () => {
        if (audioContext) {
            audioContext.close();
            setAudioContext(null);
        }
    };

    // Aufnahme starten/stoppen
    const handleRecordingToggle = () => {
        console.log("Recording Toggle:", isRecording ? "Stoppen" : "Starten");
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
        setIsRecording(!isRecording);
    };

    return (
        <div>
            <button onClick={handleRecordingToggle}>
                {isRecording ? 'Stop Voice Command' : 'Start Voice Command'}
            </button>
            {prediction && (
                <div>
                    <h3>Prediction Output:</h3>
                    <p>{prediction}</p>
                </div>
            )}
        </div>
    );
}

export default AudioClassifier;
