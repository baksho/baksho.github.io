---
layout: page
permalink: /playgrounds/
title: playgrounds
description: Interactive machine learning playgrounds that run in your browser, ordered from the foundations to more advanced topics.
nav: false
---

{% include disclaimer.liquid what="playgrounds" %}

{% assign last_group = '' %}
{% for pg in site.data.playgrounds %}
{% if pg.group != last_group %}
{% unless forloop.first %}</div>{% endunless %}
<h2 class="sb-shelf-title">{{ pg.group }}</h2>
<div class="sb-cards sb-cards-pg">
{% assign last_group = pg.group %}
{% endif %}
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
