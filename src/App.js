import React, { useState, useEffect } from 'react';
import AudioClassifier from './AudioClassifier'; // Importiere Audio-Klassifizierer-Komponente

function App() {
    const [time, setTime] = useState(60); // Startzeit des Timers (1 Minute in Sekunden)
    const [isRunning, setIsRunning] = useState(false); // Status des Timers
    const [timerDuration, setTimerDuration] = useState(60); // Timer-Dauer in Sekunden (1 Minute)

    // Timer-Funktion, die jede Sekunde die verbleibende Zeit verringert
    useEffect(() => {
        let timer = null;
        if (isRunning && time > 0) {
            timer = setInterval(() => {
                setTime((prevTime) => prevTime - 1);
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

    // Berechnet den Fortschritt des Kreises basierend auf der verbleibenden Zeit
    const progress = (time / timerDuration) * 100;

    return (
        <div className="App">
            <div className="timer-container">
                <div className="circle-progress">
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        {/* Hintergrundkreis */}
                        <circle cx="100" cy="100" r="90" stroke="#fff" strokeWidth="10" fill="none" />
                        {/* Fortschrittskreis */}
                        <circle
                            cx="100"
                            cy="100"
                            r="90"
                            stroke="#00bcd4" // Blaue Farbe für den Fortschritt
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray="565" // Umfang des Kreises
                            strokeDashoffset={(565 * (100 - progress)) / 100}
                            style={{ transition: 'stroke-dashoffset 1s ease' }}
                        />
                    </svg>
                    <div className="timer-display">
                        {Math.floor(time / 60)}:{time % 60 < 10 ? `0${time % 60}` : time % 60}
                    </div>
                </div>
                <button className="start-stop-btn" onClick={() => setIsRunning((prevState) => !prevState)}>
                    {isRunning ? 'Stop Timer' : 'Start Timer'}
                </button>
            </div>
            <AudioClassifier onCommand={handleAudioCommand} /> {/* Audio-Klassifizierer-Komponente */}
        </div>
    );
}

export default App;
