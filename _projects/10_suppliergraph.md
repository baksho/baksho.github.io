---
layout: page
title: "SupplierGraph: A Knowledge Graph for German and EU Public Procurement and Supplier Risk"
kicker: Independent research
subtitle: End-to-end knowledge graph on open procurement data
area: Knowledge Graphs, Entity Resolution, Knowledge-Graph Embeddings, GraphRAG
description: An end-to-end knowledge graph for German and EU public procurement and supplier risk on real open data, with every component evaluated against baselines, including the weak results.
group: additional
importance: 11
icon: fa-network-wired
github: https://github.com/baksho/suppliergraph
links:
  - label: Repository
    url: https://github.com/baksho/suppliergraph
---

I built an end-to-end knowledge graph for German and EU public procurement and supplier risk on real open data (GLEIF, OCDS, CPV, OpenSanctions, EU Directive 2014/24). The pipeline covers OWL 2 ontology design, R2RML integration, entity resolution, SHACL validation, OWL RL and SPARQL rule reasoning, TransE/RotatE supplier recommendation, and GraphRAG question answering.

On a sample of 20,000 tenders, the graph holds 400,532 triples with 0 SHACL violations. I evaluated each component against baselines and report the weak results as they are: the recommender is barely above chance on new buyer-supplier pairs (MRR 0.007), and an 8B-model GraphRAG reached an answer recall of only 0.091 in its first run on 14 competency questions.

The project gave me hands-on experience with the full knowledge-graph lifecycle and with honest evaluation, including reporting negative results and the limits of a pipeline.
