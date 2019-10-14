# How It Works

Rather than explaining the entirety of the stack, this document will explain
the key parts of the Up-for-Grabs site and project.

## Displaying projects

The main site is a Jekyll repository hosted on GitHub Pages, but it leverages
some neat features of Jekyll along the way.

- We use [Data files](https://jekyllrb.com/docs/datafiles/) to represent the
  projects listed on the site - one file per project, found under
  `_data/projects`
- We convert this file to JSON inside [`javascripts/projects.json`](../javascripts/projects.json)
  when the site is built using `jekyll`
- The [`projectLoader`](../javascripts/projectLoader.js) module runs when the
  page is loaded, retrieving these projects and making them available for the
  site
- The [`projectsService`](../javascripts/projectsService.js) module handles
  the rest of the work to sort and search the projects
- The [`main`](../javascripts/main.js) module handles the rest of the work to
  render the list of projects and provide the UI for filtering based on label
  or tags

## Project Infrastructure

We've settled on some infrastructure choices that mean we don't need to worry
about managing our own servers, and can save time on the manual work that comes
with a project of this size:

- [GitHub Actions](https://github.com/features/actions) run on each build and
  pull request to validate the project is in a state where it can be deployed
- [Netlify](https://www.netlify.com/) hooks run on each pull request to test the
  deploy and provide a preview so that reviewers do not need to pull down and
  verify the changes locally
- When a commit is pushed to the `gh-pages` branch, a deploy is started to
  publish the latest code to [GitHub Pages](https://pages.github.com/), which
  hosts the site
- A GitHub action runs weekly to scan the project list and cleanup any that have
  stale projects, by checking if they are still accessible via the GitHub API. This
  saves us time having to manually review projects for inactivity.
- A GitHub action runs daily to check each project and commit statistics to the
  data files. This allows us to cache statistics each time the site is published
  and makes it easier for visitors to see which projects have available issues.
