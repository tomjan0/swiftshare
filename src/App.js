import './App.css';
import {useDropzone} from "react-dropzone";
import {useCallback, useState} from "react";
import firebase from "firebase";


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
        uid = user.uid;
    })

    const removeFile = file => {
        const id = files.indexOf(file);
        let filesCopy = [...files];
        filesCopy.splice(id, 1)
        setFiles(filesCopy);
    }

    const trashIcon = () => {
        return (
            <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-trash" fill="currentColor"
                 xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fillRule="evenodd"
                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
        )
    }

    const clipboardIcon = () => {
        return (
            <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-clipboard" fill="currentColor"
                 xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd"
                      d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                <path fillRule="evenodd"
                      d="M9.5 1h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
            </svg>
        )
    }

    const parseSize = size => {
        const units = ['K', 'M', 'G', 'T'];
        let unitIndex = 0;
        size /= 1024;
        while (size > 1000) {
            size = size / 1000;
            unitIndex++;
        }
        return `${Math.round(size * 100) / 100} ${units[unitIndex]}B`;
    }

    const [progresses, setProgresess] = useState({});
    const [urls, setUrls] = useState({});
    const [uploads, setUploads] = useState(0);

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
                    setProgresess(last => {
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

    const copyToClipboard = url => {
        console.log('copy', url);
        const textField = document.createElement('textarea')
        textField.innerText = url;
        document.body.appendChild(textField);
        textField.select();
        textField.setSelectionRange(0, 99999)
        document.execCommand('copy');
        textField.remove();
    }

    const parsProgress = progress => {
        if (progress) {
            return {background: `linear-gradient(90deg, var(--blue-300)  ${progress}%, white ${progress}%)`};
        } else
            return {};
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
                            <li key={file.name + file.size}>
                                <div className="left" style={parsProgress(progresses[file.name])}>{file.name}<b
                                    style={{marginLeft: "10px"}}>({parseSize(file.size)})</b></div>
                                {!progresses[file.name]
                                    ? <div className="float-button" bg="red"
                                           onClick={() => removeFile(file)}>{trashIcon()}</div>
                                    : !urls[file.name]
                                        ? <div className="percent-progress">{progresses[file.name]}%</div>
                                        : <div className="float-button" bg="green"
                                               onClick={() => copyToClipboard(urls[file.name])}>{clipboardIcon()}</div>
                                }
                            </li>
                        )}
                    </ul>
                    <div className="flat-button" color="blue"
                         onClick={() => uploadFiles(files)}>{uploads > 0 ? 'Uploading' : 'Upload'}</div>
                </section>
            </main>
        </div>
    );
}

export default App;
