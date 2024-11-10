import * as tf from '@tensorflow/tfjs';

export async function loadAudioClassifierModel() {
    const modelURL = './assets/tm-my-audio-model/model.json';
    try {
        const model = await tf.loadLayersModel(modelURL);
        console.log('Modell erfolgreich geladen:', model);
        return model;
    } catch (error) {
        console.error('Fehler beim Laden des Modells:', error);
        throw error; // Falls du den Fehler an eine andere Stelle weitergeben möchtest
    }
}

export async function loadMetadata() {
    const metadataURL = './assets/tm-my-audio-model/metadata.json';
    try {
        const response = await fetch(metadataURL);
        if (!response.ok) {
            throw new Error(`Metadaten konnten nicht geladen werden: ${response.statusText}`);
        }
        const metadata = await response.json();
        console.log('Metadaten erfolgreich geladen:', metadata);
        return metadata;
    } catch (error) {
        console.error('Fehler beim Laden der Metadaten:', error);
        throw error;
    }
}
