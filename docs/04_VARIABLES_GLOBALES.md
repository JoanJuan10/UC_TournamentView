# 04 - Variables Globales

Referencia de variables globales accesibles a través de `underscript.utils.global()` durante una partida en modo Spectate.

## 📋 Índice

1. [Acceso a Variables Globales](#acceso-a-variables-globales)
2. [Identificadores de Jugadores](#identificadores-de-jugadores)
3. [Estado del Juego](#estado-del-juego)
4. [Datos de Jugadores](#datos-de-jugadores)
5. [Cartas y Tablero](#cartas-y-tablero)
6. [Sockets y Conexiones](#sockets-y-conexiones)
7. [Interfaz de Usuario](#interfaz-de-usuario)
8. [Otras Variables Útiles](#otras-variables-útiles)

---

## Acceso a Variables Globales

### Función `global()`

UnderScript proporciona una forma segura de acceder a variables globales:

```javascript
const utils = underscript.utils;

// Obtener variable (lanza error si no existe)
const valor = utils.global('nombreVariable');

// Obtener variable con alternativas
const valor = utils.global('opcion1', 'opcion2', 'opcion3');

// Obtener variable sin lanzar error
const valor = utils.global('nombreVariable', { throws: false });
```

### Función `globalSet()`

Para modificar variables globales (usar con precaución):

```javascript
// Establecer valor
utils.globalSet('nombreVariable', nuevoValor);

// Establecer con opciones
utils.globalSet('nombreVariable', nuevoValor, {
    force: true,   // Crear si no existe
    throws: false, // No lanzar error si falla
});
```

---

## Identificadores de Jugadores

Variables que identifican a los jugadores en la partida:

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `selfId` | `number` | ID del usuario logueado |
| `userId` | `number` | ID del jugador "tú" (perspectiva) |
| `opponentId` | `number` | ID del oponente |

```javascript
const utils = underscript.utils;

// En modo espectador:
const selfId = utils.global('selfId');         // Tu ID real
const perspectiveId = utils.global('userId');  // Jugador que "eres" al espectar
const opponentId = utils.global('opponentId'); // El otro jugador

console.log(`Espectando como jugador ${perspectiveId} vs ${opponentId}`);
```

### Diferencia entre `selfId` y `userId`

- **`selfId`**: Tu ID de usuario real (el que está logueado)
- **`userId`**: El jugador desde cuya perspectiva ves la partida
  - En **Game**: `userId === selfId`
  - En **Spectate**: `userId` es el jugador que espectamos (puede ser cualquiera)

---

## Estado del Juego

Variables que representan el estado actual de la partida:

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `turn` | `number` | Número de turno actual |
| `userTurn` | `number` | ID del jugador que tiene el turno |
| `time` | `number` | Tiempo restante del turno (segundos) |
| `gameType` | `string` | Tipo de partida |

```javascript
const utils = underscript.utils;

// Estado del turno
const turnoActual = utils.global('turn');
const quienJuega = utils.global('userTurn');
const tiempoRestante = utils.global('time');

console.log(`Turno ${turnoActual}, jugando: ${quienJuega}, tiempo: ${tiempoRestante}s`);

// Tipo de partida
const tipo = utils.global('gameType');
// Valores posibles: 'RANKED', 'CASUAL', 'FRIENDLY', 'EVENT', etc.
```

---

## Datos de Jugadores

### Variables de Nombres

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `selfUsername` | `string` | Nombre del usuario logueado |

### Variables de Almas

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `yourSoul` | `object` | Objeto del alma del jugador principal |
| `enemySoul` | `object` | Objeto del alma del oponente |
| `soul` | `string` | Nombre del alma actual |

```javascript
const utils = underscript.utils;

const tuAlma = utils.global('yourSoul', { throws: false });
const almaEnemigo = utils.global('enemySoul', { throws: false });

if (tuAlma) {
    console.log('Tu alma:', tuAlma.name);
}
```

### Estructura del Objeto Soul

```javascript
const soul = {
    name: 'Determination',  // Nombre del alma
    lives: 1,               // Vidas restantes
    dodge: 0,               // Esquivas disponibles
    // ... otras propiedades específicas del alma
};
```

---

## Cartas y Tablero

### Tablero

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `board` | `array` | Array de 8 slots del tablero |

```javascript
const utils = underscript.utils;

const tablero = utils.global('board', { throws: false });

if (tablero) {
    // Slots 0-3: Lado del oponente
    // Slots 4-7: Tu lado
    tablero.forEach((carta, index) => {
        if (carta) {
            const lado = index < 4 ? 'Oponente' : 'Tuyo';
            console.log(`${lado} - Slot ${index}: ${carta.name}`);
        }
    });
}
```

### Mano

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `hand` | `array` | Cartas en tu mano |

```javascript
const mano = utils.global('hand', { throws: false });

if (mano) {
    console.log('Cartas en mano:', mano.length);
    mano.forEach(carta => {
        console.log(`- ${carta.name} (${carta.cost} maná)`);
    });
}
```

### Cementerio

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `dustpile` | `array` | Cartas en el cementerio |

```javascript
const cementerio = utils.global('dustpile', { throws: false });

if (cementerio) {
    console.log('Cartas destruidas:', cementerio.length);
}
```

### Base de Datos de Cartas

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `allCards` | `array` | Todas las cartas del juego |

```javascript
const todasLasCartas = utils.global('allCards', { throws: false });

if (todasLasCartas) {
    // Buscar carta por ID
    const carta = todasLasCartas.find(c => c.id === 123);
    console.log('Carta encontrada:', carta?.name);
}
```

---

## Sockets y Conexiones

### Sockets Disponibles

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `socketChat` | `WebSocket` | Conexión al chat |
| `socketGame` | `WebSocket` | Conexión al juego |
| `socketQueue` | `WebSocket` | Conexión a la cola (Play) |

```javascript
const utils = underscript.utils;

const socketJuego = utils.global('socketGame', { throws: false });

if (socketJuego) {
    console.log('Estado del socket:', socketJuego.readyState);
    // 0 = CONNECTING
    // 1 = OPEN
    // 2 = CLOSING
    // 3 = CLOSED
}
```

---

## Interfaz de Usuario

### Funciones de UI

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `appendCard` | `function` | Renderiza una carta en un elemento |
| `translateElement` | `function` | Traduce un elemento |
| `translateFromServerJson` | `function` | Traduce mensaje del servidor |

```javascript
const utils = underscript.utils;

// Renderizar una carta
const appendCard = utils.global('appendCard');
const contenedor = document.createElement('div');
const carta = { id: 1, name: 'Froggit', atk: 2, hp: 3 };

try {
    appendCard(carta, $(contenedor));
} catch {
    appendCard($(contenedor), carta); // API puede variar
}
```

### Variables de Chat

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `chatNames` | `array` | Nombres de los canales de chat |
| `openPublicChats` | `array` | IDs de chats públicos abiertos |
| `privateChats` | `object` | Chats privados |

---

## Otras Variables Útiles

### Música y Audio

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `music` | `HTMLAudioElement` | Elemento de música de fondo |

```javascript
const musica = utils.global('music', { throws: false });

if (musica) {
    console.log('Reproduciendo:', !musica.paused);
    console.log('Volumen:', musica.volume);
}
```

### Configuración del Juego

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `translationReady` | `boolean` | Si las traducciones están listas |
| `pageName` | `string` | Nombre de la página actual |
| `action` | `string` | Acción actual |

---

## Ejemplo Completo: Obtener Estado de Partida

```javascript
(function() {
    const plugin = underscript.plugin('GameState', '1.0.0');
    const events = plugin.events();
    const logger = plugin.logger();
    const utils = underscript.utils;

    events.on('connect', () => {
        // Esperar un momento para que las variables se establezcan
        setTimeout(() => {
            const estado = obtenerEstadoPartida();
            logger.log('Estado de la partida:', estado);
        }, 100);
    });

    function obtenerEstadoPartida() {
        return {
            // Identificadores
            miId: utils.global('selfId', { throws: false }),
            jugadorVista: utils.global('userId', { throws: false }),
            oponente: utils.global('opponentId', { throws: false }),
            
            // Turno
            numeroTurno: utils.global('turn', { throws: false }),
            turnoDeJugador: utils.global('userTurn', { throws: false }),
            tiempoRestante: utils.global('time', { throws: false }),
            
            // Almas
            miAlma: utils.global('yourSoul', { throws: false })?.name,
            almaEnemiga: utils.global('enemySoul', { throws: false })?.name,
            
            // Tablero
            cartasEnTablero: contarCartasEnTablero(),
        };
    }

    function contarCartasEnTablero() {
        const board = utils.global('board', { throws: false });
        if (!board) return { tuyas: 0, oponente: 0 };
        
        const opponentId = utils.global('opponentId', { throws: false });
        let tuyas = 0, oponente = 0;
        
        board.forEach((carta, index) => {
            if (!carta) return;
            if (index < 4) oponente++;
            else tuyas++;
        });
        
        return { tuyas, oponente };
    }
})();
```

---

## Tabla Resumen de Variables

| Variable | Disponible en | Descripción |
|----------|---------------|-------------|
| `selfId` | Chat, Game, Spectate | Tu ID de usuario |
| `userId` | Game, Spectate | ID del jugador perspectiva |
| `opponentId` | Game, Spectate | ID del oponente |
| `turn` | Game, Spectate | Número de turno |
| `userTurn` | Game, Spectate | Quién tiene el turno |
| `time` | Game, Spectate | Tiempo restante |
| `board` | Game, Spectate | Estado del tablero |
| `hand` | Game | Tu mano (no disponible en Spectate) |
| `dustpile` | Game, Spectate | Cementerio |
| `allCards` | Todas | Base de datos de cartas |
| `yourSoul` | Game, Spectate | Tu alma |
| `enemySoul` | Game, Spectate | Alma del oponente |

---

## ⚠️ Notas Importantes

1. **Disponibilidad**: No todas las variables están disponibles en todo momento. Usa `{ throws: false }` para evitar errores.

2. **Timing**: Algunas variables se establecen de forma asíncrona. Escucha eventos como `connect` antes de accederlas.

3. **Spectate vs Game**: En modo espectador, `userId` representa al jugador que estás viendo, no a ti mismo.

4. **Mutabilidad**: Evita modificar variables globales directamente. Puede causar comportamiento inesperado.

---

## 📚 Referencias

- [Código fuente - utils.global](underscript.js) (líneas 220-250)
- [Código fuente - Eventos de connect](underscript.js) (líneas 6370-6430)

---

[← Anterior: Eventos del Juego](03_EVENTOS_JUEGO.md) | [Siguiente: Librerías Incluidas →](05_LIBRERIAS_INCLUIDAS.md)
