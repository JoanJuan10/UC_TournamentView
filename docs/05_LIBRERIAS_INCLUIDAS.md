# 05 - Librerías Incluidas en UnderScript

Documentación de las librerías externas incluidas en UnderScript y disponibles para su uso en plugins.

## 📋 Índice

1. [Acceso a Librerías](#acceso-a-librerías)
2. [jQuery](#jquery)
3. [axios](#axios)
4. [tippy.js](#tippyjs)
5. [luxon](#luxon)
6. [showdown](#showdown)
7. [Popper.js](#popperjs)
8. [SimpleToast](#simpletoast)

---

## Acceso a Librerías

Las librerías están disponibles de dos formas:

### 1. Variables Globales

La mayoría de librerías están en el objeto `window`:

```javascript
// jQuery
$('selector')
jQuery('selector')

// axios
axios.get('/api/endpoint')

// tippy
tippy(elemento, opciones)

// luxon
luxon.DateTime.now()
```

### 2. A través de `underscript.lib`

Algunas librerías están expuestas en `underscript.lib`:

```javascript
const { tippy, axios, luxon, showdown } = underscript.lib;
```

---

## jQuery

**Versión**: Cargada por el juego (no por UnderScript)

jQuery es la librería principal para manipulación del DOM en Undercards.

### Uso Básico

```javascript
// Selección de elementos
const elemento = $('#miElemento');
const clases = $('.miClase');

// Manipulación
$('.overlay').css({
    'background': 'rgba(0,0,0,0.8)',
    'color': 'white'
});

// Eventos
$('.boton').on('click', function() {
    console.log('Click!');
});

// Crear elementos
const div = $('<div class="mi-overlay">');
div.append('<span>Contenido</span>');
$('body').append(div);
```

### Métodos Útiles para Overlays

```javascript
// Posicionamiento
$('.overlay').css({
    position: 'fixed',
    top: '10px',
    right: '10px',
    zIndex: 1000
});

// Animaciones
$('.elemento').fadeIn(300);
$('.elemento').fadeOut(300);
$('.elemento').slideDown();
$('.elemento').animate({ opacity: 0.5 }, 500);

// Mostrar/Ocultar
$('.elemento').show();
$('.elemento').hide();
$('.elemento').toggle();

// Clases
$('.elemento').addClass('activo');
$('.elemento').removeClass('activo');
$('.elemento').toggleClass('activo');

// Datos
$('.elemento').data('valor', 123);
const valor = $('.elemento').data('valor');

// Dimensiones
const ancho = $('.elemento').width();
const alto = $('.elemento').height();
const posicion = $('.elemento').offset(); // { top, left }
```

### Ejemplo: Crear Overlay de Torneo

```javascript
function crearOverlay() {
    // Eliminar overlay existente
    $('#tournament-overlay').remove();
    
    // Crear estructura
    const overlay = $(`
        <div id="tournament-overlay">
            <div class="player player-1">
                <span class="name"></span>
                <span class="hp"></span>
            </div>
            <div class="vs">VS</div>
            <div class="player player-2">
                <span class="name"></span>
                <span class="hp"></span>
            </div>
        </div>
    `);
    
    // Aplicar estilos
    overlay.css({
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(90deg, #1a1a2e, #16213e)',
        padding: '10px 30px',
        borderRadius: '5px',
        zIndex: 1000
    });
    
    $('body').append(overlay);
    return overlay;
}
```

---

## axios

**Versión**: 0.21.4

Cliente HTTP basado en promesas para hacer peticiones AJAX.

### Uso Básico

```javascript
// GET
axios.get('/api/endpoint')
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error('Error:', error);
    });

// POST
axios.post('/api/endpoint', {
    dato: 'valor'
})
    .then(response => console.log(response.data));

// Con async/await
async function obtenerDatos() {
    try {
        const response = await axios.get('/api/datos');
        return response.data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}
```

### Configuración

```javascript
// Configurar headers
axios.get('/api', {
    headers: {
        'Authorization': 'Bearer token',
        'Content-Type': 'application/json'
    }
});

// Timeout
axios.get('/api', {
    timeout: 5000 // 5 segundos
});

// Parámetros
axios.get('/api', {
    params: {
        id: 123,
        filter: 'activo'
    }
});
// Resultado: /api?id=123&filter=activo
```

### Ejemplo: Obtener Datos de Usuario

```javascript
async function obtenerPerfilUsuario(userId) {
    try {
        const response = await axios.get(`/Profile?userId=${userId}`);
        // Procesar HTML o datos
        return response.data;
    } catch (error) {
        console.error('No se pudo obtener el perfil:', error);
        return null;
    }
}
```

---

## tippy.js

**Versión**: 4.3.5

Librería para crear tooltips elegantes y configurables.

### Uso Básico

```javascript
// Tooltip simple
tippy('#miElemento', {
    content: 'Este es un tooltip'
});

// Tooltip con HTML
tippy('.boton', {
    content: '<strong>Título</strong><br>Descripción',
    allowHTML: true
});

// En múltiples elementos
tippy('.todos-los-botones', {
    content: (reference) => {
        return reference.getAttribute('data-tooltip');
    }
});
```

### Opciones Comunes

```javascript
tippy(elemento, {
    // Contenido
    content: 'Texto o HTML',
    allowHTML: true,
    
    // Posición
    placement: 'top', // top, bottom, left, right, auto
    
    // Comportamiento
    trigger: 'mouseenter', // mouseenter, click, focus, manual
    interactive: false,     // Permitir interactuar con el tooltip
    hideOnClick: true,
    
    // Animación
    animation: 'fade',      // fade, scale, shift-away, etc.
    duration: [300, 250],   // [show, hide] en ms
    delay: [0, 0],          // [show, hide] delay
    
    // Apariencia
    theme: 'dark',          // Tema CSS
    arrow: true,            // Mostrar flecha
    
    // Callbacks
    onShow(instance) {
        console.log('Mostrando tooltip');
    },
    onHide(instance) {
        console.log('Ocultando tooltip');
    }
});
```

### Temas Personalizados

```javascript
// CSS para tema personalizado
const style = plugin.addStyle(`
    .tippy-box[data-theme~='tournament'] {
        background-color: #1a1a2e;
        color: #eee;
        border: 1px solid #4a4a6e;
        font-family: 'Segoe UI', sans-serif;
    }
    .tippy-box[data-theme~='tournament'] .tippy-arrow {
        color: #1a1a2e;
    }
`);

// Usar tema
tippy('.carta', {
    theme: 'tournament',
    content: 'Info de la carta'
});
```

### Ejemplo: Tooltips para Cartas

```javascript
function inicializarTooltipsCartas() {
    tippy('.card-container', {
        content: (reference) => {
            const cardId = reference.dataset.cardId;
            const card = obtenerInfoCarta(cardId);
            return `
                <div class="card-tooltip">
                    <strong>${card.name}</strong>
                    <div>ATK: ${card.atk} | HP: ${card.hp}</div>
                    <div>Coste: ${card.cost}</div>
                    <p>${card.description}</p>
                </div>
            `;
        },
        allowHTML: true,
        theme: 'tournament',
        placement: 'right',
        interactive: true
    });
}
```

---

## luxon

**Versión**: 1.28.0

Librería moderna para manejo de fechas y tiempos.

### Uso Básico

```javascript
const { DateTime, Duration } = luxon;

// Fecha actual
const ahora = DateTime.now();
console.log(ahora.toISO()); // 2025-12-23T10:30:00.000Z

// Formatear
console.log(ahora.toFormat('dd/MM/yyyy HH:mm'));  // 23/12/2025 10:30
console.log(ahora.toLocaleString(DateTime.TIME_SIMPLE)); // 10:30 AM

// Operaciones
const manana = ahora.plus({ days: 1 });
const haceUnaHora = ahora.minus({ hours: 1 });

// Diferencia
const diff = manana.diff(ahora, ['hours', 'minutes']);
console.log(diff.hours, 'horas', diff.minutes, 'minutos');
```

### Duraciones

```javascript
const { Duration } = luxon;

// Crear duración
const duracion = Duration.fromObject({ minutes: 5, seconds: 30 });

// Formatear
console.log(duracion.toFormat('mm:ss')); // 05:30

// Desde milisegundos
const fromMs = Duration.fromMillis(150000);
console.log(fromMs.toFormat('m:ss')); // 2:30
```

### Ejemplo: Temporizador de Turno

```javascript
function formatearTiempo(segundos) {
    const { Duration } = luxon;
    const duracion = Duration.fromObject({ seconds: segundos });
    
    if (segundos >= 60) {
        return duracion.toFormat('m:ss');
    }
    return duracion.toFormat('s') + 's';
}

function actualizarTemporizador() {
    const tiempo = underscript.utils.global('time', { throws: false });
    if (tiempo !== undefined) {
        const formateado = formatearTiempo(tiempo);
        $('.temporizador').text(formateado);
        
        // Cambiar color si queda poco tiempo
        if (tiempo <= 10) {
            $('.temporizador').addClass('urgente');
        } else {
            $('.temporizador').removeClass('urgente');
        }
    }
}
```

---

## showdown

**Versión**: 2.0.0

Conversor de Markdown a HTML.

### Uso Básico

```javascript
// Crear conversor
const converter = new showdown.Converter();

// Convertir Markdown a HTML
const markdown = '# Título\n\nTexto con **negrita** y *cursiva*.';
const html = converter.makeHtml(markdown);
// Resultado: <h1>Título</h1><p>Texto con <strong>negrita</strong> y <em>cursiva</em>.</p>
```

### Opciones

```javascript
const converter = new showdown.Converter({
    tables: true,           // Soporte para tablas
    strikethrough: true,    // ~~tachado~~
    tasklists: true,        // [ ] y [x] para listas
    simpleLineBreaks: true, // Saltos de línea simples
    openLinksInNewWindow: true
});
```

### Ejemplo: Mostrar Descripción de Carta

```javascript
function renderizarDescripcion(descripcionMarkdown) {
    const converter = new showdown.Converter({
        simpleLineBreaks: true
    });
    
    const html = converter.makeHtml(descripcionMarkdown);
    return `<div class="card-description">${html}</div>`;
}
```

---

## Popper.js

**Versión**: 1.16.1

Librería de posicionamiento para elementos flotantes (usada internamente por tippy.js).

### Uso Básico

```javascript
// Popper se usa principalmente a través de tippy.js
// Pero puede usarse directamente para posicionamiento personalizado

const referencia = document.querySelector('#boton');
const popup = document.querySelector('#popup');

const popperInstance = new Popper(referencia, popup, {
    placement: 'bottom',
    modifiers: {
        offset: {
            offset: '0, 10' // x, y
        },
        preventOverflow: {
            boundariesElement: 'viewport'
        }
    }
});

// Actualizar posición
popperInstance.update();

// Destruir
popperInstance.destroy();
```

---

## SimpleToast

**Versión**: 2.0.0

Librería personalizada para notificaciones toast (usada por `plugin.toast()`).

> **Nota**: Esta librería se accede principalmente a través de `plugin.toast()`. Ver [API de Plugins](02_UNDERSCRIPT_PLUGIN_API.md#notificaciones-toast) para más detalles.

### Uso Directo (Avanzado)

```javascript
// Crear toast directamente
const toast = new SimpleToast({
    title: 'Título',
    text: 'Mensaje',
    footer: 'via UnderScript',
    css: {
        'background-color': 'rgba(0,0,0,0.8)'
    },
    buttons: [{
        text: 'OK',
        onclick: () => toast.close()
    }]
});

// Métodos
toast.exists();     // ¿Existe en el DOM?
toast.close();      // Cerrar
toast.setText('Nuevo texto');
```

---

## Ejemplo Completo: Overlay con Todas las Librerías

```javascript
(function() {
    const plugin = underscript.plugin('OverlayDemo', '1.0.0');
    const events = plugin.events();
    const { DateTime } = luxon;

    // Estilos con tema para tippy
    plugin.addStyle(`
        #demo-overlay {
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            padding: 15px;
            border-radius: 8px;
            color: white;
            font-family: 'Segoe UI', sans-serif;
            z-index: 1000;
        }
        .tippy-box[data-theme~='demo'] {
            background: #2a2a4e;
            border: 1px solid #4a4a6e;
        }
    `);

    events.on('connect', async (data) => {
        // Crear overlay con jQuery
        const overlay = $(`
            <div id="demo-overlay">
                <div class="tiempo">${DateTime.now().toFormat('HH:mm:ss')}</div>
                <div class="info" data-tippy-content="Información de la partida">
                    Hover para info
                </div>
            </div>
        `);
        
        $('body').append(overlay);
        
        // Inicializar tooltips con tippy
        tippy('[data-tippy-content]', {
            theme: 'demo',
            allowHTML: true
        });
        
        // Actualizar tiempo cada segundo
        setInterval(() => {
            overlay.find('.tiempo').text(DateTime.now().toFormat('HH:mm:ss'));
        }, 1000);
        
        // Notificación
        plugin.toast('Overlay inicializado');
    });
})();
```

---

## Resumen de Librerías

| Librería | Versión | Uso Principal | Acceso |
|----------|---------|---------------|--------|
| jQuery | (juego) | Manipulación DOM | `$`, `jQuery` |
| axios | 0.21.4 | Peticiones HTTP | `axios`, `underscript.lib.axios` |
| tippy.js | 4.3.5 | Tooltips | `tippy`, `underscript.lib.tippy` |
| luxon | 1.28.0 | Fechas/Tiempos | `luxon`, `underscript.lib.luxon` |
| showdown | 2.0.0 | Markdown→HTML | `showdown`, `underscript.lib.showdown` |
| Popper.js | 1.16.1 | Posicionamiento | `Popper` |
| SimpleToast | 2.0.0 | Notificaciones | `SimpleToast`, `plugin.toast()` |

---

## 📚 Referencias

- [jQuery Documentation](https://api.jquery.com/)
- [axios GitHub](https://github.com/axios/axios)
- [tippy.js Documentation](https://atomiks.github.io/tippyjs/)
- [luxon Documentation](https://moment.github.io/luxon/)
- [showdown GitHub](https://github.com/showdownjs/showdown)
- [Popper.js Documentation](https://popper.js.org/docs/v1/)

---

[← Anterior: Variables Globales](04_VARIABLES_GLOBALES.md) | [Siguiente: Especificación del Proyecto →](06_ESPECIFICACION_PROYECTO.md)
