# Fairness JS

## Overview

Inspired by recent papers published in the Machine Learning area, we try to present a novel approach to <b>Fairness</b> (i.e. absence of bias, prejudice) in the context of graph visualization. In fact, while substantially all graph drawing algorithms optimize global metrics of the computed layout and can easily incorporate local constraints (i.e. at vertex or edge level), few algorithms can deal with more general constraints at subgroup level. In contrast, a fair visualization should guarantee that no subgroup is favored in terms of readability, that is, the possible visual complexity of the representation is equally charged among the two sets, which becomes particularly challenging in the case the cardinalities of the two sets are unbalanced. \
<br />
This repository contains an implementation of a Machine Learning + Visualization model built to study <b>fair visualization of graphs</b>. Languague used: python for the preprocess, html/css for the UI, d3/javascript for the computing. The two main framework used are [Tensorflow.js](https://github.com/tensorflow/tfjs) and [Pytorch](https://github.com/pytorch/pytorch).

## Usage

In this section I will give some instructions for the general usage of the project.

- If you want to test the project: you can go to the [github.pages](tommaso-piselli.github.io) directory of the project or clone the repo and use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension of vscode.
- To <b>Load</b> the graph: if you cloned the repository, you will find the JSONs in the `data` subdirectory. Otherwise you can download [this](https://drive.google.com/uc?export=download&id=1cUDNkWZLD_kAtf8CRst3uuQKSxxUyDWL) zip file.
- Once the graph is load: you can choose the color percentage with the slider, this will calculate the fairness. Then you can press the <b>Train</b> button to start the training.

### Python

If you want to rebuild the graphs, you can access the `preprocess` subdirectory and launch from your the `preprocess_random.py` file. \
<br />
From your terminal:

```bash
cd preprocess/
python3 preprocess_random.py
```

#### Package Requirements

`torch networkx sklearn.preprocessing numpy` \
To install Pytorch you can visit the official [webpage](https://pytorch.org/).

## Implementation

### Structure

# 🔃 Changelog

> [25/08 🕐] Build 1.0 complete and ready to be reviewed \
> [22/08 🕐] Third Card \
> [22/08 🕐] Card Layout: Card 1 and 2\
> [21/08 🕐] Start rewrite HTML and CSS for better understanding: Header and page layout\
> [18/07 🕐] Implemented fairness + stress minimization through coefficient selection: working ✔️ on all graphs at disposal\
> [13/07 🕐] Add Random graphs generator, checked ✔️ whether stress and fairness work properly\
> [11/07 🕐] Add Preprocess for more graphs\
> [07/07 🕐] Fix Mouseover bug and graph out of window\
> [07/07 🕐] Added color info panel\
> [07/07 🕐] Added color picking
