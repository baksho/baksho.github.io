---
layout: page
title: An Ontology-Driven Biomedical Knowledge Graph for Drug Link Prediction
kicker: Independent research
subtitle: Knowledge-graph engineering and leakage-controlled link prediction
area: Biomedical Knowledge Graphs, Semantic Web, Graph Machine Learning, Computational Pharmacology
description: A reproducible, test-covered pipeline from public biomedical data (ClinicalTrials.gov, openFDA, GDSC2, PubMed) to a validated knowledge graph and a leakage-controlled link-prediction benchmark.
group: selected
importance: 5
icon: fa-diagram-project
github: https://github.com/baksho/biopharma-kg
links:
  - label: Repository
    url: https://github.com/baksho/biopharma-kg
stack: Python, RDF/OWL, R2RML, SHACL, SPARQL, PyKEEN, PyTorch Geometric
---

### Research motivation

Biomedical evidence on drugs is spread across registries, regulatory databases, experimental screens, and the literature, each with its own schema and identifiers. Combining them into one queryable, validated resource is a prerequisite for evidence-grounded computational drug research. It is also a place where leakage and shortcuts can make graph-ML link-prediction results look better than they are. This project builds such a resource from real public data and tests whether it can support drug-condition, drug-sensitivity, and drug-adverse-event link prediction.

### Objectives

- Build an ontology-driven knowledge graph that integrates ClinicalTrials.gov, openFDA, GDSC2, and PubMed.
- Enforce data quality with SHACL validation and add rule-based inference with OWL-RL.
- Support competency questions in SPARQL, including cases where reasoning changes the answer.
- Evaluate link prediction under explicit leakage controls and against a popularity baseline.

### Approach

I designed an OWL 2 ontology (15 classes, 31 object properties, 24 datatype properties) and mapped SQLite views to RDF with R2RML (morph-kgc), using one named graph per source. The pipeline covers fetching, entity resolution, and LLM-based relation extraction from PubMed abstracts. An extracted relation is kept only if its evidence sentence appears verbatim in the abstract, and every assertion keeps its provenance.

Validation uses SHACL and reasoning uses OWL-RL. Ten SPARQL competency questions are included, two of them run with and without inference. For graph ML, I implemented link prediction with PyKEEN (TransE, RotatE, ComplEx) and an R-GCN with DistMult, together with a popularity baseline. The tasks include a temporal split for drug-condition prediction. Leakage controls include removing trial nodes, excluding inverse relations, time-aware context edges, and a hard no-leakage assertion before training. A test checks that the RDF graph and the ML graph contain identical edges.

### Findings and limitations

Ten stages are verified end to end by 75 offline tests on hand-written fixtures. These include checks that SPARQL answers match an independent SQL/Python computation, that SHACL conforms on the output and fails on deliberately bad data, and that the evaluator matches a brute-force implementation and PyKEEN's own evaluator.

Connectors to the live APIs, the quality of live LLM extraction, and runtime and ML results are not yet verified. Entity resolution is rule-based, and the default seed set is a sample of 60 drugs.

### Contribution and outcome

The project is a reproducible, test-covered pipeline from public biomedical data to a validated knowledge graph and a leakage-controlled link-prediction benchmark, and it is explicit about what is verified and what is not. It extends my GDSC2-based drug-response work and my knowledge-graph work on CoDHy.
