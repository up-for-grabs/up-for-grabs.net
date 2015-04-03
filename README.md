up-for-grabs.net
================

Run an open-source project? Submit a Pull Request to add yourself to the list!

Visit the website: [up-for-grabs.net](http://up-for-grabs.net/)

## Add your project

Each of the projects is a file in the [projects](https://github.com/dahlbyk/up-for-grabs.net/blob/gh-pages/_data/projects/) folder - to add yours, create a new file named after your project. Ensure all spaces and special characters are replaced with `-`, to make everyone's life easier.

The contents of the file are just some details about the project:

```yaml
name: *your project here*
desc: *some details about the project*
site: *home page or repository URL*
tags: [ *tags*, *to*, *search*, *on* ]
upforgrabs:
  name: *the label associated with your tasks*
  link: *link to the related tags*
```

## Testing the site locally

If you haven't already done it, clone the repository to your machine:

```
git clone https://github.com/dahlbyk/up-for-grabs.net.git
```

If you have a fork of the repository, change `dahlbyk` for your GitHub account name above.

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

Then open your browser to `localhost:4000` to view the site.
