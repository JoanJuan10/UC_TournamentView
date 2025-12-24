# 08 - Estado Actual del Desarrollo

> Última actualización: 24 de diciembre de 2025

## Resumen Ejecutivo

El plugin **UC_TournamentView** se encuentra en **beta funcional** con todas las características básicas implementadas y operativas. El overlay muestra información completa en tiempo real durante las partidas en modo Spectate.

---

## ✅ Características Completadas

### 1. Infraestructura Base

**Sistema de Build:**
- ✅ Webpack 4.47.0 configurado con `webpack-userscript`
- ✅ Build automático de `dist/tournamentview.user.js` y `.meta.js`
- ✅ Script `npm run build` para producción
- ✅ Script `npm start` para desarrollo con watch mode

**Registro en UnderScript:**
- ✅ Plugin correctamente registrado con `underscript.plugin()`
- ✅ Versión sincronizada desde `package.json` via `GM_info.version`
- ✅ Detección correcta de página Spectate con `underscript.onPage('Spectate')`

### 2. Sistema de Datos (GameState)

**Clase GameState completa:**
```javascript
class GameState {
  player: {
    id, username, hp, maxHp, gold,
    soul, soulLives, artifacts[],
    handCount, deckCount, boardCount, graveyardCount
  }
  opponent: { /* mismos campos */ }
  turn: number
  currentPlayer: id del jugador activo
  gameResult: 'victory' | 'defeat' | null
  isActive: boolean
  isSpectate: boolean
}
```

**Funcionalidades:**
- ✅ `reset()` - Limpia todo el estado
- ✅ `updatePlayer(data)` - Actualiza datos del jugador
- ✅ `updateOpponent(data)` - Actualiza datos del oponente
- ✅ `getState()` - Retorna snapshot del estado actual

### 3. Sistema de Plantillas (TemplateManager)

**Gestión de CSS:**
- ✅ Carga de plantilla por defecto con metadatos
- ✅ Variables CSS personalizables:
  - `--tv-primary-color`: #667eea
  - `--tv-secondary-color`: #764ba2
  - `--tv-accent-color`: #f093fb
  - `--tv-background-color`: #0f0f23
  - `--tv-text-color`: #ffffff
- ✅ `injectCSS()` - Inyecta estilos con `plugin.addStyle()`
- ✅ `removeCSS()` - Remueve elemento `<style>` del DOM
- ✅ `generateCSSVariables()` - Genera CSS con variables
- ✅ `getBaseCSS()` - Retorna CSS base del overlay

### 4. Interfaz Visual (UIManager)

**Header completo con información en tiempo real:**

**Información de jugadores (izquierda y derecha):**
- ✅ Nombre del jugador
- ✅ Alma con imagen (28x28px) extraída del DOM
- ✅ Barra de HP con:
  - Porcentaje visual (120px width)
  - Gradiente de colores (rojo → amarillo → verde)
  - Texto HP actual/máximo
- ✅ Oro actual con formato "X G"
- ✅ Artefactos con:
  - Imágenes (36x36px)
  - Contadores en badge circular (22px)
  - Borde blanco y fondo rojo gradiente
  - Separadores entre artefactos
- ✅ Contadores de cartas:
  - Mano
  - Mazo
  - Cementerio (leído desde `.dust-counter`)

**Información central:**
- ✅ Turno actual (número)
- ✅ Timer sincronizado:
  - Formato M:SS con padding
  - Polling cada 500ms desde `window.global('time')`
  - Clase `.low` para últimos 10 segundos con animación pulse

**Indicador de turno activo:**
- ✅ Borde dorado (3px) alrededor del jugador activo
- ✅ Animación `pulse-border` (2s infinite)
- ✅ Actualización correcta con `data.idPlayer` de eventos

