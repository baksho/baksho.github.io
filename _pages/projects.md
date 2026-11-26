---
layout: page
title: projects
permalink: /projects/
description: Research and course projects.
nav: true
nav_order: 3
---

<!-- Research profile, then image cards (picture, title, short text, two buttons). "View details" opens a pop-up with the full write-up.
Add a project as a file in _projects/ (front matter: title, kicker, subtitle, area, description, group [selected|additional], importance, thumb or icon, github, links, stack; the text of the file is the detail view). -->
<section class="sb-profile" aria-labelledby="sbProfileTitle">
<p class="sb-notes-eyebrow" id="sbProfileTitle">Research profile</p>
<p>My research interests lie at the intersection of mathematical machine learning, trustworthy AI, and computational biology. I am interested in developing principled methods for predictive reliability, uncertainty quantification, calibration, and interpretability, and in understanding the behavior of learning systems through theoretical analysis and reproducible computational experiments.</p>
<p>My projects span end-to-end calibration, neural-network generalization, uncertainty estimation under distribution shift, causal discovery, interpretable cancer drug-response prediction, and AI-assisted biomedical hypothesis generation. Together, they motivate my doctoral research goal: to develop mathematically grounded and practically useful machine-learning methods that support reliable scientific discovery, particularly in computational biology and biomedical research.</p>
<ul class="sb-profile-tags" aria-label="Research keywords">
<li>Trustworthy Machine Learning</li>
<li>Uncertainty Quantification</li>
<li>Calibration</li>
<li>Computational Biology</li>
</ul>
</section>

{% assign sorted_projects = site.projects | sort: "importance" %}
{% assign groups = "selected|additional" | split: "|" %}
{% for g in groups %}
{% assign group_projects = sorted_projects | where: "group", g %}
{% if group_projects.size > 0 %}
<h2 class="sb-proj-heading">{% if g == "selected" %}Selected research projects{% else %}Additional research projects{% endif %}</h2>
<div class="sb-cards">
{% for project in group_projects %}
<article class="sb-card sb-proj">
<button type="button" class="sb-card-img sb-proj-open" data-proj="proj-{{ project.importance }}" aria-label="View details: {{ project.title | escape }}">
{% if project.thumb %}<img src="{{ project.thumb | relative_url }}" alt="" loading="lazy">{% else %}<span class="sb-card-ph" aria-hidden="true"><i class="fa-solid {{ project.icon | default: 'fa-flask' }}"></i></span>{% endif %}
</button>
<div class="sb-card-body">
<h3 class="sb-card-title"><button type="button" class="sb-proj-open" data-proj="proj-{{ project.importance }}">{{ project.title }}</button></h3>
<p class="sb-card-text">{{ project.description }}</p>
<div class="sb-card-actions">
<button type="button" class="sb-btn sb-btn-primary sb-proj-open" data-proj="proj-{{ project.importance }}">View details</button>
{% if project.github %}<a class="sb-btn sb-btn-secondary" href="{{ project.github }}" target="_blank" rel="noopener"><i class="fa-brands fa-github" aria-hidden="true"></i> View on GitHub</a>{% elsif project.alt_link %}<a class="sb-btn sb-btn-secondary" href="{{ project.alt_link }}" target="_blank" rel="noopener"><i class="fa-solid {{ project.alt_icon | default: 'fa-arrow-up-right-from-square' }}" aria-hidden="true"></i> {{ project.alt_label | default: 'Open' }}</a>{% endif %}
</div>
</div>
</article>
{% endfor %}
</div>
{% endif %}
{% endfor %}

{% for project in sorted_projects %}
<div class="sb-modal" id="proj-{{ project.importance }}" role="dialog" aria-modal="true" aria-labelledby="proj-{{ project.importance }}-t" hidden>
<div class="sb-modal-card sb-modal-wide">
<button class="sb-modal-close" type="button" aria-label="Close details">&times;</button>
<p class="sb-modal-kicker">{{ project.kicker | default: 'Project' }}</p>
<h2 class="sb-modal-title" id="proj-{{ project.importance }}-t">{{ project.title }}</h2>
<p class="sb-note-meta sb-proj-meta">{% if project.subtitle %}{{ project.subtitle }}<br>{% endif %}{% if project.area %}<strong>Research area</strong>: {{ project.area }}{% endif %}</p>
<div class="sb-sum-body sb-proj-body">
{{ project.content }}
{% if project.stack %}<p class="sb-proj-stack"><strong>Technical stack</strong>: {{ project.stack }}</p>{% endif %}
</div>
{% if project.links %}
<div class="sb-sum-actions sb-proj-links">
{% for l in project.links %}<a class="sb-sum-link" href="{{ l.url }}" target="_blank" rel="noopener">{{ l.label }} &#8599;</a>{% endfor %}
</div>
{% endif %}
</div>
</div>
{% endfor %}
