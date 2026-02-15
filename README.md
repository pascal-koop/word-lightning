# Word Lightning

Ein React + TypeScript Spiel, bei dem Spieler zu einem gegebenen Buchstaben und einer Frage passende Antworten finden müssen.

## Geplante Features

### 1. IndexedDB + Dexie Datenbank für Fragen

Die Fragen sollen zukünftig in einer IndexedDB-Datenbank gespeichert werden, anstatt in einem einfachen Array. Dies ermöglicht:
- Persistente Speicherung der Fragen
- Effiziente Abfragen und Verwaltung
- Bessere Skalierbarkeit für größere Fragensammlungen

**Technische Umsetzung:**
- Erstellung einer IndexedDB-Datenbank mit Dexie.js
- Migration der aktuellen Fragen in die Datenbank
- Implementierung von Datenbankzugriffsfunktionen

### 2. Benutzerdefinierte Fragen (User Questions)

Spieler sollen die Möglichkeit erhalten, eigene Fragen zu erstellen und ins Spiel zu integrieren.

**Funktionalitäten:**
- **Erstellung eigener Fragen:** Über ein Interface können Spieler neue Fragen hinzufügen
- **Speicherung in separater Tabelle:** Eigene Fragen werden in der Tabelle `user_questions` gespeichert
- **Toggle-Funktion:** Benutzerdefinierte Fragen können über ein Interface ein- und ausgeschaltet werden
- **UI-Liste:** Alle eigenen Fragen werden als Liste in der Benutzeroberfläche angezeigt
- **Löschfunktion:** Einzelne benutzerdefinierte Fragen können gelöscht werden

**Technische Umsetzung:**
- Erstellung der Tabelle `user_questions` in der IndexedDB-Datenbank
- UI-Komponente für die Verwaltung benutzerdefinierter Fragen
- CRUD-Operationen (Create, Read, Update, Delete) für benutzerdefinierte Fragen

---

### 3. Standard-Fragen Toggle

Die Standard-Fragen sollen ein- und ausgeschaltet werden können, jedoch nicht gelöscht werden.

**Funktionalitäten:**
- **Toggle für Standard-Fragen:** Ein Schalter ermöglicht es, die Standard-Fragen zu aktivieren/deaktivieren
- **Schutz vor Löschung:** Standard-Fragen können nicht gelöscht werden
- **Standard-Verhalten:** Im Standard-Zustand sind die Standard-Fragen aktiviert, sodass das Spiel immer spielbar bleibt
- **Fehlertoleranz:** Durch diese Funktion wird verhindert, dass das Spiel durch Fehler oder fehlende Voraussicht unspielbar wird

**Technische Umsetzung:**
- Toggle-Komponente in den Einstellungen
- Logik zur Filterung der Fragen basierend auf dem Toggle-Status
- Validierung, die das Löschen von Standard-Fragen verhindert

---

## Aktueller Stand

Das Spiel verwendet derzeit:
- Ein einfaches Array (`QUESTIONS`) für die Fragensammlung
- React mit TypeScript für die Benutzeroberfläche
- Vite als Build-Tool

## Technologie-Stack

- **React** - UI-Framework
- **TypeScript** - Typsichere Programmierung
- **Vite** - Build-Tool und Development-Server
- **IndexedDB + Dexie** (geplant) - Datenbank für Fragenverwaltung
