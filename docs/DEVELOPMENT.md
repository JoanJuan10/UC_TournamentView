# 🛠️ Guía de Desarrollo

Para los que quieren tocar el código.

## Índice

- [Preparar el entorno](#preparar-el-entorno)
- [Cómo está organizado](#cómo-está-organizado)
- [Sistema de plantillas](#sistema-de-plantillas)
- [Sistema i18n](#sistema-i18n)
- [Desarrollo día a día](#desarrollo-día-a-día)
- [Testing](#testing)
- [Compilar y distribuir](#compilar-y-distribuir)
- [Debugging](#debugging)

---

## Preparar el entorno

### Lo que necesitas

- **Node.js**: v14+
- **npm**: v6+
- **Git**
- **Editor**: VS Code recomendado (pero usa el que quieras)

### Instalación

```bash
# Clonar
git clone https://github.com/JoanJuan10/UC_TournamentView.git
cd UC_TournamentView

# Instalar dependencias
npm install

# Modo dev (recompila automáticamente)
npm run dev

# Compilar para release
npm run build
```

### Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Watch mode - recarga al guardar |
| `npm run build` | Compila para producción |
| `npm run lint` | Revisa el código |

---

## Cómo está organizado

### Estructura de Directorios

```
UC_TournamentView/
│
├── src/
│   └── index.js              # Código fuente principal (4900+ líneas)
│
├── templates/
│   ├── spectator_immersive_final.json     # Plantilla principal ⭐
│   ├── classic_spectator.json             # Plantilla clásica
│   └── dark_mode_pro.json                 # Plantilla oscura
│
├── dist/
│   └── tournamentview.user.js             # Script compilado (~102 KiB)
│
├── docs/
│   ├── USER_GUIDE.md                      # Guía de usuario
│   ├── DEVELOPMENT.md                     # Esta guía
│   ├── TEMPLATE_GUIDE.md                  # Crear plantillas
│   └── API.md                             # Referencia de API
│
├── webpack.config.js          # Configuración de Webpack
├── package.json               # Dependencias y scripts
├── LICENSE                    # MIT License
└── README.md                  # Documentación principal
```

### Flujo de Datos

```
Undercards Game Events
         ↓
  UnderScript Bridge
         ↓
  Event Handlers (index.js)
         ↓
    UIManager V2
         ↓
  DOM Injection / Update
         ↓
   Template Rendering
```

---

## Arquitectura del Código

### Clase Principal: UIManager

**Ubicación**: `src/index.js`  
**Líneas**: ~2000-3500

#### Responsabilidades

1. **Inyección del DOM**:
   - Genera el HTML del overlay dinámicamente
   - Aplica el CSS de la plantilla activa
   - Gestiona el ciclo de vida del overlay

2. **Actualización de Datos**:
   - Escucha eventos de Undercards
   - Actualiza elementos DOM en tiempo real
   - Gestiona animaciones y transiciones

3. **Sistema de Plantillas**:
   - Carga y valida plantillas JSON
   - Aplica variables dinámicas (`{{VAR}}`)
   - Gestiona importación/exportación

#### Métodos Clave

```javascript
class UIManager {
  // Ciclo de vida
  init()                           // Inicializa el overlay
  destroy()                        // Limpia el overlay
  refresh()                        // Regenera el overlay
  
  // Inyección de DOM
  injectOverlay()                  // Inyecta HTML en el DOM
  injectStyles()                   // Aplica CSS de la plantilla
  
  // Actualización de datos
  updatePlayerHP(hp, maxHP)        // Actualiza vida del jugador
  updateOpponentHP(hp, maxHP)      // Actualiza vida del oponente
  updateGold(player, gold)         // Actualiza oro
  updateCardCount(player, type, count)  // Actualiza contador de cartas
  updateTurn(turn)                 // Actualiza número de turno
  updateTimer(seconds)             // Actualiza timer
  
  // Historial y notificaciones
  addLogEntry(type, message, icon) // Agrega entrada al historial
  showFloatingNotification(msg, type) // Muestra notificación flotante
  
  // Plantillas
  loadTemplate(id)                 // Carga una plantilla por ID
  applyTemplateVariables(css)      // Aplica variables dinámicas
  validateTemplate(template)       // Valida estructura JSON
  exportTemplate(id)               // Exporta plantilla como JSON
  importTemplate(json)             // Importa plantilla desde JSON
}
```

### Clase i18n

**Ubicación**: `src/index.js`  
**Líneas**: ~100-300

#### Sistema de Traducciones

```javascript
class I18n {
  constructor() {
    this.translations = {
      es: { /* traducciones en español */ },
      en: { /* traducciones en inglés */ }
    };
    this.currentLang = 'es';
  }
  
  // Obtiene una traducción con interpolación
  t(key, data = {}) {
    const text = this.translations[this.currentLang][key];
    return this.interpolate(text, data);
  }
  
  // Interpola variables en el texto
  interpolate(text, data) {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }
  
  // Cambia el idioma activo
  setLanguage(lang) {
    this.currentLang = lang;
    // Regenera el overlay con el nuevo idioma
  }
}
```

#### Agregar Nuevas Traducciones

```javascript
// En el constructor de I18n
this.translations = {
  es: {
    // ... traducciones existentes
    'newFeature.title': 'Nueva Funcionalidad',
    'newFeature.description': 'Esto hace {{action}}',
  },
  en: {
    // ... traducciones existentes
    'newFeature.title': 'New Feature',
    'newFeature.description': 'This does {{action}}',
  }
};

// Uso en el código
const text = i18n.t('newFeature.description', { action: 'algo increíble' });
// Resultado (es): "Esto hace algo increíble"
// Resultado (en): "This does algo increíble"
```

### Event Handlers

**Ubicación**: `src/index.js`  
**Líneas**: ~3500-4500

#### Eventos Capturados

```javascript
// Eventos de cartas
Game.on('getCardPlayed', (data) => {
  const { player, card } = data;
  const message = i18n.t('notif.cardPlayed', { player, card });
  uiManager.showFloatingNotification(message, 'card-played');
  uiManager.addLogEntry('card', message, '🎴');
});

// Eventos de combate
Game.on('getMonsterDestroyed', (data) => {
  const message = i18n.t('notif.monsterDestroyed');
  uiManager.showFloatingNotification(message, 'monster-destroyed');
  uiManager.addLogEntry('destroy', message, '💥');
});

// Eventos de efectos
Game.on('Log:ARTIFACT_EFFECT', (data) => {
  const { artifact } = data;
  const message = i18n.t('notif.artifactActivated', { artifact });
  uiManager.showFloatingNotification(message, 'artifact');
  uiManager.addLogEntry('artifact', message, '🔮');
});

// Eventos de estado
Game.on('getHPChanged', (data) => {
  if (data.player === 'player') {
    uiManager.updatePlayerHP(data.hp, data.maxHP);
  } else {
    uiManager.updateOpponentHP(data.hp, data.maxHP);
  }
});
```

#### Agregar Nuevos Eventos

```javascript
// 1. Captura el evento de Undercards
Game.on('YourNewEvent', (data) => {
  
  // 2. Extrae los datos necesarios
  const { someData } = data;
  
  // 3. Crea el mensaje con i18n
  const message = i18n.t('notif.yourEvent', { someData });
  
  // 4. Muestra notificación flotante (opcional)
  uiManager.showFloatingNotification(message, 'your-event-type');
  
  // 5. Agrega entrada al historial (opcional)
  uiManager.addLogEntry('your-event', message, '🆕');
  
  // 6. Actualiza el DOM si es necesario
  uiManager.updateSomeElement(someData);
});
```

---

## Sistema de Plantillas

### Estructura JSON

```json
{
  "metadata": {
    "id": "my-custom-template",
    "name": "My Custom Template",
    "version": "1.0.0",
    "author": "Your Name",
    "description": "A beautiful custom template",
    "isDefault": false
  },
  
  "variables": {
    "primaryColor": "#6a0dad",
    "secondaryColor": "#00bcd4",
    "backgroundColor": "rgba(0, 0, 0, 0.85)",
    "fontFamily": "'Segoe UI', sans-serif"
  },
  
  "customCSS": "/* CSS aquí */"
}
```

### Variables Dinámicas

Las variables se definen en `variables` y se usan en `customCSS`:

```json
{
  "variables": {
    "primaryColor": "#ff5722"
  },
  "customCSS": ".tv-panel { background: {{primaryColor}}; }"
}
```

**Resultado compilado**:
```css
.tv-panel { background: #ff5722; }
```

### Clases CSS Disponibles

#### Estructura Principal

```css
.tv-overlay            /* Contenedor principal */
.tv-player-info        /* Panel del jugador (abajo) */
.tv-opponent-info      /* Panel del oponente (arriba) */
.tv-center-info        /* Indicador de turno (izquierda) */
.tv-log-container      /* Historial de acciones (derecha) */
```

#### Componentes de Paneles

```css
.tv-player-name        /* Nombre del jugador */
.tv-soul               /* Alma con imagen */
.tv-hp                 /* HP con barra visual */
.tv-gold               /* Oro actual */
.tv-artifacts          /* Artefactos con contador */
.tv-card-counts        /* Contadores de cartas */
```

#### Historial

```css
.tv-log-button         /* Botón flotante para abrir/cerrar */
.tv-log-panel          /* Panel desplegable */
.tv-log-header         /* Encabezado del historial */
.tv-log-entries        /* Contenedor de entradas */
.tv-log-entry          /* Una entrada individual */
```

#### Notificaciones

```css
.tv-notification       /* Notificación flotante */
.notif-card-played     /* Tipo: carta jugada */
.notif-spell-cast      /* Tipo: hechizo lanzado */
.notif-monster-destroyed /* Tipo: monstruo destruido */
.notif-artifact        /* Tipo: efecto de artefacto */
.notif-soul            /* Tipo: efecto de alma */
```

### Agregar una Nueva Plantilla

1. **Crea el archivo JSON** en `templates/`:

```json
{
  "metadata": {
    "id": "retro-arcade",
    "name": "Retro Arcade",
    "version": "1.0.0",
    "author": "YourName",
    "description": "8-bit retro style",
    "isDefault": false
  },
  
  "variables": {
    "primaryColor": "#00ff00",
    "secondaryColor": "#ffff00",
    "font": "'Press Start 2P', monospace"
  },
  
  "customCSS": `
    .tv-overlay {
      font-family: {{font}};
      image-rendering: pixelated;
    }
    
    .tv-panel {
      background: #000;
      border: 4px solid {{primaryColor}};
      box-shadow: 0 0 20px {{primaryColor}};
    }
    
    /* ... más estilos ... */
  `
}
```

2. **Registra la plantilla** en `src/index.js`:

```javascript
const defaultTemplates = [
  // ... plantillas existentes
  {
    id: 'retro-arcade',
    name: 'Retro Arcade',
    version: '1.0.0',
    isDefault: false,
    isActive: false,
    filePath: 'templates/retro_arcade.json'
  }
];
```

3. **Compila y prueba**:

```bash
npm run build
```

---

## Sistema i18n

### Agregar Nuevos Idiomas

Actualmente soportamos ES y EN. Para agregar un nuevo idioma:

```javascript
class I18n {
  constructor() {
    this.translations = {
      es: { /* ... */ },
      en: { /* ... */ },
      fr: {  // Nuevo idioma: Francés
        'app.title': 'Vue de Tournoi',
        'turn.label': 'Tour',
        'hp.label': 'PV',
        // ... todas las traducciones
      }
    };
  }
}
```

### Keys de Traducción Existentes

```javascript
{
  // Interfaz
  'app.title': 'Vista de Torneo',
  'turn.label': 'Turno',
  'hp.label': 'HP',
  'gold.label': 'Oro',
  'hand.label': 'Mano',
  'deck.label': 'Mazo',
  'grave.label': 'Cementerio',
  
  // Notificaciones
  'notif.cardPlayed': '{{player}} jugó {{card}}',
  'notif.spellCast': '{{player}} usó {{spell}}',
  'notif.monsterDestroyed': 'Monstruo destruido',
  'notif.artifactActivated': '{{artifact}} activado',
  'notif.soulEffect': 'Efecto de {{soul}} activado',
  
  // Historial
  'log.title': 'Historial',
  'log.clear': 'Limpiar',
  'log.empty': 'Sin acciones',
  
  // Settings
  'settings.language': 'Idioma',
  'settings.template': 'Plantilla',
  'settings.export': 'Exportar',
  'settings.import': 'Importar'
}
```

---

## Workflow de Desarrollo

### Flujo Recomendado

1. **Crea una rama para tu feature**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Inicia el modo watch**:
   ```bash
   npm run dev
   ```

3. **Haz cambios en `src/index.js`**

4. **Recarga Undercards** para ver los cambios:
   - Los cambios se compilan automáticamente
   - Recarga la página con `Ctrl + F5`

5. **Prueba en diferentes escenarios**:
   - Diferentes almas
   - Diferentes artefactos
   - Cambios de HP/Oro rápidos
   - Múltiples notificaciones simultáneas

6. **Commitea tus cambios**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-new-feature
   ```

7. **Abre un Pull Request** en GitHub

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new notification type
fix: resolve HP update bug
docs: update README
style: format code
refactor: improve UIManager performance
test: add notification tests
chore: update dependencies
```

---

## Testing

### Testing Manual

1. **Overlay Básico**:
   - ✅ El overlay aparece en modo Spectate
   - ✅ Los paneles se posicionan correctamente
   - ✅ El texto es legible

2. **Actualización de Datos**:
   - ✅ HP se actualiza en tiempo real
   - ✅ Oro se actualiza correctamente
   - ✅ Contadores de cartas funcionan
   - ✅ Timer se sincroniza con el juego

3. **Notificaciones**:
   - ✅ Las notificaciones aparecen
   - ✅ Se apilan correctamente (sin solaparse)
   - ✅ Desaparecen después del timeout
   - ✅ Los textos respetan el idioma seleccionado

4. **Historial**:
   - ✅ El panel se abre/cierra con el botón
   - ✅ Las entradas se añaden en orden
   - ✅ El scroll funciona correctamente
   - ✅ El botón de limpiar funciona

5. **Plantillas**:
   - ✅ Se puede cambiar de plantilla
   - ✅ La plantilla activa se guarda en localStorage
   - ✅ Las plantillas exportadas son válidas
   - ✅ Las plantillas importadas se validan correctamente

### Testing Automatizado (Futuro)

```javascript
// Ejemplo de test con Jest
describe('UIManager', () => {
  test('should update HP correctly', () => {
    const ui = new UIManager();
    ui.updatePlayerHP(15, 30);
    expect(document.querySelector('.tv-hp-value').textContent).toBe('15/30');
  });
});
```

---

## Compilación y Distribución

### Webpack Config

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'tournamentview.user.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'production',
  optimization: {
    minimize: true
  }
};
```

### Metadatos del Userscript

```javascript
// ==UserScript==
// @name         UC_TournamentView
// @namespace    https://github.com/JoanJuan10/UC_TournamentView
// @version      0.1.0
// @description  Professional spectator overlay for Undercards tournaments
// @author       JoanJuan10
// @match        https://undercards.net/*
// @grant        none
// @require      https://underscript.xyz/api/v2
// ==/UserScript==
```

### Build para Producción

```bash
# Limpia dist/
rm -rf dist/

# Compila en modo producción
npm run build

# Verifica el tamaño
ls -lh dist/tournamentview.user.js
# ~102 KiB esperado

# Prueba el archivo compilado
# Instálalo en Tampermonkey y prueba en Undercards
```

---

## Debugging

### Console Logs

El plugin usa prefijo `[TournamentView]` para todos los logs:

```javascript
console.log('[TournamentView] Overlay initialized');
console.warn('[TournamentView] Template validation failed');
console.error('[TournamentView] Failed to load template');
```

### DevTools

1. **Abre DevTools**: `F12`
2. **Ve a Console**: Ver logs del plugin
3. **Ve a Elements**: Inspeccionar el DOM del overlay
4. **Ve a Network**: Ver si las plantillas se cargan correctamente

### Logs Útiles

```javascript
// En UIManager.init()
console.log('[TournamentView] Active template:', this.activeTemplate);

// En event handlers
console.log('[TournamentView] Event received:', eventName, data);

// En updatePlayerHP()
console.log('[TournamentView] HP updated:', hp, '/', maxHP);
```

### Problemas Comunes

#### El overlay no aparece

```javascript
// Verifica que estás en modo Spectate
if (!window.location.href.includes('/Spectate')) {
  console.warn('[TournamentView] Not in spectate mode');
  return;
}
```

#### Los eventos no se capturan

```javascript
// Verifica que Game existe
if (typeof Game === 'undefined') {
  console.error('[TournamentView] Game object not found');
  return;
}

// Verifica que UnderScript está cargado
if (typeof UnderScript === 'undefined') {
  console.error('[TournamentView] UnderScript not loaded');
  return;
}
```

---

## Performance

### Optimizaciones Aplicadas

1. **Debouncing de Eventos**: Los eventos rápidos (HP, Gold) usan debounce
2. **Virtual Scrolling**: El historial usa scroll virtual para >100 entradas
3. **CSS Animations**: Las animaciones usan `transform` y `opacity` (GPU)
4. **DOM Caching**: Los elementos se cachean para evitar `querySelector` repetidos

### Benchmarks

- **Inyección inicial**: ~50ms
- **Actualización de HP**: <5ms
- **Mostrar notificación**: ~10ms
- **Agregar entrada al log**: ~5ms
- **Cambio de plantilla**: ~100ms (regenera el DOM)

---

## Contribuir

Lee [CONTRIBUTING.md](../CONTRIBUTING.md) para:
- Cómo reportar bugs
- Cómo proponer features
- Estilo de código
- Pull Request checklist

---

**¿Dudas? Abre un Issue en GitHub o contacta a los mantenedores.**
