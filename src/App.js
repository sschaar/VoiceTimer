import React from 'react';
import TeachableMachineAudioModel from './TeachableMachineAudioModel'; // Importiere deine TeachableMachineAudioModel-Komponente

function App() {
    return (
        <div className="App">
            <h1>Timer mit Sprachsteuerung</h1>
            <TeachableMachineAudioModel /> {/* Füge die TeachableMachineAudioModel-Komponente hier hinzu */}
        </div>
    );
}

export default App;
