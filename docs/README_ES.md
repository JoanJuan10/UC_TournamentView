# UC_TournamentView

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/JoanJuan10/UC_TournamentView/releases)
[![Status](https://img.shields.io/badge/status-beta-green.svg)](https://github.com/JoanJuan10/UC_TournamentView)

> Un plugin hecho por fans para [UnderScript](https://github.com/UCProjects/UnderScript) que hace que ver partidas de [Undercards.net](https://undercards.net) se vea como una retransmisión de torneo. ¡Hecho por la comunidad, para la comunidad! 🎮

**[🇬🇧 English Version](../README.md)**

![UC_TournamentView Demo](https://via.placeholder.com/800x400?text=UC_TournamentView+Demo)

## ✨ ¿Qué hace?

- 🎨 **Plantillas** - 3 estilos incluidos + crea las tuyas
- 🌐 **Bilingüe** - Español e Inglés, cambia cuando quieras
- 📊 **Stats en vivo** - HP, oro, almas, artefactos, cartas, timer
- 🎯 **Indicador de turno** - Ve quién está jugando de un vistazo
- 📜 **Historial** - Todo lo que pasa en la partida
- 💾 **Auto-guardado** - Tus ajustes se recuerdan

## 🚀 Instalación Rápida

### Vas a necesitar

1. Un navegador moderno (Chrome, Firefox, Edge, Opera)
2. La extensión [Tampermonkey](https://www.tampermonkey.net/)
3. [UnderScript](https://github.com/UCProjects/UnderScript) instalado

### Cómo instalarlo

1. **Descarga**: [Última versión](https://github.com/JoanJuan10/UC_TournamentView/releases/latest/download/tournamentview.user.js)
2. **Instala**: Haz clic en el archivo → Tampermonkey aparece → Dale a "Instalar"
3. **Activa**: Ve a Undercards.net → Menú UnderScript → Settings → Plugins → TournamentView → Actívalo ✅
4. **¡Listo!**: Ve a ver cualquier partida en modo `/Spectate`

## 🎨 Plantillas

| Plantilla | Estilo | Ideal para |
|-----------|--------|------------|
| **Default** | Degradados morado/azul | Uso diario |
| **Classic Spectator** | Azul/blanco limpio | Look simple |
| **Dark Mode Pro** | Oscuro con cyan/naranja | Sesiones nocturnas |

### ¡Crea las tuyas!

Puedes hacer plantillas personalizadas en JSON:

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

Mira la [Guía de Plantillas](TEMPLATE_GUIDE.md) si quieres ponerte creativo!

## ⚙️ Ajustes

Los encuentras en: **Menú UnderScript → Plugins → TournamentView**

| Opción | Qué hace | Por defecto |
|--------|----------|-------------|
| Activar | Enciende/apaga el overlay | Apagado |
| Idioma | Cambiar entre ES/EN | Español |
| Plantilla | Elige tu estilo favorito | Default |

### Botones de plantilla

- ⭐ **Estrella** - Usar esta plantilla
- 💾 **Descarga** - Guardar como JSON
- 🗑️ **Papelera** - Borrar (solo las personalizadas)

## 🛠️ ¿Quieres colaborar?

```bash
git clone https://github.com/JoanJuan10/UC_TournamentView.git
cd UC_TournamentView
npm install
npm start      # Modo dev con auto-reload
npm run build  # Build para release
```

### Estructura del proyecto

```
├── src/index.js           # Todo el código (~4900 líneas)
├── dist/                  # Plugin compilado
├── docs/                  # Documentación
└── templates/             # Ejemplos de plantillas
```

## 📚 Documentación

| Doc | Qué contiene |
|-----|--------------|
| [Guía de Usuario](USER_GUIDE.md) | Cómo usar todo |
| [Guía de Desarrollo](DEVELOPMENT.md) | Para colaboradores |
| [Guía de Plantillas](TEMPLATE_GUIDE.md) | Crear plantillas custom |
| [Referencia de API](API.md) | Cosas técnicas |

## 🤝 Contribuir

¡Nos encantaría tu ayuda! La versión corta:

1. Haz fork del repo
2. Crea una rama (`git checkout -b feature/CosaMolona`)
3. Haz tus cambios
4. Push y abre un PR

Mira [CONTRIBUTING.md](../CONTRIBUTING.md) para la guía completa.

## 🐛 ¿Encontraste un bug? ¿Tienes una idea?

- **Bugs**: [Repórtalo aquí](https://github.com/JoanJuan10/UC_TournamentView/issues/new?template=bug_report.md)
- **Ideas**: [Compártelas aquí](https://github.com/JoanJuan10/UC_TournamentView/issues/new?template=feature_request.md)

## 📝 Licencia

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) - Libre para usar y modificar con fines no comerciales. Mira [LICENSE](../LICENSE).

## 🔗 Enlaces

- [Undercards.net](https://undercards.net) - El juego que nos gusta
- [UnderScript](https://github.com/UCProjects/UnderScript) - Necesario para que esto funcione
- [Tampermonkey](https://www.tampermonkey.net/) - Extensión del navegador necesaria

---

**Hecho con ❤️ por [JoanJuan10](https://github.com/JoanJuan10)**

*¡Solo un fan que quería hacer más divertido ver partidas!*
