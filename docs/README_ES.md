# UC_TournamentView

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/JoanJuan10/UC_TournamentView/releases)
[![Status](https://img.shields.io/badge/status-beta-green.svg)](https://github.com/JoanJuan10/UC_TournamentView)

> Plugin profesional para [UnderScript](https://github.com/UCProjects/UnderScript) que transforma la experiencia de espectador de [Undercards.net](https://undercards.net) con overlays estilo torneo profesional.

**[🇬🇧 English Version](../README.md)**

![UC_TournamentView Demo](https://via.placeholder.com/800x400?text=UC_TournamentView+Demo)

## ✨ Características

- 🎨 **Sistema de Plantillas** - 3 plantillas predefinidas + importar/exportar personalizadas
- 🌐 **Multiidioma** - Español e Inglés con cambio en tiempo real
- 📊 **Información en Tiempo Real** - HP, oro, almas, artefactos, cartas, timer
- 🎯 **Indicador de Turno** - Animaciones para identificar al jugador activo
- 📜 **Historial de Acciones** - Panel flotante con registro completo de la partida
- 💾 **Persistencia** - Todas las configuraciones se guardan automáticamente

## 🚀 Instalación Rápida

### Requisitos

1. Navegador moderno (Chrome, Firefox, Edge, Opera)
2. [Tampermonkey](https://www.tampermonkey.net/)
3. [UnderScript](https://github.com/UCProjects/UnderScript)

### Pasos

1. **Descarga**: [Última versión](https://github.com/JoanJuan10/UC_TournamentView/releases/latest/download/tournamentview.user.js)
2. **Instala**: Clic en el archivo → Tampermonkey abre → Clic en "Instalar"
3. **Activa**: Undercards.net → Menú UnderScript → Settings → Plugins → TournamentView → ✅ Activar
4. **Usa**: Visita cualquier partida en modo `/Spectate`

## 🎨 Plantillas

| Plantilla | Estilo | Ideal Para |
|-----------|--------|------------|
| **Default** | Gradientes morado/azul modernos | Streaming general |
| **Classic Spectator** | Azul/blanco limpio | Look profesional |
| **Dark Mode Pro** | Oscuro con acentos cyan/naranja | Sesiones nocturnas |

### Plantillas Personalizadas

Crea tu propia plantilla en JSON:

```json
{
  "metadata": {
    "id": "mi-plantilla",
    "name": "Mi Plantilla",
    "version": "1.0.0",
    "author": "Tu Nombre"
  },
  "variables": {
    "primaryColor": "#6a0dad",
    "secondaryColor": "#00bcd4"
  },
  "customCSS": "/* Tu CSS aquí */"
}
```

Consulta la [Guía de Plantillas](TEMPLATE_GUIDE.md) para más detalles.

## ⚙️ Configuración

Accede a los settings vía: **Menú UnderScript → Plugins → TournamentView**

| Opción | Descripción | Predeterminado |
|--------|-------------|----------------|
| Activar | Enciende/apaga el plugin | Desactivado |
| Idioma | Español o Inglés | Español |
| Plantilla | Plantilla visual activa | Default |

### Gestión de Plantillas

- ⭐ **Icono estrella** - Activar plantilla
- 💾 **Icono descarga** - Exportar como JSON
- 🗑️ **Icono papelera** - Eliminar plantillas personalizadas

## 🛠️ Desarrollo

```bash
git clone https://github.com/JoanJuan10/UC_TournamentView.git
cd UC_TournamentView
npm install
npm start      # Modo watch
npm run build  # Build de producción
```

### Estructura del Proyecto

```
├── src/index.js           # Código fuente (~4900 líneas)
├── dist/                  # Output compilado (~102 KiB)
├── docs/                  # Documentación
└── templates/             # Ejemplos de plantillas
```

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [Guía de Usuario](USER_GUIDE.md) | Cómo usar el plugin |
| [Guía de Desarrollo](DEVELOPMENT.md) | Setup y arquitectura |
| [Guía de Plantillas](TEMPLATE_GUIDE.md) | Crear plantillas personalizadas |
| [Referencia de API](API.md) | Documentación técnica |

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFeature`)
3. Commit tus cambios (`git commit -m 'Add NuevaFeature'`)
4. Push (`git push origin feature/NuevaFeature`)
5. Abre un Pull Request

Consulta [CONTRIBUTING.md](../CONTRIBUTING.md) para las guías completas.

## 🐛 Issues y Solicitudes

- **Reportar Bugs**: [Abre un issue](https://github.com/JoanJuan10/UC_TournamentView/issues/new?template=bug_report.md)
- **Solicitar Features**: [Abre un issue](https://github.com/JoanJuan10/UC_TournamentView/issues/new?template=feature_request.md)

## 📝 Licencia

Licencia MIT - consulta [LICENSE](../LICENSE) para más detalles.

## 🔗 Enlaces

- [Undercards.net](https://undercards.net)
- [UnderScript](https://github.com/UCProjects/UnderScript)
- [Tampermonkey](https://www.tampermonkey.net/)

---

**Hecho con ❤️ por [JoanJuan10](https://github.com/JoanJuan10) & HectorPSI**
