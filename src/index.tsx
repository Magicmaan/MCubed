import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import { BrowserRouter, Route, Routes, useParams } from 'react-router';

// const rootElement = document.getElementById("root");
// const root = ReactDOM.createRoot(rootElement!);

const TestComponent = () => {
	let { j } = useParams();
	console.log('Search URL ', j);
	return <div>Hi</div>;
};

ReactDOM.render(<App />, document.getElementById('root'));
