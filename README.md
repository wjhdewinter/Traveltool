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
