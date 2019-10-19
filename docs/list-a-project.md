
# Add a Project

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
  name: *the label associated with the up-for-grabs tasks* -- e.g. "help needed" (without the quotes)
  link: *URL where users can view the tasks* -- e.g. "https://github.com/username/project/labels/up%20for%20grabs"
```

Check out the [up-for-grabs](https://github.com/up-for-grabs/up-for-grabs.net/blob/gh-pages/_data/projects/up-for-grabs.net.yml) file for an example of this project structure.

## Pull Request Reviews

We aim to be responsive when a pull request is open, but if a pull request remains idle for 2 weeks with feedback that prevents us from merging it we will close the pull request. You are welcome to resubmit the project and address the feedback provided.

## Use the Yeoman Generator

If you'd like to use a generator to create the project's file, you can certainly do so!

Install the generator, then run it and walk through the steps.

```
npm install -g generator-up-for-grabs
yo up-for-grabs
```
