# Up-for-Grabs.net

[![Build Status](https://github.com/up-for-grabs/up-for-grabs.net/actions/workflows/ci.yml/badge.svg)](https://github.com/up-for-grabs/up-for-grabs.net/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/up-for-grabs/up-for-grabs.net/issues)

** Up-for-Grabs.net ** is a community-driven site that helps new and experienced contributors discover open source projects with issues labeled as “up-for-grabs.”  

Our goal is to make open source contribution more accessible, welcoming, and visible.

👉 Visit the live site: [https://up-for-grabs.net](https://up-for-grabs.net)

---

## ✨ What is this project?

Thousands of open source projects want help but struggle to connect with contributors.  

**Up-for-Grabs.net** curates these projects and their “good first issue” labels into a single, searchable website so anyone can discover how to get involved.

---

## 🚀 Getting Started (Developers)

To run the site locally:

1. ** Clone the repo **

   ```bash
   git clone https://github.com/up-for-grabs/up-for-grabs.net.git
   cd up-for-grabs.net
   ```

# Install dependencies

```bash
bundle install
npm install
Run locally
```

```bash
bundle exec jekyll serve
```

Then open http://localhost:4000 in your browser.

# 🛠 Contributing Projects
Want your project to appear on Up-for-Grabs.net? 

Great! 🎉

1. Fork this repo.

2. Add a YAML file in the _data/projects directory with your project details:
```yaml
name: MyProject
desc: A short description of what it does.
site: https://github.com/myorg/myproject
tags:
  - ruby
  - beginners
upforgrabs:
  name: up-for-grabs
  link: https://github.com/myorg/myproject/labels/up-for-grabs
  ```

3. Submit a pull request.

👉 For full details, see CONTRIBUTING.md.

# 🧪 Running Tests
This project uses automated checks to ensure quality.

Run unit tests:

```bash
rake spec
```

Lint and validate project files:

```bash
rake validate
```

CI will run these automatically on pull requests.

# 🤝 Community & Support
Browse open issues
Join the discussion in pull requests
Propose new features or improvements

We value a welcoming, respectful community.
Please read our Code of Conduct before participating.

📜 License
This project is available as open source under the terms of the MIT License.

---

## 💬 Community & Support

Have questions or want to chat?  
- [Open an issue](https://github.com/up-for-grabs/up-for-grabs.net/issues)
---

_Ready to contribute? Find your first issue and join our community of open source contributors!_