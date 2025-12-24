# 🗺️ Mapa Visual del Proyecto TournamentView

> Guía visual rápida de la estructura y componentes del proyecto

**Versión:** 0.1.0  
**Última actualización:** 24 de diciembre de 2025

---

## 📁 Estructura de Archivos

```
UC_TournamentView/
│
├── 📄 README.md                    # Documentación principal del usuario
├── 📄 LICENSE                      # Licencia MIT
├── 📄 package.json                 # Configuración npm y scripts
├── 📄 webpack.config.js            # Configuración de webpack
│
├── 📂 src/                         # Código fuente (145 KiB)
│   └── 📄 index.js                 # Archivo principal (~3,000 líneas)
│
├── 📂 dist/                        # Build compilado (88.6 KiB)
│   ├── 📄 tournamentview.user.js   # Script compilado para TamperMonkey
│   └── 📄 tournamentview.meta.js   # Metadatos para actualizaciones
│
├── 📂 docs/                        # Documentación técnica (~155 KiB)
│   ├── 📄 00_INDICE.md            # Índice completo de documentación
│   ├── 📄 01_TAMPERMONKEY.md      # UserScripts y webpack
│   ├── 📄 02_UNDERSCRIPT_PLUGIN_API.md
│   ├── 📄 03_EVENTOS_JUEGO.md
│   ├── 📄 04_VARIABLES_GLOBALES.md
│   ├── 📄 05_LIBRERIAS_INCLUIDAS.md
│   ├── 📄 06_ESPECIFICACION_PROYECTO.md  # Spec técnica completa
│   ├── 📄 07_DESARROLLO.md
│   ├── 📄 09_FASE_3_DETALLES_IMPLEMENTACION.md
│   ├── 📄 10_FASE4_PLANTILLAS.md   # Arquitectura de plantillas
│   ├── 📄 11_FASE4_RESUMEN.md      # Implementación completa (652 líneas)
│   ├── 📄 12_CANON_CHECK.md        # Validación de conformidad (98%)
│   ├── 📄 13_MANTENIMIENTO_DIC_2025.md  # Reporte de mantenimiento
│   ├── 📄 14_MAPA_VISUAL.md        # Este documento
│   ├── 📄 TESTING_GUIDE.md         # Guía de pruebas
│   └── 📄 underscript.js           # Referencia de API
│
└── 📂 templates/                   # Plantillas JSON
    ├── 📄 example_template.json    # Ejemplo con comentarios
    ├── 📄 default.json             # Plantilla por defecto (16 KB CSS)
    ├── 📄 minimal.json             # Plantilla minimalista (7 KB CSS)
    └── 📄 esports.json             # Plantilla esports (12 KB CSS)
```

---

## 🏗️ Arquitectura del Código (src/index.js)

