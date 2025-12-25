# UC_TournamentView

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/JoanJuan10/UC_TournamentView/releases)
[![Status](https://img.shields.io/badge/status-beta-green.svg)](https://github.com/JoanJuan10/UC_TournamentView)

> A fan-made overlay plugin for [UnderScript](https://github.com/UCProjects/UnderScript) that makes watching [Undercards.net](https://undercards.net) matches look like a tournament broadcast. Made by the community, for the community! 🎮

**[🇪🇸 Versión en Español](docs/README_ES.md)**

![UC_TournamentView Demo](https://via.placeholder.com/800x400?text=UC_TournamentView+Demo)

## ✨ What does it do?

- 🎨 **Templates** - 3 built-in looks + make your own
- 🌐 **Bilingual** - English & Spanish, switch anytime
- 📊 **Live Stats** - HP, gold, souls, artifacts, cards, turn timer
- 🎯 **Turn Indicator** - See who's playing at a glance
- 📜 **Action Log** - Keep track of everything that happens
- 💾 **Auto-save** - Your settings are remembered

## 🚀 Quick Install

### You'll need

1. A modern browser (Chrome, Firefox, Edge, Opera)
2. [Tampermonkey](https://www.tampermonkey.net/) extension
3. [UnderScript](https://github.com/UCProjects/UnderScript) installed

### How to install

1. **Download**: [Get the latest version](https://github.com/JoanJuan10/UC_TournamentView/releases/latest/download/tournamentview.user.js)
2. **Install**: Click the file → Tampermonkey pops up → Hit "Install"
3. **Enable**: Go to Undercards.net → UnderScript menu → Settings → Plugins → TournamentView → Turn it on ✅
4. **Enjoy**: Go watch any match in `/Spectate` mode!

## 🎨 Templates

| Template | Style | Good for |
|----------|-------|----------|
| **Default** | Purple/blue gradients | Everyday use |
| **Classic Spectator** | Clean blue/white | Simple look |
| **Dark Mode Pro** | Dark with cyan/orange | Late night sessions |

### Make your own!

You can create custom templates as JSON files:

```json
{
  "metadata": {
    "id": "my-template",
    "name": "My Template",
    "version": "1.0.0",
    "author": "Your Name"
  },
  "variables": {
    "primaryColor": "#6a0dad",
    "secondaryColor": "#00bcd4"
  },
  "customCSS": "/* Your CSS here */"
}
```

Check out the [Template Guide](docs/TEMPLATE_GUIDE.md) if you want to get creative!

## ⚙️ Settings

Find them at: **UnderScript Menu → Plugins → TournamentView**

| Option | What it does | Default |
|--------|--------------|---------|
| Enable | Turn the overlay on/off | Off |
| Language | Switch between EN/ES | Spanish |
| Template | Pick your favorite look | Default |

### Template buttons

- ⭐ **Star** - Use this template
- 💾 **Download** - Save it as JSON
- 🗑️ **Trash** - Delete (only custom ones)

## 🛠️ Want to contribute?

```bash
git clone https://github.com/JoanJuan10/UC_TournamentView.git
cd UC_TournamentView
npm install
npm start    # Dev mode with auto-reload
npm run build  # Build for release
```

### Project layout

```
├── src/index.js           # All the code (~4900 lines)
├── dist/                  # Compiled plugin
├── docs/                  # Documentation
└── templates/             # Template examples
```

## 📚 Docs

| Doc | What's in it |
|-----|--------------|
| [User Guide](docs/USER_GUIDE.md) | How to use everything |
| [Dev Guide](docs/DEVELOPMENT.md) | For contributors |
| [Template Guide](docs/TEMPLATE_GUIDE.md) | Make custom templates |
| [API Reference](docs/API.md) | Technical stuff |

## 🤝 Contributing

We'd love your help! Here's the quick version:

1. Fork the repo
2. Create a branch (`git checkout -b feature/CoolThing`)
3. Make your changes
4. Push and open a PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

## 🐛 Found a bug? Have an idea?

- **Bugs**: [Report it here](https://github.com/JoanJuan10/UC_TournamentView/issues/new?template=bug_report.md)
- **Ideas**: [Share them here](https://github.com/JoanJuan10/UC_TournamentView/issues/new?template=feature_request.md)

## 📝 License

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) - Free to use and modify for non-commercial purposes. See [LICENSE](LICENSE).

## 🔗 Links

- [Undercards.net](https://undercards.net) - The game we love
- [UnderScript](https://github.com/UCProjects/UnderScript) - Required for this to work
- [Tampermonkey](https://www.tampermonkey.net/) - Browser extension needed

---

**Made with ❤️ by [JoanJuan10](https://github.com/JoanJuan10)**

*Just a fan who wanted to make spectating more fun!*
