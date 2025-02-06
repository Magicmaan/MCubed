import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import { BrowserRouter, Route, Routes, useParams } from 'react-router';

// const rootElement = document.getElementById("root");
// const root = ReactDOM.createRoot(rootElement!);

ReactDOM.render(<App />, document.getElementById('root'));
