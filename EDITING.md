# How to edit your site

Your site is built with Jekyll (the al-folio theme) and published by a GitHub Action every time you
commit to `main`. You never edit the generated site, only the small text files listed here.

**Easiest way to edit:** open the file on github.com, click the pencil icon, change the text,
and click _Commit changes_. Check the **Actions** tab: a green tick means the site is live (usually in a few minutes).
Open a **pull request** instead of committing directly if you want a safe test first: the workflow builds the
site on pull requests but only deploys when you merge to `main`.

## What to edit for what

| I want to ...                                                       | Edit this file                                                                                                   |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Change my bio, the line under my name, or the text next to my photo | `_pages/about.md`                                                                                                |
| Replace my photo                                                    | Overwrite `assets/img/prof_pic.jpg` (keep the name; a square image works best)                                   |
| Change email / Scholar / GitHub / LinkedIn / ORCID                  | `_data/socials.yml` (one place; the home page links and search use it)                                           |
| Add a news item                                                     | Add a file in `_news/` (copy an existing one, e.g. `2026-09-skill-oral.md`, and change the `date:` and the text) |
| Add a paper                                                         | `_bibliography/papers.bib` (copy a block; see "Adding a paper" below)                                            |
| Add a project                                                       | Add a file in `_projects/` (copy one; `importance:` sets the order)                                              |
| Write / link a blog post                                            | `_posts/` (see "Blog" below)                                                                                     |
| Add a research note                                                 | `_pages/notes.md`                                                                                                |
| Add a book                                                          | Add a file in `_books/`                                                                                          |
| Update the CV page                                                  | `_data/cv.yml`, and replace `assets/pdf/Suvinava_Basak_CV.pdf` for the download button                           |
| Add a course I assisted/taught                                      | Add a file in `_teachings/`                                                                                      |
| Rename / reorder menu items                                         | `nav_order:` and `title:` at the top of the files in `_pages/` (the _writing_ dropdown is `_pages/dropdown.md`)  |
| Hide a menu item                                                    | Set `nav: false` at the top of its file in `_pages/`                                                             |
| Change site title, description, footer                              | `_config.yml` (top of the file)                                                                                  |
| Change the blue                                                     | `_sass/_variables.scss`: `$accent-light` (light mode) and `$accent-dark` (dark mode)                             |
| Change fonts, sizes, spacing                                        | `_sass/_portfolio.scss` (variables at the top: `--font-sans`, `--font-mono`, `--gutter`)                         |

Light, dark and system modes are built in (the moon/sun icon at the top right). There is nothing to edit for them.

## Adding a paper

Copy a block in `_bibliography/papers.bib`, give it a new unique key, and edit the fields:

```bibtex
@inproceedings{basak2027example,
  abbr        = {ICML},
  bibtex_show = {true},
  title       = {My paper title},
  author      = {Basak, Suvinava and Coauthor, Name},
  booktitle   = {Venue name},
  year        = {2027},
  note        = {Oral presentation},
  arxiv       = {2701.01234},
  abstract    = {Paste the abstract here.},
  code        = {https://github.com/baksho/my-repo},
  pdf         = {my-paper.pdf},
  selected    = {true}
}
```

What the fields do (do not type these explanations inside the entry; BibTeX does not allow comments there):

- `abbr`: small badge on the left (venue abbreviation).
- `note`: optional extra line under the venue.
- `arxiv`: just the ID; adds an arXiv button.
- `abstract`: adds an Abs button that expands the abstract.
- `code`: adds a Code button. `pdf`: a file you place in `assets/pdf/` adds a PDF button.
- `selected = {true}`: also shows the paper on the home page.

Use `{\"u}` for ü and put braces around words whose capitals must be kept, like `{AI}`. Newest papers go at the top.
For a journal paper use `@article` with `journal = {...}` instead of `booktitle`.

## Blog

The two files in `_posts/` are **placeholders** (their titles start with "Placeholder:"). The home page always shows the latest 2 posts.

For each Medium post, copy a placeholder, name it `YYYY-MM-DD-short-title.md`, and edit it:

```yaml
---
layout: post
title: "Your post title"
date: 2026-11-02
description: One or two sentence teaser shown in the list.
tags: medium
related_posts: false
redirect: https://medium.com/@YOUR_HANDLE/YOUR-POST-SLUG # makes the card open Medium directly
---
```

- **With `redirect:`** the title in the list opens your Medium post directly.
- **Without it**, the title opens a page on your site. Put a short summary in the body and finish with
  `[Read the full post on Medium →](https://medium.com/@YOUR_HANDLE/YOUR-POST-SLUG)`.

Delete the two placeholder files once you have real posts.

_Optional, not tested here:_ `_config.yml` has an `external_sources` section (commented example) that can import your Medium
RSS feed automatically at build time.

## The CV page

The page is generated from `_data/cv.yml`. Keep dates as `YYYY` or `YYYY-MM`, and leave out `end_date` for ongoing roles.
Do not add new top-level fields next to `name`/`location`/`email`: the "Render a CV" GitHub Action that reads this file rejects them.
That Action also commits a generated PDF to your repo when `cv.yml` changes, so **run `git pull` before your next push**
(if you edit on github.com you don't need to do anything).

## Running the site on your computer (optional)

The repository documents a Docker setup: `docker compose pull && docker compose up`, then open http://localhost:8080
(see `INSTALL.md`). The first build can take a few minutes.

## Before you share the site widely

- Replace the placeholders: 2 blog posts, 2 research notes (`_pages/notes.md`), 2 books (`_books/`).
- Germany: a personal site may need an _Impressum_ (legal notice) and a privacy statement. I am not able to tell you
  whether yours does; please check the current rules or ask your university. If you add one, put its page path in
  `impressum_path` in `_config.yml` to get a footer link.
- Your email address is on the home page as a normal mail link, so spam bots can read it. Your phone number is deliberately not on the site.
