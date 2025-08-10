# 🎮 XO Arena

Ultimate Tic-Tac-Toe igra sa AI, tournament modom i retro CRT estetikom.

## 🚀 Pokretanje

1. **Pokreni server:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Otvori igru:**
   ```bash
   open http://localhost:8000
   ```

## 🧪 Testiranje

### Automatski Testovi

Kreirao sam kompletni test suite koji automatski proverava sve funkcionalnosti igre:

#### **Browser Testovi (Preporučeno)**
```bash
cd tests
python3 -m http.server 8001
open http://localhost:8001/test-runner.html
```

#### **CLI Testovi**
```bash
cd tests
npm test                    # Pokreni sve testove
npm run test:game          # Samo game logic testovi
npm run test:ui            # Samo UI testovi
npm run test:ai            # Samo AI testovi
```

#### **Direktno iz Terminala**
```bash
cd tests
node cli-runner.js         # Svi testovi
node cli-runner.js GameLogic    # Samo game logic
node cli-runner.js UIFunctionality  # Samo UI
node cli-runner.js AIFunctionality  # Samo AI
```

### 📊 Šta Testovi Proveravaju

#### **🎮 Game Logic Tests (18 testova)**
- ✅ **Win Detection**: Horizontalne, vertikalne, dijagonalne pobede
- ✅ **Move Validation**: Validnost poteza, granice tabla
- ✅ **Timer Logic**: Funkcionalnost 60s timera za svakog igrača

#### **🖥️ UI Functionality Tests (12 testova)**
- ✅ **Mode Switching**: PvP, PvAI, AIvP modovi
- ✅ **Pause/Resume**: Funkcionalnost pauziranja
- ✅ **Button States**: Replay, Tournament, Pause dugmad

#### **🤖 AI Functionality Tests (7 testova)**
- ✅ **AI Move Generation**: Generisanje validnih AI poteza
- ✅ **AI Difficulties**: Easy, Medium, Hard nivoi
- ✅ **AI Performance**: Brzina odgovora < 100ms

### 📈 Rezultati Testova

**Trenutno stanje:**
- ✅ **37/37 testova prolazi (100%)**
- ⏱️ **Vreme izvršavanja: < 0.01s**
- 🎯 **Pokrivenost: Game Logic, UI, AI**

## 🎯 Funkcionalnosti

### **Game Modes**
- **PvP**: Čovek protiv čoveka
- **PvAI**: Čovek protiv AI-ja
- **AIvP**: AI protiv čoveka
- **AIvAI**: AI protiv AI-ja

### **AI Difficulty Levels**
- **Easy**: Osnovni AI
- **Medium**: Srednji AI
- **Hard**: Napredni AI

### **Tournament Mode**
- 5 igara u nizu
- Praćenje ukupnog pobednika
- Možda se zaustavi pre vremena

### **UI Features**
- **Pause/Resume**: Space ili dugme
- **Reset**: Resetuje trenutnu igru
- **New Game**: Nova igra
- **Replay**: Reprodukuje prethodne poteze
- **Keyboard Shortcuts**: Sve glavne akcije

### **Visual Effects**
- **CRT Aesthetics**: Retro monitor efekti
- **Scanlines**: Horizontalne linije
- **Bloom**: Svetlosni efekti
- **Noise**: CRT šum
- **Curvature**: Krivina ekrana

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `SPACE` | Pause/Resume |
| `Ctrl+N` | New Game |
| `Ctrl+R` | Reset |
| `Ctrl+1` | PvP Mode |
| `Ctrl+2` | PvAI Mode |
| `Ctrl+3` | AIvP Mode |
| `Ctrl+T` | Tournament |
| `Ctrl+Shift+T` | Stop Tournament |
| `Ctrl+H` | Hide/Show Help |

## 🐛 Bug Reports

Ako pronađeš bug:

1. **Pokreni testove** da proveriš da li je već otkriven
2. **Otvori issue** sa detaljnim opisom
3. **Uključi korake** za reprodukciju
4. **Dodaj screenshot** ako je potrebno

## 🔧 Development

### Struktura Fajlova
```
XO Arena/
├── index.html          # Glavni HTML
├── main.js             # UI i event handling
├── GameScene.js        # Game logic (Phaser)
├── ai.js               # AI algoritmi
├── tests/              # Test suite
│   ├── game-logic.test.js
│   ├── ui-functionality.test.js
│   ├── ai-functionality.test.js
│   ├── test-runner.js
│   ├── cli-runner.js
│   ├── test-runner.html
│   └── package.json
└── README.md
```

### Dodavanje Novih Testova

1. **Kreiraj test fajl** u `tests/` direktorijumu
2. **Dodaj u test runner**:
   ```javascript
   testRunner.addTestSuite(NewFeatureTests);
   ```
3. **Pokreni testove** da proveriš da li prolaze

## 📝 Changelog

### v1.2.0 - Test Suite
- ✅ Dodao kompletni test suite
- ✅ 37 automatskih testova
- ✅ Browser i CLI test runner
- ✅ 100% pokrivenost osnovnih funkcionalnosti
- ✅ NPM skripte za lakše pokretanje

### v1.1.0 - UI Improvements
- ✅ Popravljen pause functionality
- ✅ Dodao confirmation dialogs
- ✅ Dodao keyboard shortcuts
- ✅ Poboljšao tournament mode
- ✅ Dodao CRT efekte

### v1.0.0 - Initial Release
- ✅ Osnovna igra funkcionalnost
- ✅ AI protivnik
- ✅ Tournament mode
- ✅ Retro UI

## 🤝 Contributing

1. **Fork** projekat
2. **Kreiraj feature branch**
3. **Dodaj testove** za nove funkcionalnosti
4. **Pokreni testove** da proveriš da li prolaze
5. **Submit pull request**

## 📄 License

MIT License - vidi [LICENSE](LICENSE) fajl za detalje.

---

**Napomena**: Ova igra koristi Phaser.js framework i zahteva modern browser sa JavaScript podrškom.
