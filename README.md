up-for-grabs.net
================

Run an open-source project? Submit a Pull Request to add yourself to the list!

Visit the website: [up-for-grabs.net](http://up-for-grabs.net/)

## Add your project

Each of the projects is a file in the [projects](https://github.com/up-for-grabs/up-for-grabs.net/blob/gh-pages/_data/projects/) folder - to add yours, create a new file named after your project, ending in `.yml`. Ensure all spaces and special characters are replaced with `-`, to make everyone's life easier. [This guide](https://help.github.com/articles/creating-new-files/) shows you how to create the file directly in your browser without cloning the repository.

The contents of the file are just some details about the project:

```yaml
name: *your project here*
desc: *some details about the project*
site: *home page or repository URL*
tags:
# Note those are tags categorizing your project, not issue labels.
- *tags*
- *to*
- *search*
- *on*
upforgrabs:
  name: *the label associated with your tasks*
  link: *URL which users can view the tasks*
```

Check out the [up-for-grabs](https://github.com/up-for-grabs/up-for-grabs.net/blob/gh-pages/_data/projects/up-for-grabs.net.yml) file for an example of this project structure.

## Use the Yeoman Generator

If you'd like to use a generator to create your project's file, you can certainly do so!

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

If you have a fork of the repository, change `up-for-grabs` for your GitHub account name above.

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
