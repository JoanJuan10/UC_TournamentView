# 📚 API Reference

Documentación técnica del código. Si solo quieres usar el plugin, no necesitas leer esto.

## Índice

- [Clases principales](#clases-principales)
- [Sistema de eventos](#sistema-de-eventos)
- [Sistema i18n](#sistema-i18n)
- [Sistema de plantillas](#sistema-de-plantillas)
- [API de UnderScript](#api-de-underscript)

---

## Clases principales

### UIManager

La clase que maneja todo el overlay y el DOM.

#### Constructor

```javascript
class UIManager {
  constructor(templateManager, i18n) {
    this.templateManager = templateManager;
    this.i18n = i18n;
    this.overlay = null;
    this.notifications = [];
    this.logEntries = [];
  }
}
```

---

#### Métodos de ciclo de vida

##### `init(): void`

Inicializa el overlay. Solo funciona si estás en `/Spectate`.

```javascript
uiManager.init();
```

---

##### `destroy(): void`

Limpia todo y quita el overlay del DOM.

```javascript
uiManager.destroy();
```

---

##### `refresh(): void`

Regenera el overlay (útil después de cambiar plantilla o idioma).

```javascript
uiManager.refresh();
```

---

#### Métodos de actualización

##### `updatePlayerHP(hp: number, maxHP: number): void`

Actualiza la vida del jugador.

```javascript
uiManager.updatePlayerHP(25, 30);
```
- `maxHP` (number): Vida máxima

**Comportamiento**:
- Actualiza el texto `HP: 25/30`
- Actualiza la barra de progreso visual (83.33%)
- Aplica transición suave

---

##### `updateOpponentHP(hp: number, maxHP: number): void`

Actualiza la vida del oponente (igual que `updatePlayerHP`).

---

##### `updateGold(player: string, gold: number): void`

Actualiza el oro de un jugador.

```javascript
uiManager.updateGold('player', 5);
```

**Parámetros**:
- `player` (string): `'player'` o `'opponent'`
- `gold` (number): Cantidad de oro

---

##### `updateCardCount(player: string, type: string, count: number): void`

Actualiza el contador de cartas.

```javascript
uiManager.updateCardCount('player', 'hand', 7);
```

**Parámetros**:
- `player` (string): `'player'` o `'opponent'`
- `type` (string): `'hand'`, `'deck'`, o `'graveyard'`
- `count` (number): Cantidad de cartas

---

##### `updateTurn(turn: number): void`

Actualiza el número de turno.

```javascript
uiManager.updateTurn(5);
```

**Parámetros**:
- `turn` (number): Número de turno actual

---

##### `updateTimer(seconds: number): void`

Actualiza el timer de la partida.

```javascript
uiManager.updateTimer(125);  // 2:05
```

**Parámetros**:
- `seconds` (number): Tiempo en segundos

**Comportamiento**:
- Convierte a formato `MM:SS`
- Actualiza el elemento `.tv-timer`

---

##### `setActiveTurn(player: string): void`

Marca el turno activo de un jugador.

```javascript
uiManager.setActiveTurn('player');
```

**Parámetros**:
- `player` (string): `'player'` o `'opponent'`

**Comportamiento**:
- Añade clase `.active-turn` al panel correspondiente
- Remueve la clase del panel anterior
- Aplica efectos visuales (borde verde, glow)

---

#### Métodos de Notificaciones

##### `showFloatingNotification(message: string, type: string): void`

Muestra una notificación flotante temporal.

```javascript
uiManager.showFloatingNotification('Jugador1 jugó Skeleton', 'card-played');
```

**Parámetros**:
- `message` (string): Texto de la notificación
- `type` (string): Tipo de notificación para estilos (`'card-played'`, `'spell-cast'`, `'monster-destroyed'`, `'artifact'`, `'soul'`)

**Comportamiento**:
- Crea un elemento `<div class="tv-notification notif-{type}">`
- Lo posiciona en `top: 425px + (notifications.length * 40)px` (stacking)
- Aplica animación de entrada
- Auto-desaparece después de 2500ms
- Se remueve del DOM después de 3000ms

**Ejemplo de HTML generado**:
```html
<div class="tv-notification notif-card-played" style="top: 465px !important;">
  Jugador1 jugó Skeleton
</div>
```

---

#### Métodos de Historial

##### `addLogEntry(type: string, message: string, icon: string): void`

Agrega una entrada al historial de acciones.

```javascript
uiManager.addLogEntry('card', 'Jugador1 jugó Skeleton', '🎴');
```

**Parámetros**:
- `type` (string): Tipo de entrada (`'card'`, `'spell'`, `'destroy'`, `'artifact'`, `'soul'`)
- `message` (string): Mensaje a mostrar
- `icon` (string): Emoji o icono

**Comportamiento**:
- Crea una entrada en `.tv-log-entries`
- La inserta al principio (nuevas arriba)
- Aplica clase `.type-{type}` para estilos
- Mantiene un máximo de 100 entradas (las más antiguas se eliminan)

**Ejemplo de HTML generado**:
```html
<div class="tv-log-entry type-card">
  <span class="tv-log-icon">🎴</span>
  <span class="tv-log-message">Jugador1 jugó Skeleton</span>
</div>
```

---

##### `toggleLogPanel(): void`

Abre/cierra el panel de historial.

```javascript
uiManager.toggleLogPanel();
```

**Comportamiento**:
- Si está cerrado: añade clase `.visible` a `.tv-log-panel`
- Si está abierto: remueve clase `.visible`

---

##### `clearLog(): void`

Limpia todas las entradas del historial.

```javascript
uiManager.clearLog();
```

**Comportamiento**:
- Vacía el array `this.logEntries`
- Limpia el contenido de `.tv-log-entries`
- Muestra mensaje "Sin acciones registradas"

---

### I18n

Sistema de internacionalización para traducir textos.

#### Constructor

```javascript
class I18n {
  constructor() {
    this.translations = {
      es: { /* ... */ },
      en: { /* ... */ }
    };
    this.currentLang = 'es';
  }
}
```

---

#### Métodos

##### `t(key: string, data?: object): string`

Obtiene una traducción interpolada.

```javascript
const text = i18n.t('notif.cardPlayed', { player: 'Jugador1', card: 'Skeleton' });
// Español: "Jugador1 jugó Skeleton"
// Inglés: "Jugador1 played Skeleton"
```

**Parámetros**:
- `key` (string): Clave de traducción (ej. `'notif.cardPlayed'`)
- `data` (object, opcional): Objeto con variables para interpolar

**Retorna**: String traducido con variables interpoladas

**Comportamiento**:
- Busca la clave en `this.translations[this.currentLang]`
- Si no existe, retorna la clave literal
- Interpola variables con sintaxis `{{variable}}`

---

##### `setLanguage(lang: string): void`

Cambia el idioma activo.

```javascript
i18n.setLanguage('en');
```

**Parámetros**:
- `lang` (string): Código de idioma (`'es'` o `'en'`)

**Comportamiento**:
- Actualiza `this.currentLang`
- Dispara evento para regenerar el UI

---

##### `getAvailableLanguages(): string[]`

Retorna la lista de idiomas disponibles.

```javascript
const langs = i18n.getAvailableLanguages();
// ['es', 'en']
```

---

#### Keys de Traducción

##### Interfaz

| Key | ES | EN |
|-----|----|----|
| `app.title` | Vista de Torneo | Tournament View |
| `turn.label` | Turno | Turn |
| `hp.label` | HP | HP |
| `gold.label` | Oro | Gold |
| `hand.label` | Mano | Hand |
| `deck.label` | Mazo | Deck |
| `grave.label` | Cementerio | Graveyard |

##### Notificaciones

| Key | ES | EN |
|-----|----|----|
| `notif.cardPlayed` | {{player}} jugó {{card}} | {{player}} played {{card}} |
| `notif.spellCast` | {{player}} usó {{spell}} | {{player}} cast {{spell}} |
| `notif.monsterDestroyed` | Monstruo destruido | Monster destroyed |
| `notif.artifactActivated` | {{artifact}} activado | {{artifact}} activated |
| `notif.soulEffect` | Efecto de {{soul}} activado | {{soul}} effect activated |

##### Historial

| Key | ES | EN |
|-----|----|----|
| `log.title` | Historial | History |
| `log.clear` | Limpiar | Clear |
| `log.empty` | Sin acciones registradas | No actions recorded |

---

### TemplateManager

Gestiona las plantillas visuales.

#### Constructor

```javascript
class TemplateManager {
  constructor() {
    this.templates = [];
    this.activeTemplateId = null;
  }
}
```

---

#### Métodos

##### `loadTemplate(id: string): Template`

Carga una plantilla por su ID.

```javascript
const template = templateManager.loadTemplate('default-tournament-view');
```

**Parámetros**:
- `id` (string): ID único de la plantilla

**Retorna**: Objeto `Template` o `null` si no existe

**Throws**: Error si el template no existe o es inválido

---

##### `setActiveTemplate(id: string): void`

Establece una plantilla como activa.

```javascript
templateManager.setActiveTemplate('dark-mode-pro');
```

**Parámetros**:
- `id` (string): ID de la plantilla a activar

**Comportamiento**:
- Desactiva la plantilla anterior
- Activa la nueva plantilla
- Guarda en `localStorage`
- Dispara evento para regenerar el UI

---

##### `exportTemplate(id: string): string`

Exporta una plantilla como JSON.

```javascript
const json = templateManager.exportTemplate('my-template');
// Descarga automáticamente el archivo
```

**Parámetros**:
- `id` (string): ID de la plantilla a exportar

**Retorna**: String JSON

---

##### `importTemplate(jsonString: string): boolean`

Importa una plantilla desde JSON.

```javascript
const success = templateManager.importTemplate(jsonData);
```

**Parámetros**:
- `jsonString` (string): JSON de la plantilla

**Retorna**: `true` si la importación fue exitosa, `false` en caso contrario

**Throws**: Error si el JSON es inválido o falla la validación

---

##### `validateTemplate(template: object): boolean`

Valida la estructura de una plantilla.

```javascript
const isValid = templateManager.validateTemplate(templateData);
```

**Parámetros**:
- `template` (object): Objeto template a validar

**Retorna**: `true` si es válido, `false` en caso contrario

**Validaciones**:
- Tiene campo `metadata` con `id`, `name`, `version`
- El `id` es único (no existe otra plantilla con ese ID)
- Tiene campo `customCSS` (string)
- Tiene campo `variables` (object)

---

##### `deleteTemplate(id: string): boolean`

Elimina una plantilla personalizada.

```javascript
const deleted = templateManager.deleteTemplate('my-custom-template');
```

**Parámetros**:
- `id` (string): ID de la plantilla a eliminar

**Retorna**: `true` si se eliminó, `false` si no se pudo (es predefinida o no existe)

**Comportamiento**:
- Solo puede eliminar plantillas con `isDefault: false`
- Si la plantilla eliminada estaba activa, cambia a "Default Tournament View"
- Actualiza localStorage

---

## Sistema de Eventos

### Eventos de Undercards

El plugin escucha eventos del juego a través de la API de UnderScript.

#### Eventos Capturados

##### `getCardPlayed`

Se dispara cuando un jugador juega una carta.

```javascript
Game.on('getCardPlayed', (data) => {
  // data = { player: 'Jugador1', card: 'Skeleton' }
});
```

**Datos**:
- `player` (string): Nombre del jugador
- `card` (string): Nombre de la carta

---

##### `getSpellPlayed`

Se dispara cuando un jugador usa un hechizo.

```javascript
Game.on('getSpellPlayed', (data) => {
  // data = { player: 'Jugador1', spell: 'Fireball' }
});
```

**Datos**:
- `player` (string): Nombre del jugador
- `spell` (string): Nombre del hechizo

---

##### `getMonsterDestroyed`

Se dispara cuando un monstruo es destruido.

```javascript
Game.on('getMonsterDestroyed', (data) => {
  // data = { monster: 'Skeleton' }
});
```

**Datos**:
- `monster` (string): Nombre del monstruo

---

##### `getHPChanged`

Se dispara cuando cambia la vida de un jugador.

```javascript
Game.on('getHPChanged', (data) => {
  // data = { player: 'player', hp: 25, maxHP: 30 }
});
```

**Datos**:
- `player` (string): `'player'` o `'opponent'`
- `hp` (number): Vida actual
- `maxHP` (number): Vida máxima

---

##### `getGoldChanged`

Se dispara cuando cambia el oro de un jugador.

```javascript
Game.on('getGoldChanged', (data) => {
  // data = { player: 'player', gold: 5 }
});
```

**Datos**:
- `player` (string): `'player'` o `'opponent'`
- `gold` (number): Oro actual

---

##### `getTurnChanged`

Se dispara cuando cambia el turno.

```javascript
Game.on('getTurnChanged', (data) => {
  // data = { turn: 5, player: 'player' }
});
```

**Datos**:
- `turn` (number): Número de turno
- `player` (string): Jugador activo (`'player'` o `'opponent'`)

---

##### `Log:ARTIFACT_EFFECT`

Se dispara cuando se activa un artefacto.

```javascript
Game.on('Log:ARTIFACT_EFFECT', (data) => {
  // data = { artifact: 'Torn Notebook' }
});
```

**Datos**:
- `artifact` (string): Nombre del artefacto

---

##### `Log:SOUL_EFFECT`

Se dispara cuando se activa un efecto de alma.

```javascript
Game.on('Log:SOUL_EFFECT', (data) => {
  // data = { soul: 'Determination' }
});
```

**Datos**:
- `soul` (string): Nombre del alma

---

### Eventos Personalizados del Plugin

##### `template:changed`

Se dispara cuando cambia la plantilla activa.

```javascript
UnderScript.on('TournamentView:template:changed', (templateId) => {
  console.log('Nueva plantilla:', templateId);
});
```

**Datos**:
- `templateId` (string): ID de la nueva plantilla

---

##### `language:changed`

Se dispara cuando cambia el idioma.

```javascript
UnderScript.on('TournamentView:language:changed', (lang) => {
  console.log('Nuevo idioma:', lang);
});
```

**Datos**:
- `lang` (string): Código del idioma (`'es'` o `'en'`)

---

## Sistema de Plantillas

### Estructura de Template

```typescript
interface Template {
  metadata: {
    id: string;
    name: string;
    version: string;
    author: string;
    description?: string;
    isDefault: boolean;
  };
  
  variables: {
    [key: string]: string;
  };
  
  customCSS: string;
}
```

### Ejemplo Completo

```json
{
  "metadata": {
    "id": "my-template",
    "name": "My Template",
    "version": "1.0.0",
    "author": "YourName",
    "description": "Custom template",
    "isDefault": false
  },
  
  "variables": {
    "primaryColor": "#6a0dad",
    "fontFamily": "'Segoe UI', sans-serif"
  },
  
  "customCSS": ".tv-overlay { font-family: {{fontFamily}}; }"
}
```

---

## UnderScript API

### Registrar el Plugin

```javascript
UnderScript.plugin({
  name: 'TournamentView',
  version: '0.1.0',
  
  settings: [
    {
      type: 'checkbox',
      id: 'enabled',
      label: 'Activar Tournament View',
      default: false,
      onChange: (value) => {
        if (value) {
          uiManager.init();
        } else {
          uiManager.destroy();
        }
      }
    },
    
    {
      type: 'select',
      id: 'language',
      label: 'Idioma / Language',
      options: [
        { value: 'es', label: '🇪🇸 Español' },
        { value: 'en', label: '🇬🇧 English' }
      ],
      default: 'es',
      onChange: (value) => {
        i18n.setLanguage(value);
        uiManager.refresh();
      }
    }
  ],
  
  onLoad: () => {
    console.log('[TournamentView] Plugin loaded');
  },
  
  onUnload: () => {
    uiManager.destroy();
  }
});
```

### Tipos de Settings

#### Checkbox

```javascript
{
  type: 'checkbox',
  id: 'myCheckbox',
  label: 'Enable Feature',
  default: false,
  onChange: (value) => { /* ... */ }
}
```

#### Select

```javascript
{
  type: 'select',
  id: 'mySelect',
  label: 'Choose Option',
  options: [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' }
  ],
  default: 'opt1',
  onChange: (value) => { /* ... */ }
}
```

#### Text Input

```javascript
{
  type: 'text',
  id: 'myText',
  label: 'Enter Text',
  default: 'Default value',
  onChange: (value) => { /* ... */ }
}
```

---

## Extensiones

### Agregar un Nuevo Tipo de Notificación

1. **Define la traducción**:

```javascript
this.translations = {
  es: {
    'notif.newType': 'Nuevo evento: {{detail}}'
  },
  en: {
    'notif.newType': 'New event: {{detail}}'
  }
};
```

2. **Captura el evento**:

```javascript
Game.on('YourNewEvent', (data) => {
  const message = i18n.t('notif.newType', { detail: data.detail });
  uiManager.showFloatingNotification(message, 'new-type');
  uiManager.addLogEntry('new-type', message, '🆕');
});
```

3. **Añade estilos CSS** (en tu plantilla):

```css
.tv-notification.notif-new-type {
  border-color: #00ff00;
  background: rgba(0, 255, 0, 0.2);
}

.tv-log-entry.type-new-type {
  border-left: 3px solid #00ff00;
}
```

---

### Agregar un Nuevo Panel al Overlay

1. **Modifica `injectOverlay()`** en UIManager:

```javascript
const newPanelHTML = `
  <div class="tv-new-panel">
    <h3>New Panel</h3>
    <div class="tv-new-content">
      <!-- Contenido -->
    </div>
  </div>
`;

// Añade al overlay
this.overlay.innerHTML += newPanelHTML;
```

2. **Añade estilos CSS** (en tu plantilla):

```css
.tv-new-panel {
  position: absolute;
  top: 50%;
  right: 20px;
  width: 300px;
  background: rgba(0, 0, 0, 0.85);
  border: 2px solid #6a0dad;
  border-radius: 10px;
  padding: 15px;
}
```

---

## Debugging

### Logs

```javascript
// En UIManager
console.log('[TournamentView]', 'Mensaje de debug');
console.warn('[TournamentView]', 'Advertencia');
console.error('[TournamentView]', 'Error crítico');
```

### Inspeccionar Estado

```javascript
// En la consola de DevTools
UnderScript.getPluginInstance('TournamentView').uiManager.logEntries
// Ver todas las entradas del historial

UnderScript.getPluginInstance('TournamentView').templateManager.templates
// Ver todas las plantillas cargadas
```

---

**Para más información, consulta las otras guías en [`docs/`](../docs/) o abre un Issue en GitHub.**
