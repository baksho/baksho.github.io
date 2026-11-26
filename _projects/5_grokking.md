---
layout: page
title: Grokking and Normal Hyperbolicity of the Interpolation Manifold
kicker: Independent research
subtitle: "Accepted at SKILL 2026, German Informatics Society (oral presentation)."
area: Theoretical Machine Learning, Neural Network Generalization, Dynamical Systems
description: Is the sudden jump from memorization to generalization in grokking a loss of normal hyperbolicity of the interpolation manifold? A singular-value diagnostic of the residual Jacobian suggests it is not.
group: selected
importance: 3
thumb: /assets/img/publication_preview/skill-grokking.webp
icon: fa-infinity
github: https://github.com/baksho/grokking-normal-hyperbolicity
links:
  - label: Paper
    url: https://arxiv.org/pdf/2608.14803
  - label: Presentation
    url: https://github.com/baksho/grokking-normal-hyperbolicity/blob/main/presentation/SKILL2026_Basak_Grokking_Normal_Hyperbolicity_v2.pdf
  - label: Repository
    url: https://github.com/baksho/grokking-normal-hyperbolicity
stack: Python, PyTorch, Neural Networks, Numerical Linear Algebra
---

### Research motivation

Grokking is a phenomenon in which neural networks show a delayed transition from memorization to generalization during training. Understanding the mathematical mechanism behind this transition is an open problem in theoretical machine learning. This project asks whether the sharp generalization transition can be interpreted as a geometric change in the interpolation manifold.

### Objectives

- Investigate the relationship between grokking and the geometry of the interpolation manifold.
- Explore whether the transition can be interpreted as a loss of normal hyperbolicity.
- Develop and evaluate a diagnostic for studying this geometric interpretation.

### Approach

I formulated an optimizer-agnostic diagnostic based on the smallest nonzero singular value of the residual Jacobian. For squared loss, this quantity corresponds to the slowest normal restoring rate of the interpolation manifold. I evaluated it in a two-layer ReLU network trained on modular addition, tracking the diagnostic alongside training and test accuracy and examining the six smallest singular values across five initialization seeds.

### Findings and limitations

The diagnostic did not collapse during the grokking transition. It was near zero before memorization and reached its largest values during the transition. The six smallest singular values showed no subspace-local collapse, and the pattern held across five seeds. This is preliminary evidence against a global loss of normal hyperbolicity in the studied setting and favors a smooth-contraction interpretation.

### Contribution and outcome

The project connects an empirical phenomenon in neural network training with concepts from dynamical systems and differential geometry. It resulted in the paper "Is grokking a loss of normal hyperbolicity of the interpolation manifold?", accepted for oral presentation at SKILL 2026, the student conference of the German Informatics Society, and to appear in GI-Edition Lecture Notes in Informatics.
