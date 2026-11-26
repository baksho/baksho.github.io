---
layout: page
permalink: /infographics/
title: infographics
description: One-page visual summaries of machine learning concepts, from neural networks to calibration.
nav: false
---

{% include disclaimer.liquid what="infographics" %}

<div class="sb-cards sb-cards-info">
{% for g in site.data.infographics %}
{% assign base = '/assets/infographics/' | append: g.slug %}
<article class="sb-card sb-info">
<a class="sb-info-img" href="{{ base | append: '-2x.png' | relative_url }}" target="_blank" rel="noopener" aria-label="Open {{ g.title }} in full size">
<img src="{{ '/assets/img/infographics/' | append: g.slug | append: '.webp' | relative_url }}" alt="Infographic: {{ g.title }}" loading="lazy">
</a>
<div class="sb-card-body">
<h3 class="sb-card-title">{{ g.title }}</h3>
<div class="sb-dl">
<a class="sb-btn sb-btn-primary" href="{{ base | append: '-1x.png' | relative_url }}" download="{{ g.title }}@1x.png" title="Download as PNG">.png</a>
<a class="sb-btn sb-btn-secondary" href="{{ base | append: '-2x.png' | relative_url }}" download="{{ g.title }}@2x.png" title="Download the high-quality image (2x)">HQ image</a>
<a class="sb-btn sb-btn-primary" href="{{ base | append: '.pdf' | relative_url }}" download="{{ g.title }}.pdf" title="Download as PDF">.pdf</a>
</div>
</div>
</article>
{% endfor %}
</div>
