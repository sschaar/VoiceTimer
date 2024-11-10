import React, { useState, useEffect } from 'react';
import { loadAudioClassifierModel } from './loadModel';
import * as tf from '@tensorflow/tfjs';

function AudioClassifier({ onCommand }) {
    const [model, setModel] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioContext, setAudioContext] = useState(null);
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        const initializeModel = async () => {
            try {
                const loadedModel = await loadAudioClassifierModel();
                setModel(loadedModel);
                console.log('Model loaded successfully:', loadedModel);
            } catch (err) {
                console.error('Error loading model:', err);
            }
        };
        initializeModel();
    }, []);

    const classifyAudio = async (audioData) => {
        if (!model || !audioData) return;

        if (audioData.length < 43 * 232) {
            console.warn("Audio data is too short. Expected length:", 43 * 232);
            return;
        }

        // Reshape and normalize the audio data for the model
        const reshapedData = new Float32Array(43 * 232);
        reshapedData.set(audioData.slice(0, 43 * 232));

        const inputTensor = tf.tensor(reshapedData, [1, 43, 232, 1]);

        try {
            const predictionTensor = model.predict(inputTensor);
            const predictionData = await predictionTensor.data();
            predictionTensor.dispose(); // Free memory

            // Process the prediction
            const maxIndex = predictionData.indexOf(Math.max(...predictionData));
            const command = maxIndex === 0 ? 'Stop' : 'Start';
            onCommand(command);
            setPrediction(command);
            console.log('Prediction:', command);
        } catch (error) {
            console.error('Prediction error:', error);
        } finally {
            inputTensor.dispose(); // Ensure memory is freed
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const analyserNode = audioCtx.createAnalyser();
            analyserNode.fftSize = 1024;

            const sourceNode = audioCtx.createMediaStreamSource(stream);
            sourceNode.connect(analyserNode);
            setAudioContext(audioCtx);

            const dataArray = new Float32Array(analyserNode.frequencyBinCount);

            const updateAudioData = () => {
                if (!isRecording) return;

                analyserNode.getFloatFrequencyData(dataArray);
                classifyAudio(dataArray);

                requestAnimationFrame(updateAudioData);
            };

            updateAudioData();
            console.log("Audio recording started");
        } catch (err) {
            console.error('Microphone access error:', err);
        }
    };

    const stopRecording = () => {
        if (audioContext) {
            audioContext.close();
            setAudioContext(null);
            console.log("Audio recording stopped");
        }
    };

    const handleRecordingToggle = () => {
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
