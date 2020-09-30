# How It Works

Rather than explaining the entirety of the stack, this document will explain
the key parts of the Up-for-Grabs site and project.

## Displaying projects
The primary site is a Jekyll storehouse facilitated on GitHub Pages, however it influences 
some flawless highlights of Jekyll en route. 
- We use [Data files](https://jekyllrb.com/docs/datafiles/) to speak to the ventures recorded on the site - one document for every undertaking, found under '_data/ventures' 
- We convert this record to JSON inside ['javascripts/projects.json'](../javascripts/projects.json) at the point when the site is assembled utilizing 'jekyll' 
- The ['projectLoader'](../javascripts/projectLoader.js) module runs when the page is stacked, recovering these undertakings and making them accessible for the site 
- The ['projectsService'](../javascripts/projectsService.js) module handles the remainder of the work to sort and search the ventures 
- The ['main'](../javascripts/main.js) module handles the remainder of the work to render the rundown of activities and give the UI to sifting dependent on name or on the other hand labels 

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
