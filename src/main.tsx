import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupBrazilianTimezone } from './lib/timezone-config'

// Configurar timezone brasileiro ANTES de tudo
setupBrazilianTimezone();

createRoot(document.getElementById("root")!).render(<App />);
