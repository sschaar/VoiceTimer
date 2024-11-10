import React, { useEffect, useState } from "react";
import * as speechCommands from '@tensorflow-models/speech-commands'; // Importiere speechCommands

const TimerComponent = () => {
    const [recognizer, setRecognizer] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [predictions, setPredictions] = useState([]);

    // URL des Teachable Machine Modells
    const URL = "https://teachablemachine.withgoogle.com/models/MOI9rzYJL/";

    // Funktion, um Mikrofonberechtigung zu überprüfen
    const requestMicrophonePermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Mikrofonberechtigung erteilt.");
        } catch (err) {
            console.error("Mikrofonberechtigung nicht erteilt:", err);
            alert("Die Mikrofonberechtigung wurde verweigert. Bitte erlauben Sie den Zugriff auf das Mikrofon.");
        }
    };

    // Erstelle und lade das Modell
    const createModel = async () => {
        const checkpointURL = URL + "model.json"; // Modell-URL
        const metadataURL = URL + "metadata.json"; // Metadaten-URL

        try {
            const recognizer = speechCommands.create(
                "BROWSER_FFT", // FFT-Typ für die Frequenzanalyse
                undefined, // Hier wird keine spezifische Wortschatzvorlage benötigt
                checkpointURL,
                metadataURL
            );
            // Warten, bis das Modell und die Metadaten geladen sind
            await recognizer.ensureModelLoaded();
            console.log("Modell und Metadaten erfolgreich geladen.");

            const classLabels = recognizer.wordLabels(); // ["start", "stop"]
            if (classLabels.length !== 2) {
                console.error("Das Modell hat eine unerwartete Anzahl von Labels. Erwartet 2 Labels.");
                return;
            }
            return recognizer;
        } catch (error) {
            console.error("Fehler beim Laden des Modells:", error);
        }
    };

    // Initialisiere das Modell und starte das Zuhören
    const init = async () => {
        await requestMicrophonePermission(); // Mikrofonberechtigung anfordern
        const loadedRecognizer = await createModel();
        if (loadedRecognizer) {
            setRecognizer(loadedRecognizer);
            const classLabels = loadedRecognizer.wordLabels(); // ["start", "stop"]
            console.log(classLabels); // Sollte nur ["start", "stop"] enthalten

            // Container für die Anzeige der Vorhersagen
            const labelContainer = document.getElementById("label-container");
            for (let i = 0; i < classLabels.length; i++) {
                labelContainer.appendChild(document.createElement("div"));
            }

            // Startet das Zuhören auf die Sprachbefehle
            loadedRecognizer.listen(
                (result) => {
                    const scores = result.scores; // Wahrscheinlichkeiten für jedes Label
                    console.log(scores); // Ausgabe der Wahrscheinlichkeiten für "start" und "stop"

                    // Anzeige der Vorhersagen
                    const predictions = [];
                    for (let i = 0; i < classLabels.length; i++) {
                        const classPrediction = `${classLabels[i]}: ${scores[i].toFixed(2)}`;
                        predictions.push(classPrediction);
                        labelContainer.childNodes[i].innerHTML = classPrediction;
                    }

                    setPredictions(predictions);

                    // Hier kannst du auch die Logik für den Timer einfügen,
                    // je nachdem, ob "start" oder "stop" erkannt wird.
                },
                {
                    includeSpectrogram: true, // Gibt auch das Spektrogramm zurück
                    probabilityThreshold: 0.75, // Schwelle für die Vorhersagewahrscheinlichkeit
                    invokeCallbackOnNoiseAndUnknown: true, // Callback auch für Geräusche und unbekannte Wörter
                    overlapFactor: 0.50, // Überlappungsfaktor der FFT-Fenster
                }
            );
        }
    };

    // Stoppe das Zuhören, falls erforderlich
    const stopListening = () => {
        if (recognizer) {
            recognizer.stopListening();
            setIsListening(false);
        }
    };

    useEffect(() => {
        init(); // Initialisiere das Modell und starte das Zuhören

        // Cleanup Funktion zum Stoppen des Zuhörens, wenn die Komponente entladen wird
        return () => {
            if (recognizer) {
                recognizer.stopListening();
            }
        };
    }, [recognizer]);

    return (
        <div>
            <h1>Speech Command Timer</h1>
            <button onClick={() => setIsListening(!isListening)}>
                {isListening ? "Stop Listening" : "Start Listening"}
            </button>
            <div id="label-container"></div>
            {/* Zeige die Vorhersagen im Interface */}
            <div>
                {predictions.length > 0 && (
                    <ul>
                        {predictions.map((prediction, index) => (
                            <li key={index}>{prediction}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default TimerComponent;
