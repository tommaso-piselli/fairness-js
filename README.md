# Progetto Fairness

Esame di Programmazione per Internet e Web

### 💡 Idea:

![Alt text](images/mvp_1.png "Title")

### Theme Colors:

#### 🔦 Light Theme:

- background: #FFFFFF (white)
- main color (borders, titles): #2C3E50 (night blue)
- secondary color (box background): #F8F8FFFF (ghostwhite)
- highlight color: #F9E79F (yellow)
- shadows: #BDC3C7 (dark grey)

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
> ~Bigger graphs => loss goes to zero very fast~ There was a problem in the pairwiseDistance clipping to 0

# 🔃 Changelog

> [18/07 - 16:30 🕐] Implemented fairness + stress minimization through coefficient selection: working on all graphs at disposal\
> [13/07 - 18:20 🕐] Add Random graphs generator, checked ✔️ whether stress and fairness work properly\
> [11/07 - 12:15 🕐] Add Preprocess for more graphs\
> [07/07 - 18:04 🕐] Fix Mouseover bug and graph out of window\
> [07/07 - 11:36 🕐] Added color info panel\
> [07/07 - 11:13 🕐] Added color picking
