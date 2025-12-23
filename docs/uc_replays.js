// ==UserScript==
// @name         UC Replays
// @version      0.3
// @description  Adds ability to record and watch UnderCards match replays
// @author       rashidsh
// @run-at       document-idle
// @match        https://undercards.net/*
// @require      https://www.unpkg.com/pako@2.1.0/dist/pako.min.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undercards.net
// @source       https://gist.github.com/rashidsh/91942373b349d6194fe558737f6cdccd
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// ==/UserScript==

(function() {
  'use strict';

  const plugin = underscript.plugin('Replays');
  const eventManager = plugin.events;
  const settings = plugin.settings();

  const importantEvents = [
    'getTurnStart', 'getTurnEnd',
    'getUpdateBoard', 'getUpdateDustpile', 'getUpdateHand', 'getUpdatePlayerHp',
  ];

  let metaData = {};
  let gameLog = [];
  let paused = false;
  let targetTurn = null;
  let currentTurn = 0;
  let firstTurnPlayerId = null;

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const base64_arraybuffer = async (data) => {
    // Use a FileReader to generate a base64 data URI
    const base64url = await new Promise((r) => {
      const reader = new FileReader()
      reader.onload = () => r(reader.result)
      reader.readAsDataURL(new Blob([data]))
    })

    /*
    The result looks like
    "data:application/octet-stream;base64,<your base64 data>",
    so we split off the beginning:
    */
    return base64url.substring(base64url.indexOf(',') + 1);
  }

  const downloadJSON = (obj, name) => {
    const a = document.createElement('a');
    const type = name.split('.').pop();
    a.href = URL.createObjectURL(new Blob([JSON.stringify(obj)], {type: 'text/json'}));
    a.download = name;
    a.click();
  }

  const decompressString = encodedString => {
    const compressedData = Uint8Array.from(atob(encodedString), c => c.charCodeAt(0));
    const data = pako.inflate(compressedData);
    const result = new TextDecoder().decode(data);
    return JSON.parse(result);
  }

  const loadReplay = (id, decompress = true) => {
    const encodedString = GM_getValue('replay_' + id);
    const metaDataString = GM_getValue('replay_' + id + '_meta');
    return [JSON.parse(metaDataString), decompress ? decompressString(encodedString) : encodedString];
  }

  const saveReplay = (id, metaData, gameLog, callback) => {
    let encoded = new TextEncoder().encode(JSON.stringify(gameLog));
    let gameLogData = pako.deflate(encoded);
    base64_arraybuffer(gameLogData).then(encodedString => {
      GM_setValue('replay_' + id, encodedString);
      GM_setValue('replay_' + id + '_meta', JSON.stringify(metaData));

      deleteOldReplays();
      if (callback) callback();
    })
  }

  const deleteReplay = id => {
    GM_deleteValue('replay_' + id);
    GM_deleteValue('replay_' + id + '_meta');
  }

  const deleteOldReplays = () => {
    let count = 0;
    Object.values(GM_listValues().reverse()).forEach(function(key) {
      if (!/replay_\d+_meta/.test(key)) return;
      if (++count <= replayLimit.value()) return;

      const replayId = key.split('_')[1];
      deleteReplay(replayId);
    });
  }

  const seekTurn = turn => {
    targetTurn = turn;
    unsafeWindow.eventQueue = [];
    $('#btn-replay-pause').prop('disabled', false);
    $('.btn-replay-seek').prop('disabled', true);
  }

  const replay = async (metaData, log) => {
    const step = 20;
    let currentIndex = 0;
    let currentTime = 0;

    while (currentIndex < log.length) {
      const event = log[currentIndex];

      if (event.action === 'connect') {
        firstTurnPlayerId = event.userTurn;
      }

      if (targetTurn !== null) {
        if (targetTurn === currentTurn) {
          targetTurn = null;
          $('.btn-replay-seek').prop('disabled', false);

        } else if (targetTurn > currentTurn) {
          if (['getVictory', 'getDefeat', 'getResult'].includes(event.action) || currentIndex + 1 == log.length) {
            targetTurn = null;
            currentTime = event._time;
            $('.btn-replay-seek').prop('disabled', false);
            if (!unsafeWindow.finish) eventManager.emit('getResult:before'); // Show underscript's "Game Finished" toast

          } else if (importantEvents.includes(event.action) || ['getBattleLog', 'getMonsterPlayed'].includes(event.action)) {
            currentTime = event._time;
          } else {
            // If the event isn't important, skip it when seeking
            currentIndex++;
            continue;
          }

        } else if (targetTurn < currentTurn) {
          const prevEvent = log[currentIndex - 1];
          currentTime = prevEvent._time;
          currentIndex--;

          if (prevEvent.action === 'getBattleLog') {
            $('#game-history').children('.battle-log').first().remove();
          }
        }
      }

      if (event.action === 'getTurnStart') {
        currentTurn = (event.numTurn - 1) * 2 + (event.idPlayer === firstTurnPlayerId ? 0 : 1);
        if (unsafeWindow.timer) unsafeWindow.stopTimer();  // Make sure the timer is stopped even if event is skipped
      } else if (event.action === 'refreshTimer') {
        unsafeWindow.timerRequestDate = Date.now();
      }
      if (targetTurn !== null && targetTurn < currentTurn && !importantEvents.includes(event.action)) continue;

      while (event._time && event._time > currentTime) {
        if (paused || targetTurn !== null) break;  // Cancel waiting immediately
        await sleep(step);
        currentTime += Math.min(step * playbackSpeed.value(), event._time);
      }

      if (paused && targetTurn === null) {
        await sleep(step);
        continue;
      }

      // Prevent queuing too many events at once
      while (unsafeWindow.eventQueue.length > 3) {
        await sleep(step);
      }

      unsafeWindow.onMessageGame({
        data: JSON.stringify(event)
      });

      if (targetTurn === null || targetTurn >= currentTurn) {
        if (currentIndex + 1 == log.length) {
          $('#btn-replay-pause').click();
        } else currentIndex++;
      }
    }
  }

  const startReplay = () => {
    const socketGame = unsafeWindow.socketGame;
    socketGame.onmessage = null;
    socketGame.onclose = null;
    socketGame.close();

    document.title = `Undercards - Replay: ${metaData.player.username} vs ${metaData.opponent.username}`;
    unsafeWindow.spectate = true;
    unsafeWindow.sendUpdateTimer = () => {};

    $('#btn-exit').show();
    $('#endTurnBtn').remove();
    $('body').addClass('spectate');

    const replayControls = $(`
      <tr id="replay_controls">
        <td class="leftPart"></td>
        <td class="centerPart"></td>
        <td class="rightPart" style="padding-top: 12px">
          <button id="btn-replay-play" class="btn btn-sm btn-success" disabled><span class="glyphicon glyphicon-play"></span></button>
          <button id="btn-replay-pause" class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-pause"></span></button>
          <button id="btn-replay-start" class="btn btn-sm btn-primary btn-replay-seek"><span class="glyphicon glyphicon-fast-backward"></span></button>
          <button id="btn-replay-prev" class="btn btn-sm btn-primary btn-replay-seek"><span class="glyphicon glyphicon-step-backward"></span></button>
          <button id="btn-replay-next" class="btn btn-sm btn-primary btn-replay-seek"><span class="glyphicon glyphicon-step-forward"></span></button>
          <button id="btn-replay-end" class="btn btn-sm btn-primary btn-replay-seek"><span class="glyphicon glyphicon-fast-forward"></span></button>
        </td>
      </tr>
    `);

    // Layout fix
    $('.profile').last().children('tbody').children('tr').children('td').css('padding-top', '4px');
    plugin.addStyle('#yourAvatar{bottom: 44px} #game-history{height: 631px}');

    $('.profile').last().children('tbody').append(replayControls);

    $('#btn-replay-play').on('click', (e) => {
      paused = false;
      $('#btn-replay-play').prop('disabled', true);
      $('#btn-replay-pause').prop('disabled', false);
    });
    $('#btn-replay-pause').on('click', (e) => {
      paused = true;
      targetTurn = null;
      $('#btn-replay-play').prop('disabled', false);
      $('#btn-replay-pause').prop('disabled', true);
      $('.btn-replay-seek').prop('disabled', false);
    });
    $('#btn-replay-start').on('click', (e) => seekTurn(0));
    $('#btn-replay-prev').on('click', (e) => seekTurn(Math.max(currentTurn - 1, 0)));
    $('#btn-replay-next').on('click', (e) => seekTurn(currentTurn + 1));
    $('#btn-replay-end').on('click', (e) => seekTurn(Infinity));

    replay(metaData, gameLog);
  }

  class FakeSetting extends underscript.utils.SettingType {
    value(val) {
      return val;
    }
    encode(value) {
      return value;
    }
    default() {
      return undefined;
    }
  }

  class ReplayElement extends FakeSetting {
    constructor(name = 'replayElement') {
      super(name);
    }
    element(value, update, {
      remove = false,
    }) {
      return $(`<span class="glyphicon glyphicon-play" style="cursor: pointer; padding-right: 6px"></span>`)
        .on('click', e => update('play'))
        .add(
          $(`<span class="glyphicon glyphicon-download-alt" style="cursor: pointer; padding-right: 6px"></span>`)
          .on('click', e => update('download'))
        )
        .add(
          $(`<span class="glyphicon glyphicon-remove" style="cursor: pointer; padding-right: 6px"></span>`)
          .on('click', e => update('delete'))
        );
    }
    labelFirst() {
      return false;
    }
  }
  settings.addType(new ReplayElement());

  class LoadReplayElement extends FakeSetting {
    constructor(name = 'loadReplayElement') {
      super(name);
    }
    element(value, update, {
      remove = false,
    }) {
      return $(`<input type="file" accept=".replay"/>`)
        .change(e => {
          if (!e.target.files) return;

          const reader = new FileReader();
          const file = e.target.files[0];

          reader.onload = (function(f) {
              return function(e) {
                const importMetaData = JSON.parse(e.target.result);
                const importLog = decompressString(importMetaData.log);
                delete importMetaData.log;

                saveReplay(
                  'file',
                  importMetaData,
                  importLog,
                  () => unsafeWindow.location.href = '/Spectate?replay=' + 'file',
                );
              };
            })(file);

            reader.readAsText(file);
        });
    }
  }
  settings.addType(new LoadReplayElement());

  const isEnabled = settings.add({
    key: 'enable',
    name: "Enable replay recording",
    type: 'boolean',
    default: true,
  });
  const replayLimit = settings.add({
    key: 'replayLimit',
    name: "Replay limit",
    type: 'select',
    note: "Maximum number of saved replays",
    default: '20',
    options: ['10', '20', '50', '100'],
  });
  const playbackSpeed = settings.add({
    key: 'playbackSpeed',
    name: "Playback speed",
    type: 'slider',
    note: "Adjust playback speed in 0x - 5x range (default is 1x)",
    default: 1,
    reset: true,
    min: 0,
    max: 5,
    step: 0.5,
  });

  settings.add({
    key: 'loadReplay',
    name: "Load from file: ",
    type: 'Replays:loadReplayElement',
    category: "Replays",
    export: false,
  });

  const replayElements = {};
  Object.values(GM_listValues().reverse()).forEach(function(key) {
//    console.log(key, GM_getValue(key).length / 1024, 'KB');
    if (!/replay_\d+_meta/.test(key)) return;

    const replayId = key.split('_')[1];
    const metaData = JSON.parse(GM_getValue(key));
    const timeDiff = Math.floor((Date.now() - metaData.date) / 1000);
    const timeDiffDays = Math.floor(timeDiff / 60 / 60 / 24);
    const timeDiffHours = Math.floor(timeDiff / 60 / 60) % 24;
    const timeDiffMinutes = Math.floor(timeDiff / 60) % 60;

    replayElements[replayId] = settings.add({
      key: key,
      name: `<span class="${metaData.player.soul.name}">${metaData.player.username}</span> vs <span class="${metaData.opponent.soul.name}">${metaData.opponent.username}</span> (${metaData.gameType}) - ${timeDiffDays ? timeDiffDays + 'd ': ''}${timeDiffHours}h ${timeDiffMinutes}m ago`,
      type: 'Replays:replayElement',
      category: "Replays",
      export: false,
      onChange: ((action, oldValue) => {
        if (!action) return;
        replayElements[replayId].set(undefined);

        if (action === 'play') {
          unsafeWindow.location.href = '/Spectate?replay=' + replayId;

        } else if (action === 'download') {
          metaData['log'] = loadReplay(replayId, false)[1];
          downloadJSON(metaData, `${metaData.player.username} vs ${metaData.opponent.username} (${new Date().toJSON().slice(0,10)}).replay`);

        } else if (action === 'delete') {
          if (!confirm("Do you want to delete a replay?")) return;

          deleteReplay(replayId);
          $('#underscript\\.plugin\\.Replays\\.replay_' + replayId + '_meta').parent().remove();
        }
      }),
    });
  });

  underscript.onPage('Spectate', () => {
    const replay = new URLSearchParams(location.search).get('replay');
    if (!replay || !/^(\d+|file)$/.test(replay)) return;

    [metaData, gameLog] = loadReplay(replay);
    eventManager.once('allCardsReady', startReplay);
  });

  underscript.onPage('Game', () => {
    eventManager.on('GameEvent', data => {
      if (metaData.date) data._time = Date.now() - metaData.date;
      if (data.action === 'updateCard' && data.monster) {
        delete data.monster; // underscript adds this in-place, so we remove it
      }
      gameLog.push(data);

      if (data.action === 'connect') {
        metaData.date = Date.now();
        metaData.gameType = data.gameType;
        metaData.player = JSON.parse(data.you);
        metaData.opponent = JSON.parse(data.enemy);
      } else if (['getVictory', 'getDefeat', 'getResult'].includes(data.action)) {
        if (!isEnabled.value()) return;
        saveReplay(
          metaData.date,
          {
            v: 1,
            date: metaData.date,
            gameType: metaData.gameType,
            player: metaData.player,
            opponent: metaData.opponent,
            result: data.action.slice(3).toLowerCase(),
          },
          gameLog,
          () => plugin.logger.info("Replay saved, id: " + metaData.date),
        );
      }
    });
  });
})();
