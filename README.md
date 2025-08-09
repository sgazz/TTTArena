# XO Arena - Tournament Game

Web igra sa 9 tabla za XO (Tic-Tac-Toe) turnir koristeći Phaser.js framework sa timer sistemom.

## Ključna pravila

### 1. 9 nezavisnih tabli koje se igraju u krugu
- Igra se odvija na 9 mini tabla organizovanih u 3x3 grid
- X → O → sledeća tabla (kružno kretanje)

### 2. Reset table nakon pobede
- **Pobednik** → tabla se briše i na njoj počinje novi meč
- **Gubitnik** → igra prvi u novoj partiji na toj tabli
- **Nerešeno** → X igra prvi u novoj partiji

### 3. Timer sistem kao u šahu
- **Start**: 1 minut po igraču
- **Pobeda**: +15 sekundi pobedniku, -10 sekundi gubitniku
- **Nerešeno**: +5 sekundi obojici
- **Pobednik**: Onaj kome nije isteklo vreme

### 4. Modovi igre
- **PvP**: Čovek protiv čoveka
- **PvAI**: Čovek (X) protiv AI (O)
- **AIvP**: AI (X) protiv čoveka (O)

## Funkcionalnosti

- **9 tabla**: Mini XO igre u 3x3 grid-u
- **Timer sistem**: Šahovski timer sa bonus/penalty sistemom
- **Reset sistema**: Nakon pobede tabla se resetuje
- **AI protivnik**: Pametan AI koji traži pobedničke poteze
- **Animacije**: Blinkanje pobedničkih ćelija
- **Semafor**: Prikaz rezultata, vremena i bonus/penalty sekundi
- **Game Over ekran**: Finalni rezultat turnira

## Kako igrati

1. Otvorite `index.html` u web browseru
2. Izaberite mod igre (PvP, PvAI, AIvP)
3. Kliknite na aktivnu tablu (označenu žutom bojom)
4. Postavite X ili O u praznu ćeliju
5. Nakon pobede na tabli, tabla se resetuje i gubitnik igra prvi
6. Turnir se završava kada jednom od igrača istekne vreme
7. Pobednik je onaj kome nije isteklo vreme

## Kontrole

- **PvP**: Prebacivanje između modova igre
- **PvAI**: Igrajte kao X protiv AI-a
- **AIvP**: AI igra kao X protiv vas
- **Reset**: Resetuje trenutni turnir

## Tehnologije

- **Phaser.js 3**: Game framework
- **HTML5 Canvas**: Rendering
- **Vanilla JavaScript**: Game logic

## Struktura fajlova

- `index.html` - Glavni HTML fajl sa UI-om i semaforom
- `main.js` - Phaser konfiguracija i UI kontrole
- `GameScene.js` - Glavna logika igre sa timer sistemom
- `ai.js` - AI algoritam za protivnika
- `README.md` - Uputstva za igru

## Zvukovi i animacije

- **Zvukovi**: Placeholder za move, win, draw zvukove
- **Animacije**: Blinkanje pobedničkih ćelija (4 puta)
- **Semafor**: Bonus/penalty info blinka 1 sekundu
- **Game Over**: Modal sa finalnim rezultatom