**Overlay de resultados:**
- ✅ Pantalla de victoria/derrota con:
  - Título animado con `scaleIn`
  - Color verde (#10b981) para victoria
  - Color rojo (#ef4444) para derrota
  - Estadísticas: turnos totales, HP final
  - Auto-ocultado después de 5 segundos

### 5. Extracción de Datos del DOM

**Funciones implementadas:**

**`getSoulFromDOM(playerIndex)`:**
- ✅ Lee desde `window.yourSoul` / `window.enemySoul`
- ✅ Fallback: extrae desde `img[src*="souls"]` en DOM
- ✅ Retorna nombre del alma (ej: "PATIENCE", "KINDNESS")

**`getArtifactsFromDOM(playerIndex)`:**
- ✅ Lee de `#yourArtifacts` (index 0) o `#enemyArtifacts` (index 1)
- ✅ Extrae de cada `.artifact-group`:
  - `name` desde atributo `name`
  - `image` desde atributo `image`
  - `id` desde atributo `artifactid`
  - `legendary` desde atributo `legendary`
  - `counter` desde texto de `.artifact-custom`
- ✅ Retorna array de objetos artifact

**`getGraveyardFromDOM(playerIndex)`:**
- ✅ Lee todos los `.dust-counter` del DOM
- ✅ **Índices invertidos**: player 0 usa counter[1], player 1 usa counter[0]
- ✅ Fallback: busca en `table tr`
- ✅ Retorna número de cartas en cementerio

**`getSoulImageUrl(soulData)`:**
- ✅ Parsea strings y objetos JSON
- ✅ Busca imagen en DOM (`img[src*="souls"]`)
- ✅ Fallback: construye URL `images/souls/SOULNAME.png`

**`getArtifactImageUrl(artifact)`:**
- ✅ Construye URL desde `artifact.image`
- ✅ Fallback: busca en DOM por id
- ✅ Formato: `https://undercards.net/images/artifacts/{image}.png`

### 6. Sistema de Eventos

**Eventos conectados y funcionales:**

- ✅ **`:preload`** - Inicialización del plugin
  - Verifica `isEnabled.value()` (función getter)
  - Verifica `underscript.onPage('Spectate')`
  - Inyecta CSS y crea UI

- ✅ **`connect`** - Conexión inicial
  - Parsea `data.you` y `data.enemy`
  - Captura HP inicial, gold, souls
  - Captura artefactos iniciales
  - Lee cementerios desde DOM
  - Actualiza toda la UI

- ✅ **`GameStart`** - Inicio de partida
  - Marca `gameState.isActive = true`
  - Resetea turno a 0

- ✅ **`getTurnStart`** - Inicio de turno
  - Lee turno desde `window.global('turn')` o `data.numTurn`
  - Captura `data.idPlayer` como currentPlayer
  - Inicia timer watcher (interval cada 500ms)
  - Actualiza indicador de jugador activo

- ✅ **`getUpdatePlayerHp`** - Actualización de HP
  - Identifica jugador por `data.playerId`
  - Actualiza HP y maxHP
  - Refresca barra visual

- ✅ **`getPlayersStats`** - Actualización de stats
  - Parsea oro desde `data.golds`
  - Parsea cartas en mano desde `data.handsSize`
  - Parsea cartas en mazo desde `data.decksSize`
  - **Lee cementerio desde DOM** (no siempre viene en evento)
  - **Lee artefactos desde DOM** (para contadores actualizados)

- ✅ **`getUpdateBoard`** - Actualización del tablero
  - Cuenta cartas por `ownerId`
  - Actualiza `boardCount`

- ✅ **`getVictory` / `getDefeat` / `getResult`**
  - Marca resultado final
  - Muestra overlay de resultados

- ✅ **`getUpdateSoul`** - Actualización de alma
  - Parsea `data.soul`
  - Actualiza vidas y esquiva

- ✅ **`getTurnEnd`** - Fin de turno
  - Limpia timer interval
  - Resetea timer visual

- ✅ **`refreshTimer`** - Actualización de timer
  - Parsea `data.time`
  - Actualiza display del timer

### 7. Sistema de Settings

**Settings implementado:**
- ✅ `isEnabled` - Boolean para activar/desactivar
- ✅ Default: `false` (requiere activación manual)
- ✅ Listener `on('change')` funcional:
  - Al desactivar:
    - Limpia timer interval
    - Llama `uiManager.destroy()` (remueve `#uc-tournament-view`)
    - Llama `templateManager.removeCSS()` (remueve `<style>`)
    - Llama `gameState.reset()`
  - Al activar:
    - Verifica que estamos en Spectate
    - Inyecta CSS
    - Inicializa UI

**⚠️ Importante - Función Getter:**
- `isEnabled.value` es una **función**, no un valor directo
- Debe llamarse con `isEnabled.value()` para obtener el booleano
- Si se usa `if (!isEnabled.value)` sin `()`, siempre será truthy

### 8. Estilos Visuales

**Diseño implementado:**
- ✅ Header fijo en top (80px altura)
- ✅ Gradiente de fondo (primary → secondary)
- ✅ Sombras y blur effects (backdrop-filter)
- ✅ Layout flexbox responsive
- ✅ Transiciones suaves (0.3s ease)
- ✅ Animaciones:
  - `pulse-border` para jugador activo
  - `pulse` para timer bajo
  - `fadeIn` para overlay de resultados
  - `scaleIn` para contenedor de resultados

**Elementos visuales:**
- ✅ Barras de HP con gradiente RGB
- ✅ Badges circulares para contadores
- ✅ Drop shadows para profundidad
- ✅ Text shadows para legibilidad
- ✅ Box shadows con inset highlights

### 9. Sistema Multiidioma (i18n)

**Fase 3 - Internacionalización completa:**

**Clase I18n:**
```javascript
class I18n {
    constructor() {
        this.currentLanguage = 'es';
        this.translations = {
            es: { /* 17+ claves */ },
            en: { /* 17+ claves */ }
        };
    }
    
    t(key, params = {}) {
        let translation = this.translations[this.currentLanguage][key];
        // Interpolación: "Es el turno de {player}" + {player: "Joan"}
        Object.entries(params).forEach(([param, value]) => {
            translation = translation.replace(`{${param}}`, value);
        });
        return translation;
    }
}
```

**Claves de traducción implementadas:**
- `player.default` / `player.opponent` - Nombres por defecto
- `hp` / `gold` / `hand` / `deck` / `graveyard` - Estadísticas
- `turn` / `timer` / `turn.indicator` - Información de turno
- `result.victory` / `result.defeat` - Resultados
- `stats.turns` / `stats.finalHp` - Estadísticas finales
- `notification.*` - 6 tipos de notificaciones
- `history.*` - Panel de historial

**Setting de idioma:**
- ✅ Selector dropdown con opciones `['es', 'en']`
- ✅ `onChange` handler que regenera UI completa:
  - Llama `i18n.setLanguage(newValue)`
  - Ejecuta `uiManager.destroy()` y `uiManager.initialize()`
  - Si hay partida activa, actualiza todos los datos
- ✅ Persiste entre recargas de página
- ✅ Inicialización en evento `:preload` antes de crear UI

**Traducción de historial de acciones:**

**Función `translateLogHTML()`:**
- ✅ Solo traduce si idioma actual es español
- ✅ Decodifica entidades HTML con `decodeHTMLEntities()`
- ✅ Patrones de traducción implementados:
  - `"'s turn"` → `"Es el turno de {player}"` (reorganización de frase)
  - `">>> Turn X"` → `">>> Turno X"`
  - `"played"` → `"jugó"`
  - `"used"` → `"usó"`
  - `"attacked"` → `"atacó a"`
  - `"was killed"` → `"fue destruido/a"`
  - `"lost X hp"` → `"perdió X hp"`
  - `"gained X hp"` → `"ganó X hp"`
  - `"'s effect activated"` → `": efecto activado"`
  - `"'s soul activated"` → `": alma activada"`

**Manejo de entidades HTML:**
```javascript
decodeHTMLEntities(html) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = html;
    return textarea.value;
}
```
- ✅ Decodifica `&oacute;` → `ó`, `&ntilde;` → `ñ`, etc.
- ✅ Usa elemento DOM temporal para decodificación nativa del navegador
- ✅ Aplicado antes de realizar traducciones

**Actualización del historial:**
- ✅ Para español: usa `innerHTML` y aplica `translateLogHTML()`
- ✅ Para inglés: clona `childNodes` directamente preservando encoding nativo
- ✅ Evita doble línea usando `innerHTML` en vez de `outerHTML`

### 10. Ajustes Visuales y UX

**Ocultación de historiales nativos:**
```css
#history {
    display: none !important;
}

#game-history {
    display: none !important;
}
```

**Aumento de tamaños de fuente:**
- ✅ `.tv-notification`: 1.1rem (antes 1rem)
- ✅ `.tv-notification` padding: 1rem 1.5rem (mejor legibilidad)
- ✅ `.tv-notification` max-width: 400px (mejor distribución)
- ✅ `.tv-action-log`: width 450px (antes 350px)
- ✅ `.tv-log-header`: 1.2rem (antes 1.1rem)
- ✅ `.tv-log-entry`: 1.1rem con line-height 1.8

**Display de artefactos:**
- ✅ Removido `max-width: 200px` de `.tv-player-artifacts`
- ✅ Añadido `flex-wrap: wrap` para múltiples filas
- ✅ Ahora muestra artefactos ilimitados en vez de solo 4

**Posición del tablero:**
```css
/* TABLERO DE JUEGO - Ajuste de posición */
.mainContent {
    margin-top: 100px !important;
}
```
- ✅ Bajado 100px para mejor visualización con overlay
- ✅ Documentado para Fase 4 (gestión en plantillas):
  - Elementos gestionables: avatares, perfiles, board, timer, handCards, emotes
  - Propiedades configurables: margin-top, transform scale, opacity, filters

**Timer visible desde inicio:**
- ✅ `startTimerWatcher()` función helper reutilizable
- ✅ Se inicia en evento `connect` (carga inicial de página)
- ✅ Se reinicia en evento `getTurnStart` (seguridad)
- ✅ Busca `.timer.active` primero, fallback a `.timer` genérico
- ✅ Lee contenido de `<span class="white">` dentro del timer
- ✅ Polling cada 500ms con soporte para `window.global('time')`

**Auto-scroll en historial:**
- ✅ Scroll a `scrollHeight` para mostrar entradas más recientes
- ✅ `setTimeout` de 100ms para asegurar render del DOM

---

## 🚧 Pendiente / En Desarrollo

### Gestión de plantillas (Fase 4)
- [ ] Importar plantillas personalizadas (JSON)
- [ ] Exportar plantilla actual
- [ ] Editor visual de plantillas
- [ ] Múltiples plantillas predefinidas
- [ ] Validación de plantillas importadas

### Integraciones futuras (Fase 5)
- [ ] Soporte para Challonge
- [ ] API para datos de torneo
- [ ] Exportación de datos de partida
- [ ] Webhooks para eventos

---

## 🐛 Problemas Conocidos Resueltos

### ✅ Timer no sincronizaba
- **Problema**: Timer no se actualizaba o mostraba valores incorrectos
- **Solución**: Polling de `window.global('time')` cada 500ms
- **Estado**: Resuelto ✅

### ✅ Indicador de turno incorrecto
- **Problema**: Borde dorado en jugador equivocado
- **Solución**: Usar `data.idPlayer` de evento `getTurnStart`
- **Estado**: Resuelto ✅

### ✅ Imágenes de almas con error 404
- **Problema**: URLs de almas mal construidas
- **Solución**: Extraer desde DOM con `querySelectorAll('img[src*="souls"]')`
- **Estado**: Resuelto ✅

### ✅ Contadores de artefactos no se mostraban
- **Problema**: JSON de eventos no incluía contadores
- **Solución**: Leer desde DOM con `.artifact-custom` en cada `getPlayersStats`
- **Estado**: Resuelto ✅

### ✅ Cementerio con valores incorrectos
- **Problema**: Índices de `.dust-counter` confundidos
- **Solución**: Índices invertidos - player 0 usa counter[1], player 1 usa counter[0]
- **Estado**: Resuelto ✅

### ✅ Setting no desactivaba el plugin
- **Problema**: Plugin seguía activo con setting desactivado
- **Causas identificadas**:
  1. `isEnabled.value` es función getter, no se llamaba con `()`
  2. `removeCSS()` no estaba implementado
- **Solución**: 
  1. Reemplazar todas las referencias a `isEnabled.value()` con paréntesis
  2. Implementar `removeCSS()` en TemplateManager
  3. Llamar `removeCSS()` en el listener de cambios
- **Estado**: Resuelto ✅

### ✅ Settings usando i18n antes de inicialización
- **Problema**: Settings intentaban usar `i18n.t()` antes de que i18n existiera
- **Solución**: Usar strings literales bilingües en settings: "Activar Tournament View", "Idioma / Language"
- **Estado**: Resuelto ✅

### ✅ Cambio de idioma no regeneraba UI
- **Problema**: Al cambiar idioma en settings, el overlay mantenía textos antiguos
- **Solución**: En `onChange` de languageSetting, verificar si existe `uiManager.container` y llamar `destroy()/initialize()`
- **Estado**: Resuelto ✅

### ✅ Panel de historial no se ocultaba completamente
- **Problema**: Panel se quedaba parcialmente visible al colapsar
- **Solución**: Cambiar `translateX(350px)` a `translateX(450px)` para que coincida con el width del panel
- **Estado**: Resuelto ✅

### ✅ Solo 4 artefactos visibles
- **Problema**: `max-width: 200px` limitaba artefactos mostrados
- **Solución**: Remover max-width y añadir `flex-wrap: wrap` para múltiples filas
- **Estado**: Resuelto ✅

### ✅ Scroll del historial no mostraba entradas recientes
- **Problema**: `scrollTop = 0` mostraba entradas antiguas en vez de nuevas
- **Solución**: Cambiar a `scrollTop = scrollHeight` con `setTimeout(100ms)`
- **Estado**: Resuelto ✅

### ✅ Traducciones incorrectas en turnos
- **Problema**: "Player es el turno de" en vez de "Es el turno de Player"
- **Solución**: Regex con capture groups para reorganizar: `/<[^>]+>.*?<\/[^>]+>)'s turn/` → `Es el turno de ${playerHTML}`
- **Estado**: Resuelto ✅

### ✅ Caracteres especiales mostrando entidades HTML
- **Problema**: `&oacute;`, `&ntilde;` aparecían literalmente en vez de `ó`, `ñ`
- **Solución**: 
  1. Aplicar `decodeHTMLEntities()` antes de traducir
  2. Usar `innerHTML` en vez de `outerHTML` para evitar nested divs
  3. Clonar `childNodes` directamente para inglés
- **Estado**: Resuelto ✅

### ✅ Entradas de turno en dos líneas
- **Problema**: `outerHTML` creaba divs anidados causando saltos de línea
- **Solución**: Usar `innerHTML` para obtener solo el contenido sin wrapper
- **Estado**: Resuelto ✅

### ✅ Timer no visible al cargar página
- **Problema**: `timerWatcher` solo iniciaba en `getTurnStart`, no en carga inicial
- **Solución**: 
  1. Crear función `startTimerWatcher()` reutilizable
  2. Llamarla desde evento `connect` (carga inicial)
  3. Llamarla también desde `getTurnStart` (seguridad)
  4. Añadir fallback de `.timer.active` a `.timer` genérico
- **Estado**: Resuelto ✅

---

## 📊 Métricas del Código

**Archivos principales:**
- `src/index.js`: ~2730 líneas (+930 desde Fase 2)
- `dist/tournamentview.user.js`: ~57 KiB compilado (+18 KiB desde Fase 2)

**Clases principales:**
- `I18n`: ~90 líneas (nueva en Fase 3)
- `GameState`: ~80 líneas
- `TemplateManager`: ~490 líneas (+30 desde Fase 2)
- `UIManager`: ~700 líneas

**Sistemas implementados:**
- Eventos manejados: 15 eventos de UnderScript
- Funciones helper: 7 funciones (6 extracción DOM + 1 timer)
- Idiomas soportados: 2 (español, inglés)
- Claves de traducción: 17+ por idioma
- Patrones de traducción regex: 10+ patrones

**Fase 3 específicamente:**
- Sistema i18n completo
- Traducción de historial con regex
- Decodificación de entidades HTML
- 10+ bugs corregidos
- Ajustes de UX y legibilidad

---

## 🎯 Próximos Pasos Recomendados

1. **Mejorar animaciones**
   - Transiciones entre turnos
   - Efectos al cambiar valores (HP, oro, etc.)
   - Highlight de nuevas cartas

2. **Panel de historial**
   - Log de acciones importantes
   - Scroll automático
   - Filtros por tipo de evento

3. **Múltiples plantillas**
   - Tema oscuro/claro
   - Estilo minimalista
   - Estilo maximalista con más info

4. **Editor de plantillas**
   - Color picker para variables
   - Preview en vivo
   - Reset a defaults

5. **Optimizaciones**
   - Reducir polling del timer si es posible
   - Cachear lecturas del DOM
   - Lazy loading de imágenes

---

## 📝 Notas Técnicas

### Compatibilidad
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Edge
- ⚠️ Safari (no probado extensivamente)

### Rendimiento
- Polling de timer: 500ms (aceptable)
- Lecturas de DOM: Solo en eventos necesarios
- CSS: Inyectado una vez al inicio
- Sin memory leaks detectados con cleanup correcto

### Dependencias
- UnderScript v0.63.9+
- TamperMonkey (o Violentmonkey/Greasemonkey)
- Node.js 12+ (solo para desarrollo)

---

*Documento generado: 24 de diciembre de 2025*
