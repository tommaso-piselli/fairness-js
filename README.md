# Fairness JS

## Overview

Motivated by recent papers published in the field of Machine Learning, we aim to introduce a fresh approach to addressing <b>Fairness</b> (meaning the mitigation of bias and prejudice) in graph visualization. While the majority of graph drawing algorithms primarily optimize global layout metrics and readily incorporate local restrictions at the vertex or edge level, only a handful of them can effectively manage broader constraints at the subgroup level. In contrast, a <b>fair visualization</b> should ensure that no particular subgroup is given preference in terms of legibility. This entails an equitable distribution of the potential visual complexity of the representation between the two sets. This task becomes especially particularly challenging when dealing with imbalanced cardinalities between the two sets.

<br />
Contained within this repository is an implementation of a model that combines Machine Learning and Visualization, designed to study the <b>fair visualization of graphs</b>. The implementation employs Python for preprocessing, HTML/CSS for the user interface, and d3/JavaScript for computations.

The primary frameworks utilized are [Tensorflow.js](https://github.com/tensorflow/tfjs) and [Pytorch](https://github.com/pytorch/pytorch).

## Usage

In this section I will give some instructions for the general usage of the project.

- If you want to test the project: you can go to the [github.pages](https://tommaso-piselli.github.io/) directory of the project or clone the repo and use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension of vscode.
- To <b>Load</b> the graph: if you cloned the repository, you will find the JSONs in the `data/` subdirectory. Otherwise you can download [this](https://github.com/tommaso-piselli/tommaso-piselli.github.io/releases/download/v1.0/random_JSON.zip) zip file.
- Once the graph is load: you can choose the color percentage with the slider, this will calculate the fairness. Then you can press the <b>Train</b> button to start the training.

### Python

If you want to rebuild the graphs, you can access the `preprocess/` subdirectory and launch from your the `preprocess_random.py` file. \
<br />
Assuming you are in the project root, from your terminal you can write:

```bash
cd preprocess/
python3 preprocess_random.py
```

#### Package Requirements

`torch networkx sklearn.preprocessing numpy` \
To install Pytorch you can visit the official [webpage](https://pytorch.org/).

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
