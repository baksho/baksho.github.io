---
layout: page
title: bookshelf
permalink: /books/
description: Books I am reading and have read.
nav: false
---

<div class="sb-books">
{% for book in site.data.books %}
<figure class="sb-book">
<div class="sb-book-cover">
<img src="{{ '/assets/img/books/' | append: book.cover | relative_url }}" alt="Cover of {{ book.title }}" loading="lazy">
{% if book.ongoing %}<span class="sb-book-badge">Ongoing</span>{% endif %}
</div>
<figcaption>
<strong>{{ book.title }}</strong>
<span>{{ book.author }}</span>
</figcaption>
</figure>
{% endfor %}
</div>
