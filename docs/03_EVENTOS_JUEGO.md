# 03 - Eventos del Juego

Catálogo completo de eventos disponibles en UnderScript para la página de Spectate, incluyendo eventos de partida, turnos, acciones de cartas y finalización.

## 📋 Índice

1. [Sistema de Eventos](#sistema-de-eventos)
2. [Eventos del Ciclo de Vida](#eventos-del-ciclo-de-vida)
3. [Eventos de Partida](#eventos-de-partida)
4. [Eventos de Turno](#eventos-de-turno)
5. [Eventos de Cartas](#eventos-de-cartas)
6. [Eventos de Combate](#eventos-de-combate)
7. [Eventos de Jugadores](#eventos-de-jugadores)
8. [Eventos de Finalización](#eventos-de-finalización)
9. [Eventos de Log](#eventos-de-log)
10. [Eventos Cancelables](#eventos-cancelables)

---

## Sistema de Eventos

### Escuchar Eventos

```javascript
const events = plugin.events();

// Evento simple
events.on('GameStart', (data) => {
    console.log('Partida iniciada');
});

// Múltiples eventos
events.on('getVictory getDefeat getResult', (data) => {
    console.log('Partida terminada');
});
```

### Contexto del Evento

Dentro del callback, `this` proporciona metadatos:

```javascript
events.on('GameEvent', function(data) {
    this.event;      // Nombre del evento actual
    this.cancelable; // Si se puede cancelar
    this.canceled;   // Estado de cancelación
    this.singleton;  // Si es evento único
});
```

---

## Eventos del Ciclo de Vida

### Eventos de Página

| Evento | Descripción | Cuándo se emite |
|--------|-------------|-----------------|
| `:preload` | DOM disponible | Antes de cargar completamente |
| `:load` | Página cargada | Cuando todo está listo |
| `:preload:Spectate` | Preload específico de Spectate | Al entrar en `/Spectate` |
| `underscript:ready` | UnderScript listo | Todas las APIs disponibles |

```javascript
events.on(':preload', () => {
    // El DOM existe, podemos manipularlo
    console.log('DOM listo');
});

events.on(':preload:Spectate', () => {
    // Estamos en la página Spectate
    console.log('Página Spectate detectada');
});

events.on('underscript:ready', () => {
    // Todas las traducciones y APIs están listas
    console.log('UnderScript completamente cargado');
});
```

---

## Eventos de Partida

### `GameStart`

Se emite cuando se detecta una partida. **Evento singleton** (solo se emite una vez).

```javascript
events.on('GameStart', () => {
    console.log('Partida detectada');
    // Inicializar overlay aquí
});
```

### `PlayingGame`

Similar a `GameStart`, indica que estamos en una partida activa.

```javascript
events.on('PlayingGame', () => {
    console.log('Jugando/Espectando partida');
});
```

### `connect`

Se emite cuando se establece conexión con el servidor de juego. Contiene **todos los datos iniciales** de la partida.

```javascript
events.on('connect', (data) => {
    // Datos de jugadores
    const you = JSON.parse(data.you);      // Jugador principal (perspectiva)
    const enemy = JSON.parse(data.enemy);  // Oponente
    
    // Oro inicial
    const gold = JSON.parse(data.golds);   // { [playerId]: cantidad }
    
    // Tablero inicial
    const board = JSON.parse(data.board);  // Array de 8 slots (4 por jugador)
    
    // Información adicional
    console.log('Turno actual:', data.turn);
    console.log('Es turno de:', data.userTurn);
    console.log('Tipo de partida:', data.gameType);
    
    // Niveles y almas
    console.log('Tu nivel:', data.yourLevel);
    console.log('Tu alma:', data.yourSoul);
    console.log('Nivel enemigo:', data.enemyLevel);
    console.log('Alma enemigo:', data.enemySoul);
    
    // Ranks (en ranked)
    console.log('Tu rank:', data.yourRank);
    console.log('Rank enemigo:', data.enemyRank);
    
    // Vidas (en ciertos modos)
    if (data.lives) {
        const lives = JSON.parse(data.lives);
        console.log('Vidas:', lives);
    }
});
```

#### Estructura de Datos de Jugador

```javascript
const player = {
    id: 12345,           // ID del jugador
    username: 'Player1', // Nombre
    hp: 30,              // Vida actual
    maxHp: 30,           // Vida máxima
    gold: 3,             // Oro actual
    // ... más propiedades
};
```

### `GameEvent`

Evento genérico que se emite para **cada acción** del juego.

```javascript
events.on('GameEvent', (data) => {
    console.log('Acción:', data.action);
    console.log('Datos:', data);
});
```

### `PreGameEvent`

Se emite **antes** de procesar un evento. Es **cancelable**.

```javascript
events.on('PreGameEvent', function(data) {
    console.log('Evento próximo:', data.action);
    
    if (this.cancelable && algunaCondicion) {
        this.canceled = true; // Prevenir el evento
    }
});
```

---

## Eventos de Turno

### `getTurnStart`

Se emite al inicio de cada turno.

```javascript
events.on('getTurnStart', (data) => {
    console.log('Turno número:', data.numTurn);
    console.log('Turno de jugador ID:', data.idPlayer);
});
```

#### Datos de `getTurnStart`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `numTurn` | `number` | Número de turno actual |
| `idPlayer` | `number` | ID del jugador que tiene el turno |

### `getTurnEnd`

Se emite al final de cada turno.

```javascript
events.on('getTurnEnd', (data) => {
    console.log('Fin del turno de:', data.idPlayer);
    
    // Detectar timeout
    const time = underscript.utils.global('time');
    if (time <= 0) {
        console.log('El jugador agotó el tiempo');
    }
});
```

---

## Eventos de Cartas

### `getCardBoard` / `getMonsterPlayed`

Se emite cuando una carta es jugada en el tablero.

```javascript
events.on('getCardBoard', (data) => {
    const card = JSON.parse(data.card);
    console.log('Jugador', data.idPlayer, 'jugó:', card.name);
    console.log('En posición:', data.position);
});
```

#### Datos de Carta

```javascript
const card = {
    id: 1234,          // ID único en la partida
    cardId: 56,        // ID de la carta base
    name: 'Froggit',   // Nombre
    atk: 2,            // Ataque
    hp: 3,             // Vida
    maxHp: 3,          // Vida máxima
    cost: 2,           // Coste de maná
    ownerId: 12345,    // ID del propietario
    // ... más propiedades
};
```

### `getSpellPlayed`

Se emite cuando se usa una carta de hechizo.

```javascript
events.on('getSpellPlayed', (data) => {
    const card = JSON.parse(data.card);
    console.log('Hechizo usado:', card.name);
    console.log('Por jugador:', data.idPlayer);
});
```

### `getMonsterDestroyed`

Se emite cuando un monstruo es destruido.

```javascript
events.on('getMonsterDestroyed', (data) => {
    console.log('Monstruo destruido, ID:', data.monsterId);
});
```

### `updateMonster` / `updateCard`

Se emite cuando una carta en el tablero es modificada.

```javascript
events.on('updateMonster', (data) => {
    const monster = JSON.parse(data.monster || data.card);
    console.log('Carta actualizada:', monster.name);
    console.log('Nueva vida:', monster.hp);
    console.log('Nuevo ataque:', monster.atk);
});
```

### `getShowCard`

Se emite cuando un jugador revela una carta de su mano.

```javascript
events.on('getShowCard', (data) => {
    const card = JSON.parse(data.card);
    console.log('Carta revelada:', card.name);
    console.log('Por jugador:', data.idPlayer);
});
```

### `getCardDestroyedHandFull`

Se emite cuando una carta es descartada por mano llena.

```javascript
events.on('getCardDestroyedHandFull', (data) => {
    const card = JSON.parse(data.card);
    console.log('Carta descartada:', card.name);
});
```

---

## Eventos de Combate

### `getFight` / `getFightPlayer`

Se emite durante ataques.

```javascript
// Ataque a monstruo
events.on('getFight', (data) => {
    console.log('Atacante ID:', data.attackMonster);
    console.log('Defensor ID:', data.defendMonster);
});

// Ataque directo a jugador
events.on('getFightPlayer', (data) => {
    console.log('Atacante ID:', data.attackMonster);
    console.log('Jugador atacado:', data.defendPlayer);
});
```

### `getDoingEffect`

Se emite cuando se activa un efecto de carta.

```javascript
events.on('getDoingEffect', (data) => {
    console.log('Efecto de monstruo ID:', data.monsterId);
    
    if (data.card) {
        const card = JSON.parse(data.card);
        console.log('Carta con efecto:', card.name);
    }
});
```

---

## Eventos de Jugadores

### `getUpdatePlayerHp`

Se emite cuando cambia la vida de un jugador.

```javascript
events.on('getUpdatePlayerHp', (data) => {
    console.log('Jugador:', data.playerId);
    console.log('Nueva vida:', data.hp);
});
```

### `getPlayersStats`

Se emite con estadísticas actualizadas de ambos jugadores.

```javascript
events.on('getPlayersStats', (data) => {
    // Tamaño de manos
    const hands = JSON.parse(data.handsSize);
    console.log('Cartas en mano:', hands);
    
    // Oro
    const golds = JSON.parse(data.golds);
    console.log('Oro:', golds);
    
    // Vidas (en modos con vidas)
    if (data.lives) {
        const lives = JSON.parse(data.lives);
        console.log('Vidas:', lives);
    }
    
    // Artefactos
    if (data.artifacts) {
        const artifacts = JSON.parse(data.artifacts);
        console.log('Artefactos:', artifacts);
    }
});
```

### `getUpdateBoard`

Se emite cuando el tablero completo es actualizado.

```javascript
events.on('getUpdateBoard', (data) => {
    const board = JSON.parse(data.board);
    // board es array de 8 elementos (4 por jugador)
    // null = slot vacío
    
    board.forEach((card, index) => {
        if (card) {
            console.log(`Slot ${index}: ${card.name}`);
        }
    });
});
```

### `getUpdateDustpile`

Se emite cuando cambia el cementerio.

```javascript
events.on('getUpdateDustpile', (data) => {
    const dustpile = JSON.parse(data.dustpile);
    console.log('Cartas en cementerio:', dustpile.length);
});
```

### `getUpdateSoul`

Se emite cuando cambia el estado del alma de un jugador.

```javascript
events.on('getUpdateSoul', (data) => {
    const soul = JSON.parse(data.soul);
    console.log('Jugador:', data.idPlayer);
    console.log('Vidas del alma:', soul.lives);
    console.log('Esquiva:', soul.dodge);
});
```

---

## Eventos de Finalización

### `getVictory`

Se emite cuando **ganas** la partida (o el jugador que espectamos gana).

```javascript
events.on('getVictory', (data) => {
    console.log('¡Victoria!');
    
    if (data.disconnected) {
        console.log('El oponente se desconectó');
    }
    
    // Recompensas (si aplica)
    if (data.gold) console.log('Oro ganado:', data.gold);
    if (data.exp) console.log('EXP ganada:', data.exp);
});
```

### `getDefeat`

Se emite cuando **pierdes** la partida (o el jugador que espectamos pierde).

```javascript
events.on('getDefeat', (data) => {
    console.log('Derrota');
});
```

### `getResult`

Se emite al final de una partida en **modo espectador**.

```javascript
events.on('getResult', (data) => {
    console.log('Ganador:', data.winner);
    console.log('Perdedor:', data.looser); // Nota: typo en el original
    console.log('Causa:', data.cause);
    // Causas posibles:
    // - 'game-end-surrender' (rendición)
    // - 'game-end-disconnection' (desconexión)
    // - (vacío = muerte normal)
});
```

---

## Eventos de Log

Eventos del sistema de batalla log:

### `getBattleLog`

Evento genérico para logs de batalla.

```javascript
events.on('getBattleLog', (data) => {
    const log = JSON.parse(data.battleLog);
    console.log('Tipo de log:', log.battleLogType);
});
```

### `Log:ARTIFACT_EFFECT`

Se emite cuando se activa un artefacto.

```javascript
events.on('Log:ARTIFACT_EFFECT', (data) => {
    console.log('Artefacto activado:', data.artifactActor.name);
    console.log('Por jugador:', data.playerId);
    console.log('Objetivos (cartas):', data.targetCards);
    console.log('Objetivos (jugadores):', data.targetPlayers);
});
```

### `Log:SOUL_EFFECT`

Se emite cuando se activa un efecto del alma.

```javascript
events.on('Log:SOUL_EFFECT', (data) => {
    console.log('Efecto del alma activado');
    console.log('Jugador:', data.playerId);
    console.log('Objetivos:', data.targetCards, data.targetPlayers);
});
```

---

## Eventos Cancelables

Algunos eventos tienen versiones "before" que son cancelables:

| Evento Base | Versión Cancelable |
|-------------|-------------------|
| `GameEvent` | `PreGameEvent` |
| `[action]` | `[action]:before` |

```javascript
// Cancelar un evento específico
events.on('getSpellPlayed:before', function(data) {
    if (this.cancelable) {
        const card = JSON.parse(data.card);
        if (card.name === 'AlgunaCartaProhibida') {
            this.canceled = true;
            console.log('Evento cancelado');
        }
    }
});
```

---

## Mapa de Eventos para Spectate

```
Inicio de Partida
    └── GameStart (singleton)
    └── PlayingGame (singleton)
    └── connect (datos iniciales)
            │
            ▼
    ┌─── Bucle de Turnos ───┐
    │                       │
    │   getTurnStart        │
    │       │               │
    │       ▼               │
    │   [Acciones]          │
    │   ├── getCardBoard    │
    │   ├── getSpellPlayed  │
    │   ├── getFight        │
    │   ├── getDoingEffect  │
    │   ├── updateMonster   │
    │   └── ...             │
    │       │               │
    │       ▼               │
    │   getTurnEnd          │
    │                       │
    └───────────────────────┘
            │
            ▼
    Fin de Partida
    ├── getVictory (si gana)
    ├── getDefeat (si pierde)
    └── getResult (spectate)
```

---

## 📚 Referencias

- [Código fuente - Eventos de juego](underscript.js) (líneas 3200-3400)
- [UnderScript Feature API](https://feildmaster.github.io/UnderScript/feature/api)

---

[← Anterior: API de Plugins](02_UNDERSCRIPT_PLUGIN_API.md) | [Siguiente: Variables Globales →](04_VARIABLES_GLOBALES.md)
