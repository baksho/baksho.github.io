---
layout: page
title: bookshelf
permalink: /books/
description: Books I have read, am reading, and plan to read.
nav: false
---

{% assign shelves = "academic|Academic,novels|Novels & Other Reads" | split: "," %}
{% for shelf in shelves %}
{% assign parts = shelf | split: "|" %}
<h2 class="sb-shelf-title">{{ parts[1] }}</h2>
<div class="sb-books">
{% for book in site.data.books %}{% if book.category == parts[0] %}
<figure class="sb-book">
<div class="sb-book-cover">
{% if book.cover %}<img src="{{ '/assets/img/books/' | append: book.cover | relative_url }}" alt="Cover of {{ book.title }}" loading="lazy">{% else %}<div class="sb-book-typo sb-typo-{{ book.category }}"><span class="sb-typo-title">{{ book.title }}</span><span class="sb-typo-author">{{ book.author }}</span></div>{% endif %}
{% if book.status == 'ongoing' %}<span class="sb-book-badge">Ongoing</span>{% elsif book.status == 'planned' %}<span class="sb-book-badge sb-book-badge-planned">Planned</span>{% endif %}
</div>
<figcaption>
<strong>{{ book.title }}</strong>
<span>{{ book.author }}</span>
</figcaption>
</figure>
{% endif %}{% endfor %}
</div>
{% endfor %}
