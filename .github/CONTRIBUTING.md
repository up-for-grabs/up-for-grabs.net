# Contributing to Up for Grabs

This guide will help you get set up so you can make changes to the project, view
them locally and verify that the site will deploy correctly when opening a pull
request.

## Project Setup

This repository contains the GitHub Pages content and some additional Ruby and
NodeJS tooling to help verify changes as part of publishing the site.

To get a local clone of the repository:

```
git clone https://github.com/up-for-grabs/up-for-grabs.net.git
```

If you have a fork of the repository on GitHub, replace the first `up-for-grabs`
with your GitHub account.

We require Ruby 3, Bundler 2.2 and Node 16+ to test the site. You can check
these are present by running these commands in a terminal:

```
$ ruby -v
ruby 3.0.3p157 (2021-11-24 revision 3fb7d2cadc) [x86_64-darwin18]
$ bundle -v
Bundler version 2.2.33
$ node -v
v22.2.0
```

## Testing the site

There are two recommended ways to test the site locally, based on what OS you
are currently using:

- for macOS or Linux contributors - either approach is fine
- for Windows contributors - Docker is recommended because Ruby on Windows has
  some issues that need familiarity with the toolchain to properly workaround

### Testing without Docker

Within your local clone of the up-for-grabs repository, run these commands to
install the dependencies needed:

```
bundle install
```

Once you've done that, this command will build the site and make it available to
view using a local development server:

```
bundle exec jekyll serve
```

The site should be accessible in your browser at `localhost:4000`.

### Testing with Docker

[Docker](https://docker.com) can also be used to build and test the site, for
contributors who don't want to install the tooling locally. Check the setup
instructions for your OS for more information:

- [Docker for Windows](https://docs.docker.com/docker-for-windows/install/)
- [Docker for macOS](https://docs.docker.com/docker-for-mac/install/)
- [Other platforms, including Linux distros](https://docs.docker.com/v17.12/install/)

Once you have that installed, use the `docker-compose` command to build and
view the site:

```
docker-compose up
```

If that completes without error, open your browser to `localhost:4000` to view
the site.

## Automated testing

We have a suite of additional tooling that can be run to verify the contents of
the repository. These are run as part of any pull request or build on GitHub,
and it is recommended to run these locally before pushing changes to save time
with reviews.

### Validate Project Listings

This script scans all the data files under `_data/projects` to verify they can be
parsed correctly, and have the expected schema defined.

```
$ bundle exec ruby scripts/validate_data_files.rb
```

If you run this and it reports an error, check the file and fix the error before
continuing.

### Validate JavaScript Content

We use `jest` to test the JavaScript modules in the project:

```
$ npm test
```

If this command reports errors, it is likely that the site functionality has
been impacted by a change. Please investigate and address the issue before
proceeding.

We also use `eslint` and `prettier` in this project to lint and apply consistent
formatting to the JavaScript modules in the project:

```
$ npm run lint
$ npm run prettier
```

Both of these tools have "auto-fix" options, which may fix the problems reported
without needing manual work:

```
$ npm run lint-fix
$ npm run prettier-fix
```
