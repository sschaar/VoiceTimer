import React, { useEffect, useState, useRef } from "react";
import * as speechCommands from '@tensorflow-models/speech-commands';
import { Button, Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

const TimerComponent = () => {
    const recognizerRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const [timeLeft, setTimeLeft] = useState(60);
    const [timerActive, setTimerActive] = useState(false);
    const [backgroundNoise, setBackgroundNoise] = useState("");
    const [start, setStart] = useState("");
    const [stop, setStop] = useState("");

    const URL = "https://teachablemachine.withgoogle.com/models/vSd1FUUzK/";

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
            console.log("Verfügbare Labels:", classLabels);

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
            setTimerActive(false);
            resetValues();
        }

        return () => clearInterval(timerInterval);
    }, [timerActive, timeLeft]);

    const resetValues = () => {
        setStart("");
        setStop("");
        setBackgroundNoise("");
    };

    const startListening = () => {
        const recognizer = recognizerRef.current;
        if (recognizer) {
            resetValues();
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
                        setStart(scores[startIndex].toFixed(2));
                        startTimer();
                    } else if (scores[stopIndex] > threshold) {
                        console.log("Stop-Befehl erkannt");
                        setStop(scores[stopIndex].toFixed(2));
                        stopTimer();
                    } else {
                        setBackgroundNoise(scores[0].toFixed(2));
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
            setTimerActive(true);
        }
    };

    const stopTimer = () => {
        setTimerActive(false);
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100 bg-gray text-light">
            <Row className="text-center">
                <Col>
                    <Card className="p-4 bg-dark text-light border-light">
                        <h2>Timer</h2>

                        <div className="mb-4">
                            <h3 className="font-weight-bold">{timeLeft}s</h3>
                            {timeLeft === 0 && <p className="text-danger font-weight-bold">Timer ended!</p>}
                        </div>

                        <Button
                            variant={isListening ? "danger" : "success"}
                            onClick={isListening ? stopListening : startListening}
                        >
                            {isListening ? "Stop Listening" : "Start Listening"}
                        </Button>

                        <div id="label-container" className="mt-4">
                            {predictions.length > 0 && (
                                <ListGroup className="mt-3">
                                    {predictions.map((prediction, index) => (
                                        <ListGroup.Item key={index} className="bg-dark text-light border-light">
                                            {prediction}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default TimerComponent;
