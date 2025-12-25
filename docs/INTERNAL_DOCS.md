# 📋 Internal Documentation - UC_TournamentView

> Consolidated technical documentation from the development process

**Version:** 0.1.0  
**Last Updated:** December 2025

---

## Table of Contents

1. [Project Specification](#1-project-specification)
2. [UnderScript Plugin API](#2-underscript-plugin-api)
3. [Game Events](#3-game-events)
4. [Global Variables](#4-global-variables)
5. [Template System](#5-template-system)
6. [Lessons Learned](#6-lessons-learned)
7. [Bugs Resolved](#7-bugs-resolved)
8. [Conformance Check](#8-conformance-check)

---

## 1. Project Specification

### Objective

Transform the Undercards spectator page (`/Spectate`) into a modern esports-style broadcast experience.

### Architecture

```
UC_TournamentView
├── GameState          # Match data management
├── TemplateManager    # CSS templates and styling
├── UIManager          # DOM manipulation and overlay
├── I18nManager        # Internationalization (ES/EN)
└── Settings           # Plugin configuration
```

### Data Flow

```
Undercards Events → UnderScript Bridge → Event Handlers → GameState → UIManager → DOM
```

### Technical Requirements

- **Dependency**: UnderScript v0.63.9+
- **Build**: Webpack 4.47.0
- **Output**: ~102 KiB compiled
- **Storage**: localStorage (via UnderScript settings)

---

## 2. UnderScript Plugin API

### Plugin Registration

```javascript
const plugin = underscript.plugin('TournamentView', GM_info.version);
```

### Available Methods

| Method | Description |
|--------|-------------|
| `plugin.events()` | Event system |
| `plugin.settings()` | Settings system |
| `plugin.addStyle(css)` | Inject CSS |
| `plugin.toast(options)` | Show notification |

### Settings API

```javascript
const setting = plugin.settings().add({
    key: 'enabled',
    name: 'Enable Plugin',
    type: 'boolean',
    default: false,
    onChange: (value) => { /* handle change */ }
});

// IMPORTANT: value is a getter function
if (setting.value()) { /* ... */ }  // ✅ Correct
if (setting.value) { /* ... */ }    // ❌ Wrong - always truthy
```

### Custom Setting Types

Based on `uc_replays.js` pattern:

```javascript
class FakeSetting extends underscript.utils.SettingType {
    value() { return undefined; }
    encode(e) { return e; }
    default() { return undefined; }
}

class TemplateElement extends FakeSetting {
    static type = 'TournamentView:templateElement';
    labelFirst() { return false; }
    // ... element() creates clickable icons
}
```

---

## 3. Game Events

### Lifecycle Events

| Event | Description |
|-------|-------------|
| `:preload` | DOM ready |
| `:preload:Spectate` | Spectate page detected |
| `GameStart` | Match detected (singleton) |
| `connect` | Initial game data received |

### Game Events

| Event | Data |
|-------|------|
| `getPlayersStats` | HP, gold, artifacts updates |
| `getTurn` | Turn number, active player |
| `getCardPlayed` | Card played info |
| `getSpellPlayed` | Spell cast info |
| `getVictory` / `getDefeat` | Match end |

### Log Events

| Event | Data |
|-------|------|
| `Log:ARTIFACT_EFFECT` | Artifact activation |
| `Log:SOUL_EFFECT` | Soul effect |
| `Log:MONSTER_DESTROYED` | Monster death |

---

## 4. Global Variables

Access via `underscript.utils.global()`:

```javascript
const utils = underscript.utils;

// Player IDs
const selfId = utils.global('selfId');
const perspectiveId = utils.global('userId');
const opponentId = utils.global('opponentId');

// Game state
const turn = utils.global('turn');
const activePlayer = utils.global('userTurn');
const timeLeft = utils.global('time');
```

### DOM Data Extraction

Some data requires DOM reading:

```javascript
// Graveyard (inverted indices!)
const counters = document.querySelectorAll('.dust-counter');
const playerGrave = counters[1]?.textContent;  // Player is index 1
const opponentGrave = counters[0]?.textContent; // Opponent is index 0

// Artifacts with counters
const artifacts = document.querySelectorAll('#yourArtifacts .artifact-custom');
```

---

## 5. Template System

### Template Structure

```json
{
  "metadata": {
    "id": "unique-id",
    "name": "Display Name",
    "version": "1.0.0",
    "author": "Author Name"
  },
  "variables": {
    "primaryColor": "#6a0dad",
    "secondaryColor": "#00bcd4"
  },
  "customCSS": "/* CSS with {{variables}} */"
}
```

### TemplateManager Methods (18 total)

**Core:**
- `registerTemplate(template)` - Validate and register
- `setActiveTemplate(id)` - Change active template
- `getTemplateById(id)` - Find by ID
- `deleteTemplate(id)` - Remove custom template

**Persistence:**
- `loadCustomTemplates()` - Load from localStorage
- `saveCustomTemplates()` - Save to localStorage
- Key: `'uc_tournament_custom_templates'`

**Import/Export:**
- `exportTemplate(id)` - Serialize to JSON
- `importTemplate(json)` - Parse and validate
- `validateTemplate(template)` - Structure validation

**CSS:**
- `injectCSS()` - Apply template styles
- `removeCSS()` - Clear styles
- `generateCSSVariables()` - Convert to CSS custom properties

### Predefined Templates

1. **Default** - Purple/blue gradients, glassmorphism
2. **Minimal** - Flat design, gray/blue
3. **Esports** - Navy/gold, glow effects

---

## 6. Lessons Learned

### Critical: Settings API Returns Getter Function

```javascript
// ❌ WRONG - isEnabled.value is a function, always truthy
if (!isEnabled.value) { /* never executes */ }

// ✅ CORRECT - call as function
if (!isEnabled.value()) { /* works */ }
```

### DOM Indices Are Inverted

`.dust-counter` elements are in reverse order:
- Index 0 = Opponent's graveyard
- Index 1 = Player's graveyard

### UnderScript Settings Cannot Be Recreated

Once a setting is registered, it cannot be re-added with `.add()`. Use `refreshTemplateSettings()` pattern to rebuild UI.

### CSS Variables: camelCase → kebab-case

```javascript
// variables object
{ primaryColor: "#6a0dad" }

// Generated CSS
:root { --tv-primary-color: #6a0dad; }
```

### FileReader API for Imports

```javascript
const reader = new FileReader();
reader.onload = (e) => {
    const json = e.target.result;
    templateManager.importTemplate(json);
};
reader.readAsText(file);
```

### Blob API for Exports

```javascript
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `${templateId}.json`;
a.click();
URL.revokeObjectURL(url);
```

---

## 7. Bugs Resolved

### Phase 4: Template System (18 bugs)

| Bug | Issue | Solution |
|-----|-------|----------|
| #11 | Infinite recursion in onChange | Filter by value type before processing |
| #12 | UI not refreshing after activation | Implement `refreshTemplateSettings()` |
| #13 | Duplicated text in settings | Set `labelFirst() = false` |
| #14 | Star indicator not moving | Rebuild settings dynamically |
| #15 | Template not persisting | Bidirectional localStorage sync |
| #16 | "Already registered" error | Check existence before `.add()` |
| #17 | `updatePlayerStats` not a function | Verify method exists before call |
| #18 | `getBoardState` not a function | Add defensive checks |

### Key Pattern: External Data Map

UnderScript corrupts object values in settings. Solution:

```javascript
// Store data externally
const templateDataBySettingKey = new Map();

// In settings creation
templateDataBySettingKey.set(settingKey, {
    templateId: template.metadata.id,
    canDelete: !isPredefined,
    isActive: isActive
});

// In element() function, retrieve from map
const data = templateDataBySettingKey.get(fullSettingKey);
```

---

## 8. Conformance Check

### Compliance Summary: 98% ✅

| Category | Status |
|----------|--------|
| Project Structure | ✅ 100% |
| Template System | ✅ 100% |
| Settings UI | ✅ 100% |
| Webpack 4 Compatibility | ✅ 100% |
| i18n | ✅ 100% |
| Validation | ⚠️ 95% (CSS not sanitized) |
| Documentation | ✅ 100% |
| Testing | ⚠️ 90% (manual only) |

### Known Limitations

1. **CSS Sanitization**: `customCSS` field accepts arbitrary CSS. Low risk for local plugin, but sanitization recommended if community gallery is implemented.

2. **Template Size Limit**: No size validation. Consider adding 1MB limit in `validateTemplate()`.

### Verification Checklist

- [x] Based on UCProjects official template
- [x] Webpack 4 without ES2020+ features
- [x] UnderScript API used correctly
- [x] 3 predefined templates protected
- [x] Import/export functional
- [x] localStorage persistence working
- [x] i18n complete (ES/EN)
- [x] All known bugs resolved

---

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| Build Size | ~102 KiB |
| Source Size | ~150 KiB |
| Lines of Code | ~4900 |
| TemplateManager Methods | 18 |
| Translations | 17 keys × 2 languages |
| Predefined Templates | 3 |
| Known Bugs | 0 |

---

**This document consolidates:**
- 00_INDICE.md
- 01_TAMPERMONKEY.md
- 02_UNDERSCRIPT_PLUGIN_API.md
- 03_EVENTOS_JUEGO.md
- 04_VARIABLES_GLOBALES.md
- 05_LIBRERIAS_INCLUIDAS.md
- 06_ESPECIFICACION_PROYECTO.md
- 07_DESARROLLO.md
- 08_ESTADO_ACTUAL.md
- 09_LECCIONES_APRENDIDAS.md
- 10_FASE4_PLANTILLAS.md
- 11_FASE4_RESUMEN.md
- 12_CANON_CHECK.md
- 13_MANTENIMIENTO_DIC_2025.md
- 14_MAPA_VISUAL.md
- 15_RESUMEN_EJECUTIVO.md
- 16_FASE4_BUGS_RESUELTOS.md
