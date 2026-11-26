---
layout: page
title: Evaluating Grounding and Abstention in GraphRAG over a Pharmacogenomics Knowledge Graph
kicker: Independent research
subtitle: Evaluation harness for grounded question answering
area: Trustworthy AI, GraphRAG, Knowledge Graphs, LLM Evaluation, Pharmacogenomics
description: A reusable harness that compares four retrieval strategies on grounding, citation validity and abstention when answering questions over a pharmacogenomics knowledge graph.
group: selected
importance: 6
icon: fa-scale-balanced
github: https://github.com/baksho/kg-truthlens
links:
  - label: Repository
    url: https://github.com/baksho/kg-truthlens
stack: Python, GraphRAG, SPARQL, RDF, LLM evaluation, FastAPI, Docker
---

### Research motivation

Language models that answer questions over scientific knowledge can produce fluent but unsupported statements. For cell-line pharmacogenomics, it matters that every claim traces back to graph evidence, that measured and predicted drug responses are not mixed up, and that the system declines to answer when the graph has no answer. This project asks how different retrieval strategies compare on grounding, abstention, and citation validity.

### Objectives

- Compare retrieval strategies for question answering over a pharmacogenomics knowledge graph.
- Measure whether answers are supported by cited graph evidence, not only whether they are correct.
- Evaluate when a system should abstain on unanswerable questions.
- Keep measured and predicted drug responses distinct and labelled in the evidence.

### Approach

I implemented four strategies on the same questions: vector RAG (a TF-IDF baseline), text-to-SPARQL (schema-grounded generation with validation and retry), k-hop neighborhood expansion after entity linking, and a hybrid of linking, text-to-SPARQL, and neighborhood fallback. Answers are structured JSON (answer, citations, abstain, note).

Generated SPARQL is restricted to SELECT, has SERVICE calls stripped, and gets a row limit. The evaluation harness generates questions from templates (single-hop, reverse-hop, two-hop, ranking, filtered, predicted, and unanswerable) and computes gold answers by SPARQL on the graph. Metrics include precision, recall and F1, correct and excessive abstention, citation validity, unsupported-answer rate, retrieval and linking recall, SPARQL validity, and latency.

### Findings and limitations

The repository contributes the evaluation harness and does not report benchmark results. The stated limitations: the unsupported-answer check is a string match rather than a semantic entailment check, questions are template-based and paraphrase robustness is not measured, and the in-memory RDF backend cannot enforce query timeouts. The data is cell-line research data, not clinical decision support.

### Contribution and outcome

The project is a reusable harness for testing whether GraphRAG answers are grounded, cited correctly, and abstained on when appropriate. It ties my trustworthy-ML interests (reliability, abstention, honest evaluation) to knowledge-graph question answering in a biomedical setting.
