# 🤝 Guía de Contribución - UC_TournamentView

¡Gracias por tu interés en contribuir a UC_TournamentView! Este documento te guiará a través del proceso de contribución.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estilo de Código](#estilo-de-código)
- [Commits y Pull Requests](#commits-y-pull-requests)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Funcionalidades](#sugerir-funcionalidades)

---

## Código de Conducta

Este proyecto se adhiere a un código de conducta básico:

- **Sé respetuoso**: Trata a todos con respeto y consideración
- **Sé constructivo**: Las críticas deben ser constructivas y orientadas a mejorar
- **Sé colaborativo**: Trabaja en equipo y ayuda a otros contribuidores
- **Sé profesional**: Mantén las discusiones centradas en el proyecto

---

## ¿Cómo Puedo Contribuir?

### 1. Reportar Bugs 🐛

Si encuentras un bug, por favor:

1. **Busca primero** en [Issues](https://github.com/JoanJuan10/UC_TournamentView/issues) si ya fue reportado
2. Si no existe, **crea un nuevo Issue** usando la plantilla de Bug Report
3. Incluye toda la información relevante:
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Capturas de pantalla
   - Versiones (plugin, navegador, OS)
   - Console logs (si aplica)

### 2. Sugerir Funcionalidades ✨

¿Tienes una idea para mejorar el plugin?

1. **Revisa los Issues existentes** para ver si alguien ya lo sugirió
2. Si no existe, **crea un nuevo Issue** usando la plantilla de Feature Request
3. Describe claramente:
   - Qué problema resuelve
   - Cómo debería funcionar
   - Por qué sería útil

### 3. Contribuir Código 💻

#### Tipos de Contribuciones

- **Bug Fixes**: Corregir errores existentes
- **Features**: Implementar nuevas funcionalidades
- **Refactoring**: Mejorar código existente sin cambiar funcionalidad
- **Documentation**: Mejorar la documentación
- **Templates**: Crear nuevas plantillas visuales
- **i18n**: Añadir nuevos idiomas

---

## Configuración del Entorno

### Prerrequisitos

- **Node.js** v14.0.0 o superior
- **npm** v6.0.0 o superior
- **Git**
- **Editor**: VS Code recomendado

### Instalación

```bash
# 1. Fork el repositorio en GitHub

# 2. Clona tu fork
git clone https://github.com/TU_USUARIO/UC_TournamentView.git
cd UC_TournamentView

# 3. Añade el repositorio original como upstream
git remote add upstream https://github.com/JoanJuan10/UC_TournamentView.git

# 4. Instala dependencias
npm install

# 5. Crea una rama para tu feature
git checkout -b feature/mi-nueva-feature
```

### Comandos Útiles

```bash
# Modo desarrollo (watch mode)
npm run dev

# Compilar para producción
npm run build

# Linter
npm run lint

# Tests (si aplica)
npm test
```

---

## Proceso de Desarrollo

### 1. Crea una Rama

```bash
# Para features
git checkout -b feature/nombre-descriptivo

# Para bug fixes
git checkout -b fix/nombre-del-bug

# Para documentación
git checkout -b docs/tema-documentado
```

**Nomenclatura de ramas**:
- `feature/`: Nueva funcionalidad
- `fix/`: Corrección de bug
- `docs/`: Cambios en documentación
- `refactor/`: Refactorización de código
- `style/`: Cambios de estilo (formateo, etc.)
- `test/`: Añadir o modificar tests

### 2. Desarrolla

```bash
# Inicia el modo watch
npm run dev

# Haz tus cambios en src/index.js, templates/, docs/, etc.

# Prueba tus cambios en Undercards.net
# - Instala el archivo compilado (dist/tournamentview.user.js)
# - Ve a modo espectador
# - Verifica que funciona correctamente
```

### 3. Commit

```bash
# Añade los archivos modificados
git add .

# Haz commit con mensaje descriptivo
git commit -m "feat: add new notification type for spells"
```

### 4. Push

```bash
# Sube tu rama a tu fork
git push origin feature/mi-nueva-feature
```

### 5. Pull Request

1. Ve a GitHub y abre un **Pull Request** desde tu rama
2. Usa la plantilla de PR y completa toda la información
3. Espera la revisión
4. Realiza cambios si se solicitan
5. Una vez aprobado, el PR será mergeado

---

## Estilo de Código

### JavaScript

#### Convenciones Generales

```javascript
// ✅ HACER
class MiClase {
  constructor() {
    this.miVariable = 'valor';
  }
  
  miMetodo() {
    const resultado = this.calcular();
    return resultado;
  }
}

// ❌ EVITAR
class miclase {
  constructor() {
    this.mi_variable = 'valor';  // No usar snake_case
  }
  
  mi_metodo() {  // No usar snake_case
    return this.calcular()  // Falta punto y coma
  }
}
```

#### Naming Conventions

- **Classes**: PascalCase → `UIManager`, `I18n`
- **Methods/Functions**: camelCase → `updatePlayerHP()`, `showNotification()`
- **Variables**: camelCase → `activeTemplate`, `playerName`
- **Constants**: UPPER_SNAKE_CASE → `MAX_NOTIFICATIONS`, `DEFAULT_TEMPLATE_ID`
- **Private**: underscore prefix → `_privateMethod()`

#### Indentación y Espacios

```javascript
// ✅ HACER: 2 espacios
if (condition) {
  doSomething();
  doAnotherThing();
}

// ❌ EVITAR: 4 espacios o tabs
if (condition) {
    doSomething();
}
```

#### Strings

```javascript
// ✅ HACER: Single quotes para strings normales
const mensaje = 'Hola mundo';

// ✅ HACER: Template literals para interpolación
const saludo = `Hola, ${nombre}`;

// ❌ EVITAR: Double quotes sin razón
const mensaje = "Hola mundo";
```

#### Comments

```javascript
// ✅ HACER: Comentarios descriptivos
// Actualiza la vida del jugador y sincroniza la barra visual
updatePlayerHP(hp, maxHP) {
  // Calcula el porcentaje para la barra
  const percentage = (hp / maxHP) * 100;
  
  // Actualiza el DOM
  this.hpBar.style.width = `${percentage}%`;
}

// ❌ EVITAR: Comentarios obvios o inútiles
// Actualiza HP
updatePlayerHP(hp, maxHP) {
  // Calcula
  const percentage = (hp / maxHP) * 100;
  // Hace algo
  this.hpBar.style.width = `${percentage}%`;
}
```

### CSS

```css
/* ✅ HACER: Selectores específicos */
.tv-player-info {
  background: rgba(0, 0, 0, 0.85);
  border: 2px solid #6a0dad;
  border-radius: 10px;
}

/* ✅ HACER: Agrupar propiedades relacionadas */
.tv-notification {
  /* Layout */
  position: fixed;
  top: 425px;
  left: 19%;
  
  /* Visual */
  background: rgba(0, 0, 0, 0.85);
  border: 2px solid #6a0dad;
  
  /* Typography */
  font-size: 1.125rem;
  color: #ffffff;
}

/* ❌ EVITAR: Selectores genéricos */
div {
  background: red;
}
```

### JSON (Templates)

```json
{
  "metadata": {
    "id": "kebab-case-id",
    "name": "Human Readable Name",
    "version": "1.0.0"
  },
  
  "variables": {
    "camelCaseVariable": "#6a0dad"
  }
}
```

---

## Commits y Pull Requests

### Formato de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formateo, punto y coma, etc. (no afecta código)
- `refactor`: Refactorización (no es fix ni feature)
- `perf`: Mejora de performance
- `test`: Añadir o corregir tests
- `chore`: Cambios en build, dependencias, etc.

#### Ejemplos

```bash
# Feature
git commit -m "feat: add support for custom notification sounds"

# Bug fix
git commit -m "fix: resolve HP bar not updating correctly"

# Documentation
git commit -m "docs: update TEMPLATE_GUIDE with new CSS classes"

# Refactor
git commit -m "refactor: improve UIManager performance"

# Breaking change
git commit -m "feat!: change template structure (BREAKING CHANGE)"
```

### Pull Request Checklist

Antes de abrir un PR, asegúrate de:

- [ ] Has probado tus cambios en modo espectador
- [ ] Has probado con diferentes plantillas
- [ ] Has probado con i18n (ES y EN)
- [ ] No hay console.log() olvidados
- [ ] El código sigue el estilo del proyecto
- [ ] Has actualizado la documentación si es necesario
- [ ] Has añadido comentarios en código complejo
- [ ] El código compila sin errores (`npm run build`)
- [ ] Has escrito un mensaje de commit descriptivo

---

## Reportar Bugs

### Información Requerida

Cuando reportes un bug, incluye:

1. **Descripción clara** del problema
2. **Pasos para reproducir**:
   ```
   1. Ve a Undercards.net/Game?id=12345/Spectate
   2. Activa la plantilla "Dark Mode Pro"
   3. Observa que...
   ```
3. **Comportamiento esperado**: "Debería mostrar..."
4. **Comportamiento actual**: "En cambio, muestra..."
5. **Capturas de pantalla** (si es visual)
6. **Entorno**:
   - Navegador y versión
   - Sistema operativo
   - Versión del plugin
   - Versión de UnderScript
7. **Console logs** (abre DevTools → Console):
   ```
   [TournamentView] Error: ...
   ```

### Template de Bug Report

Usa la plantilla en `.github/ISSUE_TEMPLATE/bug_report.md`

---

## Sugerir Funcionalidades

### Información Requerida

Cuando sugieras una feature, incluye:

1. **Descripción clara** de la funcionalidad
2. **Motivación**: ¿Qué problema resuelve?
3. **Comportamiento propuesto**: ¿Cómo debería funcionar?
4. **Alternativas**: ¿Consideraste otras soluciones?
5. **Mockups** (opcional): Capturas o dibujos de cómo se vería

### Template de Feature Request

Usa la plantilla en `.github/ISSUE_TEMPLATE/feature_request.md`

---

## Testing

### Testing Manual

Para cada PR, prueba:

1. **Funcionalidad básica**:
   - [ ] El overlay aparece en modo espectador
   - [ ] Los datos se actualizan correctamente

2. **Plantillas**:
   - [ ] Default Tournament View
   - [ ] Classic Spectator
   - [ ] Dark Mode Pro

3. **i18n**:
   - [ ] Español (ES)
   - [ ] Inglés (EN)

4. **Navegadores**:
   - [ ] Google Chrome
   - [ ] Mozilla Firefox

5. **Escenarios específicos de tu cambio**

### Testing Automatizado (Futuro)

En el futuro, usaremos Jest para tests:

```javascript
// Ejemplo de test
describe('UIManager', () => {
  test('should update HP correctly', () => {
    const ui = new UIManager();
    ui.updatePlayerHP(15, 30);
    expect(document.querySelector('.tv-hp-value').textContent).toBe('15/30');
  });
});
```

---

## Crear Nuevas Plantillas

Si quieres contribuir una plantilla:

1. **Crea el JSON** en `templates/`
2. **Sigue la estructura** de [TEMPLATE_GUIDE.md](docs/TEMPLATE_GUIDE.md)
3. **Prueba exhaustivamente**:
   - Diferentes resoluciones
   - Diferentes estados del juego
   - Legibilidad de texto
4. **Documenta** en el PR:
   - Captura de pantalla
   - Descripción del estilo
   - Inspiración/concepto

---

## Añadir Nuevos Idiomas

Para añadir un nuevo idioma (ej. Francés):

1. **Edita `src/index.js`**:

```javascript
class I18n {
  constructor() {
    this.translations = {
      es: { /* ... */ },
      en: { /* ... */ },
      fr: {  // ✨ Nuevo idioma
        'app.title': 'Vue de Tournoi',
        'turn.label': 'Tour',
        'hp.label': 'PV',
        // ... todas las keys traducidas
      }
    };
  }
}
```

2. **Añade el idioma al selector** en Settings:

```javascript
{
  type: 'select',
  id: 'language',
  label: 'Idioma / Language',
  options: [
    { value: 'es', label: '🇪🇸 Español' },
    { value: 'en', label: '🇬🇧 English' },
    { value: 'fr', label: '🇫🇷 Français' }  // ✨ Nuevo
  ]
}
```

3. **Prueba** que todas las traducciones funcionan

---

## Preguntas Frecuentes

### ¿Cómo pruebo mis cambios?

1. Compila: `npm run build`
2. Instala `dist/tournamentview.user.js` en Tampermonkey
3. Ve a Undercards.net en modo espectador
4. Verifica que tus cambios funcionan

### ¿Puedo trabajar en un Issue sin asignármelo?

Sí, pero es recomendable comentar en el Issue que vas a trabajar en él para evitar duplicados.

### ¿Cuánto tiempo tarda la revisión de un PR?

Intentamos revisar PRs en 2-3 días. Si no hay respuesta, puedes hacer ping en el PR.

### ¿Puedo proponer cambios grandes?

Sí, pero es mejor discutirlo primero en un Issue para asegurarse de que está alineado con la visión del proyecto.

---

## Contacto

- **GitHub Issues**: [Abre un Issue](https://github.com/JoanJuan10/UC_TournamentView/issues)
- **GitHub Discussions**: [Inicia una discusión](https://github.com/JoanJuan10/UC_TournamentView/discussions)

---

## Licencia

Al contribuir, aceptas que tus contribuciones se licenciarán bajo la [Licencia MIT](LICENSE).

---

**¡Gracias por contribuir a UC_TournamentView! 🎉**
