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

### Requisitos previos

1. **Navegador compatible** con extensiones de UserScripts:
   - Chrome, Firefox, Edge, Opera, Safari, etc.

2. **TamperMonkey** (o gestor de UserScripts compatible):
   - [Instalar TamperMonkey](https://www.tampermonkey.net/)

3. **UnderScript** (UserScript base requerido):
   - [Instalar UnderScript](https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js)

### Instalación para desarrollo

1. Asegúrate de tener TamperMonkey y UnderScript instalados
2. Copia el contenido de `src/tournamentview.user.js`
3. Crea un nuevo script en TamperMonkey y pega el código
4. Guarda y recarga Undercards.net
5. Verifica que "TournamentView" aparezca en la lista de plugins de UnderScript

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

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [01_TAMPERMONKEY.md](docs/01_TAMPERMONKEY.md) | Estructura de UserScripts y headers |
| [02_UNDERSCRIPT_PLUGIN_API.md](docs/02_UNDERSCRIPT_PLUGIN_API.md) | API de plugins de UnderScript |
| [03_EVENTOS_JUEGO.md](docs/03_EVENTOS_JUEGO.md) | Eventos del juego para Spectate |
| [04_VARIABLES_GLOBALES.md](docs/04_VARIABLES_GLOBALES.md) | Variables globales accesibles |
| [05_LIBRERIAS_INCLUIDAS.md](docs/05_LIBRERIAS_INCLUIDAS.md) | Librerías disponibles en UnderScript |
| [06_ESPECIFICACION_PROYECTO.md](docs/06_ESPECIFICACION_PROYECTO.md) | Especificación técnica del proyecto |

## 🗺️ Roadmap

### Fase 1 - Fundamentos 🚧 (En progreso)
- [x] Documentación técnica completa
- [x] Configuración Git y CI/CD
- [x] Registro básico del plugin en UnderScript
- [ ] Sistema de plantillas (JSON + CSS)
- [ ] Módulo de estado del juego (GameState)
- [ ] Manejadores de eventos

### Fase 2 - Plantilla Esports (Pendiente)
- [ ] Overlay de información de jugadores
- [ ] Marcadores estilizados (HP, oro, cartas)
- [ ] Panel de historial de acciones
- [ ] Animaciones de eventos (victoria, derrota, jugadas)

### Fase 3 - Gestión de Plantillas (Pendiente)
- [ ] Importar/Exportar plantillas
- [ ] Editor visual de plantillas
- [ ] Galería de plantillas comunitarias

### Fase 4 - Integraciones (Futuro)
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
