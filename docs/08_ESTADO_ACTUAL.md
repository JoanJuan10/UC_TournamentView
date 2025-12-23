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

---

## 🚧 Pendiente / En Desarrollo

### Próximas mejoras (Fase 3)
- [ ] Animaciones de transición más suaves
- [ ] Panel de historial de acciones
- [ ] Efectos visuales para eventos importantes
- [ ] Mejoras en responsive design para pantallas pequeñas
- [ ] Temas de color alternativos

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

---

## 📊 Métricas del Código

**Archivos principales:**
- `src/index.js`: ~1800 líneas
- `dist/tournamentview.user.js`: ~39 KiB compilado

**Clases principales:**
- `GameState`: ~80 líneas
- `TemplateManager`: ~460 líneas
- `UIManager`: ~700 líneas

**Eventos manejados:** 15 eventos de UnderScript
**Funciones helper:** 6 funciones de extracción de DOM

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
