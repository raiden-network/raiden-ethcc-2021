import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

window.onbeforeunload = (event) => {
  event.preventDefault();
  event.returnValue = '';
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
