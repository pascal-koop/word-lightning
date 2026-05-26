import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // appId: die eindeutige Bundle ID im App Store. Lässt sich nach
  // dem ersten Release praktisch nicht mehr ändern.
  appId: "com.koop.wordlightning",

  // appName: der Anzeigename auf dem Home-Screen (max. ~12 Zeichen sind
  // sichtbar, bevor iOS abkürzt).
  appName: "Word Lightning",

  // webDir: Ordner mit dem fertigen Web-Build, den Capacitor in die
  // native App kopiert. Vite gibt standardmäßig nach "dist" aus.
  webDir: "dist",

  ios: {
    // contentInset: "always" sorgt dafür, dass Inhalte nicht unter
    // dem Notch oder der Status-Bar verschwinden. Wir steuern das
    // zusätzlich per CSS (safe-area-insets).
    contentInset: "always",
  },

  plugins: {
    SplashScreen: {
      // 2 Sekunden Splash, dann automatisch ausblenden. Lange Splashes
      // wirken unprofessionell, kurze fühlen sich knackig an.
      launchShowDuration: 2000,
      launchAutoHide: true,
      // Hintergrundfarbe muss zum Design passen (Indigo-Lavendel,
      // gleicher Ton wie unser Gradient in index.css).
      backgroundColor: "#eef2ff",
      showSpinner: false,
    },
  },
};

export default config;
