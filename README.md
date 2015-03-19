up-for-grabs.net
================

Run an open-source project? Submit a Pull Request to add yourself to the list!

Visit the website: [up-for-grabs.net](http://up-for-grabs.net/)

## Testing the site locally

Each of the projects exists under the [projects](https://github.com/dahlbyk/up-for-grabs.net/blob/gh-pages/_data/projects/) folder - simply add a new file (the file name should be a machine-friendly version of the project name, and use `-` in place of spaces for readability) and fill out these values:

```yaml
name: *your project here*
desc: *some details about the project*
site: *home page or repository URL*
tags: [ *tags*, *to*, *search*, *on* ]
upforgrabs:
  name: *the label associated with your tasks*
  link: *link to the related tags*
```

If you want to run the site locally, after cloning it down to your machine just run these commands (requires Ruby installed):

```
bundle install
jekyll serve --watch
```
