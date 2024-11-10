import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';  // Importiere TensorFlow.js
import '@tensorflow/tfjs-backend-webgl'; // Wenn du WebGL verwenden willst

const TeachableMachineAudioModel = () => {
    const [seconds, setSeconds] = useState(60);
    const [isRunning, setIsRunning] = useState(false);
    const [labels, setLabels] = useState([]);
    const recognizerRef = useRef(null);

    // Timer-Logik
    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
            const interval = setInterval(() => {
                setSeconds((prevSeconds) => {
                    if (prevSeconds > 0) {
                        return prevSeconds - 1;
                    } else {
                        clearInterval(interval);
                        setIsRunning(false);
                        return 0;
                    }
                });
            }, 1000);
        }
    };

    const stopTimer = () => {
        setIsRunning(false);
        setSeconds(60);
    };

    const updateTimer = () => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Initialisiere das Modell
    const createModel = async () => {
        try {
            // Lade das Teachable Machine Modell mit TensorFlow.js
            const URL = './assets/tm-my-audio-model2/'; // Link zu deinem Teachable Machine Modell
            const checkpointURL = URL + 'model.json';
            const metadataURL = URL + 'metadata.json';

            const recognizer = await window.speechCommands.create(
                'BROWSER_FFT',
                undefined,
                checkpointURL,
                metadataURL
            );

            await recognizer.ensureModelLoaded();
            recognizerRef.current = recognizer;
            setLabels(recognizer.wordLabels());
            console.log("Model loaded and labels set:", recognizer.wordLabels());
        } catch (error) {
            console.error("Error loading the model:", error);
        }
    };

    useEffect(() => {
        // Stelle sicher, dass das Modell erstellt wird, sobald die Komponente geladen ist
        createModel();
    }, []);

    // Startet die Sprachbefehls-Erkennung
    const startListening = () => {
        if (recognizerRef.current) {
            recognizerRef.current.listen(
                (result) => {
                    const scores = result.scores;
                    console.log('Speech Command Scores:', scores);
                    if (scores[0] > scores[1] && !isRunning) {
                        stopTimer();
                    } else if (scores[1] > scores[0] && !isRunning) {
                        startTimer();
                    }
                },
                {
                    includeSpectrogram: true,
                    probabilityThreshold: 0.75,
                    invokeCallbackOnNoiseAndUnknown: true,
                    overlapFactor: 0.50,
                }
            );
        }
    };

    useEffect(() => {
        if (recognizerRef.current) {
            startListening();
        }
    }, [recognizerRef.current]);

    return (
        <div>
            <div>Teachable Machine Audio Model</div>
            <button type="button" onClick={startListening}>Start Listening</button>
            <div id="label-container">
                {labels.map((label, index) => (
                    <div key={index}>{label}</div>
                ))}
            </div>
            <div id="timer-container">{updateTimer()}</div>
        </div>
    );
};

export default TeachableMachineAudioModel;
