import './App.css';
import {useDropzone} from "react-dropzone";
import {useCallback, useState} from "react";
import firebase from "firebase/app";

import FilePosition from "./components/FilePosition/FilePosition";


function StyledDropzone(props) {
    const onDrop = useCallback(acceptedFiles => {
        // Do something with the files
        const setFiles = props.setFiles;
        const files = props.files;
        for (let file of acceptedFiles) {
            if (!files.find(f => f.name === file.name && f.size === file.size)) {
                files.push(file);
            }
        }
        setFiles([...files]);
    }, [props.files, props.setFiles])

    const {
        getRootProps,
        getInputProps,
        isDragActive,
    } = useDropzone({onDrop});

    return (
        <div className="container">
            <div className="styledDrop" drag={isDragActive ? 'true' : 'false'} {...getRootProps()}>
                <input {...getInputProps()} />
                {!isDragActive ? <p>Przeciągnij tutaj swoje pliki <br/> lub <br/> kliknij, by je wybrać</p> :
                    <p>Upuść teraz</p>}
            </div>
        </div>
    );
}

function App() {
    const [files, setFiles] = useState([]);
    const functions = firebase.app().functions('europe-west3')
    const storage = firebase.storage();
    const auth = firebase.auth();
    // const functions = firebase.functions();
    auth.signInAnonymously().catch(function (error) {
        // Handle Errors here.
        // var errorCode = error.code;
        // var errorMessage = error.message;
    });
    let uid;
    auth.onAuthStateChanged(user => {
        if (user) {
            uid = user.uid;
        }
    })

    const removeFile = file => {
        const id = files.indexOf(file);
        let filesCopy = [...files];
        filesCopy.splice(id, 1)
        setFiles(filesCopy);
    }

    const [progresses, setProgresses] = useState({});
    const [urls, setUrls] = useState({});
    const [uploads, setUploads] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [, setToastTimeout] = useState(undefined);

    const uploadFiles = toUpload => {
        if (!toUpload || toUpload.length === 0 || uploads > 0) {
            return;
        }

        for (let file of toUpload) {
            if (!(progresses[file.name] === 100 || urls[file.name])) {
                uploadFile(file)
            }
        }
    }

    const uploadFile = async file => {
        setUploads(last => last + 1);
        const storageRef = storage.ref();
        const fileRef = storageRef.child(`uploads/${uid}/${file.name}`);
        const uploadTask = fileRef.put(file);
        uploadTask.on('state_changed', snapshot => {
            const progress = Math.round(snapshot.bytesTransferred * 100 / snapshot.totalBytes);
            setProgresses(last => {
                let next = {...last};
                next[file.name] = progress;
                return next;
            });
        }, error => {
            console.error(error);
        }, () => {
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                setUrls(last => {
                    const next = {...last};
                    next[file.name] = downloadURL;
                    return next;
                });
                setUploads(last => last - 1);
            });
        });
    }

    const copyToClipboard = filename => {
        const url = urls[filename];
        const textField = document.createElement('textarea')
        textField.innerText = url;
        document.body.appendChild(textField);
        textField.select();
        textField.setSelectionRange(0, 99999)
        document.execCommand('copy');
        textField.remove();
        setShowToast(true);
        setToastTimeout(prev => {
            if (prev) {
                clearTimeout(prev);
            }
            return setTimeout(() => {
                setShowToast(false);
            }, 1000)
        })
    }

    const speechRecognition = async (name, type) => {
        const t = type === 'audio/mpeg'
            ? 'mp3'
            : type.split('/')[1];
        const callable = functions.httpsCallable('speechToText', {timeout: 540000});
        const {data} = await callable({path: `uploads/${uid}/${name}`, type: t})
        if (data.status === 'OK') {
            const blob = new Blob([`Średnia pewność transkrypcji: ${data.avgConfidence}\nTranskrypcja:\n${data.transcription}`],
                {type: "text/plain;charset=utf-8"});
            const dummyLink = document.createElement('a');
            dummyLink.href = URL.createObjectURL(blob);
            dummyLink.download = `${name.split('.')[0]}_transcription.txt`;
            dummyLink.click();
        } else if (data.status === 'ERROR') {
            throw Error(data.message);
        } else {
            throw Error('Unknown error.')
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Swiftshare</h1>
                <p>
                    Udostępniaj szybko i wygodnie
                </p>
            </header>
            <main>
                <section>
                    <StyledDropzone files={files} setFiles={setFiles}/>
                    <ul className="file-list">
                        {files.map(file =>
                            <FilePosition key={file.name + file.size} file={file} progress={progresses[file.name]}
                                          url={urls[file.name]} speechRecognition={speechRecognition}
                                          removeFile={removeFile} copyToClipboard={copyToClipboard}/>
                        )}
                    </ul>
                    <div className="flat-button"
                         onClick={() => uploadFiles(files)}>{uploads > 0 ? 'Udostępnianie...' : 'Udostępnij'}</div>
                </section>
            </main>
            <aside className={`toast ${showToast ? 'show' : ''}`}>
                Skopiowano
            </aside>
        </div>
    );
}

export default App;
