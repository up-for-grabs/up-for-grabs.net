
# List a Project

This document walks through the process of submitting a project to Up for Grabs

## Criteria

We are interested in active open source projects that meet this criteria:

 - available maintainers who are interested in guiding new contributors
 - the project curates a list of small tasks which are ideal for new contributors
 - maintainers are happy and willing to review and work with new contributors to
   help them learn more about open source

If you project does not satisfy all of this criteria, it may be declined at the
review process. We'll provide suggestions to help address
these things.

## Add using the GitHub web editor

The simplest way to add your project is to use the GitHub web editor. If you are
signed into GitHub, simply navigate to [this link](https://github.com/up-for-grabs/up-for-grabs.net/tree/gh-pages/_data/projects)
to view the list of projects.

In the header click the "Create new file" link to start the process

**SCREENSHOT**

This will open the web editor with an empty file:

**SCREENSHOT**

Ensure that you name the file after your project, and that the file extension
is  `.yml`.

Add this template as the contents of the file, and then replace the default
values with details specific to your project:

```yaml
name: Your Project Name Here
desc: A brief description of the project
site: https://example.org/your-project-link-here
tags:
- tags
- to
- search
- on
upforgrabs:
  name: up for grabs
  link: https://github.com/username/project/labels/up%20for%20grabs
```

**TODO:** details about the specific fields

If you're not sure what to provide, here are some examples:

 - [the Up for Grabs project itself is listed](https://github.com/up-for-grabs/up-for-grabs.net/blob/gh-pages/_data/projects/up-for-grabs.net.yml)
 - ...
 - ...

When you are done with the project details, use the form at the bottom of the
page to create the commit:

**SCREENSHOT**

The next page will show you the changes made - click "Create pull request" to
start creating the pull request:

**SCREENSHOT**

Fill out the Pull request template to add anything else, and then click
"Create pull request" to submit it for review.

## Use the Yeoman Generator

If you'd like to use a generator to create the project's file, you can certainly do so!

Install the generator, then run it and walk through the steps.

```
npm install -g generator-up-for-grabs
yo up-for-grabs
```

## Pull Request Reviews

We aim to be responsive when a pull request is open, but if a pull request
remains idle for 2 weeks with feedback that prevents us from merging it we will
close the pull request. You are welcome to resubmit the project and address the
feedback provided.
