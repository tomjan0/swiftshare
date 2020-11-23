const functions = require('firebase-functions');
const speech = require('@google-cloud/speech');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const options = {
    timeoutSeconds: 540,
    memory: '1GB'
}

exports.speechToText = functions.region('europe-west3').runWith(options).https.onCall(async (data) => {

    if (!data.path) {
        return JSON.stringify({avgConfidence: '', transcription: 'File not found'})
    }
    // Creates a client
    const client = new speech.SpeechClient();

    const gcsUri = `gs://swiftshare-df351.appspot.com/${data.path}`;
    const encoding = 'LINEAR16';
    // const sampleRateHertz = 16000;
    const languageCode = 'pl-PL';

    const config = {
        // encoding: encoding,
        // sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
    };

    if (data.type === 'wav') {
        config.encoding = encoding;
    }

    const audio = {
        uri: gcsUri,
    };

    const req = {
        config: config,
        audio: audio,
    };

    // Detects speech in the audio file. This creates a recognition job that you
    // can wait for now, or get its result later.
    const [operation] = await client.longRunningRecognize(req);
    // Get a Promise representation of the final result of the job
    const [res] = await operation.promise();
    const transcription = res.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    const sumConfidence = res.results
        .map(result => result.alternatives[0].confidence)
        .reduce((acc, el) => acc + el)
    const avgConfidence = sumConfidence / res.results.length;
    // functions.logger.info(`Transcription: ${transcription}`);
    return JSON.stringify({transcription, avgConfidence});
});
