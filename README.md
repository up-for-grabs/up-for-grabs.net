up-for-grabs.net
================

Do you run or participate in an open-source project? Submit a Pull Request to add it to the list!

Visit the website: [up-for-grabs.net](http://up-for-grabs.net/)

## Add a project

Each of the projects is a file in the [projects](https://github.com/up-for-grabs/up-for-grabs.net/blob/gh-pages/_data/projects/) folder - to add a new one, create a new file named after the project, ending in `.yml`. Ensure all spaces and special characters are replaced with `-`, to make everyone's life easier. [This guide](https://help.github.com/articles/creating-new-files/) shows you how to create the file directly in the browser, without cloning the repository in the command line.

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

## Use the Yeoman Generator

If you'd like to use a generator to create the project's file, you can certainly do so!

Install the generator, then run it and walk through the steps.

```
npm install -g generator-up-for-grabs
yo up-for-grabs
```

## Testing the site locally

If you haven't already, clone the repository to your machine:

```
git clone https://github.com/up-for-grabs/up-for-grabs.net.git
```

If you have a fork of the repository, change `up-for-grabs` into your GitHub account name above.

You need Ruby and Bundler installed to test the site - you can confirm these are present by running these commands:

```
ruby -v
bundle -v
```

If you're happy with that, run these commands in the directory where you cloned the up-for-grabs repository:

```
bundle install
jekyll serve --watch
```

Alternatively, the application can be run in a [Docker](https://docker.com) container:

```
docker-compose up
```

Then open your browser to `localhost:4000` to view the site.
