import './App.css';
import {useDropzone} from "react-dropzone";
import {useCallback, useState} from "react";


function StyledDropzone(props) {
    const onDrop = useCallback(acceptedFiles => {
        // Do something with the files
        const setFiles = props.setFiles;
        const files = props.files;
        for (let file of acceptedFiles) {
            if (!files.find(f => f.name === file.name && f.size === file.size)) {
                console.log('pushing ' + file.name + ', size: ' + file.size)
                files.push(file);
            }
        }
        setFiles([...files]);
    }, [props.files, props.setFiles])

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
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
                    <ul className="filelist">
                        {files.map(file =>
                            <li key={file.name + file.size}>{file.name}</li>
                        )}
                    </ul>
                </section>
            </main>
        </div>
    );
}

export default App;
