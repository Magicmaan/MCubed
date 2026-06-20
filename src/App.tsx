import { useState } from 'react';
import './styles/App.css';
import './styles/index.css';
import ModelView from './pages/ModelView';
import TextureView from './pages/TextureView';
import NavBar from './components/NavBar';

function App() {
	const [currentView, setCurrentView] = useState<'model' | 'texture'>('model');

	return (
		<div className="dark flex h-screen w-screen flex-col flex-nowrap transition-all duration-300">
			<NavBar view={currentView} setView={setCurrentView} />
			{currentView === 'model' ? <ModelView /> : <TextureView />}
		</div>
	);
}

export default App;
