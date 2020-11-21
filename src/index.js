import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/storage";
import "firebase/auth";

// Use your config values here.
firebase.initializeApp({
    apiKey: "AIzaSyDdnODn84v5MDCgbvRinvnHYHaVaEtCaRY",
    authDomain: "swiftshare-df351.firebaseapp.com",
    databaseURL: "https://swiftshare-df351.firebaseio.com",
    projectId: "swiftshare-df351",
    storageBucket: "swiftshare-df351.appspot.com",
    messagingSenderId: "939926637113",
    appId: "1:939926637113:web:21c5068b74ba5228dc5be8",
    measurementId: "G-VMTLT0R5P2"
});

firebase.analytics();


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
