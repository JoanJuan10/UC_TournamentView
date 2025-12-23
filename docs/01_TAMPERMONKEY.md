# 01 - TamperMonkey: Estructura de UserScripts

Guía completa sobre la estructura de UserScripts para TamperMonkey, enfocada en el desarrollo de plugins para UnderScript.

## 📋 Índice

1. [¿Qué es TamperMonkey?](#qué-es-tampermonkey)
2. [Estructura de un UserScript](#estructura-de-un-userscript)
3. [Directivas del Header](#directivas-del-header)
4. [Directivas Específicas para UC_TournamentView](#directivas-específicas-para-uc_tournamentview)
5. [Permisos (@grant)](#permisos-grant)
6. [Momento de Ejecución (@run-at)](#momento-de-ejecución-run-at)
7. [Plantilla Base del Plugin](#plantilla-base-del-plugin)

---

## ¿Qué es TamperMonkey?

TamperMonkey es una extensión de navegador que permite ejecutar **UserScripts** - pequeños programas JavaScript que modifican el comportamiento o apariencia de páginas web.

### Instalación
- [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
- [Página oficial](https://www.tampermonkey.net/)

---

## Estructura de un UserScript

Todo UserScript tiene dos partes principales:

```javascript
// ==UserScript==
// ... directivas del header ...
// ==/UserScript==

// Código JavaScript del script
(function() {
    'use strict';
    // Tu código aquí
})();
```

### Bloque de Metadatos (Header)

El header está delimitado por `// ==UserScript==` y `// ==/UserScript==`. Contiene directivas que definen:

- Nombre y descripción del script
- En qué páginas se ejecuta
- Dependencias externas
- Permisos necesarios
- Información de actualización

---

## Directivas del Header

### Directivas de Identificación

| Directiva | Descripción | Ejemplo |
|-----------|-------------|---------|
| `@name` | Nombre del script | `@name UC_TournamentView` |
| `@namespace` | Identificador único (generalmente URL) | `@namespace https://github.com/tu-usuario/` |
| `@version` | Versión del script (semver) | `@version 1.0.0` |
| `@author` | Autor del script | `@author TuNombre` |
| `@description` | Descripción corta | `@description Vista de torneo para Undercards` |

### Directivas de Localización (i18n)

Puedes añadir traducciones con sufijos de idioma:

```javascript
// @name              UC_TournamentView
// @name:es           Vista de Torneo UC
// @name:fr           Vue Tournoi UC
// @description       Tournament view for Undercards
// @description:es    Vista de torneo para Undercards
```

### Directivas de URLs

| Directiva | Descripción | Ejemplo |
|-----------|-------------|---------|
| `@homepage` | Página principal del proyecto | `@homepage https://github.com/...` |
| `@supportURL` | URL para reportar problemas | `@supportURL https://github.com/.../issues` |
| `@updateURL` | URL del archivo `.meta.js` para actualizaciones | `@updateURL https://.../script.meta.js` |
| `@downloadURL` | URL del script completo | `@downloadURL https://.../script.user.js` |
| `@icon` | Icono del script | `@icon https://undercards.net/favicon.ico` |

### Directivas de Coincidencia de URLs

| Directiva | Descripción | Ejemplo |
|-----------|-------------|---------|
| `@match` | Patrón de URLs donde se ejecuta | `@match https://*.undercards.net/*` |
| `@exclude` | Patrón de URLs a excluir | `@exclude https://*.undercards.net/*/*` |
| `@include` | Similar a @match (sintaxis antigua) | `@include *://undercards.net/*` |

#### Patrones de @match

```javascript
// Todas las páginas de undercards.net (con o sin subdominios)
@match https://*.undercards.net/*

// Solo la página de Spectate
@match https://undercards.net/Spectate
@match https://undercards.net/Spectate?*

// Páginas específicas
@match https://undercards.net/Game
@match https://undercards.net/Play
```

### Directivas de Dependencias

| Directiva | Descripción |
|-----------|-------------|
| `@require` | Cargar script externo antes de ejecutar |
| `@resource` | Pre-cargar recurso (CSS, JSON, imágenes) |

```javascript
// Cargar checkerV2.js para compatibilidad con UnderScript (recomendado con webpack)
@require https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js

// O cargar UnderScript completo (desarrollo sin webpack)
@require https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js

// Cargar librerías adicionales
@require https://unpkg.com/some-library@1.0.0/dist/lib.min.js

// Pre-cargar CSS como recurso
@resource customCSS https://example.com/styles.css
```

---

## Directivas Específicas para UC_TournamentView

### Con Webpack (Recomendado)

Si usas el [template oficial de UCProjects](https://github.com/UCProjects/plugin-template) con webpack, las directivas se generan automáticamente desde `package.json` y `webpack.config.js`:

**package.json:**
```json
{
  "name": "tournamentview",
  "scriptName": "UC Tournament View",
  "description": "Plugin para UnderScript...",
  "repository": "JoanJuan10/UC_TournamentView",
  "version": "0.1.0"
}
```

**webpack.config.js:**
```javascript
const WebpackUserscript = require('webpack-userscript');
const { name, scriptName, description, repository } = require('./package.json');

module.exports = {
  plugins: [
    new WebpackUserscript({
      headers: {
        name: scriptName,
        description,
        namespace: 'https://uc.feildmaster.com/',
        match: 'https://*.undercards.net/*',
        exclude: 'https://*.undercards.net/*/*',
        updateURL: `https://github.com/${repository}/releases/latest/download/${name}.meta.js`,
        downloadURL: `https://github.com/${repository}/releases/latest/download/${name}.user.js`,
        require: [
          'https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js',
        ],
        grant: 'none',
      },
    }),
  ],
};
```

El archivo `dist/tournamentview.user.js` generado incluirá:

```javascript
// ==UserScript==
// @name        UC Tournament View
// @version     0.1.0
// @author      JoanJuan10
// @description Plugin para UnderScript que mejora la vista de espectador...
// @homepage    https://github.com/JoanJuan10/UC_TournamentView
// @match       https://*.undercards.net/*
// @namespace   https://uc.feildmaster.com/
// @exclude     https://*.undercards.net/*/*
// @updateURL   https://github.com/JoanJuan10/UC_TournamentView/releases/latest/download/tournamentview.meta.js
// @downloadURL https://github.com/JoanJuan10/UC_TournamentView/releases/latest/download/tournamentview.user.js
// @require     https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js
// @grant       none
// ==/UserScript==
```

### Sin Webpack (Manual)

Si desarrollas directamente el UserScript sin build system:

```javascript
// ==UserScript==
// @name         UC Tournament View
// @name:es      Vista de Torneo UC
// @description  Tournament view plugin for Undercards spectating
// @description:es  Plugin de vista de torneo para espectador de Undercards
// @version      0.1.0
// @author       JoanJuan10
// @match        https://*.undercards.net/*
// @exclude      https://*.undercards.net/*/*
// @require      https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js
// @homepage     https://github.com/[tu-usuario]/UC_TournamentView
// @supportURL   https://github.com/[tu-usuario]/UC_TournamentView/issues
// @namespace    https://github.com/[tu-usuario]/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undercards.net
// @grant        none
// ==/UserScript==
```

### Notas Importantes

1. **`@run-at document-body`** - Requerido para que UnderScript funcione correctamente
2. **`@match` incluye `feildmaster.github.io`** - Para la página de configuración de UnderScript
3. **`@exclude` con doble barra** - Excluye subpáginas no válidas
4. **`@require` de UnderScript** - Carga el script base como dependencia
5. **`@grant none`** - Acceso completo al DOM sin sandbox

---

## Permisos (@grant)

La directiva `@grant` solicita permisos especiales. Para plugins de UnderScript usamos `none`:

### @grant none

```javascript
// @grant none
```

Con `none`:
- ✅ Acceso completo al objeto `window` de la página
- ✅ Acceso a `underscript` y todas sus APIs
- ✅ Manipulación directa del DOM
- ❌ No disponibles las funciones `GM_*`

### Otros Permisos (No usados en UC_TournamentView)

| Permiso | Función |
|---------|---------|
| `GM_setValue` | Guardar datos persistentes |
| `GM_getValue` | Obtener datos guardados |
| `GM_xmlhttpRequest` | Peticiones HTTP cross-origin |
| `GM_notification` | Notificaciones del sistema |
| `unsafeWindow` | Acceso explícito a window |

> ⚠️ **Nota**: UnderScript proporciona sus propias APIs para almacenamiento (settings) y notificaciones (toast), por lo que no necesitamos permisos adicionales.

---

## Momento de Ejecución (@run-at)

Define cuándo se ejecuta el script:

| Valor | Momento | Uso |
|-------|---------|-----|
| `document-start` | Inmediatamente, antes de cargar el DOM | Interceptar requests |
| `document-body` | Cuando existe `<body>` | **UnderScript requiere este** |
| `document-end` | DOM listo, antes de imágenes | Scripts generales |
| `document-idle` | Después de cargar todo | Scripts no urgentes |

### Para UC_TournamentView

```javascript
// @run-at document-body
```

**Obligatorio** usar `document-body` porque:
- UnderScript se inicializa cuando existe `<body>`
- Necesitamos que `underscript.plugin()` esté disponible
- Permite registrar eventos antes de que la página cargue completamente

---

## Plantilla Base del Plugin

### Con Webpack (Recomendado)

Al usar el template oficial, tu código en `src/index.js` es limpio y simple:

```javascript
const underscript = window.underscript;
const plugin = underscript.plugin('TournamentView', GM_info.version);

// Setting básico de activación
const isEnabled = plugin.settings().add({
    key: 'enabled',
    name: 'Activar Tournament View',
    type: 'boolean',
    default: true,
});

// Evento principal
plugin.events.on(':preload', () => {
    if (!isEnabled.value) return;
    
    console.log('TournamentView plugin loaded');
    
    // Tu código aquí
});
```

Webpack se encarga de:
- ✅ Generar el header completo
- ✅ Minificar el código
- ✅ Gestionar versiones desde `package.json`
- ✅ Incluir `checkerV2.js` automáticamente
- ✅ Crear archivo `.meta.js` para actualizaciones

### Sin Webpack (Desarrollo Rápido)

Para desarrollo rápido sin build, usa esta plantilla en `tournamentview.user.js`:

```javascript
// ==UserScript==
// @name         UC Tournament View
// @version      0.1.0
// @author       JoanJuan10
// @description  Plugin para UnderScript que mejora la vista de espectador
// @match        https://*.undercards.net/*
// @exclude      https://*.undercards.net/*/*
// @require      https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js
// @grant        none
// ==/UserScript==

const underscript = window.underscript;
const plugin = underscript.plugin('TournamentView', GM_info.version);

// Setting básico
const isEnabled = plugin.settings().add({
    key: 'enabled',
    name: 'Activar Tournament View',
    type: 'boolean',
    default: true,
});

// Evento principal
plugin.events.on(':preload', () => {
    if (!isEnabled.value) return;
    console.log('TournamentView cargado');
});
```

### Plantilla Completa (Sin Webpack)

Para un plugin completo sin webpack:

```javascript
// ==UserScript==
// @name         UC Tournament View
// @name:es      Vista de Torneo UC
// @description  Tournament view plugin for Undercards spectating
// @description:es  Plugin de vista de torneo para espectador de Undercards
// @version      0.1.0
// @author       JoanJuan10
// @match        https://*.undercards.net/*
// @exclude      https://*.undercards.net/*/*
// @require      https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js
// @homepage     https://github.com/JoanJuan10/UC_TournamentView
// @supportURL   https://github.com/JoanJuan10/UC_TournamentView/issues
// @namespace    https://github.com/JoanJuan10/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undercards.net
// @grant        none
// ==/UserScript==

const underscript = window.underscript;
const plugin = underscript.plugin('TournamentView', GM_info.version);
const events = plugin.events();
const settings = plugin.settings();
const logger = plugin.logger();

// ============================================
// ESTILOS CSS
// ============================================

const style = plugin.addStyle(`
    /* Estilos base del plugin */
    .tournament-view {
        /* ... */
    }
`);

// ============================================
// CONFIGURACIÓN (SETTINGS)
// ============================================

const enabledSetting = settings.add({
    key: 'tournamentview.enabled',
    name: 'Activar Vista de Torneo',
    type: 'boolean',
    default: true,
    category: 'Tournament View',
});

// ============================================
// LÓGICA PRINCIPAL
// ============================================

// Solo ejecutar en página Spectate
if (!underscript.onPage('Spectate')) {
    logger.debug('No estamos en Spectate, plugin inactivo');
    return;
}

// Evento: Página cargada
events.on(':preload', () => {
    if (!enabledSetting.value) return;
    logger.log('Plugin cargado en modo Spectate');
});

// Evento: Partida iniciada
events.on('GameStart', () => {
    if (!enabledSetting.value) return;
    logger.log('Partida detectada, inicializando vista de torneo...');
    // Inicializar overlay aquí
});

// Evento: Conexión establecida (datos de jugadores disponibles)
events.on('connect', (data) => {
    if (!enabledSetting.value) return;
    logger.log('Datos de partida recibidos:', data);
    // Procesar datos de jugadores aquí
});

// Evento: Partida finalizada
events.on('getVictory getDefeat getResult', (data) => {
    logger.log('Partida finalizada:', data);
    // Mostrar resultado aquí
});

// ============================================
// NOTIFICACIÓN DE CARGA
// ============================================

plugin.toast({
    title: 'Tournament View',
    text: 'Plugin cargado correctamente',
});
```

---

## 📚 Referencias

- [Documentación oficial de TamperMonkey (ES)](https://www.tampermonkey.net/documentation.php?locale=es)
- [UnderScript GitHub](https://github.com/UCProjects/UnderScript)
- [Match Patterns - Chrome](https://developer.chrome.com/docs/extensions/mv3/match_patterns/)

---

[← Volver al README](../README.md) | [Siguiente: API de Plugins →](02_UNDERSCRIPT_PLUGIN_API.md)
