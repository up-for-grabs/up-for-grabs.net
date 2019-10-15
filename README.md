up-for-grabs.net
![Continuous Integration  status](https://github.com/up-for-grabs/up-for-grabs.net/workflows/Continuous%20Integration/badge.svg)
[![All Contributors](https://img.shields.io/badge/all_contributors-11-orange.svg?style=flat-square)](#contributors)
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
  name: *the label associated with the up-for-grabs tasks* -- e.g. "help needed" (without the quotes)
  link: *URL where users can view the tasks* -- e.g. "https://github.com/username/project/labels/up%20for%20grabs"
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

## Contributing

If you would like to get involved with the project, please read the
[CONTRIBUTING.md](.github/CONTRIBUTING.md) file as it contains:

 - instructions about getting your environment setup
 - guidance for testing locally
 - commands to run to verify changes

## How does the site work?

If you want to learn more about the various parts of the Up-for-Grabs project,
the [How it works](docs/how-it-works.md) document is a good overview.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/filipe-gomes"><img src="https://avatars1.githubusercontent.com/u/42053052?v=4" width="100px;" alt="Filipe Magalhaes Gomes"/><br /><sub><b>Filipe Magalhaes Gomes</b></sub></a><br /><a href="#content-filipe-gomes" title="Content">🖋</a></td>
    <td align="center"><a href="https://mkkhedawat.github.io/"><img src="https://avatars2.githubusercontent.com/u/5137374?v=4" width="100px;" alt="Manish Kumar Khedawat"/><br /><sub><b>Manish Kumar Khedawat</b></sub></a><br /><a href="https://github.com/up-for-grabs/up-for-grabs.net/commits?author=mkkhedawat" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/SpaceEEC"><img src="https://avatars1.githubusercontent.com/u/24881032?v=4" width="100px;" alt="SpaceEEC"/><br /><sub><b>SpaceEEC</b></sub></a><br /><a href="https://github.com/up-for-grabs/up-for-grabs.net/commits?author=SpaceEEC" title="Code">💻</a></td>
    <td align="center"><a href="http://www.joaomanoel.com.br"><img src="https://avatars0.githubusercontent.com/u/6238111?v=4" width="100px;" alt="João Manoel Lins"/><br /><sub><b>João Manoel Lins</b></sub></a><br /><a href="#content-JoaoManoel" title="Content">🖋</a></td>
    <td align="center"><a href="https://github.com/crystal-dawn"><img src="https://avatars3.githubusercontent.com/u/38540136?v=4" width="100px;" alt="Crystal Yungwirth"/><br /><sub><b>Crystal Yungwirth</b></sub></a><br /><a href="#content-crystal-dawn" title="Content">🖋</a></td>
    <td align="center"><a href="https://github.com/TeslaAdis"><img src="https://avatars1.githubusercontent.com/u/20220542?v=4" width="100px;" alt="Adis Talic"/><br /><sub><b>Adis Talic</b></sub></a><br /><a href="https://github.com/up-for-grabs/up-for-grabs.net/commits?author=TeslaAdis" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/AstroBoogie"><img src="https://avatars2.githubusercontent.com/u/18710598?v=4" width="100px;" alt="Nathaniel Adams"/><br /><sub><b>Nathaniel Adams</b></sub></a><br /><a href="https://github.com/up-for-grabs/up-for-grabs.net/commits?author=AstroBoogie" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://ishan.co"><img src="https://avatars0.githubusercontent.com/u/1873271?v=4" width="100px;" alt="Ishan Sharma"/><br /><sub><b>Ishan Sharma</b></sub></a><br /><a href="https://github.com/up-for-grabs/up-for-grabs.net/commits?author=ishansharma" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/firfircelik"><img src="https://avatars0.githubusercontent.com/u/34511698?v=4" width="100px;" alt="Firat Celik"/><br /><sub><b>Firat Celik</b></sub></a><br /><a href="https://github.com/up-for-grabs/up-for-grabs.net/commits?author=firfircelik" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/phncosta"><img src="https://avatars0.githubusercontent.com/u/47827714?v=4" width="100px;" alt="Paulo H. Costa"/><br /><sub><b>Paulo H. Costa</b></sub></a><br /><a href="https://github.com/up-for-grabs/up-for-grabs.net/commits?author=phncosta" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/XxZhang2017"><img src="https://avatars2.githubusercontent.com/u/26696836?v=4" width="100px;" alt="XxZhang2017"/><br /><sub><b>XxZhang2017</b></sub></a><br /><a href="#content-XxZhang2017" title="Content">🖋</a></td>
  </tr>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!
