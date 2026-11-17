---
layout: page
title: projects
permalink: /projects/
description: Research and course projects.
nav: true
nav_order: 3
---

<!-- Image cards: picture on top, then title, description and the GitHub link. Add a project as a file in _projects/ (front matter: title, description, importance, thumb, github). -->
<div class="sb-cards">
{% assign sorted_projects = site.projects | sort: "importance" %}
{% for project in sorted_projects %}
<article class="sb-card">
{% if project.github %}<a class="sb-card-img" href="{{ project.github }}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">{% else %}<a class="sb-card-img" href="{{ project.url | relative_url }}" tabindex="-1" aria-hidden="true">{% endif %}
{% if project.thumb %}<img src="{{ project.thumb | relative_url }}" alt="" loading="lazy">{% endif %}
</a>
<div class="sb-card-body">
<h3 class="sb-card-title">
{% if project.github %}<a href="{{ project.github }}" target="_blank" rel="noopener">{{ project.title }}</a>{% else %}<a href="{{ project.url | relative_url }}">{{ project.title }}</a>{% endif %}
</h3>
<p class="sb-card-text">{{ project.description }}</p>
{% if project.github %}
<a class="sb-card-link" href="{{ project.github }}" target="_blank" rel="noopener"><i class="fa-brands fa-github" aria-hidden="true"></i> View on GitHub</a>
{% else %}
<a class="sb-card-link" href="{{ project.url | relative_url }}">Read more <span aria-hidden="true">→</span></a>
{% endif %}
</div>
</article>
{% endfor %}
</div>
