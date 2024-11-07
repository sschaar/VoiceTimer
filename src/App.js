// App.js

import React, { useState, useEffect } from 'react';
import AudioClassifier from './AudioClassifier'; // Audio-Klassifizierer importieren

function App() {
    const [time, setTime] = useState(0); // Timer-Zeit in Sekunden
    const [isRunning, setIsRunning] = useState(false); // Status des Timers

    // Timer-Funktion, die jede Sekunde die Zeit erhöht
    useEffect(() => {
        let timer = null;
        if (isRunning) {
            timer = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        } else if (!isRunning && time !== 0) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isRunning, time]);

    // Funktion, die von AudioClassifier aufgerufen wird, um den Timer zu steuern
    const handleAudioCommand = (command) => {
        if (command === 'Start') {
            setIsRunning(true);
        } else if (command === 'Stop') {
            setIsRunning(false);
        }
    };

    // Manuelles Starten und Stoppen des Timers
    const handleStartStop = () => {
        setIsRunning((prevState) => !prevState);
    };

    return (
        <div className="App">
            <h1>Voice-Controlled Timer</h1>
            <div>
                <h2>
                    {Math.floor(time / 60)}:
                    {time % 60 < 10 ? `0${time % 60}` : time % 60}
                </h2>
                <button onClick={handleStartStop}>
                    {isRunning ? 'Stop Timer' : 'Start Timer'}
                </button>
            </div>
            <AudioClassifier onCommand={handleAudioCommand} /> {/* AudioClassifier-Komponente mit Callback */}
        </div>
    );
}

export default App;
