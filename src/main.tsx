import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Filter out benign TensorFlow Lite / Emscripten WASM informational logs
// that are routed to stderr (e.g. "INFO: Created TensorFlow Lite XNNPACK delegate for CPU.")
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('TensorFlow Lite') ||
      args[0].includes('XNNPACK') ||
      args[0].includes('INFO:'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('TensorFlow Lite') ||
      args[0].includes('XNNPACK') ||
      args[0].includes('INFO:'))
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

const originalConsoleInfo = console.info;
console.info = (...args: unknown[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('TensorFlow Lite') ||
      args[0].includes('XNNPACK') ||
      args[0].includes('INFO:'))
  ) {
    return;
  }
  originalConsoleInfo.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);
