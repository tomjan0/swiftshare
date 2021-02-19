const functions = require('firebase-functions');
const speech = require('@google-cloud/speech');

const options = {
    timeoutSeconds: 540
}
// Creates a client
const client = new speech.SpeechClient();

exports.speechToText = functions
    .region('europe-west3')
    .runWith(options)
    .https
    .onCall(async (data) => {
        try {
            if (!data.path || !data.type) {
                return {status: 'ERROR', message: 'Wrong request data.'}
            }
            const gcsUri = `gs://swiftshare-df351.appspot.com/${data.path}`;
            const config = {
                languageCode: 'pl-PL',
            };

            if (data.type === 'wav') {
                config.encoding = 'LINEAR16';
            } else if (data.type === 'mp3') {
                config.sampleRateHertz = 44100;
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
            const res = (await operation.promise())[0];
            if (res.results) {
                const transcription = res.results
                    .map(result => result.alternatives[0].transcript)
                    .join('\n');
                const sumConfidence = res.results
                    .map(result => result.alternatives[0].confidence)
                    .reduce((acc, el) => acc + el)
                const avgConfidence = sumConfidence / res.results.length;
                return {status: "OK", transcription, avgConfidence};
            }
            return {status: "ERROR", message: 'Empty transcription.'};
        } catch (e) {
            functions.logger.error(e);
            return {status: "ERROR", message: e.details || 'Unknown error occurred.'};
        }
    });
