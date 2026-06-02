import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import './index.css'
import App from './App.tsx'
import { initializeDatabase } from './db/db.ts'

initializeDatabase().catch((error) => {
  console.error("Failed to initialize database", error);
});

// Native-Setup nur ausführen, wenn wir wirklich in einer Capacitor-App laufen
// (also nicht im Browser auf vercel.app). Capacitor.isNativePlatform() liefert
// false im Web, true auf iOS/Android.
if (Capacitor.isNativePlatform()) {
  // Status-Bar (Uhr/Akku oben) auf dunklen Text setzen, weil unser
  // Hintergrund hell (indigo-50) ist. "Style.Dark" = dunkler Text.
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {
    /* falls Plugin noch nicht bereit ist – nicht kritisch */
  });

  // Splash-Screen erst ausblenden wenn React die App gerendert hat,
  // damit der Nutzer keinen weißen Blitz sieht.
  SplashScreen.hide().catch(() => {
    /* okay, falls schon versteckt */
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
