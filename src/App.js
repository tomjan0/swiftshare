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
        // isDragAccept,
        // isDragReject
    } = useDropzone({onDrop});

    return (
        <div className="container">
            <div className="styledDrop" drag={isDragActive ? 'true' : 'false'} {...getRootProps()}>
                <input {...getInputProps()} />
                {!isDragActive ? <p>Przeciągnij tutaj swoje pliki <br/> lub <br/> kliknij, by je wybrać</p> :
                    <p>Upuść teraz</p>}
            </div>
            {/*{files.map(file =>*/}
            {/*    <li>{file.name}</li>*/}
            {/*)}*/}
        </div>
    );
}

function App() {
    const [files, setFiles] = useState([]);
    const storage = firebase.storage();
    const auth = firebase.auth();
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
        const storageRef = storage.ref();
        for (let file of toUpload) {
            if (!(progresses[file.name] === 100 || urls[file.name])) {
                setUploads(last => last + 1);
                const fileRef = storageRef.child(`uploads/${uid}/${file.name}`);
                console.log(file);
                const uploadTask = fileRef.put(file);
                uploadTask.on('state_changed', snapshot => {
                    const progress = Math.round(snapshot.bytesTransferred * 100 / snapshot.totalBytes);
                    setProgresses(last => {
                        let next = {...last};
                        next[file.name] = progress;
                        return next;
                    });
                }, function (error) {
                    console.log(error);
                }, function () {
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
        }
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
                                              url={urls[file.name]}
                                              removeFile={removeFile} copyToClipboard={copyToClipboard}/>
                        )}
                    </ul>
                    <div className="flat-button" color="blue"
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
