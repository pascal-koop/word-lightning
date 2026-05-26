# Word Lightning – Weg in den App Store

Diese Anleitung führt dich Schritt für Schritt von „funktioniert lokal" bis
„im App Store kaufbar". Lies sie **einmal komplett durch**, bevor du anfängst –
manche Schritte hängen von vorherigen Entscheidungen ab.

---

## Inhalt

1. [Voraussetzungen](#1-voraussetzungen)
2. [Erste lokale iOS-Build (Simulator)](#2-erste-lokale-ios-build-simulator)
3. [Auf einem echten iPhone testen](#3-auf-einem-echten-iphone-testen)
4. [App Icon & Splash Screen ersetzen](#4-app-icon--splash-screen-ersetzen)
5. [App Store Connect einrichten](#5-app-store-connect-einrichten)
6. [Archive bauen und hochladen](#6-archive-bauen-und-hochladen)
7. [Store-Eintrag ausfüllen & Review einreichen](#7-store-eintrag-ausfüllen--review-einreichen)
8. [Updates veröffentlichen](#8-updates-veröffentlichen)
9. [Workflow-Cheatsheet](#9-workflow-cheatsheet)

---

## 1. Voraussetzungen

- [ ] **macOS** (du hast schon einen Mac ✅)
- [ ] **Xcode** aus dem Mac App Store installieren (ca. 10 GB – am besten über Nacht).
      Nach der Installation einmal öffnen und Lizenz akzeptieren.
- [ ] Im Terminal:
      ```bash
      sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
      ```
      → damit nicht mehr nur die Command-Line-Tools genutzt werden.
- [ ] **Apple Developer Program** Mitgliedschaft kaufen (99 USD/Jahr) auf
      [developer.apple.com/programs](https://developer.apple.com/programs/).
      Die Aktivierung dauert manchmal 24h.
- [ ] Eine **Apple ID**, die mit dem Developer-Programm verknüpft ist.

> ⚠️ Du kannst **alle Schritte bis 5 schon ohne Developer Account ausprobieren**
> (Simulator + persönliches Test-Gerät funktionieren mit deiner normalen Apple ID).
> Du brauchst den Account erst zum Hochladen in den Store.

---

## 2. Erste lokale iOS-Build (Simulator)

Sobald Xcode installiert ist:

```bash
# Web bauen + iOS-Projekt synchen + Xcode öffnen
npm run ios:open
```

In Xcode:

1. Oben Mitte: Gerät auswählen → z. B. **„iPhone 16 Pro"** (Simulator).
2. Großer **▶︎ Play-Button** (oben links) → Xcode baut und startet die App.

Beim ersten Mal dauert das 2–5 Minuten. Du solltest dann „Word Lightning"
im iPhone-Simulator sehen.

**Wenn etwas schiefgeht:**

- Fehler „No signing certificate found" → siehe nächster Abschnitt.
- Weißer Bildschirm → in Xcode unten Konsole prüfen, meist hat `npm run build`
  einen Fehler übersehen. Workflow erneut: `npm run ios:sync`.

---

## 3. Auf einem echten iPhone testen

Der Simulator reicht für die meisten Dinge, aber **haptisches Feedback,
echte Performance und Status-Bar-Verhalten** kannst du nur auf einem echten
Gerät testen.

1. iPhone per USB-C/Lightning-Kabel anschließen, am iPhone „Diesem Computer
   vertrauen" bestätigen.
2. In Xcode oben Mitte dein iPhone auswählen.
3. **Signing einrichten** (einmalig):
   - Links im Project Navigator auf das blaue „App"-Projekt klicken.
   - Reiter **„Signing & Capabilities"** → Target **„App"**.
   - Häkchen **„Automatically manage signing"** setzen.
   - Bei **„Team"** deine Apple ID auswählen
     (falls noch keine da: „Add an Account…" → Apple ID eingeben).
   - Bei **„Bundle Identifier"** sollte `com.koop.wordlightning` stehen.
4. ▶︎ Play-Button drücken.
5. Beim ersten Start am iPhone: **Einstellungen → Allgemein → VPN & Geräte­verwaltung**
   → dein Profil → **„Vertrauen"**.

> 💡 **Ohne** Developer-Account verfallen Apps nach 7 Tagen vom Gerät und müssen
> neu signiert werden. **Mit** Account hält die Signierung 1 Jahr.

---

## 4. App Icon & Splash Screen ersetzen

### App Icon

Apple braucht **ein einziges PNG**: **1024×1024 px**, **kein Alpha-Kanal**
(also kein transparenter Hintergrund), **keine abgerundeten Ecken**
(iOS rundet selbst).

**Tipps:**

- Motiv großzügig dimensionieren – das Icon erscheint später nur wenige mm groß.
- Lieber Symbol als Text. Wenn Text, dann sehr groß und kontrastreich.
- Hintergrundfarbe sollte zum App-Design passen (Indigo-Töne aus deinem CSS).
- ⚠️ Klär vorher, ob das Spiel **„Word Blitz"** oder **„Word Lightning"** heißt
  und einigt dich auf einen Namen über alle Stellen hinweg.

So baust du das Icon-Set:

1. Erstelle eine `AppIcon.png` (1024×1024) in einem Bildprogramm
   (Figma, Sketch, Affinity, Photoshop, Pixelmator …).
2. In Xcode links den Pfad **App → App → Assets.xcassets → AppIcon** öffnen.
3. Das große leere Quadrat in der Mitte (1024×1024 „App Store iOS") → dein
   PNG einfach reinziehen.
4. Modernes Xcode generiert kleinere Größen automatisch.

### Splash Screen

Das zentrale Logo auf dem Splash kommt aus `LaunchScreen.storyboard`:

- Pfad in Xcode: **App → App → Base.lproj → LaunchScreen.storyboard**.
- Klicke das Logo-`UIImageView` in der Mitte → rechte Seitenleiste → Image
  → wähle das Splash-Asset.
- Splash-Assets liegen in `ios/App/App/Assets.xcassets/Splash.imageset/`.
  Ersetze die drei PNGs (1x/2x/3x) durch dein Logo.

### Background-Farbe

Steht in [`capacitor.config.ts`](../capacitor.config.ts) unter
`plugins.SplashScreen.backgroundColor`. Ändern, dann `npm run ios:sync`.

---

## 5. App Store Connect einrichten

1. Auf [appstoreconnect.apple.com](https://appstoreconnect.apple.com) einloggen.
2. **My Apps → "+" → New App**.
3. Felder ausfüllen:
   - **Platform**: iOS
   - **Name**: „Word Lightning" (Achtung: muss in App Store eindeutig sein –
     vielleicht ist der Name schon vergeben → ggf. anders nennen)
   - **Primary Language**: German (oder English, je nach Hauptmarkt)
   - **Bundle ID**: `com.koop.wordlightning` aus dem Dropdown.
     (Wenn er nicht im Dropdown steht: in Xcode einmal das Projekt bauen,
     damit die ID bei Apple registriert wird, oder unter
     [Certificates, Identifiers & Profiles → Identifiers](https://developer.apple.com/account/resources/identifiers/list)
     manuell anlegen.)
   - **SKU**: irgendein interner Code, z. B. `WORDLIGHTNING001`.
4. **Create**.

Du landest jetzt auf der App-Übersicht und kannst die Metadaten ausfüllen
(siehe Abschnitt 7).

---

## 6. Archive bauen und hochladen

Wenn Icon, Texte und Code stimmen:

```bash
npm run ios:open
```

In Xcode:

1. Oben Mitte: Gerät auf **„Any iOS Device (arm64)"** stellen
   (nicht Simulator – Apple akzeptiert nur Release-Builds für echte Geräte).
2. Menü **Product → Archive**.
3. Build dauert 1–3 Minuten. Danach öffnet sich der **Organizer**.
4. Im Organizer dein Archive auswählen → **„Distribute App"**.
5. Wähle **„App Store Connect"** → **„Upload"**.
6. Default-Optionen lassen, **„Next"** durchklicken bis **„Upload"**.
7. Apple lädt hoch (1–5 Minuten) und macht eine erste automatische Prüfung.
8. In App Store Connect siehst du nach 10–30 Minuten den Build unter
   **„TestFlight"** auftauchen.

---

## 7. Store-Eintrag ausfüllen & Review einreichen

In **App Store Connect → deine App → App Store** (im linken Menü):

### Pflichtfelder

- **Promotional Text** (170 Zeichen) – darf nachträglich geändert werden,
  ohne neuen Review. Nutze das für Marketing.
- **Description** (4000 Zeichen) – beschreibt das Spiel ausführlich.
- **Keywords** (100 Zeichen, kommagetrennt) – z. B.:
  `word, game, party, vocabulary, brain, fun, family`
- **Support URL** – Pflicht. Eine simple HTML-Seite oder dein Vercel-Link reicht.
- **Marketing URL** – optional.
- **Privacy Policy URL** – **Pflicht!** Selbst wenn deine App keine Daten
  sammelt, brauchst du eine Datenschutzerklärung als URL. Tipps:
  - Generator: [app-privacy-policy-generator.firebaseapp.com](https://app-privacy-policy-generator.firebaseapp.com/)
  - Hosten z. B. als GitHub Pages oder einfache Vercel-Page.
  - Du darfst dort ehrlich schreiben „Diese App sammelt **keine** personen­bezogenen
    Daten. Alle Spielstände bleiben lokal auf dem Gerät." → das ist sogar gut für Apple.
- **Screenshots** für mindestens diese Bildschirmgrößen:
  - **6.7"** (iPhone 15 Pro Max) – 1290×2796
  - **6.5"** (iPhone 11 Pro Max) – 1242×2688
  - **5.5"** (iPhone 8 Plus) – 1242×2208
  - → Du kannst sie alle im Xcode-Simulator mit `Cmd+S` aufnehmen.
  - Mindestens 2 Screenshots pro Größe, max. 10.
- **App Icon** (1024×1024) – wird automatisch aus dem Build übernommen.
- **Age Rating** – Fragebogen ausfüllen. Wenn du „spicy adult prompts"
  einbaust (wie im README erwähnt): mind. **17+** wählen, sonst riskierst du
  einen Reject.
- **App Category** – primär „Games" → Subkategorie „Word".
- **Pricing & Availability** – Preis (kostenlos oder z. B. 1,99 €) und Länder wählen.

### Data Privacy Section

Apple fragt explizit, welche Daten du sammelst. Word Lightning sammelt
**nichts** → wähle „Data Not Collected". Das ist ein riesiger Pluspunkt.

### Review einreichen

- Unter **„Build"** den hochgeladenen Build auswählen.
- **„Add for Review"** → **„Submit for Review"**.
- Apple prüft in der Regel innerhalb **24–72 Stunden**.

### ⚠️ Typische Reject-Gründe für Capacitor-Apps

1. **„Minimum Functionality" (Guideline 4.2)** – Apple denkt, du hast nur
   eine Website verpackt. Lösung: betone Offline-Fähigkeit, native Haptics,
   eigene Inhalte, Custom-Prompts-Editor. Mach Screenshots, die die App-Natur zeigen.
2. **Fehlende Privacy Policy** – siehe oben.
3. **Falsches Age-Rating** wenn Erwachsenen-Prompts ausgeliefert werden.
4. **Crashes auf bestimmten iPhones** – immer auf mindestens einem echten Gerät testen.

---

## 8. Updates veröffentlichen

Wenn du im Code etwas änderst:

1. **Version erhöhen**: in Xcode unter **App → General → Identity**:
   - `Version` (= „1.0.0", für Nutzer sichtbar) hochzählen, **wenn** sich
     für den Nutzer etwas Sichtbares ändert.
   - `Build` (= „1", „2", „3", … intern) musst du **bei jedem Upload**
     erhöhen, sonst lehnt App Store Connect den Upload ab.
2. `npm run ios:sync`
3. Xcode → Product → Archive → wie in Abschnitt 6.
4. In App Store Connect: neue Version anlegen, „What's New in This Version"
   ausfüllen, Build wählen, Submit.

Bugfix-Updates (Build erhöhen ohne Code-Änderungen sichtbar zu machen) gehen
oft in **24h** durch.

---

## 9. Workflow-Cheatsheet

| Aufgabe | Befehl |
|---|---|
| Lokal im Browser entwickeln | `npm run dev` |
| Web-Version bauen | `npm run build` |
| Tests laufen lassen | `npm run test:run` |
| Code zu iOS syncen | `npm run ios:sync` |
| iOS-Projekt in Xcode öffnen | `npm run ios:open` |

**Goldene Regel:** Jede Code-Änderung erfordert `npm run ios:sync` (oder
`ios:open`), damit der frische Build in die iOS-App wandert. Der Capacitor-Cli
schreit nicht, wenn du das vergisst – die App zeigt dann einfach den alten Stand.

---

## Hilfe?

- Capacitor-Doku: <https://capacitorjs.com/docs/ios>
- Apple-Review-Guidelines: <https://developer.apple.com/app-store/review/guidelines/>
- App Store Connect Help: <https://developer.apple.com/help/app-store-connect/>
