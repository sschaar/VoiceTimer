import * as tf from '@tensorflow/tfjs';

export async function loadAudioClassifierModel() {
    const modelURL = '/assets/tm-my-audio-model/model.json';
    return await tf.loadLayersModel(modelURL);
}

export async function loadMetadata() {
    const metadataURL = '/assets/tm-my-audio-model/metadata.json';
    const response = await fetch(metadataURL);
    return await response.json();
}
