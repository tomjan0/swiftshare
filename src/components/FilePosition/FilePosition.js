import React from 'react';
import "./FilePosition.css";
import {CheckIcon, CopyIcon, DocumentTextIcon, TrashIcon, XIcon} from "../../shared/icons";
import Spinner from "../../shared/spinner";

export default class FilePosition extends React.Component {
    constructor() {
        super();
        this.state = {
            recognitionStatus: 'not-started'
        }
    }

    remove = () => {
        this.props.removeFile(this.props.file);
    }

    copyToClipboard = () => {
        this.props.copyToClipboard(this.props.file.name);
    }

    speechRecognition = async () => {
        if (this.state.recognitionStatus === 'not-started') {
            this.setState({recognitionStatus: 'in-progress'});
            try {
                await this.props.speechRecognition(this.props.file.name, this.props.file.type);
                this.setState({recognitionStatus: 'finished'});
            } catch (e) {
                this.setState({recognitionStatus: 'failed'});
            }

        }
    }

    get completed() {
        return !!this.props.url;
    }

    get inProgress() {
        return !!this.props.progress;
    }

    get formattedSize() {
        let size = this.props.file.size;
        const units = ['K', 'M', 'G', 'T'];
        let unitIndex = 0;
        size /= 1024;
        while (size > 1000) {
            size = size / 1000;
            unitIndex++;
        }
        return `${Math.round(size * 100) / 100} ${units[unitIndex]}B`;
    }

    get progressStyle() {
        const progress = this.props.progress;
        if (progress) {
            return {background: `linear-gradient(90deg, var(--blue-300)  ${progress}%, white ${progress}%)`};
        } else
            return {};
    }

    get recognitionIcon() {
        switch (this.state.recognitionStatus) {
            case 'not-started':
                return <DocumentTextIcon/>;
            case 'in-progress':
                return <Spinner/>;
            case 'finished':
                return <CheckIcon/>;
            case 'failed':
                return <XIcon/>
            default:
                return <DocumentTextIcon/>;
        }
    }

    get isAudio() {
        return this.props.file.type.split('/')[0] === 'audio';
    }

    render() {
        return (
            <li>
                <div className="left" style={this.progressStyle}>{this.props.file.name}
                    <b style={{marginLeft: "10px"}}>({this.formattedSize})</b>
                </div>
                {this.isAudio && this.completed &&
                <div
                    className={`float-button ${this.completed ? this.state.recognitionStatus === 'failed' ? 'error' : 'feature' : ''}`}
                    bg={this.state.recognitionStatus === 'failed' ? 'red' : 'blue'}
                    onClick={this.speechRecognition}>{this.recognitionIcon}</div>
                }
                {!this.inProgress
                    ? <div className="float-button" bg="red"
                           onClick={this.remove}><TrashIcon/></div>
                    : !this.completed
                        ? <div className="percent-progress">{this.props.progress}%</div>
                        : <div className="float-button" bg="green"
                               onClick={this.copyToClipboard}><CopyIcon/></div>
                }

            </li>
        )
    }
}
