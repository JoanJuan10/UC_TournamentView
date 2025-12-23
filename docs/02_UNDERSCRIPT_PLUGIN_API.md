# 02 - API de Plugins de UnderScript

Documentación completa de la API de plugins de UnderScript, incluyendo registro, métodos disponibles, sistema de settings y creación de tipos personalizados.

## 📋 Índice

1. [Registro de Plugins](#registro-de-plugins)
2. [Métodos del Plugin](#métodos-del-plugin)
3. [Sistema de Eventos](#sistema-de-eventos)
4. [Sistema de Settings](#sistema-de-settings)
5. [Tipos de Settings](#tipos-de-settings)
6. [Crear Tipos Personalizados](#crear-tipos-personalizados)
7. [Estilos CSS](#estilos-css)
8. [Notificaciones Toast](#notificaciones-toast)
9. [Logger](#logger)

---

## Registro de Plugins

### Crear un Plugin

```javascript
const plugin = underscript.plugin('NombrePlugin', '1.0.0');
```

#### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `name` | `string` | ✅ | Nombre del plugin (máx. 20 caracteres) |
| `version` | `string \| number` | ❌ | Versión del plugin |

#### Restricciones del Nombre

- **Máximo 20 caracteres**
- Solo caracteres **alfanuméricos** y **espacios** (`a-z`, `A-Z`, `0-9`, ` `)
- Debe ser **único** entre todos los plugins

#### Propiedades del Plugin

```javascript
plugin.name      // Nombre del plugin
plugin.version   // Versión del plugin (si se proporcionó)
```

#### Ejemplo

```javascript
// ✅ Correcto
const plugin = underscript.plugin('TournamentView', '1.0.0');
const plugin = underscript.plugin('Mi Plugin', 2);

// ❌ Incorrecto
const plugin = underscript.plugin('Este-Nombre-Es-Muy-Largo!', '1.0'); // Muy largo + caracteres inválidos
const plugin = underscript.plugin('Plugin@Special', '1.0'); // Caracteres inválidos
```

---

## Métodos del Plugin

Una vez creado el plugin, tienes acceso a estos métodos:

| Método | Descripción |
|--------|-------------|
| `plugin.events()` | Sistema de eventos |
| `plugin.settings()` | Sistema de configuración |
| `plugin.addStyle(css)` | Inyectar CSS |
| `plugin.toast(options)` | Mostrar notificación |
| `plugin.logger()` | Sistema de logging |

---

## Sistema de Eventos

### Obtener el Gestor de Eventos

```javascript
const events = plugin.events();
```

### Escuchar Eventos

#### `events.on(evento, callback)`

Escucha un evento. Puede escuchar múltiples eventos separados por espacio.

```javascript
// Evento único
events.on('GameStart', (data) => {
    console.log('Partida iniciada!', data);
});

// Múltiples eventos
events.on('getVictory getDefeat', (data) => {
    console.log('Partida terminada');
});
```

#### `events.once(evento, callback)`

Escucha un evento **una sola vez**.

```javascript
events.once('connect', (data) => {
    console.log('Primera conexión:', data);
});
```

#### `events.until(evento, callback)`

Escucha hasta que el callback retorne `true`.

```javascript
events.until('getTurnStart', (data) => {
    if (data.numTurn >= 10) {
        console.log('¡Turno 10 alcanzado!');
        return true; // Deja de escuchar
    }
    return false; // Sigue escuchando
});
```

### Emitir Eventos

#### `events.emit(evento, ...datos)`

Emite un evento personalizado.

```javascript
events.emit('miEvento', { custom: 'data' });
```

### Eventos Cancelables

Algunos eventos pueden ser cancelados para prevenir su comportamiento por defecto.

```javascript
events.on('PreGameEvent', function(data) {
    if (this.cancelable && algunaCondicion) {
        this.canceled = true; // Cancela el evento
    }
});
```

### Metadatos del Callback

Dentro del callback, `this` contiene información útil:

```javascript
events.on('GameEvent', function(data) {
    console.log(this.event);      // Nombre del evento
    console.log(this.cancelable); // Si es cancelable
    console.log(this.canceled);   // Estado de cancelación
    console.log(this.singleton);  // Si es evento singleton
    console.log(this.delayed);    // Si fue retrasado
});
```

---

## Sistema de Settings

### Obtener el Gestor de Settings

```javascript
const settings = plugin.settings();
```

### Añadir un Setting

```javascript
const mySetting = settings.add({
    key: 'plugin.setting.key',     // Clave única (requerido)
    name: 'Nombre del Setting',     // Nombre mostrado
    type: 'boolean',                // Tipo de setting
    default: true,                  // Valor por defecto
    category: 'Mi Categoría',       // Categoría para agrupar
    note: 'Descripción al hover',   // Tooltip
    refresh: true,                  // Mostrar "requiere refrescar"
    disabled: false,                // Deshabilitado
    hidden: false,                  // Oculto pero registrado
    export: true,                   // Permitir exportación
    reset: true,                    // Mostrar botón de reset
    onChange: (newVal, oldVal) => { // Callback al cambiar
        console.log('Cambió:', newVal);
    },
});
```

### Propiedades del Setting

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `key` | `string` | **Requerido**. Clave única del setting |
| `name` | `string` | Nombre mostrado en la UI |
| `type` | `string \| SettingType` | Tipo de input |
| `default` | `any` | Valor por defecto |
| `category` | `string` | Categoría para agrupar settings |
| `note` | `string \| () => string` | Tooltip al hover |
| `refresh` | `boolean \| () => boolean` | Mostrar nota "requiere refrescar" |
| `disabled` | `boolean \| () => boolean` | Deshabilitar el setting |
| `hidden` | `boolean` | Ocultar de la UI pero mantener registrado |
| `export` | `boolean` | Permitir exportar (default: `true`) |
| `reset` | `boolean \| () => boolean` | Mostrar botón de reset |
| `onChange` | `(newVal, oldVal) => void` | Callback cuando cambia el valor |
| `converter` | `(currentVal) => newVal` | Convertir valor almacenado |
| `data` | `any` | Datos extra para el tipo de setting |

### Métodos del Setting

```javascript
mySetting.key;           // Obtener la clave
mySetting.value();       // Obtener valor actual
mySetting.set(newValue); // Establecer nuevo valor
mySetting.disabled;      // Verificar si está deshabilitado
mySetting.on(callback);  // Escuchar cambios
mySetting.show();        // Abrir página de settings
mySetting.refresh();     // Forzar actualización de UI
```

### Escuchar Cambios Globales

```javascript
settings.on('clave.del.setting', (newVal, oldVal) => {
    console.log('Setting cambió:', newVal);
});

settings.isOpen(); // Verificar si el diálogo está abierto
```

---

## Tipos de Settings

UnderScript proporciona varios tipos de settings predefinidos:

### Tipos Básicos

| Tipo | Descripción | Valor |
|------|-------------|-------|
| `'boolean'` | Checkbox on/off | `true` / `false` |
| `'text'` | Campo de texto | `string` |
| `'password'` | Campo oculto | `string` |
| `'color'` | Selector de color | `string` (hex) |

```javascript
// Boolean
settings.add({
    key: 'enabled',
    name: 'Activar',
    type: 'boolean',
    default: true,
});

// Text
settings.add({
    key: 'username',
    name: 'Nombre',
    type: 'text',
    default: '',
});

// Password
settings.add({
    key: 'apikey',
    name: 'API Key',
    type: 'password',
    default: '',
});

// Color
settings.add({
    key: 'accentColor',
    name: 'Color de acento',
    type: 'color',
    default: '#4464bd',
});
```

### Tipos de Selección

| Tipo | Descripción | Valor |
|------|-------------|-------|
| `'select'` | Dropdown de opciones | `string` (opción seleccionada) |
| `'slider'` | Barra deslizante | `number` |

```javascript
// Select (dropdown)
settings.add({
    key: 'theme',
    name: 'Plantilla',
    type: 'select',
    default: 'esports',
    data: ['esports', 'minimal', 'classic'], // Opciones
});

// Slider
settings.add({
    key: 'opacity',
    name: 'Opacidad',
    type: 'slider',
    default: 80,
    data: {
        min: 0,
        max: 100,
        step: 5,
    },
});
```

### Tipos de Colecciones

| Tipo | Descripción | Valor |
|------|-------------|-------|
| `'array'` | Lista de strings | `string[]` |
| `'list'` | Lista drag-drop | `string[]` |
| `'map'` | Pares clave-valor | `object` |

```javascript
// Array
settings.add({
    key: 'favorites',
    name: 'Favoritos',
    type: 'array',
    default: [],
});

// List (drag-drop)
settings.add({
    key: 'order',
    name: 'Orden de elementos',
    type: 'list',
    default: ['hp', 'gold', 'cards'],
});

// Map (clave -> valor)
settings.add({
    key: 'aliases',
    name: 'Alias',
    type: 'map',
    default: {},
});
```

### Tipos Especiales

| Tipo | Descripción | Valor |
|------|-------------|-------|
| `'keybind'` | Captura de tecla | `object` (tecla) |
| `'remove'` | Se elimina al seleccionar | - |
| `'advancedMap'` | Map con tipos específicos | `object` |

```javascript
// Keybind
settings.add({
    key: 'toggleHotkey',
    name: 'Tecla para mostrar/ocultar',
    type: 'keybind',
    default: { key: 'F2' },
});

// Remove (para elementos que se auto-eliminan)
settings.add({
    key: 'deleteMe',
    name: 'Eliminar esta opción',
    type: 'remove',
});

// Advanced Map (tipos específicos para key y value)
settings.add({
    key: 'customMappings',
    name: 'Mapeos personalizados',
    type: {
        key: 'text',       // Tipo para la clave
        value: 'color',    // Tipo para el valor
    },
    default: {},
});
```

---

## Crear Tipos Personalizados

Puedes crear tipos de settings personalizados extendiendo `SettingType`:

### Clase SettingType

```javascript
class MiTipoPersonalizado extends underscript.utils.SettingType {
    constructor() {
        super('MiTipoPersonalizado'); // Nombre único
    }

    /**
     * Crea el elemento HTML para el setting
     * @param {any} value - Valor actual
     * @param {function} update - Función para actualizar (undefined = eliminar)
     * @param {object} options - Opciones adicionales
     */
    element(value, update, { container, data, key, name, removeSetting }) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value || '';
        
        input.addEventListener('change', () => {
            update(input.value || undefined);
        });
        
        return input;
    }

    /**
     * Valida/transforma el valor
     * @param {any} val - Valor a validar
     * @returns {any} - Valor validado
     */
    value(val) {
        return val;
    }
}
```

### Registrar y Usar

```javascript
// Crear instancia
const miTipo = new MiTipoPersonalizado();

// Registrar para que otros plugins puedan usarlo (opcional)
settings.addType(miTipo);

// Usar en un setting
settings.add({
    key: 'miSetting',
    name: 'Mi Setting Personalizado',
    type: miTipo, // Pasar la instancia
    default: '',
});
```

### Ejemplo: Selector de Plantillas

```javascript
class TemplateSelector extends underscript.utils.SettingType {
    constructor(templates) {
        super('TemplateSelector');
        this.templates = templates;
    }

    element(value, update, { container, data }) {
        const wrapper = document.createElement('div');
        wrapper.className = 'template-selector';
        
        this.templates.forEach(template => {
            const btn = document.createElement('button');
            btn.textContent = template.name;
            btn.className = value === template.id ? 'active' : '';
            btn.onclick = () => {
                update(template.id);
                wrapper.querySelectorAll('button').forEach(b => b.className = '');
                btn.className = 'active';
            };
            wrapper.appendChild(btn);
        });
        
        return wrapper;
    }

    value(val) {
        return typeof val === 'string' ? val : 'default';
    }
}
```

---

## Estilos CSS

### Añadir Estilos

```javascript
const style = plugin.addStyle(`
    .mi-clase {
        color: white;
        background: rgba(0, 0, 0, 0.8);
    }
    
    .otro-estilo {
        border: 1px solid #fff;
    }
`);
```

### Métodos del Estilo

```javascript
// Añadir más estilos
style.append(`
    .clase-adicional {
        padding: 10px;
    }
`);

// Reemplazar todos los estilos
style.replace(`
    .nuevos-estilos {
        margin: 5px;
    }
`);

// Eliminar estilos
style.remove();
```

### Ejemplo con Plantilla Variable

```javascript
function aplicarPlantilla(plantilla) {
    const css = `
        .overlay {
            background: ${plantilla.backgroundColor};
            color: ${plantilla.textColor};
            opacity: ${plantilla.opacity};
        }
    `;
    style.replace(css);
}
```

---

## Notificaciones Toast

### Mostrar Toast Simple

```javascript
plugin.toast('Mensaje simple');
```

### Toast con Opciones

```javascript
plugin.toast({
    title: 'Título',
    text: 'Contenido del mensaje',
    buttons: [{
        text: 'Aceptar',
        className: 'dismiss',
        onclick: () => {
            console.log('Botón clickeado');
        },
    }],
    css: {
        'background-color': 'rgba(0, 100, 0, 0.8)',
    },
    onClose: (reason) => {
        console.log('Toast cerrado:', reason);
    },
});
```

### Propiedades del Toast

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `title` | `string` | Título del toast |
| `text` | `string` | Contenido del mensaje |
| `buttons` | `array` | Botones a mostrar |
| `css` | `object` | Estilos CSS personalizados |
| `className` | `string` | Clase CSS adicional |
| `onClose` | `function` | Callback al cerrar |
| `footer` | `string` | Texto del footer |

---

## Logger

### Obtener el Logger

```javascript
const logger = plugin.logger();
```

### Métodos de Logging

```javascript
logger.log('Mensaje informativo');
logger.warn('Advertencia');
logger.error('Error');
logger.debug('Información de debug');
```

Todos los mensajes se prefijan automáticamente con el nombre del plugin:

```
[TournamentView] Mensaje informativo
[TournamentView] Advertencia
[TournamentView] Error
[TournamentView] Información de debug
```

---

## Ejemplo Completo

```javascript
(function() {
    'use strict';

    const plugin = underscript.plugin('TournamentView', '1.0.0');
    const events = plugin.events();
    const settings = plugin.settings();
    const logger = plugin.logger();

    // Estilos
    const style = plugin.addStyle(`
        .tournament-overlay { 
            position: fixed; 
            top: 10px; 
            right: 10px; 
        }
    `);

    // Settings
    const enabled = settings.add({
        key: 'tv.enabled',
        name: 'Activar overlay',
        type: 'boolean',
        default: true,
        category: 'Tournament View',
    });

    const template = settings.add({
        key: 'tv.template',
        name: 'Plantilla',
        type: 'select',
        data: ['esports', 'minimal'],
        default: 'esports',
        category: 'Tournament View',
        onChange: (newVal) => {
            logger.log('Plantilla cambiada a:', newVal);
            aplicarPlantilla(newVal);
        },
    });

    // Eventos
    events.on('GameStart', () => {
        if (!enabled.value()) return;
        logger.log('Iniciando overlay con plantilla:', template.value());
    });

    // Notificación
    plugin.toast({
        title: 'Tournament View',
        text: 'Plugin cargado',
    });

})();
```

---

## 📚 Referencias

- [UnderScript Plugin API](https://feildmaster.github.io/UnderScript/api/underscript/plugin)
- [UnderScript Feature API](https://feildmaster.github.io/UnderScript/feature/api)
- [Código fuente de UnderScript](docs/underscript.js)

---

[← Anterior: TamperMonkey](01_TAMPERMONKEY.md) | [Siguiente: Eventos del Juego →](03_EVENTOS_JUEGO.md)
