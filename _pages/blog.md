---
layout: page
permalink: /blog/
title: blog
description: Notes and posts on machine learning and research.
nav: false # blog lives in the 'writing' dropdown (see _pages/dropdown.md)
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1 # The number of links before the current page
    after: 3 # The number of links after the current page
---

{% comment %}
Same look as the Latest posts block on the About page (thumbnail left, details right). The tag chips come from display_tags / display_categories in _config.yml.
{% endcomment %}

{% if site.display_tags.size > 0 or site.display_categories.size > 0 %}
<div class="sb-tagbar">
{% for tag in site.display_tags %}<a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}"><i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}</a>{% endfor %}
{% for category in site.display_categories %}<a href="{{ category | slugify | prepend: '/blog/category/' | relative_url }}"><i class="fa-solid fa-tag fa-sm"></i> {{ category }}</a>{% endfor %}
</div>
{% endif %}

<div class="sb-post-rows sb-post-rows-blog">
{% if page.pagination.enabled %}{% assign postlist = paginator.posts %}{% else %}{% assign postlist = site.posts %}{% endif %}
{% for post in postlist %}
{% if post.redirect == blank %}{% assign item_href = post.url | relative_url %}{% assign item_ext = false %}{% elsif post.redirect contains '://' %}{% assign item_href = post.redirect %}{% assign item_ext = true %}{% else %}{% assign item_href = post.redirect | relative_url %}{% assign item_ext = false %}{% endif %}
{% if post.external_source == blank %}{% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}{% else %}{% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}{% endif %}
{% assign year = post.date | date: "%Y" %}
<article class="sb-post-row">
<a class="sb-post-thumb" href="{{ item_href }}"{% if item_ext %} target="_blank" rel="noopener noreferrer"{% endif %} tabindex="-1" aria-hidden="true">{% if post.thumbnail %}<img src="{{ post.thumbnail | relative_url }}" alt="" loading="lazy">{% endif %}</a>
<div class="sb-post-info">
<h3 class="sb-post-title"><a href="{{ item_href }}"{% if item_ext %} target="_blank" rel="noopener noreferrer"{% endif %}>{{ post.title }}</a></h3>
{% if post.description != blank %}<p class="sb-post-desc">{{ post.description }}</p>{% endif %}
<p class="sb-post-meta">{% assign sep = '' %}{% unless post.hide_date %}{{ post.date | date: '%B %Y' }}{% assign sep = ' &nbsp;·&nbsp; ' %}{% endunless %}{% if post.external_source %}{{ sep }}{{ post.external_source }}{% assign sep = ' &nbsp;·&nbsp; ' %}{% endif %}{% unless item_ext %}{{ sep }}{{ read_time }} min read{% endunless %}{% if item_ext %}{{ sep }}<a href="{{ item_href }}" target="_blank" rel="noopener noreferrer">read on {{ post.external_source | default: 'the web' }} <i class="fa-solid fa-arrow-up-right-from-square fa-xs"></i></a>{% endif %}</p>
{% if post.tags.size > 0 %}<p class="sb-post-tags">{% for tag in post.tags %}<a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">#{{ tag }}</a>{% endfor %}</p>{% endif %}
</div>
</article>
{% endfor %}
</div>

{% if page.pagination.enabled %}
{% include pagination.liquid %}
{% endif %}
