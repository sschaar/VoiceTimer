import React, { useEffect, useState, useRef } from "react";
import * as speechCommands from '@tensorflow-models/speech-commands';

const TimerComponent = () => {
    const recognizerRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(60); // Timer starting from 1 minute (60 seconds)
    const [timerActive, setTimerActive] = useState(false); // Timer control state

    const URL = "https://teachablemachine.withgoogle.com/models/MOI9rzYJL/";

    const requestMicrophonePermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Mikrofonberechtigung erteilt.");
        } catch (err) {
            console.error("Mikrofonberechtigung nicht erteilt:", err);
            alert("Die Mikrofonberechtigung wurde verweigert. Bitte erlauben Sie den Zugriff auf das Mikrofon.");
        }
    };

    const createModel = async () => {
        const checkpointURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        try {
            const recognizer = speechCommands.create(
                "BROWSER_FFT",
                undefined,
                checkpointURL,
                metadataURL
            );
            await recognizer.ensureModelLoaded();
            console.log("Modell und Metadaten erfolgreich geladen.");

            const classLabels = recognizer.wordLabels();
            console.log("Available class labels:", classLabels);

            if (!classLabels.includes("start") || !classLabels.includes("stop")) {
                console.error("Das Modell enthält nicht die erwarteten Labels 'start' und 'stop'.");
                return null;
            }

            recognizerRef.current = recognizer;
            return recognizer;
        } catch (error) {
            console.error("Fehler beim Laden des Modells:", error);
            return null;
        }
    };

    const init = async () => {
        await requestMicrophonePermission();
        if (!recognizerRef.current) {
            await createModel();
        }
    };

    useEffect(() => {
        init();

        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.stopListening();
            }
        };
    }, []);

    useEffect(() => {
        let timerInterval;
        if (timerActive && timeLeft > 0) {
            timerInterval = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setTimerActive(false); // Stop timer when it reaches 0
        }

        return () => clearInterval(timerInterval);
    }, [timerActive, timeLeft]);

    const startListening = () => {
        const recognizer = recognizerRef.current;
        if (recognizer) {
            recognizer.listen(
                (result) => {
                    const scores = result.scores;
                    const classLabels = recognizer.wordLabels();
                    const predictions = [];
                    const threshold = 0.75;

                    for (let i = 0; i < classLabels.length; i++) {
                        const classPrediction = `${classLabels[i]}: ${scores[i].toFixed(2)}`;
                        predictions.push(classPrediction);
                    }

                    setPredictions(predictions);

                    const startIndex = classLabels.indexOf("start");
                    const stopIndex = classLabels.indexOf("stop");

                    if (scores[startIndex] > threshold) {
                        console.log("Start-Befehl erkannt");
                        startTimer();
                    } else if (scores[stopIndex] > threshold) {
                        console.log("Stop-Befehl erkannt");
                        stopTimer();
                    }
                },
                {
                    includeSpectrogram: true,
                    probabilityThreshold: 0.5,
                    invokeCallbackOnNoiseAndUnknown: true,
                    overlapFactor: 0.50,
                }
            );
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognizerRef.current) {
            recognizerRef.current.stopListening();
            setIsListening(false);
        }
    };

    const startTimer = () => {
        if (!timerActive && timeLeft > 0) {
            setTimerActive(true); // Start or resume timer only if not active and timeLeft > 0
        }
    };

    const stopTimer = () => {
        setTimerActive(false); // Pause the timer without resetting it
    };

    return (
        <div>
            <h1>Speech Command Timer</h1>
            <button onClick={isListening ? stopListening : startListening}>
                {isListening ? "Stop Listening" : "Start Listening"}
            </button>
            <div id="label-container"></div>
            <div>
                {predictions.length > 0 && (
                    <ul>
                        {predictions.map((prediction, index) => (
                            <li key={index}>{prediction}</li>
                        ))}
                    </ul>
                )}
            </div>
            <div>
                <h2>Time Left: {timeLeft}s</h2>
                {timeLeft === 0 && <p>Timer ended!</p>}
            </div>
        </div>
    );
};

export default TimerComponent;