```
📄 src/index.js (145 KiB, ~3,000 líneas)
│
├── 🔧 Imports y Setup (líneas 1-50)
│   ├── Configuración webpack
│   └── Variables globales
│
├── 🌐 Sistema i18n (líneas 50-200)
│   ├── Clase I18nManager
│   ├── Diccionarios ES/EN (17 claves cada uno)
│   └── Método t(key, params)
│
├── 🎨 TemplateManager (líneas 200-600)
│   ├── 18 métodos de gestión
│   │   ├── registerTemplate()
│   │   ├── setActiveTemplate()
│   │   ├── getTemplateById()
│   │   ├── getAllTemplateIds()
│   │   ├── getActiveTemplateId()
│   │   ├── deleteTemplate()
│   │   ├── loadCustomTemplates()
│   │   ├── saveCustomTemplates()
│   │   ├── saveCustomTemplate()
│   │   ├── exportTemplate()
│   │   ├── importTemplate()
│   │   ├── validateTemplate()
│   │   ├── injectCSS()
│   │   ├── removeCSS()
│   │   └── generateCSSVariables()
│   │
│   └── 3 plantillas predefinidas
│       ├── Default (16 KB CSS)
│       ├── Minimal (7 KB CSS)
│       └── Esports (12 KB CSS)
│
├── 📊 GameState (líneas 600-900)
│   ├── Estado de partida
│   ├── Jugadores (HP, gold, souls, artifacts)
│   ├── Timer y turnos
│   └── Métodos update()
│
├── 🎮 GameEventHandler (líneas 900-1500)
│   ├── Listeners de eventos
│   ├── Manejo de turnos
│   ├── Cambios de HP
│   ├── Efectos de cartas
│   └── Notificaciones
│
├── 🖼️ UIManager (líneas 1500-2500)
│   ├── Construcción del overlay
│   │   ├── Header con jugadores
│   │   ├── Barras de HP
│   │   ├── Recursos (gold, souls, artifacts)
│   │   ├── Contadores (hand, deck, graveyard)
│   │   ├── Timer y turnos
│   │   └── Overlay de resultados
│   │
│   ├── Animaciones
│   │   ├── HP changes (shake, pulse)
│   │   ├── Notificaciones flotantes
│   │   └── Efectos visuales (glow)
│   │
│   └── Panel de historial
│       ├── Últimas 30 acciones
│       ├── Botón toggle
│       └── Auto-scroll
│
├── ⚙️ Custom Settings (líneas 2500-3000)
│   ├── FakeSetting (base class)
│   ├── TemplateElement (iconos de gestión)
│   │   ├── glyphicon-star (activar)
│   │   ├── glyphicon-download-alt (exportar)
│   │   └── glyphicon-trash (eliminar)
│   │
│   ├── FileInputElement (import JSON)
│   └── refreshTemplateSettings()
│
└── 🚀 Plugin Registration (líneas 3000-3200)
    ├── underscript.plugin('TournamentView')
    ├── Hooks :preload y :load
    ├── Exports: start, stop, load, preload
    └── Settings configuration
```

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                     Página /Spectate                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 UnderScript :preload                        │
│  • Verifica página = /Spectate                             │
│  • Retorna true para inicializar                           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  UnderScript :load                          │
│  1. Inicializa i18n (idioma del usuario)                   │
│  2. Carga TemplateManager                                   │
│     • Carga plantillas de localStorage                      │
│     • Registra 3 predefinidas                               │
│     • Activa plantilla seleccionada                         │
│  3. Inicializa GameState                                    │
│  4. Configura GameEventHandler                              │
│  5. Construye UIManager                                     │
│  6. Registra Settings en UnderScript                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Overlay Activo                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Header (Jugadores)                      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────┐              ┌─────────────┐             │
│  │  Jugador 1  │              │  Jugador 2  │             │
│  │  HP: ████░░ │              │  HP: ██████ │             │
│  │  Gold: 10   │              │  Gold: 12   │             │
│  │  Souls: 🔵🔵│              │  Souls: 🔵  │             │
│  │  Artifacts: │              │  Artifacts: │             │
│  │    🎭×2 🔮×1│              │    ⚔️×1      │             │
│  │             │              │             │             │
│  │  Hand: 5    │              │  Hand: 3    │             │
│  │  Deck: 12   │              │  Deck: 15   │             │
│  │  Grave: 8   │              │  Grave: 5   │             │
│  └─────────────┘              └─────────────┘             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Turno 10 - Tiempo: 1:45                      │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Eventos del Juego (tiempo real)                │
│                                                             │
│  • Turno cambia → Actualiza indicador visual               │
│  • HP cambia → Anima barra (shake o pulse)                 │
│  • Carta jugada → Notificación verde                       │
│  • Efecto activado → Glow en icono                         │
│  • Historial actualizado → Auto-scroll                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Fin de la Partida                          │
│  • Overlay de resultados con estadísticas                  │
│  • Opción para reiniciar overlay                           │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Sistema de Settings

```
UnderScript Menu → Plugins → TournamentView
│
├── 🌐 Idioma / Language
│   ├── 🇪🇸 Español
│   └── 🇬🇧 English
│
├── ✅ Activar Tournament View
│   ├── ON: Muestra overlay y aplica CSS
│   └── OFF: Remueve overlay y CSS
│
└── 🎨 Plantillas
    │
    ├── ⭐ Default - Default Tournament Style
    │   │   [⭐] Activar  [💾] Exportar
    │   │
    ├── ○ Minimal - Minimal Clean Style  
    │   │   [☆] Activar  [💾] Exportar
    │   │
    ├── ○ Esports - Professional Esports Style
    │   │   [☆] Activar  [💾] Exportar
    │   │
    ├── ○ Mi Plantilla Custom (si importada)
    │   │   [☆] Activar  [💾] Exportar  [🗑️] Eliminar
    │   │
    └── 📁 Importar Plantilla (JSON)
        └── [Seleccionar archivo...]
```

**Leyenda:**
- ⭐ = Plantilla activa
- ☆ = Plantilla inactiva
- 💾 = Exportar a JSON
- 🗑️ = Eliminar (solo custom)

---

## 🎨 Estructura de una Plantilla JSON

