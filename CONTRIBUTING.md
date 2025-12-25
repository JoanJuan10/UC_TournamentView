# 🤝 Contributing Guide - UC_TournamentView

Hey! Thanks for wanting to help out with UC_TournamentView. This doc explains how you can contribute.

## 📋 Table of Contents

- [Before anything](#before-anything)
- [How can I help?](#how-can-i-help)
- [Setting up](#setting-up)
- [How to develop](#how-to-develop)
- [Code style](#code-style)
- [Commits and PRs](#commits-and-prs)

---

## Before anything

We just ask that you're respectful to the rest of the community. We're here because we love the game and want to make cool stuff. That's it.

---

## How can I help?

### Report bugs 🐛

If something doesn't work:

1. First search in [Issues](https://github.com/JoanJuan10/UC_TournamentView/issues) in case someone already reported it
2. If it doesn't exist, create a new one with the Bug Report template
3. The more info you give, the better (steps to reproduce, screenshots, console logs...)

### Suggest ideas ✨

Got an idea that would improve the plugin?

1. Check Issues if someone already suggested it
2. If not, create one with the Feature Request template
3. Explain what problem it would solve and why it's cool

### Write code 💻

You can help with:
- **Bug fixes** - Fix broken stuff
- **Features** - Add new functionality
- **Docs** - Improve documentation
- **Templates** - Create new visual templates
- **i18n** - Add more languages

---

## Setting up

### You'll need

- **Node.js** v14+
- **npm** v6+
- **Git**
- An editor (VS Code works great)

### Installation

```bash
# 1. Fork on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/UC_TournamentView.git
cd UC_TournamentView

# 3. Add original repo as upstream
git remote add upstream https://github.com/JoanJuan10/UC_TournamentView.git

# 4. Install dependencies
npm install

# 5. Create your branch
git checkout -b feature/my-new-thing
```

### Useful commands

```bash
npm run dev    # Watch mode (auto reload)
npm run build  # Compile for release
npm run lint   # Check code
```

---

## How to develop

### Basic flow

```bash
# 1. Create your branch
git checkout -b feature/my-thing

# 2. Develop with npm run dev

# 3. Test in the game
# - Install dist/tournamentview.user.js in Tampermonkey
# - Go to /Spectate on Undercards.net
# - Check that it works

# 4. Commit and push
git add .
git commit -m "feat: my new feature"
git push origin feature/my-thing

# 5. Open a PR on GitHub
```

### Branch naming

- `feature/` → New stuff
- `fix/` → Fix something
- `docs/` → Documentation

---

## Code style

Nothing fancy, just the basics:

```javascript
// ✅ Good
class MyClass {
  constructor() {
    this.myVariable = 'value';
  }
  
  myMethod() {
    const result = this.calculate();
    return result;
  }
}

// ❌ Bad
class myclass {
  constructor() {
    this.my_variable = 'value';  // no snake_case
  }
}
```

- **Classes**: PascalCase → `UIManager`
- **Variables/Methods**: camelCase → `updatePlayerHP`
- **2 spaces** for indentation
- **Single quotes** for strings

---

## Commits and PRs

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: new feature
fix: bug fix
docs: documentation changes
refactor: code improvement
```

Examples:
```bash
git commit -m "feat: add custom notification sounds"
git commit -m "fix: HP bar not updating"
git commit -m "docs: improve template guide"
```

### Before opening a PR

Check that:
- [x] Works in spectator mode
- [x] Works with all 3 templates
- [x] Works in ES and EN
- [x] No forgotten `console.log()`
- [x] Compiles without errors (`npm run build`)

---

## Creating templates

Want to create a new template? Check the [Template Guide](docs/TEMPLATE_GUIDE.md).

Basically:
1. Create the JSON in `templates/`
2. Test that it looks good
3. Submit a PR with a screenshot

---

## Adding languages

Want to add another language? Search for `translations` in `src/index.js` and add yours following the `es` and `en` pattern.

---

## Questions

- **How do I test?** → `npm run build`, install the `.user.js` in Tampermonkey, open a match in Spectate
- **Can I work on an Issue?** → Yes, just comment so we know you're on it
- **How long for review?** → We try within 2-3 days, but we're amateurs so be patient 😅

---

**Thanks for wanting to help! 🎉**
