# UC_TournamentView

Plugin para [UnderScript](https://github.com/UCProjects/UnderScript) que moderniza la vista de espectador de [Undercards.net](https://undercards.net) con un sistema de plantillas visuales estilo torneo profesional.

## 📋 Descripción

**UC_TournamentView** transforma la página de espectador (`/Spectate`) de Undercards en una experiencia visual moderna inspirada en transmisiones de esports. El plugin ofrece:

- 🎨 **Sistema de plantillas intercambiables** - Personaliza completamente la apariencia
- 📦 **Importar/Exportar plantillas** - Comparte tus diseños en formato JSON + CSS
- 🎮 **Plantilla "Esports Moderno"** incluida - Lista para usar desde el primer momento
- ⚙️ **Configuración flexible** - Ajusta cada detalle desde el panel de settings

## 🔧 Requisitos

1. **Navegador compatible** con extensiones de UserScripts:
   - Chrome, Firefox, Edge, Opera, Safari, etc.

2. **TamperMonkey** (o gestor de UserScripts compatible):
   - [Instalar TamperMonkey](https://www.tampermonkey.net/)

3. **UnderScript** (UserScript base requerido):
   - [Instalar UnderScript](https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js)

## 📥 Instalación

1. Asegúrate de tener TamperMonkey y UnderScript instalados
2. [Haz clic aquí para instalar UC_TournamentView](#) *(próximamente)*
3. Accede a cualquier partida en modo espectador: `https://undercards.net/Spectate?gameId=XXX&playerId=YYY`
4. ¡Disfruta de la nueva vista de torneo!

## ⚙️ Configuración

Accede a la configuración del plugin desde:
- **Menú de UnderScript** → Settings → Tournament View

### Opciones disponibles:
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

### Fase 1 - Fundamentos ✅
- [x] Documentación técnica
- [ ] Estructura base del plugin
- [ ] Sistema de plantillas (JSON + CSS)

### Fase 2 - Plantilla Esports
- [ ] Overlay de información de jugadores
- [ ] Marcadores estilizados (HP, oro, cartas)
- [ ] Panel de historial de acciones
- [ ] Animaciones de eventos (victoria, derrota, jugadas)

### Fase 3 - Gestión de Plantillas
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
