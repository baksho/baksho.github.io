---
layout: page
permalink: /playgrounds/
title: playgrounds
description: Interactive machine learning playgrounds that run in your browser.
nav: false
---

<div class="sb-cards sb-cards-pg">
{% for pg in site.data.playgrounds %}
{% assign pg_url = '/playgrounds/' | append: pg.slug | append: '/' | relative_url %}
<article class="sb-card">
<a class="sb-card-img" href="{{ pg_url }}" tabindex="-1" aria-hidden="true">
<img class="sb-th-light" src="{{ '/assets/img/playgrounds/' | append: pg.slug | append: '-light.webp' | relative_url }}" alt="" loading="lazy">
<img class="sb-th-dark" src="{{ '/assets/img/playgrounds/' | append: pg.slug | append: '-dark.webp' | relative_url }}" alt="" loading="lazy">
</a>
<div class="sb-card-body">
<h3 class="sb-card-title"><a href="{{ pg_url }}">{{ pg.title }}</a></h3>
<p class="sb-card-text">{{ pg.description }}</p>
<a class="sb-card-link" href="{{ pg_url }}">Open playground <span aria-hidden="true">→</span></a>
</div>
</article>
{% endfor %}
</div>
