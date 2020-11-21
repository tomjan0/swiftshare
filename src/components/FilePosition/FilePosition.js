import React from 'react';
// import classes from "./FilePosition.module.css";
import {CopyIcon, TrashIcon} from "../../shared/icons.js";

export default class FilePosition extends React.Component {

    remove = () => {
        this.props.removeFile(this.props.file);
    }

    copyToClipboard = () => {
        this.props.copyToClipboard(this.props.file.name);
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

    render() {
        return (
            <li>
                <div className="left" style={this.progressStyle}>{this.props.file.name}
                    <b style={{marginLeft: "10px"}}>({this.formattedSize})</b>
                </div>
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
