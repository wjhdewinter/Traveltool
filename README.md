# Final Countdown PRO

Een mobiele webbased countdown-app in donkere stijl, geschikt voor GitHub Pages.

## Functies

- Meerdere countdowns toevoegen
- Countdown bewerken en verwijderen
- Dagen, uren, minuten en seconden
- Automatisch opslaan in de browser
- Mobielvriendelijke layout
- Werkt als simpele PWA
- Geschikt voor GitHub Pages

## Installatie op GitHub Pages

1. Maak een nieuwe repository aan op GitHub.
2. Upload alle bestanden uit deze map.
3. Ga naar **Settings > Pages**.
4. Kies bij Source: **Deploy from a branch**.
5. Kies branch **main** en map **root**.
6. Klik op Save.
7. Open daarna de GitHub Pages link.

## Bestanden

- `index.html` - de app
- `style.css` - vormgeving
- `app.js` - countdown logica
- `manifest.json` - PWA instellingen
- `sw.js` - offline cache

## Aanpassen

De standaard countdowns kun je aanpassen in `app.js` bij `loadCountdowns()`.


## Nieuw in v2

- Detailpagina per countdown
- Grote timerweergave zoals in je voorbeeld
- Extra berekeningen:
  - jaren
  - maanden
  - weken
  - dagen
  - werkdagen
  - uren
  - minuten
  - seconden
  - milliseconden
- Deelknop via mobiele share-sheet


## Nieuw in v3

- Blauwe zwevende knop op de detailpagina verwijderd
- App is installeerbaar als PWA
- Mooi app-icoon toegevoegd
- Installatieknop toegevoegd wanneer de browser dit ondersteunt

## Installeren op telefoon

### Android / Chrome
1. Open de GitHub Pages link.
2. Tik op **App installeren** als de knop verschijnt.
3. Verschijnt de knop niet? Open het browsermenu en kies **Toevoegen aan startscherm**.

### iPhone / Safari
1. Open de GitHub Pages link in Safari.
2. Tik op delen.
3. Kies **Zet op beginscherm**.
