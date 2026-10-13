---
layout: about
title: about
permalink: /
subtitle: Data Science · TU Braunschweig

profile:
  align: right
  image: prof_pic.jpg
  image_circular: false # crops the image to make it circular
  more_info: >
    <p>Braunschweig, Germany</p>

selected_papers: true # includes a list of papers marked as "selected={true}" in _bibliography/papers.bib
social: false # the link row below replaces the icon-only social bar

announcements:
  enabled: true # includes a list of news items (files in _news/)
  scrollable: false # adds a vertical scroll bar if there are more than 3 news items
  limit: 5 # leave blank to include all the news in the `_news` folder

latest_posts:
  enabled: true
  scrollable: false # adds a vertical scroll bar if there are more than 3 new posts items
  limit: 2 # number of blog posts shown on the home page
---

I am a statistical machine learning researcher interested in the mathematical and empirical foundations of deep learning: generalization, optimization, uncertainty quantification, calibration and learning under distribution shift. I combine theoretical analysis of neural-network behavior with computational experiments, and apply it to biomedical machine learning.

I am an M.Sc. student in Data Science at [TU Braunschweig](https://www.tu-braunschweig.de/en) and am writing my thesis on end-to-end calibration of neural networks in a biomedical context, supervised by Prof. Dr. Nicole Mücke at the Institute for Statistics and Foundations of Machine Learning. I also work as a student research assistant at [Medizinische Hochschule Hannover](https://www.mhh.de/en), where I develop an LLM- and knowledge-graph-aware multi-agent RAG system for scientific hypothesis generation from heterogeneous biomedical evidence.

Before my master's I worked in industry for several years, first at Ericsson and then as a strategy consultant at Wipro, with an MBA from IIM Indore in between. I am a recipient of the Deutschlandstipendium (2025/26).

<div class="link-row">
  <a href="mailto:{{ site.data.socials.email }}"><i class="fa-solid fa-envelope"></i>Email</a>
  <a href="{{ site.data.socials.cv_pdf | relative_url }}"><i class="fa-solid fa-file-pdf"></i>CV</a>
  <a href="https://scholar.google.com/citations?user={{ site.data.socials.scholar_userid }}"><i class="ai ai-google-scholar"></i>Google Scholar</a>
  <a href="https://github.com/{{ site.data.socials.github_username }}"><i class="fa-brands fa-github"></i>GitHub</a>
  <a href="https://www.linkedin.com/in/{{ site.data.socials.linkedin_username }}/"><i class="fa-brands fa-linkedin"></i>LinkedIn</a>
  <a href="https://orcid.org/{{ site.data.socials.orcid_id }}"><i class="ai ai-orcid"></i>ORCID</a>
</div>
