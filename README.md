# UC_TournamentView

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/JoanJuan10/UC_TournamentView/releases)
[![Status](https://img.shields.io/badge/status-beta-green.svg)](https://github.com/JoanJuan10/UC_TournamentView)

> Professional overlay plugin for [UnderScript](https://github.com/UCProjects/UnderScript) that transforms the [Undercards.net](https://undercards.net) spectator experience into an esports-style broadcast view.

**[🇪🇸 Versión en Español](docs/README_ES.md)**

![UC_TournamentView Demo](https://via.placeholder.com/800x400?text=UC_TournamentView+Demo)

## ✨ Features

- 🎨 **Template System** - 3 built-in templates + custom import/export
- 🌐 **Multi-language** - English & Spanish with real-time switching
- 📊 **Real-time Info** - HP, gold, souls, artifacts, cards, turn timer
- 🎯 **Turn Indicator** - Visual animations for active player
- 📜 **Action Log** - Floating panel with complete match history
- 💾 **Persistence** - All settings saved automatically

## 🚀 Quick Install

### Requirements

1. Modern browser (Chrome, Firefox, Edge, Opera)
2. [Tampermonkey](https://www.tampermonkey.net/)
3. [UnderScript](https://github.com/UCProjects/UnderScript)

### Installation

1. **Download**: [Latest Release](https://github.com/JoanJuan10/UC_TournamentView/releases/latest/download/tournamentview.user.js)
2. **Install**: Click the file → Tampermonkey opens → Click "Install"
3. **Enable**: Undercards.net → UnderScript menu → Settings → Plugins → TournamentView → ✅ Enable
4. **Use**: Visit any match in `/Spectate` mode

## 🎨 Templates

| Template | Style | Best For |
|----------|-------|----------|
| **Default** | Modern purple/blue gradients | General streaming |
| **Classic Spectator** | Clean blue/white | Professional look |
| **Dark Mode Pro** | Dark with cyan/orange accents | Night sessions |

### Custom Templates

Create your own template as JSON:

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

See [Template Guide](docs/TEMPLATE_GUIDE.md) for details.

## ⚙️ Configuration

Access settings via: **UnderScript Menu → Plugins → TournamentView**

| Option | Description | Default |
|--------|-------------|---------|
| Enable | Turn plugin on/off | Off |
| Language | English or Spanish | Spanish |
| Template | Active visual template | Default |

### Template Management

- ⭐ **Star icon** - Activate template
- 💾 **Download icon** - Export as JSON
- 🗑️ **Trash icon** - Delete custom templates

## 🛠️ Development

```bash
git clone https://github.com/JoanJuan10/UC_TournamentView.git
cd UC_TournamentView
npm install
npm start    # Watch mode
npm run build  # Production build
```

### Project Structure

```
├── src/index.js           # Main source (~4900 lines)
├── dist/                  # Compiled output (~102 KiB)
├── docs/                  # Documentation
└── templates/             # Template examples
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [User Guide](docs/USER_GUIDE.md) | How to use the plugin |
| [Development Guide](docs/DEVELOPMENT.md) | Setup and architecture |
| [Template Guide](docs/TEMPLATE_GUIDE.md) | Create custom templates |
| [API Reference](docs/API.md) | Technical documentation |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🐛 Issues & Requests

- **Bug Reports**: [Open an issue](https://github.com/JoanJuan10/UC_TournamentView/issues/new?template=bug_report.md)
- **Feature Requests**: [Open an issue](https://github.com/JoanJuan10/UC_TournamentView/issues/new?template=feature_request.md)

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Undercards.net](https://undercards.net)
- [UnderScript](https://github.com/UCProjects/UnderScript)
- [Tampermonkey](https://www.tampermonkey.net/)

---

**Made with ❤️ by [JoanJuan10](https://github.com/JoanJuan10) & HectorPSI**
