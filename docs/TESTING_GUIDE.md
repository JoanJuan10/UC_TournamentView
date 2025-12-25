# Testing Guide

Quick reference for testing TournamentView functionality.

## Quick Checklist

### Basic Setup
- [ ] TamperMonkey installed with plugin
- [ ] UnderScript running on Undercards.net
- [ ] Navigate to Spectate mode
- [ ] Enable "TournamentView" in UnderScript settings
- [ ] Verify overlay appears with Default template

### Template System
- [ ] Template selector shows 3 options (Default, Minimal, Esports)
- [ ] Switching templates regenerates UI correctly
- [ ] All player info displays correctly (HP, gold, souls, cards)
- [ ] Turn indicator and timer work properly

### Import/Export
- [ ] Export downloads valid JSON file
- [ ] Import `docs/example_template.json` successfully
- [ ] Imported template appears with "(Custom)" suffix
- [ ] Invalid JSON shows appropriate error messages

### Persistence
- [ ] Custom templates persist after browser restart
- [ ] Selected template stays active after page reload

### i18n
- [ ] Labels change when switching language (ES ↔ EN)
- [ ] All UI elements translate correctly

## Expected Console Logs

```
[TournamentView] Plantillas predefinidas cargadas: 3
[TournamentView] Cambiando plantilla a: [id]
[TournamentView] Plantilla exportada exitosamente
[TournamentView] Plantilla importada exitosamente: [name]
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| UI doesn't regenerate | Check console for errors, disable/enable plugin |
| Imported template missing | Verify JSON validity, check `metadata.id` is unique |
| Colors not applying | Verify `variables` has all required colors, check CSS uses `var(--tv-*)` |
| Export fails | Check browser download permissions |

## Test Results Template

```
Date: ___________
Version: 0.1.0
Browser: ___________
Issues: 
Notes:
```

