---
layout: page
title: "CoDHy: An AI Co-Scientist for Biomarker-Guided Drug Combination Hypothesis Generation"
kicker: Student research assistant
subtitle: "CAIMed Research Group, Peter L. Reichertz Institute for Medical Informatics & Medizinische Hochschule Hannover. Advisors: Dr. rer. nat. Zahra Ahmadi and Dr.-Ing. Raneen Younis."
area: Biomedical AI, LLMs, Knowledge Graphs, Scientific Reasoning, Drug Combination Research
description: An interactive multi-agent AI co-scientist that builds task-specific knowledge graphs from biomedical evidence and proposes, validates and ranks drug-combination hypotheses. Accepted at IEEE ICDM 2026 (Demo Track).
group: selected
importance: 2
thumb: /assets/img/publication_preview/icdm-codhy.webp
icon: fa-flask
alt_label: View paper
alt_icon: fa-file-lines
alt_link: https://arxiv.org/abs/2603.00612
links:
  - label: Paper
    url: https://arxiv.org/pdf/2603.00612
stack: LLMs, RAG, Knowledge Graphs, Multi-Agent Systems, Python
---

### Research motivation

Biomedical research increasingly needs evidence from molecular, genomic, clinical, and literature sources to be brought together. Large language models are promising for scientific reasoning, but their outputs can suffer from incomplete evidence, inconsistent information, and overconfident conclusions. This project develops an AI co-scientist that supports biomarker-guided drug combination hypothesis generation through evidence-based reasoning.

### Objectives

- Develop a multi-agent system for biomedical hypothesis generation.
- Integrate heterogeneous biomedical evidence through Knowledge Graph-aware Retrieval-Augmented Generation.
- Support reasoning over molecular, genomic, clinical, and literature information.
- Investigate calibrated confidence and risk-controlled mechanisms for scientific reasoning under incomplete evidence.

### Approach

CoDHy (Combination-Drug Hypothesis Explorer) is an interactive AI co-scientist. It builds task-specific knowledge graphs from biomedical literature and curated resources, and combines relation-aware graph embeddings with agent-based reasoning to generate, validate, and rank evidence-grounded drug-combination hypotheses. The workflow includes consistency checks, evidence-based validation, iterative feedback, ranking, and a persistent "taboo" memory for rejected combinations. A web interface lets researchers specify a biomarker, a cancer context, and the literature scope, and then inspect the evidence and intermediate results.

The system combines large language models, Knowledge Graphs, and Retrieval-Augmented Generation in a multi-agent architecture. The focus is on evidence-grounded reasoning and on mechanisms that account for uncertainty and for the limits of the available evidence.

### Contribution and outcome

I am an equal-contribution co-author and contribute to developing the LLM- and Knowledge Graph-aware system. It is designed to support researcher-led exploration and prioritization, not to present generated combinations as clinically validated treatments. The work was accepted at IEEE ICDM 2026 (Demo Track) and will appear in the workshop proceedings, with the paper "From literature to hypotheses: An AI co-scientist system for biomarker-guided drug combination hypothesis generation".
