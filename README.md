up-for-grabs.net
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
================

Do you run or participate in an open-source project? Submit a Pull Request to add it to the list!

Visit the website: [up-for-grabs.net](https://up-for-grabs.net/)

## Add a Project

- Each of the projects is a file in the [projects](https://github.com/up-for-grabs/up-for-grabs.net/blob/gh-pages/_data/projects/) folder.
- To add a new one, create a new file named after the project, ending in `.yml`.
- Ensure all spaces and special characters are replaced with `-`, to make everyone's life easier.
- [This guide](https://help.github.com/articles/creating-new-files/) shows you how to create the file directly in the browser, without cloning the repository in the command line.

The contents of the file are just some details about the project:

```yaml
name: *project name*
desc: *a brief description of the project*
site: *home page or repository URL*
tags:
# Note: these are tags categorizing the project, not issue labels.
- *tags*
- *to*
- *search*
- *on*
upforgrabs:
  name: *the label associated with the up-for-grabs tasks -- e.g. "help needed" (without the quotes)*
  link: *URL where users can view the tasks -- e.g. https://github.com/username/project/labels/up%20for%20grabs*
```

Check out the [up-for-grabs](https://github.com/up-for-grabs/up-for-grabs.net/blob/gh-pages/_data/projects/up-for-grabs.net.yml) file for an example of this project structure.

### Pull Request Reviews

We aim to be responsive when a pull request is open, but if a pull request remains idle for 2 weeks with feedback that prevents us from merging it we will close the pull request. You are welcome to resubmit the project and address the feedback provided.

## Use the Yeoman Generator

If you'd like to use a generator to create the project's file, you can certainly do so!

Install the generator, then run it and walk through the steps.

```
npm install -g generator-up-for-grabs
yo up-for-grabs
```

## Testing the Site Locally

If you haven't already, clone the repository to your machine:

```
git clone https://github.com/up-for-grabs/up-for-grabs.net.git
```

If you have a fork of the repository, change `up-for-grabs` into your GitHub account named above.

We recommend installing Ruby 2.6.x and Bundler 2.0.x to test the site - you can confirm these are present by running these commands:

```
$ ruby -v
ruby 2.6.4p104 (2019-08-28 revision 67798) [x86_64-darwin18]
$ bundle -v
Bundler version 2.0.2
```

If you're happy with that, run these commands in the directory where you cloned the up-for-grabs repository:

```
bundle install
bundle exec jekyll serve
```

Alternatively, the application can be run in a [Docker](https://docker.com) container:

```
docker-compose up
```

Then open your browser to `localhost:4000` to view the site.

## How This All Works
We use a few great features of Jekyll and GitHub Pages to host this entire site for free.

* We are using a file called `scripts.html` which is an include file. When we publish the site, Jekyll uses this to concatenate and generate the scripts that will actually be downloaded when a user visits the site.
* Within the `scripts.html` template, we're referencing `site.data.projects`, which gives us access to the entire directory of `.yml` files as a set of variables. We combine this with the `jsonify` liquid transformer to turn them into a JSON object. This means that the raw data is generated once, so it downloads very quickly as static data.
* When the web page is opened, our startup JS processes each project in the array of projects and pushes it into the array that the rest of the site uses.
* We use [travis-ci](https://travis-ci.org/up-for-grabs/up-for-grabs.net) to run a custom ruby script, `cibuild`, that checks all the `.yml` files to make sure they can be appropriately parsed. This makes sure we don't merge any incorrectly formed project files.

What this means is that, when a pull request is merged, GitHub Pages automatically builds the site via Jekyll and publishes it to our GitHub -- no database or hosting needed. (Thanks, GitHub!)

## Automation and Curation

Because of the immense number of projects currently tracked in Up-for-Grabs,
we've spent time adding tasks to run periodically so we can focus on curation
and site improvements.

Recent examples :

 - Cleanup stale projects - each week a task runs to review the list of projects
   and remove any that have been marked as archived or are no longer accessible
   via the GitHub API.
 - Update project stats - every day a task runs to check each project and commit
   statistics to the data files. This allows us to cache statistics each time
   the site is published and makes it easier for visitors to see which projects
   have available issues.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/SpaceEEC"><img src="https://avatars1.githubusercontent.com/u/24881032?v=4" width="100px;" alt="SpaceEEC"/><br /><sub><b>SpaceEEC</b></sub></a><br /><a href="https://github.com/up-for-grabs/up-for-grabs.net/commits?author=SpaceEEC" title="Code">💻</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!