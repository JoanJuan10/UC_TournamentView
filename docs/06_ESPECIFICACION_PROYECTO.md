# 06 - Especificación del Proyecto UC_TournamentView

> Actualizado: 24 de diciembre de 2025 - Estado: Sistema de Plantillas Completo (Fase 4 ✅)

Especificación técnica completa del plugin UC_TournamentView, incluyendo arquitectura, sistema de plantillas avanzado y diseño de plantillas visuales.

**✅ Nota**: La Fase 4 (Sistema de Plantillas) está completamente implementada. Ver [11_FASE4_RESUMEN.md](11_FASE4_RESUMEN.md) para detalles completos.

## 📋 Índice

1. [Visión General](#visión-general)
2. [Arquitectura del Plugin](#arquitectura-del-plugin)
3. [Sistema de Plantillas](#sistema-de-plantillas)
4. [Estructura JSON de Plantilla](#estructura-json-de-plantilla)
5. [Plantilla Base: Esports Moderno](#plantilla-base-esports-moderno)
6. [Componentes del Overlay](#componentes-del-overlay)
7. [Sistema de Settings](#sistema-de-settings)
8. [Flujo de Datos](#flujo-de-datos)
9. [Extensibilidad Futura](#extensibilidad-futura)

---

## Visión General

### Objetivo

Transformar la página de espectador (`/Spectate?gameId=XXX&playerId=YYY`) de Undercards en una experiencia visual moderna estilo transmisión de esports profesional.

### Estado Actual

✅ **Fase 4 Completada**: Sistema completo de gestión de plantillas implementado y funcional. Ver [11_FASE4_RESUMEN.md](11_FASE4_RESUMEN.md) para detalles completos.

**Implementado**:
- ✅ Overlay de información en tiempo real
- ✅ Sistema de plantillas con CSS variables
- ✅ **3 plantillas predefinidas (Default, Minimal, Esports)**
- ✅ **Sistema de gestión avanzado con categoría independiente**
- ✅ **Importar/Exportar plantillas personalizadas**
- ✅ **Validación robusta de plantillas**
- ✅ **Persistencia en localStorage**
- ✅ Extracción de datos del DOM
- ✅ Settings funcional (activar/desactivar)
- ✅ Timer sincronizado
- ✅ Indicador de turno activo
- ✅ Overlay de resultados
- ✅ Sistema multiidioma (ES/EN)
- ✅ Animaciones mejoradas y notificaciones
- ✅ Panel de historial colapsable
- ✅ Diseño responsive

**Futuras Mejoras**:
- 🎨 Editor visual de plantillas (Fase 5)
- 🌐 Galería de plantillas comunitarias
- ⚙️ Plantillas dinámicas con hooks JavaScript
- 🎬 Animaciones avanzadas personalizables

### Alcance

| Incluido | No Incluido (Por ahora) |
|----------|-------------------------|
| ✅ Vista Spectate | ❌ Vista Game (jugador) |
| ✅ Overlays visuales | ❌ Modificar mecánicas |
| ✅ Sistema de plantillas completo | ❌ Integración con torneos externos |
| ✅ Importar/Exportar plantillas | ❌ Streaming directo |
| ✅ 3 plantillas predefinidas | ❌ Datos externos |
| ✅ Gestión avanzada de plantillas | ❌ Editor visual (futuro) |
| ✅ Información existente en la web | |

### Requisitos Técnicos

- **Dependencia**: UnderScript v0.63.9+ (cargado vía `@require`)
- **Compatibilidad**: Navegadores modernos con TamperMonkey
- **Almacenamiento**: localStorage (vía UnderScript settings)
- **Sin dependencias externas adicionales**

---

## Arquitectura del Plugin

### Diagrama de Módulos

```
UC_TournamentView
├── Build System
│   ├── webpack.config.js
│   ├── package.json
│   └── Node.js dependencies
│
├── Core
│   ├── Plugin Registration (src/index.js)
│   ├── Settings Manager
│   └── Event Handlers
│
├── Template System ✅ (Implementado)
│   ├── TemplateManager (18 métodos)
│   ├── Template Loader (predefinidas + custom)
│   ├── Template Parser & Validator
│   ├── Import/Export Manager
│   ├── CSS Injector (plugin.addStyle)
│   └── localStorage Persistence
│
├── Settings UI ✅ (Implementado)
│   ├── FakeSetting (base class)
│   ├── TemplateElement (gestión por plantilla)
│   ├── FileInputElement (importar)
│   └── Categoría "Plantillas"
│
├── UI Components ✅ (Implementado)
│   ├── Header Bar (nombres, HP, souls, artifacts)
│   ├── Turn Indicator & Timer
│   ├── Action Log (historial colapsable)
│   ├── Notificaciones flotantes
│   └── Victory/Defeat Overlay
│
└── Data Layer ✅ (Implementado)
    ├── GameState (player, opponent, turn)
    ├── UIManager (update methods)
    └── Template Storage (localStorage)
```

### Estructura de Archivos

```
UC_TournamentView/
├── README.md
├── LICENSE
├── package.json              # Configuración npm y metadatos
├── webpack.config.js         # Configuración de webpack
├── .eslintrc.js              # Configuración de linting
├── .github/                  # Workflows de CI/CD
│   └── workflows/
│       └── ci.yml
├── src/
│   └── index.js              # Código fuente principal del plugin
├── dist/                     # Archivos compilados (generados)
│   ├── tournamentview.user.js
│   └── tournamentview.meta.js
├── docs/                     # Documentación técnica
│   ├── 01_TAMPERMONKEY.md
│   ├── 02_UNDERSCRIPT_PLUGIN_API.md
│   ├── 03_EVENTOS_JUEGO.md
│   ├── 04_VARIABLES_GLOBALES.md
│   ├── 05_LIBRERIAS_INCLUIDAS.md
│   ├── 06_ESPECIFICACION_PROYECTO.md
│   ├── 07_DESARROLLO.md
│   └── underscript.js        # Referencia del código fuente
└── templates/                # Plantillas de diseño
    └── esports-moderno.json  # Plantilla por defecto (futuro)
```

### Flujo de Desarrollo

```
1. Editar código en src/index.js
        ↓
2. Ejecutar `npm start` (watch) o `npm run build`
        ↓
3. Webpack compila y empaqueta
        ↓
4. Se genera dist/tournamentview.user.js
        ↓
5. TamperMonkey detecta el cambio
        ↓
6. Recargar página de Undercards para ver cambios
```

---

## Sistema de Plantillas

### Concepto

Las plantillas definen cómo se ve el overlay. Cada plantilla contiene:

1. **Metadatos**: Nombre, versión, autor
2. **Configuración**: Posiciones, visibilidad de elementos
3. **Estilos CSS**: Colores, fuentes, animaciones
4. **Variables**: Valores personalizables por el usuario

### Formato de Archivo

Las plantillas se almacenan y exportan como **JSON** que incluye tanto la configuración como el CSS embebido.

```
┌─────────────────────────────────────┐
│           Plantilla JSON            │
├─────────────────────────────────────┤
│  metadata: { name, version, ... }   │
│  config: { positions, visibility }  │
│  variables: { colors, sizes, ... }  │
│  css: "string con estilos CSS"      │
└─────────────────────────────────────┘
```

### Operaciones de Plantillas

| Operación | Descripción |
|-----------|-------------|
| **Cargar** | Aplicar plantilla activa al iniciar |
| **Cambiar** | Seleccionar otra plantilla desde settings |
| **Importar** | Cargar plantilla desde archivo JSON |
| **Exportar** | Guardar plantilla actual como JSON |
| **Duplicar** | Crear copia para personalizar |
| **Eliminar** | Borrar plantilla personalizada |

---

## Estructura JSON de Plantilla

### Esquema Completo

```json
{
  "metadata": {
    "id": "esports-moderno",
    "name": "Esports Moderno",
    "version": "1.0.0",
    "author": "UC_TournamentView",
    "description": "Estilo moderno inspirado en transmisiones de esports",
    "createdAt": "2025-12-23T00:00:00.000Z",
    "updatedAt": "2025-12-23T00:00:00.000Z"
  },
  
  "config": {
    "components": {
      "headerBar": {
        "enabled": true,
        "position": "top-center",
        "showHP": true,
        "showGold": true,
        "showCards": true,
        "showSoul": true
      },
      "turnIndicator": {
        "enabled": true,
        "position": "top-center",
        "style": "animated"
      },
      "actionLog": {
        "enabled": true,
        "position": "right",
        "maxEntries": 10,
        "showIcons": true
      },
      "timer": {
        "enabled": true,
        "position": "top-center",
        "warningThreshold": 10,
        "criticalThreshold": 5
      },
      "victoryOverlay": {
        "enabled": true,
        "animation": "fade-scale",
        "duration": 3000
      }
    },
    
    "layout": {
      "padding": "10px",
      "gap": "15px",
      "borderRadius": "8px"
    }
  },
  
  "variables": {
    "colors": {
      "primary": "#4a90d9",
      "secondary": "#2ecc71",
      "background": "rgba(26, 26, 46, 0.95)",
      "backgroundAlt": "rgba(22, 33, 62, 0.95)",
      "text": "#ffffff",
      "textMuted": "#aaaaaa",
      "accent": "#e74c3c",
      "warning": "#f1c40f",
      "success": "#2ecc71",
      "danger": "#e74c3c",
      "player1": "#3498db",
      "player2": "#e74c3c",
      "border": "rgba(255, 255, 255, 0.2)"
    },
    
    "fonts": {
      "primary": "'Segoe UI', 'Roboto', sans-serif",
      "display": "'Orbitron', 'Segoe UI', sans-serif",
      "mono": "'Consolas', 'Monaco', monospace"
    },
    
    "sizes": {
      "fontSmall": "12px",
      "fontNormal": "14px",
      "fontLarge": "18px",
      "fontXLarge": "24px",
      "iconSmall": "16px",
      "iconNormal": "24px",
      "iconLarge": "32px"
    },
    
    "effects": {
      "blur": "10px",
      "shadow": "0 4px 15px rgba(0, 0, 0, 0.3)",
      "glow": "0 0 10px rgba(74, 144, 217, 0.5)",
      "transitionSpeed": "0.3s"
    }
  },
  
  "css": "/* CSS generado a partir de variables - ver sección CSS */"
}
```

### Posiciones Válidas

```
┌─────────────────────────────────────────┐
│  top-left    top-center    top-right    │
│                                         │
│  left                           right   │
│                                         │
│  bottom-left bottom-center bottom-right │
└─────────────────────────────────────────┘
```

---

## Plantilla Base: Esports Moderno

### Descripción Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER BAR                               │
│  ┌──────────────────┐    VS    ┌──────────────────┐             │
│  │ ★ Player1       │   ⏱️   │ Player2       ★ │             │
│  │ ❤️ 25/30  💰 5   │  1:30   │ 💰 3  ❤️ 30/30 │             │
│  │ 🃏 4  ⭐ Bravery │         │ Justice ⭐ 🃏 5  │             │
│  └──────────────────┘         └──────────────────┘             │
│                         TURNO 5                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                        [ÁREA DE JUEGO]                          │
│                      (Sin modificar)                             │
│                                                                  │
│                                                      ┌─────────┐│
│                                                      │ LOG     ││
│                                                      │ ──────  ││
│                                                      │ Player1 ││
│                                                      │ jugó    ││
│                                                      │ Froggit ││
│                                                      │         ││
│                                                      │ Player2 ││
│                                                      │ atacó   ││
│                                                      │ ...     ││
│                                                      └─────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### CSS de la Plantilla Esports

```css
/* ============================================
   UC_TournamentView - Esports Moderno
   ============================================ */

/* Variables CSS (generadas desde JSON) */
:root {
  --tv-primary: #4a90d9;
  --tv-secondary: #2ecc71;
  --tv-bg: rgba(26, 26, 46, 0.95);
  --tv-bg-alt: rgba(22, 33, 62, 0.95);
  --tv-text: #ffffff;
  --tv-text-muted: #aaaaaa;
  --tv-player1: #3498db;
  --tv-player2: #e74c3c;
  --tv-border: rgba(255, 255, 255, 0.2);
  --tv-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  --tv-transition: 0.3s ease;
  --tv-font: 'Segoe UI', sans-serif;
  --tv-font-display: 'Orbitron', sans-serif;
}

/* ============================================
   Header Bar
   ============================================ */
.tv-header {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 30px;
  background: linear-gradient(180deg, var(--tv-bg) 0%, var(--tv-bg-alt) 100%);
  border-bottom: 2px solid var(--tv-border);
  border-radius: 0 0 15px 15px;
  box-shadow: var(--tv-shadow);
  z-index: 1000;
  font-family: var(--tv-font);
}

/* ============================================
   Player Cards
   ============================================ */
.tv-player {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 20px;
  background: var(--tv-bg-alt);
  border-radius: 10px;
  border: 1px solid var(--tv-border);
  min-width: 200px;
}

.tv-player.player1 {
  border-left: 4px solid var(--tv-player1);
}

.tv-player.player2 {
  border-right: 4px solid var(--tv-player2);
  flex-direction: row-reverse;
  text-align: right;
}

.tv-player-name {
  font-size: 18px;
  font-weight: bold;
  color: var(--tv-text);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tv-player.player1 .tv-player-name {
  color: var(--tv-player1);
}

.tv-player.player2 .tv-player-name {
  color: var(--tv-player2);
}

/* ============================================
   Stats (HP, Gold, Cards)
   ============================================ */
.tv-stats {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: var(--tv-text-muted);
}

.tv-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tv-stat-icon {
  font-size: 16px;
}

.tv-hp {
  color: #e74c3c;
}

.tv-hp.critical {
  animation: pulse-red 0.5s infinite;
}

.tv-gold {
  color: #f1c40f;
}

.tv-cards {
  color: #9b59b6;
}

/* ============================================
   VS Divider & Timer
   ============================================ */
.tv-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.tv-vs {
  font-size: 24px;
  font-weight: bold;
  color: var(--tv-text);
  font-family: var(--tv-font-display);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.tv-timer {
  font-size: 20px;
  font-family: var(--tv-font-display);
  color: var(--tv-text);
  padding: 5px 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
}

.tv-timer.warning {
  color: #f1c40f;
  animation: pulse-yellow 1s infinite;
}

.tv-timer.critical {
  color: #e74c3c;
  animation: pulse-red 0.5s infinite;
}

/* ============================================
   Turn Indicator
   ============================================ */
.tv-turn {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  font-family: var(--tv-font);
  color: var(--tv-text);
  background: var(--tv-bg);
  padding: 8px 25px;
  border-radius: 20px;
  border: 1px solid var(--tv-border);
  z-index: 999;
}

.tv-turn .turn-number {
  font-weight: bold;
  color: var(--tv-primary);
}

.tv-turn .current-player {
  color: var(--tv-secondary);
}

/* ============================================
   Action Log
   ============================================ */
.tv-log {
  position: fixed;
  right: 10px;
  top: 100px;
  width: 250px;
  max-height: 400px;
  background: var(--tv-bg);
  border: 1px solid var(--tv-border);
  border-radius: 10px;
  overflow: hidden;
  z-index: 998;
  font-family: var(--tv-font);
}

.tv-log-header {
  padding: 10px 15px;
  background: var(--tv-bg-alt);
  border-bottom: 1px solid var(--tv-border);
  font-weight: bold;
  color: var(--tv-text);
}

.tv-log-entries {
  max-height: 350px;
  overflow-y: auto;
  padding: 10px;
}

.tv-log-entry {
  padding: 8px 10px;
  margin-bottom: 5px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  font-size: 13px;
  color: var(--tv-text-muted);
  border-left: 3px solid transparent;
  transition: var(--tv-transition);
}

.tv-log-entry:first-child {
  background: rgba(255, 255, 255, 0.1);
  color: var(--tv-text);
}

.tv-log-entry.player1 {
  border-left-color: var(--tv-player1);
}

.tv-log-entry.player2 {
  border-left-color: var(--tv-player2);
}

.tv-log-entry.system {
  border-left-color: var(--tv-secondary);
  font-style: italic;
}

/* ============================================
   Victory/Defeat Overlay
   ============================================ */
.tv-result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  z-index: 2000;
  opacity: 0;
  animation: fadeIn 0.5s forwards;
}

.tv-result-content {
  text-align: center;
  transform: scale(0.8);
  animation: scaleIn 0.5s 0.2s forwards;
}

.tv-result-title {
  font-size: 48px;
  font-family: var(--tv-font-display);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 5px;
  margin-bottom: 20px;
}

.tv-result-title.victory {
  color: #2ecc71;
  text-shadow: 0 0 30px rgba(46, 204, 113, 0.5);
}

.tv-result-title.defeat {
  color: #e74c3c;
  text-shadow: 0 0 30px rgba(231, 76, 60, 0.5);
}

.tv-result-players {
  font-size: 24px;
  color: var(--tv-text);
}

/* ============================================
   Animaciones
   ============================================ */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes pulse-yellow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ============================================
   Scrollbar personalizado
   ============================================ */
.tv-log-entries::-webkit-scrollbar {
  width: 6px;
}

.tv-log-entries::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.tv-log-entries::-webkit-scrollbar-thumb {
  background: var(--tv-primary);
  border-radius: 3px;
}

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 1200px) {
  .tv-header {
    padding: 8px 15px;
    gap: 10px;
  }
  
  .tv-player {
    min-width: 150px;
    padding: 8px 12px;
  }
  
  .tv-player-name {
    font-size: 14px;
  }
  
  .tv-log {
    width: 200px;
  }
}
```

---

## Componentes del Overlay

### 1. Header Bar

Barra superior con información de ambos jugadores.

```javascript
const HeaderBar = {
    create() {
        return $(`
            <div class="tv-header">
                <div class="tv-player player1">
                    <div class="tv-player-info">
                        <div class="tv-player-name"></div>
                        <div class="tv-stats">
                            <span class="tv-stat tv-hp">❤️ <span class="value">30/30</span></span>
                            <span class="tv-stat tv-gold">💰 <span class="value">3</span></span>
                            <span class="tv-stat tv-cards">🃏 <span class="value">4</span></span>
                        </div>
                    </div>
                </div>
                <div class="tv-center">
                    <div class="tv-vs">VS</div>
                    <div class="tv-timer">1:30</div>
                </div>
                <div class="tv-player player2">
                    <!-- Espejado de player1 -->
                </div>
            </div>
        `);
    },
    
    update(player1Data, player2Data) {
        // Actualizar valores
    }
};
```

### 2. Turn Indicator

Indicador del turno actual.

```javascript
const TurnIndicator = {
    create() {
        return $(`
            <div class="tv-turn">
                Turno <span class="turn-number">1</span> - 
                <span class="current-player">Player1</span>
            </div>
        `);
    },
    
    update(turnNumber, currentPlayerName) {
        $('.tv-turn .turn-number').text(turnNumber);
        $('.tv-turn .current-player').text(currentPlayerName);
    }
};
```

### 3. Action Log

Panel de historial de acciones.

```javascript
const ActionLog = {
    maxEntries: 10,
    
    create() {
        return $(`
            <div class="tv-log">
                <div class="tv-log-header">📋 Historial</div>
                <div class="tv-log-entries"></div>
            </div>
        `);
    },
    
    addEntry(text, playerClass = '') {
        const entry = $(`<div class="tv-log-entry ${playerClass}">${text}</div>`);
        entry.css('animation', 'slideIn 0.3s ease');
        
        const container = $('.tv-log-entries');
        container.prepend(entry);
        
        // Limitar entradas
        while (container.children().length > this.maxEntries) {
            container.children().last().remove();
        }
    }
};
```

### 4. Victory/Defeat Overlay

Pantalla de resultado final.

```javascript
const ResultOverlay = {
    show(isVictory, winner, loser) {
        const overlay = $(`
            <div class="tv-result-overlay">
                <div class="tv-result-content">
                    <div class="tv-result-title ${isVictory ? 'victory' : 'defeat'}">
                        ${isVictory ? '¡VICTORIA!' : 'DERROTA'}
                    </div>
                    <div class="tv-result-players">
                        ${winner} venció a ${loser}
                    </div>
                </div>
            </div>
        `);
        
        $('body').append(overlay);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            overlay.fadeOut(500, () => overlay.remove());
        }, 5000);
    }
};
```

---

## Sistema de Settings

### Categorías de Settings

```javascript
const SETTINGS_CATEGORIES = {
    GENERAL: 'Tournament View',
    TEMPLATES: 'Plantillas',
    COMPONENTS: 'Componentes',
    APPEARANCE: 'Apariencia',
};
```

### Settings del Plugin

```javascript
// Activar/Desactivar
settings.add({
    key: 'tv.enabled',
    name: 'Activar Tournament View',
    type: 'boolean',
    default: true,
    category: SETTINGS_CATEGORIES.GENERAL,
});

// Selector de plantilla
settings.add({
    key: 'tv.template',
    name: 'Plantilla activa',
    type: 'select',
    data: ['esports-moderno', 'minimal', 'classic'],
    default: 'esports-moderno',
    category: SETTINGS_CATEGORIES.TEMPLATES,
    onChange: (newVal) => TemplateManager.apply(newVal),
});

// Importar plantilla
settings.add({
    key: 'tv.import',
    name: 'Importar plantilla',
    type: 'text',
    default: '',
    category: SETTINGS_CATEGORIES.TEMPLATES,
    note: 'Pega el JSON de la plantilla aquí',
    onChange: (json) => {
        if (json) {
            try {
                TemplateManager.import(JSON.parse(json));
            } catch (e) {
                plugin.toast({ title: 'Error', text: 'JSON inválido' });
            }
        }
    },
});

// Componentes individuales
settings.add({
    key: 'tv.components.header',
    name: 'Mostrar Header Bar',
    type: 'boolean',
    default: true,
    category: SETTINGS_CATEGORIES.COMPONENTS,
});

settings.add({
    key: 'tv.components.log',
    name: 'Mostrar Log de acciones',
    type: 'boolean',
    default: true,
    category: SETTINGS_CATEGORIES.COMPONENTS,
});

settings.add({
    key: 'tv.components.timer',
    name: 'Mostrar Temporizador',
    type: 'boolean',
    default: true,
    category: SETTINGS_CATEGORIES.COMPONENTS,
});

// Personalización
settings.add({
    key: 'tv.colors.primary',
    name: 'Color primario',
    type: 'color',
    default: '#4a90d9',
    category: SETTINGS_CATEGORIES.APPEARANCE,
    onChange: (color) => updateCSSVariable('--tv-primary', color),
});

settings.add({
    key: 'tv.opacity',
    name: 'Opacidad del overlay',
    type: 'slider',
    data: { min: 50, max: 100, step: 5 },
    default: 95,
    category: SETTINGS_CATEGORIES.APPEARANCE,
});
```

---

## Flujo de Datos

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                         INICIALIZACIÓN                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Registrar Plugin                                             │
│  2. Cargar Settings                                              │
│  3. Cargar Plantilla activa                                      │
│  4. Inyectar CSS                                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENTO: GameStart                             │
│  - Verificar que estamos en Spectate                            │
│  - Crear estructura del overlay                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EVENTO: connect                               │
│  - Parsear datos de jugadores                                   │
│  - Inicializar estado del juego                                 │
│  - Renderizar overlay con datos iniciales                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUCLE DE EVENTOS                              │
├─────────────────────────────────────────────────────────────────┤
│  getTurnStart      → Actualizar indicador de turno             │
│  getUpdatePlayerHp → Actualizar HP en header                    │
│  getPlayersStats   → Actualizar oro, cartas                     │
│  getCardBoard      → Añadir entrada al log                      │
│  getSpellPlayed    → Añadir entrada al log                      │
│  getFight          → Añadir entrada al log                      │
│  ...               → Procesar según tipo                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              EVENTO: getVictory/getDefeat/getResult             │
│  - Mostrar overlay de resultado                                 │
│  - Animación de victoria/derrota                                │
│  - Limpiar después de X segundos                                │
└─────────────────────────────────────────────────────────────────┘
```

### Estado del Juego

```javascript
const GameState = {
    players: {},       // { [id]: PlayerData }
    currentTurn: 0,
    whoseTurn: null,
    timeRemaining: 0,
    board: [],
    
    init(connectData) {
        const you = JSON.parse(connectData.you);
        const enemy = JSON.parse(connectData.enemy);
        const golds = JSON.parse(connectData.golds);
        
        this.players[you.id] = {
            ...you,
            gold: golds[you.id],
            isPlayer1: true
        };
        
        this.players[enemy.id] = {
            ...enemy,
            gold: golds[enemy.id],
            isPlayer1: false
        };
        
        this.currentTurn = connectData.turn || 1;
        this.whoseTurn = connectData.userTurn;
    },
    
    updateHP(playerId, newHP) {
        if (this.players[playerId]) {
            this.players[playerId].hp = newHP;
        }
    },
    
    // ... más métodos
};
```

---

## Extensibilidad Futura

### Fase 4: Integraciones (Roadmap)

#### Integración con Challonge

```javascript
// Ejemplo de estructura futura
const ChallongeIntegration = {
    enabled: false,
    tournamentId: null,
    
    async connect(tournamentUrl) {
        // Obtener datos del torneo
    },
    
    async updateMatch(winnerId) {
        // Actualizar resultado en Challonge
    },
    
    renderBracket() {
        // Mostrar bracket del torneo
    }
};
```

#### Exportación de Datos

```javascript
// Estructura para exportar partida
const MatchExport = {
    toJSON() {
        return {
            gameId: currentGameId,
            players: GameState.players,
            turns: recordedTurns,
            result: gameResult,
            duration: gameDuration,
            actions: actionLog
        };
    },
    
    toCSV() {
        // Formato CSV para estadísticas
    }
};
```

### Nuevas Plantillas

El sistema de plantillas permite añadir fácilmente nuevos estilos:

- **Minimal**: Interfaz minimalista, solo información esencial
- **Classic**: Estilo retro, inspirado en juegos de cartas clásicos
- **Stream**: Optimizado para streaming, con áreas para cámara
- **Custom**: Plantilla base para personalización completa

---

## 📚 Referencias

- [Documentación de TamperMonkey](01_TAMPERMONKEY.md)
- [API de Plugins de UnderScript](02_UNDERSCRIPT_PLUGIN_API.md)
- [Eventos del Juego](03_EVENTOS_JUEGO.md)
- [Variables Globales](04_VARIABLES_GLOBALES.md)
- [Librerías Incluidas](05_LIBRERIAS_INCLUIDAS.md)

---

[← Anterior: Librerías Incluidas](05_LIBRERIAS_INCLUIDAS.md) | [Volver al README →](../README.md)
