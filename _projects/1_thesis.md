---
layout: page
title: "End-to-End Calibration: Theory and Empirical Evaluation in Biomedical Context"
kicker: Master's thesis
subtitle: "Institute for Statistics and Foundations of Machine Learning, TU Braunschweig. Supervisor: Prof. Dr. Nicole Mücke; second examiner: Prof. Dr. Tim Kacprowski."
area: Trustworthy ML, Predictive Calibration, Uncertainty Quantification, Biomedical ML
description: Can calibration be built into neural-network training instead of being fixed afterwards? A differentiable calibration objective, tested in controlled experiments and on gene regulatory network inference.
group: selected
importance: 1
thumb: /assets/img/projects/thesis-calibration.webp
icon: fa-chart-line
github: https://github.com/baksho/e2ecal
links:
  - label: Thesis Report
    url: https://github.com/baksho/e2ecal/blob/main/Final%20Thesis%20Report.pdf
  - label: Repository
    url: https://github.com/baksho/e2ecal
stack: Python, PyTorch, Statistical Learning, Neural Networks, Transformers
---

### Research motivation

Modern neural networks can produce highly confident predictions without corresponding empirical reliability. Post-hoc calibration methods can improve confidence estimates after training, but they do not put predictive reliability into the learning objective itself. This thesis asks whether calibration can be incorporated directly into neural network training, and how doing so affects predictive performance, posterior estimation, and uncertainty quantification.

### Objectives

- Investigate end-to-end calibration methods that put calibration objectives into neural network training.
- Study the relationship between predictive performance, confidence, and reliability.
- Evaluate the behavior of calibrated models under distribution shift.
- Explore Transformer-based gene regulatory network (GRN) inference as a biomedical application.

### Approach

I augmented empirical risk minimization with a differentiable calibration penalty, instead of relying only on post-hoc correction:

<p class="sb-eq">\[ \min_{\theta \in \Theta}\; (1-\lambda)\,\widehat{C}(f_{\theta}) + \lambda\,\widehat{E}(f_{\theta}) \]</p>

The work combines theoretical analysis with controlled computational experiments. These examined calibration-refinement trade-offs, model capacity, objective weights, post-hoc calibration baselines, optimization-related ablations, and a covariate-shift setting in which the input distribution changes while the conditional label mechanism stays fixed. The GRN study used Transformer-based edge prediction on DREAM5 and SERGIO data and evaluated ranking, probability-sensitive, and calibration metrics.

### Selected findings

Across 30 random seeds in the controlled one-dimensional setting, λ = 0.1 reduced the posterior mean-squared error at capacities m = 10, 100, and 1000 from 0.0189, 0.0482, and 0.0378 to 0.0101, 0.0127, and 0.0129, and the expected calibration error also decreased at all three capacities. The covariate-shift experiment was encouraging, but ablations showed that some of the gains were associated with effective step-size changes, and calibration-only training performed poorly.

On DREAM5 Network 1, the medium-capacity BCE model with λ = 0.5 improved AUROC from 0.857 to 0.882, AUPR from 0.787 to 0.833, and the Brier score from 0.136 to 0.120. Results were not uniform across datasets or capacities, and cross-network calibration did not transfer automatically. The thesis therefore stresses conditional effectiveness, careful evaluation, and the complementary role of post-hoc methods, rather than claiming a universal benefit.

### Contribution and relevance

The work connects calibration objectives with statistical-learning questions and tests them on a biomedical prediction task. It strengthened my interest in reliable probabilistic prediction, calibration under distribution shift, and the conditions under which trustworthy-ML interventions give reproducible benefits.
