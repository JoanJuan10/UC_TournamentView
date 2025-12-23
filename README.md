# UC_TournamentView

Plugin para [UnderScript](https://github.com/UCProjects/UnderScript) que moderniza la vista de espectador de [Undercards.net](https://undercards.net) con un sistema de plantillas visuales estilo torneo profesional.

## 📋 Descripción

**UC_TournamentView** es un plugin en desarrollo para [UnderScript](https://github.com/UCProjects/UnderScript) que transformará la página de espectador (`/Spectate`) de Undercards en una experiencia visual moderna inspirada en transmisiones de esports.

### Estado actual: Fase inicial 🚧

El plugin actualmente se encuentra en su fase de desarrollo inicial. Por ahora solo se registra correctamente en UnderScript sin funcionalidades activas. Estamos construyendo la base técnica siguiendo las mejores prácticas de integración con UnderScript.

### Características planeadas:

- 🎨 **Sistema de plantillas intercambiables** - Personaliza completamente la apariencia
- 📦 **Importar/Exportar plantillas** - Comparte tus diseños en formato JSON + CSS
- 🎮 **Plantilla "Esports Moderno"** - Diseño profesional listo para usar
- ⚙️ **Configuración flexible** - Ajusta cada detalle desde el panel de settings

## 🔧 Requisitos

1. **Navegador compatible** con extensiones de UserScripts:
   - Chrome, Firefox, Edge, Opera, Safari, etc.

2. **TamperMonkey** (o gestor de UserScripts compatible):
   - [Instalar TamperMonkey](https://www.tampermonkey.net/)

3. **UnderScript** (UserScript base requerido):
   - [Instalar UnderScript](https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js)

## 📥 Instalación

### ⚠️ Nota importante
Este plugin está actualmente en **desarrollo temprano**. Solo se registra en UnderScript sin funcionalidades activas. No es recomendable instalarlo aún a menos que quieras seguir el desarrollo.

### Para Usuarios Finales (Pendiente)

Cuando el plugin esté listo para usuarios finales, simplemente:

1. Instala [TamperMonkey](https://www.tampermonkey.net/)
2. Instala [UnderScript](https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js)
3. Descarga el plugin desde [Releases](https://github.com/JoanJuan10/UC_TournamentView/releases)
4. TamperMonkey detectará el archivo `.user.js` automáticamente

### Para Desarrolladores

Este plugin usa el [template oficial de UCProjects](https://github.com/UCProjects/plugin-template) con webpack para el build.

#### Requisitos

- [Node.js](https://nodejs.org/) (v12 o superior)
- [Git](https://git-scm.com/)
- [TamperMonkey](https://www.tampermonkey.net/)
- [UnderScript](https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js)

#### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/JoanJuan10/UC_TournamentView.git
cd UC_TournamentView
```

2. Instala las dependencias:
```bash
npm install
```

3. Compila el plugin:
```bash
npm run build
```

4. El archivo compilado estará en `dist/tournamentview.user.js`
5. Instálalo en TamperMonkey arrastrando el archivo al navegador

#### Desarrollo en Tiempo Real

Para desarrollo activo con recompilación automática:

```bash
npm start
```

Esto ejecutará webpack en modo watch. Cada vez que guardes cambios en `src/index.js`, el plugin se recompilará automáticamente en `dist/tournamentview.user.js`.

## ⚙️ Configuración

### Estado actual
Por ahora, el plugin solo incluye un setting básico de activación/desactivación. No hay funcionalidades implementadas aún.

Accede a la configuración del plugin desde:
- **Menú de UnderScript** → Plugins → TournamentView

### Opciones disponibles:
- ✅ Activar/Desactivar Tournament View

### Próximamente:
- Seleccionar plantilla activa
- Importar plantilla (JSON)
- Exportar plantilla actual
- Personalizar colores y posiciones
- Activar/desactivar elementos del overlay

## 🛠️ Desarrollo

### Estructura del Proyecto

```
UC_TournamentView/
├── src/
│   └── index.js              # Código fuente principal
├── dist/
│   ├── tournamentview.user.js  # Script compilado
│   └── tournamentview.meta.js  # Metadatos para actualizaciones
├── docs/                      # Documentación técnica
├── templates/                 # Plantillas de diseño
├── package.json              # Configuración npm
├── webpack.config.js         # Configuración webpack
└── README.md
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala las dependencias del proyecto |
| `npm start` | Inicia webpack en modo watch (desarrollo) |
| `npm run build` | Compila el plugin para producción |

### Flujo de Trabajo

1. Edita el código en `src/index.js`
2. Ejecuta `npm start` para modo watch
3. Los cambios se recompilan automáticamente en `dist/`
4. Recarga la página de Undercards para ver los cambios
5. Para producción, usa `npm run build`

### Basado en el Template Oficial

Este proyecto sigue el [template oficial de UCProjects](https://github.com/UCProjects/plugin-template), que incluye:
- Webpack para bundling y minificación
- `checkerV2.js` para compatibilidad con UnderScript
- Gestión automática de versiones desde `package.json`
- Generación de archivos `.meta.js` para actualizaciones

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [01_TAMPERMONKEY.md](docs/01_TAMPERMONKEY.md) | Estructura de UserScripts, headers y webpack |
| [02_UNDERSCRIPT_PLUGIN_API.md](docs/02_UNDERSCRIPT_PLUGIN_API.md) | API de plugins de UnderScript |
| [03_EVENTOS_JUEGO.md](docs/03_EVENTOS_JUEGO.md) | Eventos del juego para Spectate |
| [04_VARIABLES_GLOBALES.md](docs/04_VARIABLES_GLOBALES.md) | Variables globales accesibles |
| [05_LIBRERIAS_INCLUIDAS.md](docs/05_LIBRERIAS_INCLUIDAS.md) | Librerías disponibles en UnderScript |
| [06_ESPECIFICACION_PROYECTO.md](docs/06_ESPECIFICACION_PROYECTO.md) | Especificación técnica del proyecto |
| [07_DESARROLLO.md](docs/07_DESARROLLO.md) | **Guía de desarrollo con webpack** |

## 🗺️ Roadmap

### Fase 1 - Fundamentos ✅ (Completado)
- [x] Documentación técnica completa
- [x] Configuración Git y CI/CD
- [x] Migración al template oficial de UCProjects
- [x] Configuración de webpack y build system
- [x] Registro básico del plugin en UnderScript

### Fase 2 - Sistema de Plantillas 🚧 (Siguiente)
- [ ] Sistema de plantillas (JSON + CSS)
- [ ] Módulo de estado del juego (GameState)
- [ ] Manejadores de eventos
- [ ] Inyección de CSS dinámico

### Fase 3 - Plantilla Esports (Pendiente)
- [ ] Overlay de información de jugadores
- [ ] Marcadores estilizados (HP, oro, cartas)
- [ ] Panel de historial de acciones
- [ ] Animaciones de eventos (victoria, derrota, jugadas)

### Fase 4 - Gestión de Plantillas (Pendiente)
- [ ] Importar/Exportar plantillas
- [ ] Editor visual de plantillas
- [ ] Galería de plantillas comunitarias

### Fase 5 - Integraciones (Futuro)
- [ ] Soporte para Challonge
- [ ] Integración con sistemas de torneo
- [ ] Exportación de datos de partida

## 🤝 Contribuir

¿Quieres contribuir al proyecto? ¡Genial!

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-plantilla`)
3. Realiza tus cambios y haz commit
4. Envía un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia especificada en [LICENSE](LICENSE).

## 🔗 Enlaces Útiles

- [Undercards.net](https://undercards.net) - Juego original
- [UnderScript GitHub](https://github.com/UCProjects/UnderScript) - UserScript base
- [TamperMonkey](https://www.tampermonkey.net/) - Gestor de UserScripts
- [Documentación TamperMonkey (ES)](https://www.tampermonkey.net/documentation.php?locale=es)

---

*Desarrollado con ❤️ para la comunidad de Undercards*
