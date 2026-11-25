---
layout: page
permalink: /notes/
title: research notes
description: Concise notes on papers I study, written to be easy to read and revisit. Short summaries for orientation, longer notes for a closer look.
nav: false
---

{% include disclaimer.liquid what="notes" %}

{% for cat in site.data.paper_categories %}
{% assign cat_papers = site.data.papers | where: 'category', cat.id %}
{% if cat_papers.size > 0 %}
<section class="sb-notes-sec" aria-labelledby="sec-{{ cat.id }}">
<div class="sb-notes-head">
<div>
<p class="sb-notes-eyebrow">Collection {{ forloop.index | prepend: '0' }}</p>
<h2 id="sec-{{ cat.id }}">{{ cat.title }}</h2>
<p class="sb-notes-sub">{{ cat.description }}</p>
</div>
<div class="sb-rail-btns">
<button type="button" class="sb-rail-btn" data-rail="-1" aria-label="Scroll {{ cat.title }} left">&larr;</button>
<button type="button" class="sb-rail-btn" data-rail="1" aria-label="Scroll {{ cat.title }} right">&rarr;</button>
</div>
</div>
<div class="sb-rail" tabindex="0" aria-label="{{ cat.title }} papers">
{% for p in cat_papers %}
<article class="sb-paper">
<button type="button" class="sb-paper-cover sb-sum-open sb-cover-{{ cat.id }}" data-sum="sum-{{ p.id }}" aria-label="Open the quick summary of {{ p.title }}">
<span class="sb-cover-top">{{ cat.title }}</span>
<span class="sb-cover-title">{{ p.title }}</span>
<span class="sb-cover-bottom">{{ p.venue }}</span>
<span class="sb-cover-art" aria-hidden="true">{{ p.glyph }}</span>
</button>
<p class="sb-paper-meta">{{ p.venue }} &middot; <a href="{{ p.doi }}" target="_blank" rel="noopener">DOI &#8599;</a></p>
<h3 class="sb-paper-title"><button type="button" class="sb-sum-open" data-sum="sum-{{ p.id }}">{{ p.title }}</button></h3>
<p class="sb-paper-label">Takeaway</p>
<p class="sb-paper-text">{{ p.takeaway }}</p>
<p class="sb-paper-label">One-line interpretation</p>
<p class="sb-paper-quote">{{ p.interpretation }}</p>
<button type="button" class="sb-paper-row sb-sum-open" data-sum="sum-{{ p.id }}">Read quick summary <span aria-hidden="true">&#8599;</span></button>
<a class="sb-paper-row sb-paper-more" href="{{ '/notes/' | append: p.id | append: '/' | relative_url }}">For more detailed notes, please click here <span aria-hidden="true">&rarr;</span></a>
</article>
{% endfor %}
</div>
</section>
{% endif %}
{% endfor %}

{% for p in site.data.papers %}
{% capture sum_file %}notes/{{ p.id }}-summary.html{% endcapture %}
<div id="sum-{{ p.id }}" hidden data-title="{{ p.title | escape }}" data-doi="{{ p.doi }}" data-note="{{ '/notes/' | append: p.id | append: '/' | relative_url }}">
{% include {{ sum_file }} %}
</div>
{% endfor %}

<div class="sb-modal" id="sbSumModal" role="dialog" aria-modal="true" aria-labelledby="sbSumTitle" hidden>
<div class="sb-modal-card sb-modal-wide">
<button class="sb-modal-close" type="button" aria-label="Close summary">&times;</button>
<p class="sb-modal-kicker">Quick summary</p>
<h2 class="sb-modal-title" id="sbSumTitle"></h2>
<div class="sb-sum-body" id="sbSumBody"></div>
<div class="sb-sum-actions">
<a id="sbSumDoi" class="sb-sum-link" href="#" target="_blank" rel="noopener">Read the paper &#8599;</a>
<a id="sbSumNote" class="sb-sum-btn" href="#">Read the detailed research note &rarr;</a>
</div>
</div>
</div>
