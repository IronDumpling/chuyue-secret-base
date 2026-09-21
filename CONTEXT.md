# Chuyue site

A personal site with two sections: a **blog** that is read, and a **portfolio** that is browsed. The site repository builds and deploys it; the text and images live in a separate repository, `chuyue-content`, checked out into `content/`.

## Language

**Section**:
One of the two halves of the site, `blog` or `portfolio`. Each has its own categories and its own way of showing them (the blog is a list, the portfolio is a grid of cards).
_Avoid_: area, tab

**Category**:
The place a **Post** or **Project** belongs to: `films`, `games`, `photography`. A category's id is its folder name in `content/` and the segment in its URL. Ids are unique within a section.
_Avoid_: type, tag

**Group**:
A set of categories shown together in the filter menu (`reviews`, `computing`). It exists only for the menu: it is never in a folder name or a URL, so regrouping changes no files and no links. A group with a single category (`moments`) has no second menu level.
_Avoid_: parent category, section

**Post**:
One entry in the blog: a review or a moment.

**Project**:
One entry in the portfolio: an application, a game, a piece of systems or AI work, a photo series, an illustration.

**Context**:
Where a Project was made (`course`, `research`, `work`, `personal`). It is a label on the card, not a category.
_Avoid_: category

**Taxonomy**:
The list of sections, groups and categories, defined in `lib/taxonomy.ts`. The content folders must match it or the build fails.

## Relationships

- A Section has one or more Groups; a Group has one or more Categories; a Post or Project is in exactly one Category.
- Display names of groups, categories and contexts are in the dictionaries, one per language, not in the taxonomy.

## Flagged ambiguities

- "Type" used to mean review/casual and was a folder level and a URL segment. It is gone: whether a Post is a review now follows from its Group.
- "Student project" was a category. It is a **Context** (`course`) now, because a course project is also an application, a game, systems or AI work.
