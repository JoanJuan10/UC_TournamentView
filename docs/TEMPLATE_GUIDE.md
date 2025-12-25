# 🎨 Guía de Plantillas

Cómo crear tus propias plantillas para UC_TournamentView.

## Índice

- [¿Qué es una plantilla?](#qué-es-una-plantilla)
- [Estructura básica](#estructura-básica)
- [Variables](#variables)
- [Clases CSS](#clases-css)
- [Ejemplos](#ejemplos)
- [Tips](#tips)
- [Validación](#validación)

---

## ¿Qué es una plantilla?

Una plantilla es un archivo JSON que define cómo se ve el overlay. Puedes cambiar:

- **Colores** - Primarios, secundarios, fondos...
- **Fuentes** - Tipografía, tamaños...
- **CSS personalizado** - Lo que quieras, básicamente

---

## Estructura básica

Un archivo de plantilla tiene esta pinta:

```json
{
  "metadata": {
    "id": "mi-plantilla",
    "name": "Mi Plantilla Molona",
    "version": "1.0.0",
    "author": "Tu Nombre",
    "description": "Una plantilla que hice yo"
  },
  
  "variables": {
    "primaryColor": "#6a0dad",
    "secondaryColor": "#00bcd4",
    "backgroundColor": "rgba(0, 0, 0, 0.85)"
  },
  
  "customCSS": "/* Tu CSS aquí */"
}
```

### Campos de metadata

| Campo | Obligatorio | Qué es |
|-------|-------------|--------|
| `id` | ✅ | ID único (sin espacios, minúsculas) |
| `name` | ✅ | Nombre que se ve en Settings |
| `version` | ✅ | Versión (1.0.0, 1.1.0...) |
| `author` | ✅ | Tu nombre o nick |
| `description` | ❌ | Descripción corta |

### Variables recomendadas

```json
{
  "variables": {
    // Colores
    "primaryColor": "#6a0dad",       // Color principal
    "secondaryColor": "#00bcd4",     // Color secundario
    "accentColor": "#ffc107",        // Color de acento
    "backgroundColor": "rgba(0, 0, 0, 0.85)",  // Fondo de paneles
    "textColor": "#ffffff",          // Color de texto
    "textShadow": "0 2px 4px rgba(0,0,0,0.8)",  // Sombra de texto
    
    // Tipografía
    "fontFamily": "'Segoe UI', sans-serif",
    "fontSize": "16px",
    "fontWeight": "400",
    "titleSize": "1.5rem",
    "labelSize": "0.9rem",
    
    // Layout
    "panelWidth": "858px",
    "panelHeight": "auto",
    "borderRadius": "10px",
    "padding": "15px",
    "gap": "10px",
    
    // Efectos
    "boxShadow": "0 4px 12px rgba(0,0,0,0.3)",
    "backdropFilter": "blur(10px)",
    "borderStyle": "2px solid",
    "transitionSpeed": "0.3s"
  }
}
```

### Campo `customCSS`

CSS completo que se inyecta en el `<head>`. Puedes usar:

- **Variables**: `{{variableName}}` se reemplaza por el valor en `variables`
- **Todas las clases CSS** del overlay (ver sección [Clases CSS](#clases-css))
- **Media queries**, **animaciones**, **pseudo-elementos**, etc.

**Formato**:
```json
{
  "customCSS": ".tv-overlay { background: {{backgroundColor}}; }"
}
```

Para CSS multi-línea (recomendado):
```json
{
  "customCSS": `
    .tv-overlay {
      font-family: {{fontFamily}};
      background: {{backgroundColor}};
    }
    
    .tv-panel {
      border: {{borderStyle}} {{primaryColor}};
      box-shadow: {{boxShadow}};
    }
  `
}
```

---

## Variables Dinámicas

### Sintaxis

```json
{
  "variables": {
    "myColor": "#ff5722"
  },
  "customCSS": ".element { color: {{myColor}}; }"
}
```

**Resultado compilado**:
```css
.element { color: #ff5722; }
```

### Interpolación Múltiple

```json
{
  "variables": {
    "primary": "#6a0dad",
    "radius": "10px"
  },
  "customCSS": `
    .panel {
      border: 2px solid {{primary}};
      border-radius: {{radius}};
      background: linear-gradient(135deg, {{primary}}, #000);
    }
  `
}
```

### Variables No Definidas

Si usas `{{undefinedVar}}` en el CSS pero no la defines en `variables`, se mantiene literal:

```json
{
  "variables": {},
  "customCSS": ".element { color: {{notDefined}}; }"
}
```

**Resultado**:
```css
.element { color: {{notDefined}}; }  /* ⚠️ Inválido */
```

**Recomendación**: Siempre define todas las variables que uses.

---

## Clases CSS

### Estructura Principal

#### `.tv-overlay`
Contenedor raíz que envuelve todo el overlay.

```css
.tv-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
  pointer-events: none;  /* Permite clicks a través del overlay */
  font-family: {{fontFamily}};
}
```

**Propiedades recomendadas**:
- `font-family`: Fuente base
- `color`: Color de texto base
- `font-size`: Tamaño de fuente base

---

### Paneles de Jugadores

#### `.tv-player-info` (Jugador Principal - Abajo)
Panel del jugador en la parte inferior.

```css
.tv-player-info {
  position: absolute;
  bottom: 20px;
  left: calc(50% - 429px);  /* Centrado con panelWidth/2 */
  width: {{panelWidth}};
  min-width: {{panelWidth}};
  max-width: {{panelWidth}};
  background: {{backgroundColor}};
  border: {{borderStyle}} {{primaryColor}};
  border-radius: {{borderRadius}};
  padding: {{padding}};
  box-shadow: {{boxShadow}};
  backdrop-filter: {{backdropFilter}};
  pointer-events: auto;
  transition: all {{transitionSpeed}} ease;
}

/* Indicador de turno activo */
.tv-player-info.active-turn {
  border-color: #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
}
```

#### `.tv-opponent-info` (Oponente - Arriba)
Panel del oponente en la parte superior (misma estructura que `.tv-player-info`).

```css
.tv-opponent-info {
  position: absolute;
  top: 20px;
  left: calc(50% - 429px);
  width: {{panelWidth}};
  /* ... resto igual a .tv-player-info ... */
}
```

---

### Componentes de Paneles

#### `.tv-player-name`
Nombre del jugador.

```css
.tv-player-name {
  font-size: {{titleSize}};
  font-weight: bold;
  color: {{primaryColor}};
  text-shadow: {{textShadow}};
  margin-bottom: 10px;
}
```

#### `.tv-soul`
Alma del jugador con imagen.

```css
.tv-soul {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tv-soul-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid {{secondaryColor}};
}

.tv-soul-name {
  font-size: {{labelSize}};
  color: {{secondaryColor}};
}
```

#### `.tv-hp`
Vida del jugador con barra visual.

```css
.tv-hp {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.tv-hp-label {
  font-size: {{labelSize}};
  font-weight: 600;
  color: {{textColor}};
}

.tv-hp-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #ff5252;  /* Rojo para HP */
}

.tv-hp-bar-container {
  flex: 1;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.tv-hp-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff5252, #ff8a80);
  transition: width {{transitionSpeed}} ease;
  border-radius: 10px;
}
```

#### `.tv-gold`
Oro actual.

```css
.tv-gold {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tv-gold-label {
  font-size: {{labelSize}};
  color: {{textColor}};
}

.tv-gold-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffc107;  /* Dorado */
}
```

#### `.tv-artifacts`
Artefactos con contador.

```css
.tv-artifacts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.tv-artifact-item {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.1);
  padding: 5px 10px;
  border-radius: 15px;
  font-size: {{labelSize}};
}

.tv-artifact-icon {
  width: 20px;
  height: 20px;
}

.tv-artifact-count {
  font-weight: bold;
  color: {{accentColor}};
}
```

#### `.tv-card-counts`
Contadores de cartas (Mano, Mazo, Cementerio).

```css
.tv-card-counts {
  display: flex;
  gap: 15px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.tv-card-count-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.tv-card-count-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
}

.tv-card-count-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: {{primaryColor}};
}
```

---

### Indicador de Turno

#### `.tv-center-info`
Panel central con turno y timer.

```css
.tv-center-info {
  position: absolute;
  left: calc(50% - 520px);  /* Ajusta según diseño */
  top: calc(50% - 140px);
  background: {{backgroundColor}};
  border: {{borderStyle}} {{primaryColor}};
  border-radius: {{borderRadius}};
  padding: 20px;
  text-align: center;
  box-shadow: {{boxShadow}};
  pointer-events: auto;
}

.tv-turn-indicator {
  font-size: 2rem;
  font-weight: bold;
  color: {{primaryColor}};
  margin-bottom: 10px;
}

.tv-turn-number {
  font-size: 3rem;
  color: {{secondaryColor}};
  text-shadow: {{textShadow}};
}

.tv-timer {
  font-size: 1.5rem;
  color: {{accentColor}};
  font-family: 'Courier New', monospace;
}
```

---

### Historial de Acciones

#### `.tv-log-container`
Contenedor del historial en la esquina derecha.

```css
.tv-log-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000000;
  pointer-events: auto;
}
```

#### `.tv-log-button`
Botón flotante para abrir/cerrar el historial.

```css
.tv-log-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: {{primaryColor}};
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: white;
  box-shadow: {{boxShadow}};
  transition: all {{transitionSpeed}} ease;
}

.tv-log-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
```

#### `.tv-log-panel`
Panel desplegable con las entradas del historial.

```css
.tv-log-panel {
  position: absolute;
  top: 60px;
  right: 0;
  width: 350px;
  max-height: 500px;
  background: {{backgroundColor}};
  border: {{borderStyle}} {{primaryColor}};
  border-radius: {{borderRadius}};
  padding: 15px;
  box-shadow: {{boxShadow}};
  backdrop-filter: {{backdropFilter}};
  display: none;  /* Controlado por JS */
}

.tv-log-panel.visible {
  display: block;
}
```

#### `.tv-log-header`
Encabezado del historial con título y botón de cerrar.

```css
.tv-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tv-log-header span {
  font-size: 1.7rem;
  font-weight: bold;
  color: {{primaryColor}};
}

.tv-log-close {
  background: none;
  border: none;
  color: {{textColor}};
  font-size: 1.5rem;
  cursor: pointer;
  transition: color {{transitionSpeed}};
}

.tv-log-close:hover {
  color: {{primaryColor}};
}
```

#### `.tv-log-entries`
Contenedor de las entradas del historial.

```css
.tv-log-entries {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

/* Scrollbar personalizado */
.tv-log-entries::-webkit-scrollbar {
  width: 8px;
}

.tv-log-entries::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.tv-log-entries::-webkit-scrollbar-thumb {
  background: {{primaryColor}};
  border-radius: 4px;
}

.tv-log-entries::-webkit-scrollbar-thumb:hover {
  background: {{secondaryColor}};
}
```

#### `.tv-log-entry`
Una entrada individual del historial.

```css
.tv-log-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  font-size: 1.1rem;
  color: {{textColor}};
  transition: background {{transitionSpeed}};
}

.tv-log-entry:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tv-log-icon {
  font-size: 1.5rem;
  min-width: 25px;
  text-align: center;
}

.tv-log-message {
  flex: 1;
  word-wrap: break-word;
}

/* Tipos de entradas */
.tv-log-entry.type-card {
  border-left: 3px solid #2196f3;  /* Azul */
}

.tv-log-entry.type-spell {
  border-left: 3px solid #9c27b0;  /* Morado */
}

.tv-log-entry.type-destroy {
  border-left: 3px solid #f44336;  /* Rojo */
}

.tv-log-entry.type-artifact {
  border-left: 3px solid #ffc107;  /* Dorado */
}

.tv-log-entry.type-soul {
  border-left: 3px solid #00bcd4;  /* Cyan */
}
```

---

### Notificaciones Flotantes

#### `.tv-notification`
Notificación flotante que aparece temporalmente.

```css
.tv-notification {
  position: fixed;
  top: 425px !important;  /* Posición base */
  left: 19% !important;
  padding: 15px 25px;
  background: {{backgroundColor}};
  border: {{borderStyle}} {{primaryColor}};
  border-radius: {{borderRadius}};
  font-size: 1.125rem;
  color: {{textColor}};
  box-shadow: {{boxShadow}};
  backdrop-filter: {{backdropFilter}};
  z-index: 1000001;
  pointer-events: none;
  animation: slideIn {{transitionSpeed}} ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

#### Tipos de Notificaciones

```css
/* Carta jugada */
.tv-notification.notif-card-played {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.2);
}

/* Hechizo lanzado */
.tv-notification.notif-spell-cast {
  border-color: #9c27b0;
  background: rgba(156, 39, 176, 0.2);
}

/* Monstruo destruido */
.tv-notification.notif-monster-destroyed {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.2);
}

/* Efecto de artefacto */
.tv-notification.notif-artifact {
  border-color: #ffc107;
  background: rgba(255, 193, 7, 0.2);
}

/* Efecto de alma */
.tv-notification.notif-soul {
  border-color: #00bcd4;
  background: rgba(0, 188, 212, 0.2);
}
```

---

## Ejemplos Completos

### Ejemplo 1: Minimal Clean

```json
{
  "metadata": {
    "id": "minimal-clean",
    "name": "Minimal Clean",
    "version": "1.0.0",
    "author": "YourName",
    "description": "Clean and minimal design",
    "isDefault": false
  },
  
  "variables": {
    "primaryColor": "#ffffff",
    "secondaryColor": "#cccccc",
    "backgroundColor": "rgba(255, 255, 255, 0.95)",
    "textColor": "#333333",
    "fontFamily": "'Helvetica Neue', Arial, sans-serif",
    "borderRadius": "4px",
    "panelWidth": "800px"
  },
  
  "customCSS": `
    .tv-overlay {
      font-family: {{fontFamily}};
      color: {{textColor}};
    }
    
    .tv-player-info,
    .tv-opponent-info {
      width: {{panelWidth}};
      min-width: {{panelWidth}};
      max-width: {{panelWidth}};
      background: {{backgroundColor}};
      border: 1px solid #ddd;
      border-radius: {{borderRadius}};
      padding: 15px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .tv-player-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: {{textColor}};
      margin-bottom: 10px;
    }
    
    .tv-hp-bar {
      background: #4caf50;
    }
    
    .tv-notification {
      background: {{backgroundColor}};
      border: 1px solid #ddd;
      color: {{textColor}};
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
  `
}
```

### Ejemplo 2: Neon Cyberpunk

```json
{
  "metadata": {
    "id": "neon-cyberpunk",
    "name": "Neon Cyberpunk",
    "version": "1.0.0",
    "author": "CyberDev",
    "description": "Futuristic neon style",
    "isDefault": false
  },
  
  "variables": {
    "primaryColor": "#ff00ff",
    "secondaryColor": "#00ffff",
    "accentColor": "#ffff00",
    "backgroundColor": "rgba(10, 10, 30, 0.9)",
    "textColor": "#00ffff",
    "fontFamily": "'Orbitron', 'Courier New', monospace",
    "borderRadius": "2px",
    "panelWidth": "900px",
    "glowShadow": "0 0 20px",
    "transitionSpeed": "0.2s"
  },
  
  "customCSS": `
    .tv-overlay {
      font-family: {{fontFamily}};
      color: {{textColor}};
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .tv-player-info,
    .tv-opponent-info {
      width: {{panelWidth}};
      min-width: {{panelWidth}};
      max-width: {{panelWidth}};
      background: {{backgroundColor}};
      border: 2px solid {{primaryColor}};
      border-radius: {{borderRadius}};
      padding: 20px;
      box-shadow: {{glowShadow}} {{primaryColor}};
      position: relative;
      overflow: hidden;
    }
    
    .tv-player-info::before,
    .tv-opponent-info::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent,
        {{primaryColor}},
        transparent
      );
      animation: scan 3s linear infinite;
      opacity: 0.1;
    }
    
    @keyframes scan {
      0% { transform: translateX(-100%) translateY(-100%); }
      100% { transform: translateX(100%) translateY(100%); }
    }
    
    .tv-player-name {
      font-size: 1.5rem;
      font-weight: bold;
      color: {{primaryColor}};
      text-shadow: {{glowShadow}} {{primaryColor}};
      margin-bottom: 15px;
    }
    
    .tv-hp-bar {
      background: linear-gradient(90deg, {{primaryColor}}, {{secondaryColor}});
      box-shadow: inset {{glowShadow}} rgba(255, 255, 255, 0.3);
    }
    
    .tv-notification {
      background: {{backgroundColor}};
      border: 2px solid {{secondaryColor}};
      color: {{secondaryColor}};
      box-shadow: {{glowShadow}} {{secondaryColor}};
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .tv-log-panel {
      background: {{backgroundColor}};
      border: 2px solid {{primaryColor}};
      box-shadow: {{glowShadow}} {{primaryColor}};
    }
    
    .tv-log-entry {
      border: 1px solid {{secondaryColor}};
      background: rgba(0, 255, 255, 0.05);
    }
  `
}
```

### Ejemplo 3: Retro Arcade

```json
{
  "metadata": {
    "id": "retro-arcade",
    "name": "Retro Arcade",
    "version": "1.0.0",
    "author": "RetroGamer",
    "description": "8-bit arcade style",
    "isDefault": false
  },
  
  "variables": {
    "primaryColor": "#00ff00",
    "secondaryColor": "#ffff00",
    "backgroundColor": "#000000",
    "textColor": "#00ff00",
    "fontFamily": "'Press Start 2P', 'Courier New', monospace",
    "borderRadius": "0px",
    "panelWidth": "850px"
  },
  
  "customCSS": `
    .tv-overlay {
      font-family: {{fontFamily}};
      color: {{textColor}};
      image-rendering: pixelated;
    }
    
    .tv-player-info,
    .tv-opponent-info {
      width: {{panelWidth}};
      min-width: {{panelWidth}};
      max-width: {{panelWidth}};
      background: {{backgroundColor}};
      border: 4px solid {{primaryColor}};
      border-radius: {{borderRadius}};
      padding: 16px;
      box-shadow: 
        0 0 0 2px #000,
        0 0 0 6px {{primaryColor}},
        inset 0 0 20px rgba(0, 255, 0, 0.2);
    }
    
    .tv-player-name {
      font-size: 0.8rem;
      color: {{secondaryColor}};
      text-shadow: 2px 2px 0 #000;
      margin-bottom: 12px;
      animation: blink 1s step-start infinite;
    }
    
    @keyframes blink {
      50% { opacity: 0.5; }
    }
    
    .tv-hp-bar-container {
      height: 16px;
      background: #003300;
      border: 2px solid {{primaryColor}};
      border-radius: 0;
    }
    
    .tv-hp-bar {
      background: {{primaryColor}};
      border-radius: 0;
      box-shadow: inset 0 0 8px rgba(0, 255, 0, 0.8);
    }
    
    .tv-notification {
      background: {{backgroundColor}};
      border: 4px solid {{primaryColor}};
      color: {{primaryColor}};
      font-size: 0.7rem;
      box-shadow: 0 0 20px {{primaryColor}};
      animation: slideInPixel 0.3s steps(10);
    }
    
    @keyframes slideInPixel {
      from {
        transform: translateX(-100px);
      }
      to {
        transform: translateX(0);
      }
    }
  `
}
```

---

## Best Practices

### 1. Variables

✅ **Hacer**:
- Define todas las variables que uses
- Usa nombres descriptivos: `primaryColor`, no `c1`
- Agrupa por categorías (colores, tipografía, layout)

❌ **Evitar**:
- Variables no definidas en el CSS
- Nombres crípticos
- Valores hardcodeados que deberían ser variables

### 2. CSS

✅ **Hacer**:
- Usa la sintaxis de variables para reutilización
- Respeta las clases existentes (no las sobrescribas completamente)
- Añade transiciones para suavizar cambios
- Usa `pointer-events: auto` solo en elementos interactivos

❌ **Evitar**:
- `!important` innecesario (solo en `.tv-notification` si es necesario)
- Cambiar la estructura del HTML (eso es inmutable)
- Eliminar propiedades críticas como `position: fixed`

### 3. Compatibilidad

✅ **Hacer**:
- Prueba en diferentes resoluciones
- Usa unidades relativas (`rem`, `em`, `%`)
- Incluye fallbacks para fuentes: `'CustomFont', 'Fallback', sans-serif`

❌ **Evitar**:
- Anchos/altos fijos sin considerar diferentes pantallas
- Fuentes sin fallbacks
- Colores sin suficiente contraste

### 4. Performance

✅ **Hacer**:
- Usa `transform` y `opacity` para animaciones (GPU)
- Limita el uso de `backdrop-filter` (costoso)
- Evita selectores complejos

❌ **Evitar**:
- Animaciones con `left`, `top`, `width`, `height`
- Sombras o filtros excesivos
- Selectores como `.tv-overlay * * * .element`

---

## Validación

### Validación Automática

El plugin valida automáticamente:

1. **Estructura JSON**: ¿Es JSON válido?
2. **Campo `metadata`**: ¿Tiene todos los campos requeridos?
3. **Campo `variables`**: ¿Es un objeto?
4. **Campo `customCSS`**: ¿Es un string?
5. **ID Único**: ¿No existe otra plantilla con el mismo `id`?

### Validación Manual

Antes de importar/distribuir tu plantilla:

1. **Valida el JSON**: Usa [jsonlint.com](https://jsonlint.com/)
2. **Prueba en el plugin**:
   - Importa la plantilla
   - Actívala
   - Ve a modo espectador
   - Verifica que todo se vea correcto
3. **Prueba en diferentes escenarios**:
   - Diferentes almas
   - HP bajo/alto
   - Múltiples artefactos
   - Historial con muchas entradas

---

## Distribución

### Exportar tu Plantilla

1. En Settings → Plantillas, activa tu plantilla (⭐)
2. Haz clic en el icono de descarga (💾)
3. Se descarga `tu_plantilla_id.json`

### Compartir

Puedes compartir tu plantilla:

1. **GitHub**: Sube el JSON a un repositorio
2. **Discord**: Adjunta el archivo en el canal de Undercards
3. **Reddit**: Publica en r/Undertale
4. **Pastebin**: Sube el JSON y comparte el link

### Licencia

Si distribuyes tu plantilla, considera agregar una licencia en la descripción:

```json
{
  "metadata": {
    "description": "My template | MIT License | Feel free to modify!"
  }
}
```

---

## 🎨 Galería de Plantillas

¿Creaste una plantilla increíble? Compártela en:

- **Discord de Undercards**: [Link]
- **GitHub Discussions**: [Link](https://github.com/JoanJuan10/UC_TournamentView/discussions)
- **Reddit**: r/Undertale

---

**¿Tienes dudas? Abre un Issue en GitHub o contacta a los mantenedores.**
