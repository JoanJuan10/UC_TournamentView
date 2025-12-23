const underscript = window.underscript;
const plugin = underscript.plugin('TournamentView', GM_info.version);

// Setting básico de activación
const isEnabled = plugin.settings().add({
    key: 'enabled',
    name: 'Activar Tournament View',
    type: 'boolean',
    default: true,
});

plugin.events.on(':preload', () => {
    if (!isEnabled.value) return;
    console.log('TournamentView plugin loaded');
});