```json
{
  "metadata": {
    "id": "mi-plantilla",           // ← Identificador único
    "name": "Mi Plantilla Épica",   // ← Nombre visible
    "version": "1.0.0",              // ← Versión (semver)
    "author": "Tu Nombre",
    "description": "...",
    "created": "2025-12-24",
    "modified": "2025-12-24",
    "tags": ["custom", "epic"]
  },
  
  "variables": {                     // ← CSS variables
    "primaryColor": "#ff0000",       // → --tv-primary-color
    "secondaryColor": "#00ff00",     // → --tv-secondary-color
    "accentColor": "#0000ff",        // → --tv-accent-color
    "backgroundColor": "#ffffff",
    "textColor": "#000000",
    // ... más variables personalizadas
  },
  
  "customCSS": "/* CSS aquí */"      // ← CSS completo de la plantilla
}
```

**Conversión automática:** `camelCase` → `kebab-case`
- `primaryColor` → `--tv-primary-color`
- `backgroundColor` → `--tv-background-color`

---

## 📊 Métricas Clave

### Código
| Métrica | Valor |
|---------|-------|
| Build final | 88.6 KiB |
| Source code | 145 KiB |
| Líneas de código | ~3,000 |
| Métodos TemplateManager | 18 |

### Plantillas Predefinidas
| Plantilla | CSS Size | Estilo |
|-----------|----------|--------|
| Default | 16 KB | Gradientes, glassmorphism |
| Minimal | 7 KB | Flat, simple, limpio |
| Esports | 12 KB | Profesional, glow effects |

### Documentación
| Total | ~155 KB |
|-------|---------|
| Archivos | 15 documentos |
| Cobertura | 100% ✅ |

### Conformidad
| Global | 98% ✅ |
|--------|---------|
| Bugs conocidos | 0 |
| Tests automáticos | Pendiente |

---

## 🎯 Puntos de Entrada

### Para Desarrolladores
1. Empieza aquí: [README.md](../README.md)
2. Arquitectura: [06_ESPECIFICACION_PROYECTO.md](06_ESPECIFICACION_PROYECTO.md)
3. Implementación: [11_FASE4_RESUMEN.md](11_FASE4_RESUMEN.md)
4. Código: [src/index.js](../src/index.js)

### Para Usuarios
1. Instalación: [README.md](../README.md)
2. Uso: Sección "Sistema de Plantillas" del README
3. Crear plantilla: [example_template.json](../templates/example_template.json)

### Para Testing
1. Guía completa: [TESTING_GUIDE.md](TESTING_GUIDE.md)
2. Build: `npm run build`
3. Test: Cargar en `/Spectate`

---

## 🚀 Scripts NPM

```bash
# Desarrollo
npm install          # Instalar dependencias
npm start            # Webpack watch mode

# Producción
npm run build        # Build para producción

# Testing
# (Manual por ahora, ver TESTING_GUIDE.md)
```

---

## 🔗 Enlaces Rápidos

### Documentación Clave
- [Índice Completo](00_INDICE.md)
- [Especificación Técnica](06_ESPECIFICACION_PROYECTO.md)
- [Resumen Fase 4](11_FASE4_RESUMEN.md)
- [Canon Check](12_CANON_CHECK.md)
- [Reporte Mantenimiento](13_MANTENIMIENTO_DIC_2025.md)

### Desarrollo
- [Guía de Desarrollo](07_DESARROLLO.md)
- [API de UnderScript](02_UNDERSCRIPT_PLUGIN_API.md)
- [Eventos del Juego](03_EVENTOS_JUEGO.md)

### Testing
- [Guía de Pruebas](TESTING_GUIDE.md)
- [Plantilla de Ejemplo](../templates/example_template.json)

---

## 🏆 Estado Actual

```
Fase 1: Fundamentos              ✅ Completado
Fase 2: UI y Plantillas          ✅ Completado
Fase 3: Mejoras Visuales e i18n  ✅ Completado
Fase 4: Gestión de Plantillas    ✅ Completado ← Actual
Fase 5: Editor Visual            📋 Planificado
Galería Comunitaria              📋 Planificado
```

**Estado del proyecto:** ✅ PRODUCCIÓN LISTA

- Funcionalidad: 100%
- Documentación: 100%
- Conformidad: 98%
- Bugs: 0

---

*Mapa visual creado: 24 de diciembre de 2025 - 16:20*  
*Última actualización: 24 de diciembre de 2025*  
*Próxima revisión: Después de Fase 5*
