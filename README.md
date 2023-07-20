# Progetto Fairness

Esame di Programmazione per Internet e Web

### 💡 Idea:

![Alt text](images/mvp_1.png "Title")

### Theme Colors:

#### 🔦 Light Theme:

- background: #FFFFFF (white)
- main color (borders, titles): #6200ee
- secondary color (box background): 3700b3
- highlight color: #03dac5
- shadows: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)

#### 🕶️ Dark Theme:

- background: #121212 (black)
- main color (borders, titles): #BB86FC (violet)
- secondary color (box background): #1F1B24 (dark grey)
- highlight color: #CF6679 (pale pink)
- shadows: #424242 (grey)

### 🔖 ToDos:

- ~aggiungere un panel per selezionare la percentuale di nodi colorati.~
- aggiungere un tool per scegliere esattamente quali nodi colorare (?)
- aggiungere pulsante per re run dell'applicazione
- aggiungere Tooltip
- aggiungere ~initial and~ final stress and fairness
- Implementare train con momentum gradient descent
- Update color scheme
- aggiungere calcolo delle posizioni randomiche in Javascript invece che in Python

## 🐛 Known Bugs (To Fix):

> ~Mouseover a vertex goes back to black instead of the new color~\
> ~Preprocessing issues~\
> Resizing window is not consistent with graph view --> bootstrap or tailwind
> Bigger graphs => loss goes to zero very fast

# 🔃 Changelog

> [13/07 - 18:20 🕐] Add Random graphs generator, checked ✔️ whether stress and fairness work properly\
> [11/07 - 12:15 🕐] Add Preprocess for more graphs\
> [07/07 - 18:04 🕐] Fix Mouseover bug and graph out of window\
> [07/07 - 11:36 🕐] Added color info panel\
> [07/07 - 11:13 🕐] Added color picking
