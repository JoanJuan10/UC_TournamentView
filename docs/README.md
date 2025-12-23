# 📚 Documentación UC_TournamentView

> Centro de documentación del plugin UC_TournamentView para UnderScript

---

## 🚀 Inicio Rápido

### Para Usuarios Finales

1. **Instala los requisitos**:
   - [TamperMonkey](https://www.tampermonkey.net/)
   - [UnderScript](https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js)

2. **Instala el plugin**:
   - Descarga `dist/tournamentview.user.js`
   - Abre el archivo con TamperMonkey
   - Confirma la instalación

3. **Activa el plugin**:
   - Ve a Undercards.net
   - Menú UnderScript → Plugins → TournamentView
   - Marca "Activar Tournament View"

4. **Disfruta**:
   - Visita cualquier partida en modo Spectate
   - El overlay aparecerá automáticamente

### Para Desarrolladores

```bash
git clone https://github.com/JoanJuan10/UC_TournamentView.git
cd UC_TournamentView
npm install
npm start  # Modo desarrollo con watch
```

Consulta [07_DESARROLLO.md](07_DESARROLLO.md) para la guía completa.

---

## 📖 Documentación por Tema

### 🔰 Fundamentos

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[README.md](../README.md)** | Descripción general del proyecto, instalación y roadmap | Todos |
| **[01_TAMPERMONKEY.md](01_TAMPERMONKEY.md)** | Estructura de UserScripts, headers y webpack | Desarrolladores |
| **[02_UNDERSCRIPT_PLUGIN_API.md](02_UNDERSCRIPT_PLUGIN_API.md)** | API de plugins de UnderScript | Desarrolladores |

### 🎮 Undercards

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[03_EVENTOS_JUEGO.md](03_EVENTOS_JUEGO.md)** | Eventos del juego disponibles en modo Spectate | Desarrolladores |
| **[04_VARIABLES_GLOBALES.md](04_VARIABLES_GLOBALES.md)** | Variables globales accesibles desde el plugin | Desarrolladores |
| **[05_LIBRERIAS_INCLUIDAS.md](05_LIBRERIAS_INCLUIDAS.md)** | Librerías disponibles en UnderScript | Desarrolladores |

### 🏗️ Proyecto

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[06_ESPECIFICACION_PROYECTO.md](06_ESPECIFICACION_PROYECTO.md)** | Especificación técnica completa del proyecto | Desarrolladores |
| **[07_DESARROLLO.md](07_DESARROLLO.md)** | Guía completa de desarrollo con webpack | Desarrolladores |
| **[08_ESTADO_ACTUAL.md](08_ESTADO_ACTUAL.md)** | Estado actual de implementación (beta funcional) | Todos |
| **[09_LECCIONES_APRENDIDAS.md](09_LECCIONES_APRENDIDAS.md)** | Lecciones técnicas y mejores prácticas | Desarrolladores |

### 📝 Referencia

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[underscript.js](underscript.js)** | Código fuente completo de UnderScript | Desarrolladores avanzados |

---

## 🎯 Rutas de Aprendizaje

### 🌱 Usuario Nuevo

1. Lee [README.md](../README.md) para entender qué hace el plugin
2. Instala el plugin siguiendo las instrucciones
3. Activa el plugin en los settings de UnderScript
4. Visita una partida en modo Spectate

### 👨‍💻 Desarrollador Nuevo

1. **Fundamentos**:
   - [01_TAMPERMONKEY.md](01_TAMPERMONKEY.md) - Entiende cómo funcionan los UserScripts
   - [02_UNDERSCRIPT_PLUGIN_API.md](02_UNDERSCRIPT_PLUGIN_API.md) - Aprende la API de plugins

2. **Contexto del Juego**:
   - [03_EVENTOS_JUEGO.md](03_EVENTOS_JUEGO.md) - Eventos disponibles
   - [04_VARIABLES_GLOBALES.md](04_VARIABLES_GLOBALES.md) - Acceso a datos del juego

3. **Desarrollo**:
   - [07_DESARROLLO.md](07_DESARROLLO.md) - Setup y flujo de trabajo
   - [06_ESPECIFICACION_PROYECTO.md](06_ESPECIFICACION_PROYECTO.md) - Arquitectura del proyecto

4. **Implementación**:
   - [08_ESTADO_ACTUAL.md](08_ESTADO_ACTUAL.md) - ¿Qué está hecho?
   - [09_LECCIONES_APRENDIDAS.md](09_LECCIONES_APRENDIDAS.md) - Tips y mejores prácticas
   - Revisa `src/index.js` para el código fuente

### 🚀 Contribuidor

1. **Preparación**:
   - Lee [07_DESARROLLO.md](07_DESARROLLO.md) - Setup del entorno
   - Revisa [08_ESTADO_ACTUAL.md](08_ESTADO_ACTUAL.md) - ¿Qué falta implementar?
   - Lee [09_LECCIONES_APRENDIDAS.md](09_LECCIONES_APRENDIDAS.md) - Evita problemas comunes

2. **Implementación**:
   - Elige una feature del roadmap en [README.md](../README.md)
   - Estudia la arquitectura en [06_ESPECIFICACION_PROYECTO.md](06_ESPECIFICACION_PROYECTO.md)
   - Desarrolla usando los patrones del proyecto

3. **Contribución**:
   - Crea un fork del repositorio
   - Implementa tu feature
   - Crea un Pull Request con descripción clara

---

## 🔍 Búsqueda Rápida

### Por Tema

**Events** → [03_EVENTOS_JUEGO.md](03_EVENTOS_JUEGO.md)  
**Variables** → [04_VARIABLES_GLOBALES.md](04_VARIABLES_GLOBALES.md)  
**Settings** → [02_UNDERSCRIPT_PLUGIN_API.md](02_UNDERSCRIPT_PLUGIN_API.md#settings)  
**CSS** → [06_ESPECIFICACION_PROYECTO.md](06_ESPECIFICACION_PROYECTO.md#plantilla-base-esports-moderno)  
**GameState** → [08_ESTADO_ACTUAL.md](08_ESTADO_ACTUAL.md#2-sistema-de-datos-gamestate)  
**DOM Extraction** → [08_ESTADO_ACTUAL.md](08_ESTADO_ACTUAL.md#5-extracción-de-datos-del-dom)  
**Webpack** → [07_DESARROLLO.md](07_DESARROLLO.md#configuración-de-webpack)  
**Debugging** → [07_DESARROLLO.md](07_DESARROLLO.md#debugging)

### Por Problema

**Timer no funciona** → [09_LECCIONES_APRENDIDAS.md](09_LECCIONES_APRENDIDAS.md#4-timer-sincronización)  
**Settings no funcionan** → [09_LECCIONES_APRENDIDAS.md](09_LECCIONES_APRENDIDAS.md#1-underscript-settings-api---función-getter)  
**Contador incorrecto** → [09_LECCIONES_APRENDIDAS.md](09_LECCIONES_APRENDIDAS.md#3-índices-invertidos-en-el-dom)  
**404 en imágenes** → [08_ESTADO_ACTUAL.md](08_ESTADO_ACTUAL.md#imágenes-de-almas-con-error-404)  
**Build falla** → [07_DESARROLLO.md](07_DESARROLLO.md#problemas-comunes)

---

## 📊 Estado del Proyecto

**Versión Actual**: 0.1.0  
**Estado**: Beta Funcional  
**Última Actualización**: 24 de diciembre de 2025

### Progreso General

```
Fase 1: Fundamentos         ████████████████████ 100% ✅
Fase 2: UI Base             ████████████████████ 100% ✅
Fase 3: Animaciones         ████░░░░░░░░░░░░░░░░  20% 🚧
Fase 4: Plantillas          ░░░░░░░░░░░░░░░░░░░░   0% 📦
Fase 5: Integraciones       ░░░░░░░░░░░░░░░░░░░░   0% 🔮
```

Ver detalles en [README.md](../README.md#-roadmap) y [08_ESTADO_ACTUAL.md](08_ESTADO_ACTUAL.md).

---

## 🛠️ Arquitectura Simplificada

```
┌─────────────────────────────────────────┐
│         TamperMonkey (Navegador)        │
└───────────────┬─────────────────────────┘
                │
    ┌───────────▼───────────┐
    │     UnderScript       │
    │   (Plugin System)     │
    └───────────┬───────────┘
                │
    ┌───────────▼───────────┐
    │   UC_TournamentView   │
    │                       │
    │  ┌─────────────────┐  │
    │  │   GameState     │  │ ← Datos
    │  ├─────────────────┤  │
    │  │ TemplateManager │  │ ← CSS
    │  ├─────────────────┤  │
    │  │   UIManager     │  │ ← DOM
    │  └─────────────────┘  │
    └───────────┬───────────┘
                │
    ┌───────────▼───────────┐
    │    Undercards.net     │
    │    (Página web)       │
    └───────────────────────┘
```

Ver diagrama completo en [06_ESPECIFICACION_PROYECTO.md](06_ESPECIFICACION_PROYECTO.md#arquitectura-del-plugin).

---

## 💡 Tips Rápidos

### Para Usuarios

- **No funciona el overlay?** → Verifica que esté activado en los settings de UnderScript
- **Quiero desactivarlo?** → Desactiva "Activar Tournament View" en settings
- **Cómo personalizar colores?** → Por ahora no se puede, llegará en Fase 4

### Para Desarrolladores

- **Usa `npm start`** → Recompilación automática al guardar
- **Console.log con prefijo** → `console.log('[TournamentView] ...')` para filtrar fácilmente
- **Lee el DOM, no asumas** → Usa DevTools para ver la estructura real
- **isEnabled.value()** → Es una función, llámala con `()`
- **Fallbacks siempre** → DOM puede cambiar, ten plan B

Ver más en [09_LECCIONES_APRENDIDAS.md](09_LECCIONES_APRENDIDAS.md).

---

## 🤝 Comunidad

- **GitHub**: [JoanJuan10/UC_TournamentView](https://github.com/JoanJuan10/UC_TournamentView)
- **Issues**: [Reportar bugs o sugerir features](https://github.com/JoanJuan10/UC_TournamentView/issues)
- **Pull Requests**: Contribuciones bienvenidas

---

## 📜 Licencia

Ver [LICENSE](../LICENSE) para detalles.

---

*Documentación generada: 24 de diciembre de 2025*  
*Mantenida por: JoanJuan10*
