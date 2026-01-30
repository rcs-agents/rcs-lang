/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-Regular.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-RegularItalic.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-Semibold.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-SemiboldItalic.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-Thin.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-ThinItalic.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-Ultralight.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-UltralightItalic.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-Bold.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-BoldItalic.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-Light.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-LightItalic.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-Medium.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-MediumItalic.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-Heavy.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-HeavyItalic.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-Black.otf';
import './assets/fonts/San-Francisco-Pro-Fonts/SF-Pro-Display-BlackItalic.otf';
import App from './App';

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);
