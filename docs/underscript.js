// ==UserScript==
// @name         UnderCards script
// @description  Various changes to undercards game
// @version      0.63.9
// @author       feildmaster
// @run-at       document-body
// @match        https://*.undercards.net/*
// @match        https://feildmaster.github.io/UnderScript/*
// @exclude      https://*.undercards.net/*/*
// @require      https://browser.sentry-cdn.com/7.73.0/bundle.tracing.replay.min.js
// @require      https://unpkg.com/showdown@2.0.0/dist/showdown.min.js
// @require      https://unpkg.com/popper.js@1.16.1/dist/umd/popper.min.js
// @require      https://unpkg.com/tippy.js@4.3.5/umd/index.all.min.js
// @require      https://unpkg.com/axios@0.21.4/dist/axios.min.js
// @require      https://unpkg.com/luxon@1.28.0/build/global/luxon.min.js
// @require      https://raw.githubusercontent.com/feildmaster/SimpleToast/2.0.0/simpletoast.js
// @homepage     https://feildmaster.github.io/UnderScript/
// @source       https://github.com/UCProjects/UnderScript
// @supportURL   https://github.com/UCProjects/UnderScript/issues
// @updateURL    https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.meta.js
// @downloadURL  https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js
// @namespace    https://feildmaster.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undercards.net
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const UNDERSCRIPT = 'UnderScript';
  const footer = `<div style="width:100%;text-align:center;font-size:12px;font-family:monospace;">${UNDERSCRIPT} &copy;feildmaster</div>`;
  const footer2 = `<div style="width:100%;text-align:center;font-size:12px;font-family:monospace;">via ${UNDERSCRIPT}</div>`;
  const hotkeys = [];
  const scriptVersion = GM_info.script.version;
  const buttonCSS = {
    border: '',
    height: '',
    background: '',
    'font-size': '',
    margin: '',
    'border-radius': '',
  };
  const window = typeof unsafeWindow === 'object' ? unsafeWindow : globalThis;
  const SOCKET_SCRIPT_CLOSED = 3500;
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  function noop() {}

  function setup$3() {
    if (typeof setVersion === 'function') setVersion(GM_info.script.version, GM_info.scriptHandler);
  }
  if (!location.host.includes('undercards.net')) {
    if (document.readyState === 'complete') {
      setup$3();
    } else {
      window.addEventListener('load', setup$3);
    }
  }

  function sleep(ms = 0, ...args) {
    return new Promise((res) => { setTimeout(res, ms, ...args); });
  }

  function eventEmitter() {
    const events = {
    };
    const singletonEvents = {
    };
    const options = {
      cancelable: false,
      canceled: false,
      singleton: false,
      async: false,
    };
    options.cancelable = undefined;
    function reset() {
      const ret = { ...options };
      options.cancelable = undefined;
      options.canceled = false;
      options.singleton = false;
      options.async = false;
      return ret;
    }
    function emit(event, e, ...data) {
      const {
        canceled: canceledState,
        cancelable = canceledState,
        singleton,
        async,
      } = reset();
      const delayed = e !== events[event];
      if (singletonEvents[event] && !delayed) {
        const ret = {
          ran: false,
          canceled: false,
        };
        if (async) return Promise.resolve(ret);
        return ret;
      }
      if (singleton) {
        singletonEvents[event] = {
          data,
          async,
        };
      }
      let ran = false;
      let canceled = canceledState;
      const promises = [];
      if (Array.isArray(e) && e.length) {
        ran = true;
        [...e].forEach((ev) => {
          try {
            const meta = { event, cancelable, canceled, async, delayed, singleton };
            const ret = ev.call(meta, ...data);
            if (async && ret !== undefined) {
              promises.push(Promise.resolve(ret)
                .then(() => canceled = !!meta.canceled)
                .catch((err) => {
                  console.error(`Error occurred while parsing (async) event: ${ev.displayName || ev.name || 'unnamed'}(${event})`, err, ...data);
                }));
            }
            canceled = !!meta.canceled;
          } catch (err) {
            console.error(`Error occurred while parsing event: ${ev.displayName || ev.name || 'unnamed'}(${event})`, err, ...data);
          }
        });
      }
      function results() {
        return {
          ran,
          canceled: cancelable && canceled,
        };
      }
      if (async) {
        return Promise.all(promises).then(results);
      }
      return results();
    }
    function off(event, fn) {
      event.split(' ').forEach((e) => {
        const list = events[e] || [];
        while (list.includes(fn)) {
          list.splice(list.indexOf(fn), 1);
        }
      });
    }
    const emitter = {
      on(event, fn) {
        reset();
        if (typeof fn !== 'function') return this;
        event.split(' ').forEach((e) => {
          const singleton = singletonEvents[e];
          if (singleton) {
            sleep().then(() => {
              reset();
              options.async = singleton.async;
              emit(e, [fn], ...singleton.data);
            });
          } else {
            if (!Array.isArray(events[e])) {
              events[e] = [];
            }
            events[e].push(fn);
          }
        });
        return this;
      },
      once(event, fn) {
        if (typeof fn !== 'function') return this;
        function wrapper(...args) {
          off(event, wrapper);
          return fn.call(this, ...args);
        }
        return this.on(event, wrapper);
      },
      one(event, fn) {
        return this.once(event, fn);
      },
      until(event, fn) {
        if (typeof fn !== 'function') return this;
        function wrapper(...args) {
          const ret = fn.call(this, ...args);
          if (ret instanceof Promise) {
            return ret.then((val) => {
              if (val) off(event, wrapper);
              return val;
            });
          }
          if (ret) {
            off(event, wrapper);
          }
          return ret;
        }
        return this.on(event, wrapper);
      },
      emit: (event, ...data) => emit(event, singletonEvents[event] || events[event], ...data),
      off(event, fn) {
        off(event, fn);
        return this;
      },
    };
    Object.keys(options).forEach((key) => {
      Object.defineProperty(emitter, key, {
        get() {
          options[key] = true;
          return this;
        },
      });
    });
    return Object.freeze(emitter);
  }

  const eventManager = eventEmitter();

  function debug(message, permission = 'debugging', ...extras) {
    if (!value$1(permission) && !value$1('debugging.*')) return;
    console.debug(`[${permission}]`, message, ...extras);
  }
  function value$1(key) {
    const val = localStorage.getItem(key);
    return val === '1' || val === 'true';
  }

  const internal$1 = typeof Object.hasOwn === 'function';
  function hasOwn(object, property) {
    if (internal$1) {
      return Object.hasOwn(object, property);
    }
    return Object.prototype.hasOwnProperty.call(object, property);
  }

  function global(...key) {
    const {
      throws = true,
    } = typeof key[key.length - 1] === 'object' ? key.pop() : {};
    const found = key.find((e) => hasOwn(window, e));
    if (found === undefined) {
      const msg = `[${key.join(',')}] does not exist`;
      if (throws) throw new Error(msg);
      return debug(msg);
    }
    return window[found];
  }
  function globalSet(key, value, {
    force = false,
    throws = true,
  } = {}) {
    if (!force && !hasOwn(window, key)) {
      const msg = `[${key}] does not exist`;
      if (throws) throw new Error(msg);
      return debug(msg);
    }
    const original = window[key];
    if (typeof value === 'function') {
      const wrapper = {
        super: original,
      };
      window[key] = value.bind(wrapper);
    } else {
      window[key] = value;
    }
    return original;
  }

  eventManager.on(':preload', () => {
    function call(cards) {
      eventManager.singleton.emit('allCardsReady', cards);
    }
    const allCards = global('allCards', {
      throws: false,
    });
    if (!allCards) {
      const cached = localStorage.getItem('allCards');
      if (!cached) return;
      const parsed = JSON.parse(cached);
      window.allCards = parsed;
      call(parsed);
    } else if (!allCards.length) {
      document.addEventListener('allCardsReady', () => call(global('allCards')));
    } else {
      call(allCards);
    }
  });

  const underscript = {
    version: scriptVersion,
  };
  const modules$1 = {};
  function register$5(name, val, module = false) {
    if (underscript[name]) {
      if (!module) throw new Error(`${name} already exists`);
      console.error(`Module [${name}] skipped, variable exists`);
      return;
    }
    underscript[name] = val;
  }
  const mod = new Proxy(modules$1, {
    get(o, key, r) {
      if (!(key in o)) {
        const ob = {};
        Reflect.set(o, key, ob, r);
        register$5(key, ob, true);
      }
      return Reflect.get(o, key, r);
    },
    set(o, key, val, r) {
      if (key in o) return false;
      register$5(key, val, true);
      return Reflect.set(o, key, val, r);
    },
  });
  window.underscript = new Proxy(underscript, {
    get(...args) {
      return new Proxy(Reflect.get(...args), { set() {} });
    },
    set() {},
  });

  const nameRegex = /^[a-z0-9 ]+$/i;
  const registry$1 = new Map();
  const modules = [];
  function load$3({ name, mod, dependencies = [], runs = 0 }, methods, local) {
    if (methods[name] !== undefined) {
      console.error(`Skipping "${name}": Already exists`);
      return;
    }
    const required = dependencies.filter((module) => methods[module.replace('!', '')] === undefined);
    if (required.length) {
      if (runs < 5) local.push({ name, mod, dependencies: required, runs: runs + 1 });
      return;
    }
    try {
      const val = mod(methods);
      if (val !== undefined) {
        methods[name] = val;
      }
    } catch (e) {
      console.error(`Error loading "${name}":`, e);
    }
  }
  function Plugin(name = '', version = '') {
    if (name.length > 20) throw new Error(`Plugin name too long (${name}[${name.length}/20])`);
    if (!nameRegex.test(name)) throw new Error(`Name contains illegal characters (${name})`);
    if (registry$1.has(name)) throw new Error(`Name already registered (${name})`);
    const methods = {
      name,
    };
    if (version) {
      methods.version = version;
    }
    const local = [...modules];
    for (let i = 0; i < local.length; i++) {
      load$3(local[i], methods, local);
    }
    local.filter(({ runs = 0, dependencies = [] }) => runs === 5 && dependencies.some((module) => !module.includes('!')))
      .forEach(({ name: prop, dependencies }) => console.log(`Failed to load module: ${prop} [${dependencies.join(', ')}]`));
    const plugin = Object.freeze(methods);
    registry$1.set(name, plugin);
    return plugin;
  }
  register$5('plugin', (name, version) => {
    if (typeof name !== 'string' || !name.trim()) throw new Error('Plugin must have a name');
    if (version && !['string', 'number'].includes(typeof version)) throw new Error(`Version must be a string or number, not ${typeof version}`);
    return Plugin(name.trim(), version);
  });
  function registerModule(name, mod, ...dependencies) {
    if (!name) throw new Error('Module has no name');
    if (typeof mod !== 'function') throw new Error('Module must be a function');
    modules.push({ name, mod, dependencies: dependencies.flat() });
  }
  function getPluginNames() {
    return [...registry$1.keys()];
  }

  const GUEST = {
    id: 0,
    username: 'Guest',
  };
  function invalid() {
    return typeof Sentry === 'undefined';
  }
  function init$7() {
    if (invalid()) return;
    const config = {
      dsn: 'https://15436307be8e32073988a7d1d8603ef9@o4505766117703680.ingest.sentry.io/4505771776737280',
      release: 'underscript@0.63.9',
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      environment: 'production',
      initialScope: {
        tags: {
          underscript: true,
        },
        user: GUEST,
      },
    };
    Sentry.init(config);
  }
  function setUser(data) {
    if (invalid()) return;
    Sentry.configureScope((scope) => {
      scope.setUser(data);
    });
  }
  function capture(error, event, plugin) {
    if (invalid()) return;
    Sentry.withScope((scope) => {
      if (plugin) {
        scope.setTag('plugin', plugin.name);
        scope.setTag('underscript', null);
      }
      if (event) {
        scope.setContext('event', event);
      }
      const plugins = getPluginNames();
      if (plugins.length) {
        scope.setContext('plugins', plugins);
      }
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureMessage(error);
      }
    });
  }
  function login$1(id = '', username = '') {
    if (!id) return;
    setUser({ id, username });
  }
  function logout() {
    setUser(GUEST);
  }
  function captureError(error, event = undefined) {
    capture(error, event);
  }
  function capturePluginError(plugin, error, event = undefined) {
    capture(error, event, plugin);
  }

  function wrap(callback, prefix = '', logger = console) {
    try {
      return callback();
    } catch (e) {
      const name = prefix || callback && callback.name || 'Undefined';
      captureError(e, {
        name,
        function: 'wrap',
      });
      logger.error(`[${name}] Error occured`, e);
    }
    return undefined;
  }

  function setter(key, args) {
    const original = args[`on${key}`];
    function wrapper(dialog) {
      let ret;
      if (typeof original === 'function') {
        ret = wrap(() => original(dialog), `BootstrapDialog:on${key}`);
      }
      eventManager.emit(`BootstrapDialog:${key}`, dialog);
      return ret;
    }
    return wrapper;
  }
  function construct(Target, [args = {}]) {
    const obj = new Target({
      ...args,
      onshow: setter('show', args),
      onshown: setter('shown', args),
      onhide: setter('hide', args),
      onhidden: setter('hidden', args),
    });
    eventManager.emit('BootstrapDialog:create', obj);
    return obj;
  }
  function get$1(target, prop, R) {
    if (prop === 'show') {
      return (o = {}) => {
        const ret = new R(o);
        if (eventManager.cancelable.emit('BootstrapDialog:preshow', ret).canceled) {
          return ret;
        }
        return ret.open();
      };
    }
    return Reflect.get(target, prop, R);
  }
  eventManager.on(':preload', () => {
    if (window.BootstrapDialog) {
      window.BootstrapDialog = new Proxy(window.BootstrapDialog, { construct, get: get$1 });
    }
  });

  function VarStore(def) {
    let v = def;
    function get() {
      const ret = v;
      set(def);
      return ret;
    }
    function peak() {
      return v;
    }
    function set(val) {
      return v = val;
    }
    function isSet() {
      return v !== def;
    }
    const ret = {
      get, set, peak, isSet, value: v,
    };
    Object.defineProperty(ret, 'value', {
      get,
      set,
    });
    return Object.freeze(ret);
  }

  const sessionId = window.crypto?.randomUUID() || Math.random().toString();
  function login(id, username) {
    eventManager.singleton.emit('login', id, username);
  }
  if (sessionStorage.getItem('UserID')) {
    login(sessionStorage.getItem('UserID'), sessionStorage.getItem('Username') ?? undefined);
  }
  eventManager.on('Chat:Connected', () => {
    const sessID = sessionStorage.getItem('UserID');
    const selfId = global('selfId');
    const username = global('selfUsername');
    if (sessID && sessID === selfId) return;
    login(selfId, username);
    sessionStorage.setItem('UserID', selfId);
    sessionStorage.setItem('Username', username);
  });
  eventManager.on('logout', () => {
    sessionStorage.removeItem('UserID');
    sessionStorage.removeItem('Username');
  });
  function isActive() {
    return localStorage.getItem('underscript.session') === sessionId;
  }
  function updateIfActive() {
    if (document.hidden || isActive()) return;
    localStorage.setItem('underscript.session', sessionId);
    eventManager.emit('window:active');
  }
  document.addEventListener('visibilitychange', updateIfActive);
  updateIfActive();

  let reconnectAttempts = 0;
  const guestMode = VarStore(false);
  const historyIds = new Set();
  function handleClose(event) {
    console.debug('Disconnected', event);
    if (![1000, 1006].includes(event.code)) return;
    setTimeout(reconnect, 1000 * reconnectAttempts);
  }
  function bind$1(socketChat) {
    const oHandler = socketChat.onmessage;
    socketChat.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { action } = data;
      debug(data, `debugging.rawchat.${action}`);
      if (action === 'getMessage' && data.idRoom) {
        data.room = `chat-public-${data.idRoom}`;
        data.open = global('openPublicChats').includes(data.idRoom);
      } else if (action === 'getPrivateMessage' && data.idFriend) {
        data.idRoom = data.idFriend;
        data.room = `chat-private-${data.idRoom}`;
        data.open = Array.isArray(global('privateChats')[data.idRoom]);
      }
      eventManager.emit('preChatMessage', data);
      if (eventManager.cancelable.emit(`preChat:${action}`, data).canceled) return;
      oHandler(event);
      eventManager.emit('ChatMessage', data);
      eventManager.emit(`Chat:${action}`, data);
      if (action === 'getSelfInfos') {
        eventManager.singleton.emit('Chat:Connected');
        getMessages(data);
      }
    };
    const oClose = socketChat.onclose;
    socketChat.onclose = (e) => {
      if (e.code !== SOCKET_SCRIPT_CLOSED) oClose();
      eventManager.emit('Chat:Disconnected');
      handleClose(e);
    };
  }
  function reconnect(force = false) {
    if (!force && (!isActive() || guestMode.isSet() || reconnectAttempts > 3 || global('socketChat', { throws: false })?.readyState !== WebSocket.CLOSED)) return;
    reconnectAttempts += 1;
    const socket = new WebSocket(`wss://${location.hostname}/chat`);
    globalSet('socketChat', socket);
    socket.onmessage = (event) => {
      if (global('socketChat') !== socket) return;
      const data = JSON.parse(event.data);
      const { action } = data;
      switch (action) {
        case 'getSelfInfos': {
          socket.onmessage = global('onMessageChat');
          socket.onclose = global('onCloseChat');
          bind$1(socket);
          const history = getMessages(data);
          const append = global('appendMessage');
          history.forEach((message) => {
            if ($(`#message-${message.id}`).length) return;
            append(message, message.idRoom, false);
          });
          eventManager.emit('Chat:Reconnected');
          reconnectAttempts = 0;
          break;
        }
        default: {
          console.debug('Message:', action);
          socket.close(SOCKET_SCRIPT_CLOSED, 'reconnect');
        }
      }
    };
    socket.onclose = handleClose;
  }
  function getMessages({ discussionHistory, otherHistory }) {
    if (!discussionHistory || !otherHistory) {
      return [];
    }
    const history = [
      ...JSON.parse(discussionHistory),
      ...JSON.parse(otherHistory),
    ].filter(({ id }) => !historyIds.has(id));
    history.forEach(({ id }) => historyIds.add(id));
    return history;
  }
  function sendMessageWrapper(...args) {
    if (global('socketChat').readyState !== WebSocket.OPEN) {
      updateIfActive();
      reconnect();
      eventManager.once('Chat:Reconnected', () => this.super(...args));
    } else {
      this.super(...args);
    }
  }
  eventManager.on(':preload', () => {
    if (typeof socketChat !== 'undefined') {
      debug('Chat detected');
      eventManager.singleton.emit('ChatDetected');
      bind$1(global('socketChat'));
      globalSet('sendMessage', sendMessageWrapper);
      globalSet('sendPrivateMessage', sendMessageWrapper);
      document.addEventListener('visibilitychange', () => reconnect());
      globalSet('appendChat', function appendChat(idRoom = '', chatMessages = [], isPrivate = true) {
        const room = `chat-${isPrivate ? 'private' : 'public'}-${idRoom}`;
        const newRoom = !document.querySelector(`#${room}`);
        const data = {
          idRoom,
          room,
          roomName: isPrivate ? '' : global('chatNames')[idRoom - 1] || '',
          history: JSON.stringify(chatMessages),
        };
        if (newRoom) {
          eventManager.emit('preChat:getHistory', data);
        }
        this.super(idRoom, chatMessages, isPrivate);
        if (newRoom) {
          eventManager.emit('Chat:getHistory', data);
        }
      }, {
        throws: false,
      });
    }
    eventManager.on('Chat:getHistory', ({ room, roomName: name }) => {
      const messages = $(`#${room} .chat-messages`);
      $(`#${room} input[type="text"]`).keydown(function sending(e) {
        if (e.key !== 'Enter') return;
        const data = {
          room,
          name,
          messages,
          input: this,
        };
        if (eventManager.cancelable.emit('Chat:send', data).canceled) {
          debug('Canceled send');
          $(this).val('');
          e.preventDefault();
          e.stopPropagation();
        }
      });
    });
    eventManager.on('GuestMode', () => {
      console.debug('Guest Mode');
      guestMode.set(true);
    });
    eventManager.on('Chat:Reconnected', () => {
      console.debug('Reconnected');
      $('.chat-messages').find('.red:last').remove();
    });
  });

  function toLocale({
    locale = 'en',
    id,
    data = [],
  }) {
    const l = $.i18n().locale;
    $.i18n().locale = locale;
    try {
      return $.i18n(`${id}`, ...data);
    } catch {
      return 'ERROR';
    } finally {
      $.i18n().locale = l;
    }
  }
  function toEnglish(id, ...data) {
    return toLocale({ id, data });
  }

  const translate = (element) => {
    element = element instanceof $ ? element : $(element);
    if ($.i18n) {
      global('translateElement')(element);
    }
    return element;
  };
  function translateText(text, {
    args = [],
    fallback = text,
    locale,
  } = {}) {
    if (window.$?.i18n) {
      const string = `${text}`;
      const val = (() => {
        if (locale && $.i18n().locale !== locale) {
          const temp = toLocale({
            id: string,
            data: args,
            locale,
          });
          if (temp === 'ERROR') {
            return string;
          }
          return temp;
        }
        return $.i18n(string, ...args);
      })();
      if (val !== string) return val;
    }
    return `${fallback}`;
  }

  class Constant {
    #value;
    constructor(value, ...rest) {
      this.#value = [value, ...rest];
    }
    equals(other) {
      return this === other || this.#value.includes(other?.valueOf());
    }
    toString() {
      return this.valueOf();
    }
    valueOf() {
      return this.#value[0];
    }
  }

  class Translation extends Constant {
      static DISMISS = this.General('dismiss', 'Dismiss');
      static ERROR = this.General('error', 'Error');
      static OPEN = this.General('open', 'Open');
      static PURCHASE = this.General('purchase.item');
      static UNDO = this.General('undo', 'Undo');
      static UNKNOWN = this.General('unknown', 'Unknown');
      static UPDATE = this.General('update', 'Update');
      static CATEGORY_AUTO_DECLINE = this.Setting('category.autodecline');
      static CATEGORY_CARD_SKINS = this.Setting('category.card.skins');
      static CATEGORY_CHAT_COMMAND = this.Setting('category.chat.commands');
      static CATEGORY_CHAT_IGNORED = this.Setting('category.chat.ignored');
      static CATEGORY_CHAT_IMPORT = this.Setting('category.chat.import');
      static CATEGORY_CUSTOM = this.Setting('category.custom');
      static CATEGORY_FRIENDSHIP = this.Setting('category.friendship');
      static CATEGORY_HOME = this.Setting('category.home');
      static CATEGORY_HOTKEYS = this.Setting('category.hotkeys');
      static CATEGORY_LIBRARY_CRAFTING = this.Setting('category.library.crafting');
      static CATEGORY_MINIGAMES = this.Setting('category.minigames');
      static CATEGORY_OUTLINE = this.Setting('category.outline');
      static CATEGORY_PLUGINS = this.Setting('category.plugins');
      static CATEGORY_STREAMER = this.Setting('category.streamer');
      static CATEGORY_UPDATES = this.Setting('category.updates');
      static DISABLE_COMMAND_SETTING = this.Setting('command', 1);
      static IGNORED = this.Toast('ignore', 1);
      static INFO = this.Toast('toast.info', 'Did you know?');
      static CANCEL = this.Vanilla('dialog-cancel', 'Cancel');
      static CLOSE = this.Vanilla('dialog-close', 'Close');
      static CONTINUE = this.Vanilla('dialog-continue', 'Continue');
      args;
      fallback;
      constructor(key, { args = [], fallback, prefix = 'underscript', } = {}) {
          if (prefix) {
              super(`${prefix}.${key}`);
          }
          else {
              super(key);
          }
          this.args = args;
          this.fallback = fallback;
      }
      get key() {
          return this.valueOf();
      }
      translate(...args) {
          return translateText(this.key, {
              args: args.length ? args : this.args,
              fallback: this.fallback,
          });
      }
      withArgs(...args) {
          return new Translation(this.key, {
              args,
              prefix: null,
          });
      }
      toString() {
          return this.translate();
      }
      static General(key, text) {
          const fallback = typeof text === 'string' ? text : undefined;
          return new Translation(`general.${key}`, { fallback });
      }
      static Menu(key, text) {
          const fallback = typeof text === 'string' ? text : undefined;
          return new Translation(`menu.${key}`, { fallback });
      }
      static Setting(key, text) {
          const fallback = typeof text === 'string' ? text : undefined;
          return new Translation(`settings.${key}`, { fallback });
      }
      static Toast(key, text) {
          const fallback = typeof text === 'string' ? text : undefined;
          return new Translation(`toast.${key}`, { fallback });
      }
      static Vanilla(key, text) {
          const fallback = typeof text === 'string' ? text : undefined;
          return new Translation(key.toLowerCase(), { fallback, prefix: null });
      }
  }

  function charCount(string = '', char = '') {
    const regex = new RegExp(char, 'g');
    const matches = string.match(regex);
    return matches?.length ?? 0;
  }

  function last(arrayLike) {
    if (Array.isArray(arrayLike)) return arrayLike.at(-1);
    if (arrayLike?.length !== undefined) return arrayLike[arrayLike.length - 1];
    throw new Error('Not an array like object', typeof arrayLike);
  }

  function newStyle(plugin = false) {
    let loaded = false;
    const el = document.createElement('style');
    function appendStyle() {
      if (el.parentElement) return;
      if (plugin) el.dataset.underscriptPlugin = plugin.name;
      else el.dataset.underscript = '';
      document.head.append(el);
    }
    eventManager.on(':preload', () => {
      loaded = true;
    });
    function add(...styles) {
      const hasChildren = styles.length + el.children.length;
      if (hasChildren) {
        if (loaded) appendStyle();
        else eventManager.once(':preload', () => appendStyle());
      }
      return wrapper(append(styles));
    }
    function append(styles = [], nodes = []) {
      styles.flat().forEach((s) => {
        if (charCount(s, '{') !== charCount(s, '}')) {
          const logger = plugin?.logger ?? console;
          logger.error('Malformed CSS (missing { or }):\n', s);
          return;
        }
        el.append(s);
        nodes.push(last(el.childNodes));
      });
      return nodes;
    }
    function wrapper(nodes = []) {
      return {
        remove() {
          nodes.splice(0)
            .forEach((node) => node.remove());
          return this;
        },
        replace(...styles) {
          return this.remove().append(styles);
        },
        append(...styles) {
          append(styles, nodes);
          return this;
        },
      };
    }
    return {
      add,
    };
  }
  const style = newStyle();

  let e;
  let x;
  let y;
  function update$4() {
    if (!e) return;
    e.css({
      left: x + e.width() + 15 < $(window).width() ? x + 15 : x - e.width() - 10,
      top: y + e.height() + 18 > $(window).height() ? $(window).height() - e.height() : y + 18,
    });
  }
  eventManager.on('jQuery', () => {
    $(document).on('mousemove.script', function mouseMove(event) {
      x = event.pageX - window.pageXOffset;
      y = event.pageY - window.pageYOffset;
      update$4();
    });
  });
  function hide$1() {
    if (e) {
      e.remove();
      e = null;
    }
  }
  function show$2(data, border = null) {
    return function hoverAction(event) {
      hide$1();
      if (event.type === 'mouseleave' || event.type === 'blur') return;
      const el = $('<div>');
      e = el;
      if (data instanceof Translation) {
        eventManager.on('underscript:ready', () => {
          el.prepend(`${data}`);
        });
      } else {
        e.append(data);
      }
      e.append($(footer).clone());
      e.css({
        border,
        position: 'fixed',
        'background-color': 'rgba(0,0,0,0.9)',
        padding: '2px',
        'z-index': 1220,
      });
      $('body').append(e);
      update$4();
    };
  }
  function getFooter(type) {
    switch (type) {
      case 'footer2':
      case 'short': return footer2;
      case 'none':
      case 'hidden': return '';
      default: return footer;
    }
  }
  function tip(text, target, {
    follow = true,
    arrow = false,
    onShow,
    footer: lFooter = 'footer',
    fade = false,
    placement = 'auto',
    trigger,
    distance,
    offset = '50, 25',
  } = {}) {
    debug(`Hover Tip: ${text}`);
    const options = {
      arrow,
      placement,
      content: `<div>${text}</div>${getFooter(lFooter)}`,
      animateFill: false,
      theme: 'undercards',
      hideOnClick: true,
      a11y: false,
    };
    if (offset || offset === '') options.offset = offset;
    if (distance !== undefined) options.distance = distance;
    if (trigger) options.trigger = trigger;
    if (typeof onShow === 'function') options.onShow = onShow;
    if (!fade) {
      options.delay = 0;
      options.duration = 0;
    }
    if (follow && !arrow) {
      options.placement = 'bottom';
      options.followCursor = true;
      options.hideOnClick = false;
    }
    if (tippy.version.startsWith(3)) {
      options.performance = true;
    }
    if (tippy.version.startsWith(4)) {
      options.boundary = 'viewport';
      options.aria = false;
      options.ignoreAttributes = true;
    }
    tippy(target, options);
  }

  function each(o, f, t) {
    if (!o) return;
    Object.keys(o).forEach((x) => {
      f.call(t, o[x], x, o);
    });
  }

  function isSimpleObject(obj) {
    return obj && Object.getPrototypeOf(obj) === Object.prototype;
  }

  function merge(...obj) {
    const ret = {};
    if (obj) {
      obj.forEach((o) => {
        each(o, (val, key) => {
          ret[key] = isSimpleObject(val) ? merge(ret[key], val) : val;
        });
      });
    }
    return ret;
  }

  function toArray(value = []) {
    return Array.isArray(value) ? value : [value];
  }

  let ready$1 = false;
  eventManager.on('underscript:ready', () => ready$1 = true);
  function blankToast() {
    return new SimpleToast();
  }
  function toast$6(arg) {
    if (!arg) return false;
    if (typeof arg === 'string' || arg instanceof Translation) {
      arg = {
        text: arg,
      };
    }
    const isTranslation = [
      arg.text,
      arg.title,
      ...toArray(arg.buttons).map(({ text }) => text),
    ].some((obj) => obj instanceof Translation);
    const defaults = {
      footer: 'via UnderScript',
      css: {
        'background-color': 'rgba(0,5,20,0.6)',
        'text-shadow': '',
        'font-family': 'monospace',
        footer: {
          'text-align': 'end',
        },
      },
    };
    if (ready$1 && isTranslation) preprocess(arg);
    const slice = new SimpleToast(merge(defaults, arg));
    if (!ready$1 && isTranslation && slice.exists()) {
      const el = $('#AlertToast > div:last');
      eventManager.on('underscript:ready', () => {
        process$1(slice, el, arg);
      });
    }
    return slice;
  }
  function errorToast(error) {
    function getStack(err = {}) {
      const stack = err.stack;
      if (stack) {
        return stack.replace('<', '&lt;');
      }
      return null;
    }
    const lToast = {
      title: error.name || error.title || Translation.ERROR,
      text: error.message || error.text || getStack(error.error || error) || error,
      css: {
        'background-color': 'rgba(200,0,0,0.6)',
      },
      className: error.className,
      onClose: error.onClose,
      footer: error.footer,
      buttons: error.buttons,
    };
    return toast$6(lToast);
  }
  function infoToast(arg, key, val = '1') {
    if (localStorage.getItem(key) === val) return null;
    if (typeof arg === 'string') {
      arg = {
        text: arg,
      };
    } else if (typeof arg !== 'object') return null;
    const override = {
      onClose: (...args) => {
        if (typeof arg.onClose === 'function') {
          if (arg.onClose(...args)) {
            return;
          }
        }
        localStorage.setItem(key, val);
      },
    };
    const defaults = {
      title: Translation.INFO,
      css: {
        'font-family': 'inherit',
      },
    };
    return toast$6(merge(defaults, arg, override));
  }
  function dismissable({ title, text, key, value = 'true', css = {} }) {
    if (localStorage.getItem(key) === value) return undefined;
    const buttons = {
      text: Translation.DISMISS,
      className: 'dismiss',
      css: buttonCSS,
      onclick: (e) => {
        localStorage.setItem(key, value);
      },
    };
    return toast$6({
      title,
      text,
      buttons,
      className: 'dismissable',
      css,
    });
  }
  function preprocess(arg) {
    ['text', 'title'].forEach((prop) => {
      if (arg[prop] instanceof Translation) arg[prop] = `${arg[prop]}`;
    });
    toArray(arg.buttons).forEach((button) => {
      if (button.text instanceof Translation) button.text = `${button.text}`;
    });
  }
  function process$1(instance, el, { text, title, buttons }) {
    if (text instanceof Translation) instance.setText(`${text}`);
    if (title instanceof Translation) el.find('> span:first').text(title);
    const $buttons = el.find('> button');
    toArray(buttons).forEach((button, i) => {
      if (button.text instanceof Translation) $buttons[i].textContent = button.text;
    });
  }

  let menu;
  function addMenuButton(name, url) {
    if (!menu) return false;
    if (!name) throw new Error('Menu button must have a name');
    const el = document.createElement('li');
    const a = document.createElement('a');
    a.classList.add('click');
    a.innerHTML = name;
    if (url) {
      a.rel = 'noreferrer';
      a.href = url;
    }
    el.append(a);
    menu.append(el);
    return el;
  }
  eventManager.on(':preload', () => {
    menu = document.querySelector('ul.dropdown-menu[role="menu"]');
    if (!menu) return;
    style.add('.click {cursor: pointer;}');
    const divider = document.createElement('li');
    divider.classList.add('divider');
    const header = document.createElement('li');
    header.classList.add('dropdown-header');
    header.textContent = 'UnderScript';
    menu.append(divider, header);
  });

  function compound(...events) {
    const callback = events.pop();
    if (typeof callback !== 'function') throw new Error('Callback not provided');
    const cache = {};
    let triggered = 0;
    function trigger(event, ...data) {
      if (!cache[event].triggered) {
        cache[event].triggered = this.singleton ? 'singleton' : true;
        triggered += 1;
      }
      if (triggered >= events.length) {
        events.forEach((ev) => {
          const e = cache[ev];
          if (e.triggered !== true) return;
          e.triggered = false;
          triggered -= 1;
        });
        wrap(callback);
      }
    }
    events.forEach((ev) => {
      cache[ev] = {
        triggered: false,
      };
      eventManager.on(ev, function wrapper(...data) {
        trigger.call(this, ev, ...data);
      });
    });
  }

  let initialized;
  let menuOpen;
  let wrapper$1;
  let body;
  let cooked;
  let toast$5;
  const buttons = [];
  function init$6() {
    if (typeof initialized === 'boolean') return initialized;
    if (typeof jQuery === 'undefined') return initialized = false;
    style.add(
      '.menu-backdrop { display: none; position: fixed; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: #000; background-color: rgba(0,0,0,0.4); z-index: 1010; }',
      '.menu-close { float: right; color: #aaa; font-size: 28px; font-weight: bold; margin: -5px; }',
      '.menu-close:hover, .menu-close:focus { color: #FFF; text-decoration: none; cursor: pointer; }',
      '.menu-content { color: #fff; margin: 4% auto; padding: 0; border: 2px solid #888; width: 280px; background: #000 url(../images/backgrounds/2.png) center 632px; }',
      '.menu-content > * { padding: 2px 16px; }',
      '.menu-content a { color: #fff; }',
      '.menu-header { text-align: center; font-size: 30px; }',
      '.menu-footer img { height: 16px; vertical-align: middle; }',
      '.menu-body { background-color: rgba(0,0,0,0.6); min-height: 250px; max-height: 600px; overflow-y: auto; }',
      '.menu-body ul { list-style: none; padding: 0; }',
      '.menu-body li { list-style-type: none; border: 1px solid #fff; width: 80%; text-align: center; margin: 5px auto; opacity: 1; }',
      '.menu-body li:hover, .menu-body li:focus { text-decoration: underline; opacity: 0.4; }',
    );
    body = $('<div class="menu-body">');
    wrapper$1 = $('<div class="menu-backdrop" tabindex="-1">')
      .append($('<div class="menu-content">')
        .attr({
          role: 'Menu',
        })
        .append(
          `<div class="menu-header"><span class="menu-close right">&times;</span>${Translation.Menu('menu.title')}</div>`,
          body,
          `<div class="menu-footer"><a href="https://git.io/fxysg" target="_blank">UnderScript</a> v${scriptVersion} <a href="https://discord.gg/D8DFvrU" target="_blank"><img id="usdiscord" src="images/social/discord.png" alt="discord"></a></div>`,
        ))
      .on('click', (e) => {
        if (e.target === wrapper$1[0]) {
          close();
        }
      });
    $('body').append(wrapper$1);
    $('span.menu-close').on('click', close);
    return initialized = true;
  }
  function open$4() {
    if (menuOpen || !init$6()) return;
    eventManager.emit(':menu:opening');
    if (!cooked) {
      body.html('');
      buttons.forEach((data) => {
        if (data.hidden()) return;
        const button = $('<li>');
        button.attr({
          role: 'button',
          tabindex: 0,
        });
        if (data.url) ; else {
          button.text(translateText(data.getText()));
        }
        if (typeof data.action === 'function') {
          const callable = (e) => {
            if (typeof data.enabled !== 'function' || data.enabled()) {
              const result = data.action(e);
              if (result !== undefined ? result : data.close) {
                close();
              }
            } else {
              button.blur();
            }
          };
          button.on('click', callable)
            .on('keydown', (e) => {
              if (e.key !== ' ' && e.key !== 'Enter') return;
              e.preventDefault();
              callable(e);
            }).css({
              cursor: 'pointer',
            });
        }
        if (data.note) {
          if (typeof data.note === 'function') {
            button.on('mouseenter focus', (e) => {
              const note = data.note();
              if (note) {
                show$2(note)(e);
              }
            }).on('mouseleave blur', hide$1);
          } else if (typeof data.note === 'string') {
            button.on('mouseenter focus', show$2(data.note))
              .on('mouseleave blur', hide$1);
          }
        }
        body.append(button);
      });
      cooked = true;
    }
    wrapper$1.css({ display: 'block' }).focus();
    menuOpen = true;
    if (toast$5) {
      toast$5.close('opened');
    }
  }
  function close() {
    if (!menuOpen) return;
    wrapper$1.css({ display: '' });
    menuOpen = false;
  }
  function isOpen$1() {
    return menuOpen;
  }
  function addButton(button = {}) {
    if (!button || !button.text) {
      debug('Menu: Missing button information');
      return;
    }
    const { text, action, url, note, enabled, hidden } = button;
    const safeButton = {
      action,
      url,
      note,
      enabled,
      close: button.keep !== true,
      getText: () => (typeof text === 'function' ? text() : text),
      hidden: () => typeof hidden === 'function' && hidden() || false,
    };
    if (button.top) {
      buttons.unshift(safeButton);
    } else {
      buttons.push(safeButton);
    }
    dirty();
  }
  compound(':load', 'underscript:ready', () => {
    const btn = addMenuButton(Translation.Menu('menu'));
    if (btn) btn.addEventListener('click', () => open$4());
    dirty();
    toast$5 = infoToast({
      text: Translation.Toast('menu'),
      onClose: (reason) => {
        toast$5 = null;
      },
    }, 'underscript.notice.menu', '1');
  });
  function dirty() {
    cooked = false;
  }

  style.add(
    '.tabbedView { display: flex; flex-flow: row wrap; align-content: flex-start; }',
    '.tabbedView.left, .tabbedView.right { flex-flow: column wrap; }',
    '.tabbedView.right > .tabLabel { order: 3; }',
    '.tabButton, .tabContent { display: none; }',
    '.tabContent { order: 2; flex: 1 100%; }',
    '.tabButton:checked + .tabLabel + .tabContent { display: flex; }',
    '.tabLabel { display: flex; padding: 2px 5px; border: 1px solid white; margin-right: 5px; }',
    '.tabLabel.end { order: 1; }',
    '.tabButton:checked + .tabLabel { background-color: rgb(68, 100, 189); }',
    '.tabbedView.left > .tabLabel {}',
    '.tabbedView.right > .tabLabel {}',
  );
  let groupID = 0;
  function TabManager() {
    const group = groupID;
    groupID += 1;
    const tabs = [];
    const tabSettings = {
      left: false,
    };
    const view = document.createElement('div');
    view.classList.add('tabbedView');
    function addTab(name = '', content = '') {
      const id = tabs.length ? tabs[tabs.length - 1].id + 1 : 0;
      const elements = newTab(`${group}-${id}`, group);
      const tab = {
        id,
        elements,
        content,
        active: tabs.length === 0,
      };
      tabs.push(tab);
      function setName(value = name) {
        elements[1].textContent = value;
      }
      function setContent(value = content) {
        tab.content = value;
        if (typeof value === 'string') {
          elements[2].innerHTML = value;
        }
      }
      function setEnd(value = false) {
        elements[1].classList.toggle('end', value === true);
      }
      function setActive() {
        if (tab.active) return;
        tabs.forEach((t) => t.active = false);
        tab.active = true;
      }
      setName();
      setContent();
      setEnd();
      const wrapper = {
        id,
        setName,
        setContent,
        setEnd,
        setActive,
      };
      Object.defineProperty(wrapper, 'active', {
        get() {
          return tab.active;
        },
        enumerable: true,
      });
      return wrapper;
    }
    function render(raw = false) {
      view.classList.toggle('left', tabSettings.left);
      tabs.forEach(({
        elements: [button, label, content],
        content: contents,
        active = false,
      }) => {
        if (active) {
          button.checked = true;
        }
        let value = contents;
        if (typeof value === 'function') {
          value = value();
        } else if (typeof value.render === 'function') {
          value = value.render(true);
        }
        if (typeof value === 'string') {
          content.innerHTML = value;
        } else if (value instanceof HTMLElement) {
          content.innerHTML = '';
          content.appendChild(value);
        } else return;
        view.appendChild(button);
        view.appendChild(label);
        view.appendChild(content);
      });
      if (raw) return view;
      return view.outerHTML;
    }
    function settings({
      left = false,
    }) {
      tabSettings.left = left;
    }
    return {
      addTab,
      render,
      settings,
    };
  }
  function newTab(id = 0, group = 0) {
    const name = `tab${id}`;
    const button = document.createElement('input');
    button.id = name;
    button.type = 'radio';
    button.name = `view${group}`;
    button.classList.add('tabButton');
    const label = document.createElement('label');
    label.classList.add('tabLabel');
    label.htmlFor = name;
    const content = document.createElement('div');
    content.classList.add('tabContent');
    return [button, label, content];
  }

  class SettingType {
    constructor(name) {
      const isString = typeof name === 'string';
      this.name = name && isString ? name.trim() : name;
      if (!isString || !this.name) throw new Error('Name not provided');
    }
    value(val, data = undefined) {
      throw new Error('Value not implemented');
    }
    encode(value) {
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    }
    default(data = undefined) {
      return null;
    }
    element(value, update, {
      data = undefined,
      remove = false,
      container,
      key = '',
    }) {
      throw new Error('Element not implemented');
    }
    styles() {
      return [];
    }
    labelFirst() {
      return true;
    }
    get isBasic() {
      return false;
    }
    toString() {
      return this.name;
    }
  }

  class ArrayType extends SettingType {
    constructor(name = 'array') {
      super(name);
    }
    value(data) {
      if (typeof data === 'string') return JSON.parse(data);
      return data;
    }
    default() {
      return [];
    }
    element(value, update, {
      key,
      container,
    }) {
      let index = 0;
      function add(text) {
        $(container).append(createArrayItem(text, `${key}.${index}`, value, update));
        index += 1;
      }
      value.forEach(add);
      return $('<input type="text">').css({
        'background-color': 'transparent',
      }).on('keydown.script', function keydown(e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        value.push(this.value);
        add(this.value);
        this.value = '';
        update(value);
      });
    }
    styles() {
      return [
        'input.array-remove { display: none; }',
        'input.array-remove:checked + label:before { content: "× "; color: red; }',
      ];
    }
  }
  function createArrayItem(text, key, value, update) {
    const ret = $('<div>')
      .on('change.script', () => {
        const i = value.indexOf(text);
        if (i > -1) {
          value.splice(i, 1);
          update(value);
        }
        ret.remove();
      });
    const el = $('<input>')
      .addClass('array-remove')
      .attr({
        type: 'checkbox',
        id: key,
      }).prop('checked', '1');
    const label = $(`<label>`).html(text)
      .attr({
        for: key,
      });
    ret.append(el, ' ', label);
    return ret;
  }

  class MapList extends ArrayType {
    constructor(name = 'map') {
      super(name);
    }
    default() {
      return new Map();
    }
    element(val, update, { container, key: setting }) {
      const data = [...val.entries()];
      function invalid(text) {
        return data.some(([value]) => value === text);
      }
      function add(value, i) {
        function save(remove) {
          if (remove) data.splice(data.indexOf(value), 1);
          update(data.filter(([key]) => key));
        }
        container.append(createItem({ value, save, invalid, key: `${setting}.${i}` }));
      }
      data.forEach(add);
      let entries = data.length;
      return $('<button class="btn btn-success glyphicon glyphicon-plus">').on('click', () => {
        const item = ['', ''];
        data.push(item);
        add(item, entries);
        entries += 1;
      });
    }
    encode(value = []) {
      if (value instanceof Map) {
        return super.encode([...value.entries()]);
      }
      return super.encode(value);
    }
    styles() {
      return [
        '{ border-top: 1px solid white; border-bottom: 1px solid white; padding: 5px 0; }',
        'label { align-self: flex-end; }',
        '.btn { padding: 3px 6px; }',
        '.item { display: inline-flex; flex-wrap: wrap; align-items: center; padding-top: 5px; width: 100%; }',
        '.item > * { margin: 0 5px; }',
        '.error [id]:not([id$=".value"]) { border-color: red; }',
        '.warning { display: none; color: red; flex-basis: 100%; user-select: none; }',
        '.error .warning { display: block; }',
      ];
    }
    value(value) {
      return new Map(super.value(value));
    }
  }
  function createItem({
    value = ['key', 'value'],
    save,
    invalid,
    key,
  }) {
    const left = $('<input type="text">').val(value[0]).on('blur', () => {
      const newVal = left.val();
      const isInvalid = newVal !== value[0] && invalid(newVal);
      left.parent().toggleClass('error', isInvalid);
      if (isInvalid || newVal === value[0]) return;
      value[0] = newVal;
      save();
    }).attr('id', key);
    const right = $('<input type="text">').val(value[1]).on('blur', () => {
      const newVal = right.val();
      if (newVal === value[1]) return;
      value[1] = newVal;
      save();
    }).attr('id', `${key}.value`);
    const button = $('<button class="btn btn-danger glyphicon glyphicon-trash">').on('click', () => {
      save(true);
      button.parent().remove();
    });
    const warning = $('<div class="warning clickable">')
      .text(Translation.Setting('map.duplicate'))
      .on('click', () => left.val(value[0])
        .parent().removeClass('error'));
    return $('<div class="item">').append(left, ' : ', right, button, warning);
  }

  const registry = new Map();
  function getSettingType(type) {
    if (isSettingType(type)) return type;
    return registry.get(type);
  }
  function isSettingType(type) {
    return type instanceof SettingType;
  }

  const mapTypes = new Set();
  let baseRegistered = false;
  class AdvancedMap extends MapList {
    #keyType;
    #valueType;
    #name;
    constructor(keyType = 'text', valueType = keyType) {
      super('advancedMap');
      this.#keyType = getSettingType(keyType);
      this.#valueType = getSettingType(valueType);
      if (!isSettingType(this.#keyType) || !isSettingType(this.#valueType)) throw new Error('AdvancedMap requires setting types');
      const uniqueTypes = [...new Set([this.#keyType, this.#valueType])];
      this.#name = uniqueTypes.join('_').replaceAll(' ', '-');
      if (baseRegistered) {
        this.name += `_${this.#name}`;
      }
    }
    element(val, update, {
      container, data: mapData = {}, disabled, key, name, untilClose,
    } = {}) {
      const data = [...val.entries()];
      const dataKey = getData$1(mapData);
      const dataValue = getData$1(mapData, true);
      let entries = data.length;
      const add = (lineValue, id) => {
        function save(remove) {
          if (remove) data.splice(data.indexOf(lineValue), 1);
          const ret = data.filter(([_]) => _);
          update(ret);
        }
        const line = $('<div class="item">');
        const options = { container: $('<div>'), name, disabled, remove: false, removeSetting() {}, key: `${key}.${id}`, child: true };
        const left = $(this.#keyType.element(this.#keyValue(lineValue[0], dataKey), (newValue) => {
          const [keyValue] = lineValue;
          const isInvalid = this.#isInvalid(data, keyValue, newValue);
          line.toggleClass('error', isInvalid);
          if (isInvalid || newValue === keyValue) return;
          lineValue[0] = newValue;
          cacheLeftValue();
          save();
        }, {
          ...options,
          data: dataKey,
        }));
        const right = $(this.#valueType.element(this.#value(lineValue[1], dataValue), (newValue) => {
          if (newValue === lineValue[1]) return;
          lineValue[1] = newValue;
          save();
        }, {
          ...options,
          data: dataValue,
          key: `${options.key}.value`,
        }));
        const button = $('<button class="btn btn-danger glyphicon glyphicon-trash">').on('click', () => {
          save(true);
          line.remove();
        });
        let leftValue;
        const warning = $('<div class="warning clickable">')
          .text(Translation.Setting('map.duplicate'))
          .on('click', () => left.val(leftValue)
            .parent().removeClass('error'));
        function refresh() {
          left.prop('disabled', disabled);
          right.prop('disabled', disabled);
          button.prop('disabled', disabled);
        }
        let simpleLookup = false;
        function cacheLeftValue() {
          leftValue = simpleLookup ?
            left.val() :
            left.find(`#${options.key}`).val();
        }
        if (!left.find(`#${options.key}`).length) {
          left.attr('id', options.key);
          simpleLookup = true;
        }
        if (!right.find(`#${options.key}.value`).length) {
          right.attr('id', `${options.key}.value`);
        }
        cacheLeftValue();
        refresh();
        untilClose(`refresh:${key}`, refresh, `create:${key}`);
        container.append(line.append(left, ' : ', right, button, warning));
      };
      data.forEach(add);
      const { defaultKey, defaultValue } = mapData;
      return $('<button class="btn btn-success glyphicon glyphicon-plus">').on('click', () => {
        const item = [
          defaultKey ?? this.#keyType.default(dataKey) ?? '',
          defaultValue ?? this.#valueType.default(dataValue) ?? '',
        ];
        data.push(item);
        add(item, entries);
        entries += 1;
      });
    }
    encode(value = []) {
      if (value instanceof Map) {
        return super.encode(this.#encodeEntries([...value.entries()]));
      }
      return super.encode(this.#encodeEntries(value));
    }
    styles() {
      return [...new Set([
        ...super.styles(),
        ...this.#keyType.styles(),
        ...this.#valueType.styles(),
      ]).values()];
    }
    #keyValue(value, data) {
      return this.#keyType.value(value, data);
    }
    #value(value, data) {
      return this.#valueType.value(value, data);
    }
    #encodeEntries(data = []) {
      return data.map(([key, val]) => ([
        this.#keyType.encode(key),
        this.#valueType.encode(val),
      ]));
    }
    #isInvalid(data, oldValue, newValue) {
      if (newValue === oldValue) return false;
      const encodedKeyValue = this.#keyType.encode(newValue);
      if (encodedKeyValue === this.#keyType.encode(oldValue)) return false;
      return data.some(
        ([keyValue]) => this.#keyType.encode(keyValue) === encodedKeyValue,
      );
    }
    get isRegistered() {
      const registered = mapTypes.has(this.#name);
      if (!registered) {
        mapTypes.add(this.#name);
        baseRegistered = true;
      }
      return registered;
    }
  }
  function getData$1({ dataKey, dataValue, key, keyData, leftData, value, valueData, rightData } = {}, secondary = false) {
    if (secondary) {
      return value || dataValue || valueData || rightData;
    }
    return key || dataKey || keyData || leftData;
  }

  class boolean extends SettingType {
    constructor(name = 'boolean') {
      super(name);
    }
    value(val, { extraValue, reverse = false } = {}) {
      if (typeof val === 'boolean') return val;
      const truthy = ['1', 'true', 1];
      if (extraValue) truthy.push(`${extraValue}`);
      const ret = truthy.includes(val);
      return reverse ? !ret : ret;
    }
    element(value, update, {
      remove = false,
    }) {
      return $(`<input type="checkbox">`)
        .prop('checked', value)
        .on('change.script', (e) => update(getValue$1(e.target, remove)));
    }
    default({ reverse } = {}) {
      return !!reverse;
    }
    labelFirst() {
      return false;
    }
    get isBasic() {
      return true;
    }
  }
  function getValue$1(el, remove = false) {
    if (el.checked) {
      return 1;
    }
    return remove ? undefined : 0;
  }

  class Text extends SettingType {
    constructor(name = 'text') {
      super(name);
    }
    value(val) {
      return `${val}`;
    }
    element(value, update) {
      return $('<input type="text">')
        .val(value)
        .on('blur.script', (e) => update(e.target.value))
        .css({
          'background-color': 'transparent',
        });
    }
    get isBasic() {
      return true;
    }
  }

  class Color extends Text {
    constructor(name = 'color') {
      super(name);
    }
    element(value, update) {
      return $('<input>').attr({
        type: 'color',
        value,
      }).on('change.script', (e) => update(e.target.value));
    }
    labelFirst() {
      return false;
    }
    styles() {
      return [
        'input[type="color"] { width: 16px; height: 18px; padding: 0 1px; }',
        'input[type="color"]:hover { border-color: #00b8ff; cursor: pointer; }',
      ];
    }
  }

  function clone(obj) {
    if (Array.isArray(obj)) {
      return [...obj];
    }
    if (typeof obj === 'object') {
      return { ...obj };
    }
    return obj;
  }

  class List extends ArrayType {
    constructor(name = 'list') {
      super(name);
    }
    value(val, data = []) {
      const value = super.value(val)
        .map((o) => data.find((i) => getValue(i) === o))
        .filter((_) => _);
      if (value.length !== data.length) {
        data.forEach((o) => {
          if (value.includes(o)) return;
          value.push(o);
        });
      }
      return value.map(clone);
    }
    default(data = []) {
      return data.map(getValue);
    }
    encode(value = []) {
      return super.encode(value.map(getValue));
    }
    element(value, update) {
      const list = $('<ol>').addClass('sortedList');
      let dragged;
      function dragging(e) {
        dragged = e.target;
        e.dataTransfer.effectAllowed = 'move';
      }
      function draggedOver(e) {
        if (!dragged || e.target.parentElement !== dragged.parentElement) return;
        e.preventDefault();
      }
      function dropped(e) {
        e.preventDefault();
        if (!dragged || e.target.parentElement !== dragged.parentElement || e.target === dragged) return;
        const target = list.children();
        const from = target.index(dragged);
        const to = target.index(e.target);
        value.splice(to, 0, ...value.splice(from, 1));
        update(value);
        if (from < to) {
          $(e.target).after(dragged);
        } else {
          $(e.target).before(dragged);
        }
        dragged = null;
      }
      function addItem(o) {
        const node = document.createElement('li');
        node.innerText = translateText(getLabel$1(o));
        node.draggable = true;
        if (typeof o.class === 'string') {
          node.classList.add(...o.class.trim().split(/\s+/));
        }
        node.addEventListener('dragstart', dragging);
        node.addEventListener('dragover', draggedOver);
        node.addEventListener('drop', dropped);
        list.append(node);
      }
      value.forEach(addItem);
      return list;
    }
    styles() {
      return [
        '.sortedList { flex-basis: 100%; padding: 0; list-style-position: inside; }',
        '.sortedList li { cursor: grab; }',
      ];
    }
  }
  function getValue(item) {
    if (typeof item === 'object') {
      if (item.val !== undefined) return item.val;
      if (item.value !== undefined) return item.value;
      return translateText(getLabel$1(item));
    }
    return item;
  }
  function getLabel$1(
    item,
    allowed = true,
  ) {
    if (allowed && typeof item === 'function') {
      return getLabel$1(item(), false);
    }
    if (typeof item === 'object') {
      return getLabel$1(item.label || item.text, allowed);
    }
    if (!item) throw new Error('Label not provided');
    if (typeof item !== 'string') throw new Error(`Unknown label: ${typeof item}`);
    return item;
  }

  class Password extends Text {
    constructor(name = 'password') {
      super(name);
    }
    element(value, update) {
      return $('<input type="password">')
        .val(value)
        .on('blur.script', (e) => update(e.target.value))
        .css({
          'background-color': 'transparent',
        });
    }
  }

  class Remove extends Text {
    constructor(name = 'remove') {
      super(name);
    }
    element(value, update, {
      removeSetting,
    }) {
      return $(`<input type="checkbox">`)
        .addClass('remove')
        .prop('checked', true)
        .on('change.script', (e) => removeSetting());
    }
    labelFirst() {
      return false;
    }
    styles() {
      return [
        '.remove { display: none; }',
        '.remove:checked + label:before { content: "× "; color: red; }',
      ];
    }
  }

  class Select extends Text {
    constructor(name = 'select') {
      super(name);
    }
    default([data] = []) {
      const [l, v = l] = toArray(data);
      return `${v}`;
    }
    element(value, update, {
      data = [],
    }) {
      return $('<select>')
        .append(options(data, value))
        .on('change.script', (e) => update(e.target.value));
    }
  }
  function options(data = [], current = '') {
    return data.map((o) => {
      const [l, v = l] = toArray(o);
      return `<option value="${v}"${`${current}` === `${v}` ? ' selected' : ''}>${translateText(l)}</option>`;
    });
  }

  class Slider extends Text {
    constructor(name = 'slider') {
      super(name);
    }
    element(value, update, {
      data = {},
    }) {
      return $('<input>')
        .attr({
          type: 'range',
          min: data.min ?? '0',
          max: data.max ?? '100',
          step: data.step ?? '1',
        })
        .val(value)
        .on('change.script', (e) => update(e.target.value));
    }
    value(val) {
      if (Number.isNaN(val)) {
        return parseFloat(val);
      }
      return val;
    }
    styles() {
      return [
        '.flex-start input[type="range"] { flex-grow: 1; }',
        'input[type="range"] { display: inline; width: 200px; vertical-align: middle; }',
      ];
    }
  }

  const baseLabels = {
    ' ': 'Space',
  };
  const any = Translation.Setting('key.any');
  const bind = Translation.Setting('key.bind');
  class keybind extends Text {
    constructor(name = 'keybind') {
      super(name);
    }
    element(value, update, {
      data = {},
      key: id,
    }) {
      const labels = {
        ...baseLabels,
        ...data.labels,
      };
      function getLabel(key) {
        return translateText(labels[key] || key);
      }
      let val = value !== 'Escape' ? value : '';
      let temp = getLabel(val);
      const ret = $('<div class="keybind-wrapper">');
      const input = $(`<input type="text" id="${id}">`)
        .val(temp)
        .on('focus', () => {
          input.val('').prop('placeholder', any);
          ret.addClass('editing');
        })
        .on('keydown', (event) => {
          const { key } = event;
          if (key !== 'Escape' && key !== val) {
            event.preventDefault();
            update(key);
            temp = getLabel(key);
            val = key;
          }
          input.blur();
        })
        .on('blur', () => {
          input.val(temp).prop('placeholder', bind);
          ret.removeClass('editing');
        })
        .prop('placeholder', bind);
      const button = $('<button class="glyphicon glyphicon-remove-sign">')
        .on('click', () => {
          if (temp === '') return;
          temp = '';
          input.val(temp);
          update(undefined);
        });
      ret.append(input, button);
      return ret;
    }
    styles() {
      return [
        '.keybind-wrapper { position: relative; }',
        '.keybind-wrapper input { text-align: center; caret-color: transparent; }',
        '.keybind-wrapper input:focus { border-color: transparent; outline: red double 1px; }',
        '.keybind-wrapper button { position: absolute; top: 4px; right: 0px; color: red; background-color: transparent; border: none; display: none;  }',
        '.keybind-wrapper:not(.editing):hover button { display: inline-block; }',
      ];
    }
  }

  const types = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ArrayType: ArrayType,
    Boolean: boolean,
    Color: Color,
    List: List,
    Password: Password,
    Remove: Remove,
    Select: Select,
    Slider: Slider,
    Text: Text,
    MapType: MapList,
    Keybind: keybind,
    AdvancedMap: AdvancedMap
  });

  const refresh$2 = Translation.Setting('note.refresh');
  class RegisteredSetting {
    #key;
    #name;
    #type;
    #page;
    #category;
    #default;
    #disabled;
    #hidden;
    #remove;
    #export;
    #prefix;
    #reset;
    #data;
    #note;
    #refresh;
    #onChange;
    #events;
    #transformer;
    constructor({
      category,
      converter,
      data,
      default: def,
      disabled,
      export: exporting,
      extraPrefix,
      events,
      hidden,
      key,
      name,
      note,
      onChange,
      page,
      refresh: refreshText,
      remove,
      reset,
      transform,
      type,
    } = {}) {
      this.#key = key;
      this.#name = name || key;
      this.#type = type;
      this.#page = page;
      this.#category = category;
      this.#default = def;
      this.#disabled = disabled;
      this.#hidden = hidden;
      this.#remove = remove;
      this.#export = exporting;
      this.#prefix = extraPrefix;
      this.#reset = reset;
      this.#data = data;
      this.#note = note;
      this.#refresh = refreshText;
      this.#events = events;
      this.#transformer = transform;
      if (typeof onChange === 'function') {
        this.#onChange = onChange;
      }
      if (typeof converter === 'function') {
        this.#convert(converter);
      }
    }
    get key() {
      return this.#key;
    }
    get name() {
      return translateText(this.#value(this.#name));
    }
    get type() {
      return this.#type;
    }
    get page() {
      return this.#page;
    }
    get category() {
      return this.#category;
    }
    get disabled() {
      return this.#value(this.#disabled) === true;
    }
    get hidden() {
      return this.#value(this.#hidden) === true;
    }
    get remove() {
      return this.#value(this.#remove) === true;
    }
    get exportable() {
      return this.#value(this.#export) !== false;
    }
    get extraPrefix() {
      return this.#prefix;
    }
    get reset() {
      return this.#value(this.#reset) === true;
    }
    get data() {
      return this.#value(this.#data);
    }
    get note() {
      const notes = [];
      const note = this.#value(this.#note);
      if (note) {
        notes.push(translateText(note));
      }
      if (this.#value(this.#refresh)) {
        notes.push(refresh$2);
      }
      return notes.join('<br>');
    }
    update(val) {
      const {
        key,
        type,
        value: prev,
      } = this;
      if (val === undefined || val === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, type.encode(val));
      }
      this.#onChange?.(this.value, prev);
      this.#events.emit(key, this.value, prev);
      this.#events.emit('setting:change', key, this.value, prev);
    }
    set value(val) {
      this.update(val);
    }
    get value() {
      const val = localStorage.getItem(this.key);
      if (val === null) {
        return this.default;
      }
      return this.#transform(this.type.value(val, this.data));
    }
    get default() {
      const val = this.#default;
      if (val !== undefined) {
        return this.#transform(this.type.value(this.#value(val), this.data));
      }
      return this.#transform(this.type.default(this.data));
    }
    #convert(converter) {
      const { key } = this;
      const current = localStorage.getItem(key);
      if (current === null) return;
      const converted = converter(current);
      if (converted === null) {
        localStorage.removeItem(key);
      } else if (converted !== undefined) {
        localStorage.setItem(key, this.type.encode(converted));
      }
    }
    #transform(value) {
      if (typeof this.#transformer === 'function') {
        return this.#transformer(value);
      }
      return value;
    }
    #value(input) {
      if (typeof input === 'function') {
        return input();
      }
      return input;
    }
  }

  const styles$2 = ".flex-stretch {\n  flex-basis: 100%;\n}\n\n.flex-start {\n  display: flex;\n  align-items: flex-start;\n  flex-wrap: wrap;\n}\n\n.flex-start > label + * {\n  margin-left: 7px;\n}\n\n.flex-start > input {\n  margin-right: 4px;\n}\n\n.mono .modal-body {\n  font-family: monospace;\n  max-height: 500px;\n  overflow-y: auto;\n}\n\n.underscript-dialog .bootstrap-dialog-message {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n.underscript-dialog fieldset {\n  padding: 0.35em 0.625em 0.75em;\n  margin: 0 2px;\n  border: 1px solid silver;\n}\n\n.underscript-dialog legend {\n  padding: 0;\n  border: 0;\n  width: auto;\n  margin: 0;\n  font-family: DTM-Mono, sans-serif;\n  color: white;\n}\n\n.underscript-dialog label.disabled {\n  color: #666;\n  cursor: not-allowed;\n}\n\n.underscript-dialog .target-setting {\n  border: 2px solid yellow;\n}\n\n/*\n.underscript-dialog .modal-content {\n  background: #000 url(../images/backgrounds/2.png) -380px -135px;\n}\n.underscript-dialog .modal-content .modal-header,\n.underscript-dialog .modal-body {\n  background-color: transparent;\n}\n*/\n\n.underscript-dialog .modal-footer button.btn {\n  margin-bottom: 5px;\n}\n\n/* TODO: convert reset to a type? for convenience {} */\n.underscript-dialog .reset:hover {\n  cursor: pointer;\n  font-weight: bold;\n}\n\n.underscript-dialog .reset::before {\n  content: '[';\n}\n\n.underscript-dialog .reset::after {\n  content: ']';\n}\n";

  class DialogHelper {
    #instance;
    #events = eventEmitter();
    isOpen() {
      return !!this.#instance;
    }
    open({
      buttons = [],
      cssClass = 'underscript-dialog',
      message,
      title,
      ...options
    } = BootstrapDialog.defaultOptions) {
      if (this.isOpen() || !message || !title) return;
      BootstrapDialog.show({
        ...options,
        title,
        message,
        buttons: [
          ...buttons,
          {
            cssClass: 'btn-primary',
            label: `${Translation.CLOSE}`,
            action: () => this.close(),
          },
        ],
        cssClass: `mono ${cssClass}`,
        onshown: (diag) => {
          this.#instance = diag;
          this.#events.emit('open', diag);
        },
        onhidden: () => {
          this.#instance = null;
          this.#events.emit('close');
        },
      });
    }
    close() {
      this.#instance?.close();
    }
    onClose(callback) {
      this.#events.on('close', callback);
    }
    onOpen(callback) {
      this.#events.on('open', callback);
    }
    appendButton(...buttons) {
      const diag = this.#instance;
      if (!diag) return;
      diag.options.buttons.push(...buttons);
      diag.updateButtons();
    }
    prependButton(...buttons) {
      const diag = this.#instance;
      if (!diag) return;
      diag.options.buttons.unshift(...buttons);
      diag.updateButtons();
    }
  }

  const defaultSetting = new RegisteredSetting();
  style.add(styles$2);
  const settingReg = {
  };
  const events$3 = eventEmitter();
  const configs = new Map();
  const dialog$1 = new DialogHelper();
  let updateLock = false;
  function getScreen() {
    if (getScreen.screen) {
      return getScreen.screen;
    }
    const screen = TabManager();
    screen.settings({ left: true });
    screen.plugins = TabManager();
    const tab = screen.addTab('Plugins', screen.plugins);
    tab.setEnd(true);
    configs.set('Plugins', {
      page: tab,
    });
    getScreen.screen = screen;
    return screen;
  }
  function getPage(key) {
    const config = configs.get(key);
    if (config && config.page) {
      return config.page;
    }
    function builder() {
      return getMessage(key)[0];
    }
    const screen = key.name ? getScreen().plugins : getScreen();
    const name = key.name || key;
    const tab = screen.addTab(name, builder);
    return tab;
  }
  function init$5(page) {
    if (!configs.has(page)) {
      const name = page === 'main' ? 'UnderScript' : page.name || page;
      const data = {
        name,
        settings: {},
        page: getPage(page),
      };
      data.page.setName(name);
      configs.set(page, data);
    }
    return configs.get(page);
  }
  function createSetting(setting = defaultSetting) {
    if (setting.hidden) return null;
    const ret = $('<div>').addClass('flex-start');
    const { key, type } = setting;
    events$3.emit(`create:${key}`);
    ret.addClass(getCSSName(type.name));
    events$3.on(`scroll:${key}`, () => {
      $('.target-setting').removeClass('target-setting');
      ret.addClass('target-setting')
        .get(0).scrollIntoView();
      ret.delay(2000).queue((next) => {
        ret.removeClass('target-setting');
        next();
      });
    });
    const container = $(`<div>`).addClass('flex-stretch');
    const el = $(type.element(setting.value, (...args) => {
      if (!updateLock) updateLock = setting;
      setting.update(...args);
    }, {
      get data() { return setting.data; },
      get disabled() { return setting.disabled; },
      get remove() { return setting.remove; },
      container,
      get name() { return setting.name; },
      key,
      removeSetting() {
        removeSetting(setting, el);
      },
      untilClose,
    }));
    if (!el.find(`#${key.replaceAll('.', '\\.')}`).length) {
      el.attr({
        id: key,
      });
    }
    const label = $(`<label for="${key}">`).html(setting.name);
    const labelPlacement = type.labelFirst();
    if (labelPlacement) {
      ret.append(label, ' ', el);
    } else if (labelPlacement !== null) {
      ret.append(el, ' ', label);
    } else {
      ret.append(el);
    }
    ret.hover((e) => {
      const { note } = setting;
      if (!note) return undefined;
      return show$2(note)(e);
    }, hide$1);
    if (setting.reset) {
      const reset = $('<span>')
        .text('x')
        .addClass('reset')
        .click(() => {
          const def = setting.default ?? '';
          el.val(def);
          setting.update(undefined);
        });
      ret.append(' ', reset);
    }
    ret.append(container);
    function refresh() {
      el.prop('disabled', setting.disabled);
      label.toggleClass('disabled', setting.disabled);
      label.html(setting.name);
    }
    refresh();
    untilClose(`refresh:${key}`, refresh, `create:${key}`);
    return ret;
  }
  function getMessage(page) {
    const container = $('<div>');
    const pageSettings = configs.get(page).settings;
    const categories = {};
    function createCategory(name) {
      const set = $('<fieldset>');
      categories[name] = set;
      if (name !== 'N/A') {
        set.append($('<legend>').html(translateText(name)));
      }
      container.append(set);
      return set;
    }
    function category(name = 'N/A') {
      return categories[name] || createCategory(name);
    }
    category();
    each(pageSettings, (data = defaultSetting) => wrap(() => {
      let element = createSetting(data);
      category(data.category).append(element);
      function refresh() {
        if (updateLock === data) {
          updateLock = false;
          return;
        }
        const newElement = createSetting(data);
        element.replaceWith(newElement);
        element = newElement;
      }
      untilClose(data.key, refresh);
    }, data.key, getLogger(data)));
    if (!category('N/A').html()) {
      category('N/A').remove();
    }
    return container;
  }
  function register$4(data) {
    if (typeof data !== 'string' && !data.key) throw new Error('No key provided');
    const key = (data.key || data);
    if (settingReg[key]) throw new Error(`${settingReg[key].name}[${key}] already registered`);
    const page = data.page || 'main';
    const setting = {
      ...(typeof data === 'object' && data),
      events: events$3,
      key,
      page,
      type: data.type || registry.get('boolean'),
    };
    const slider = (data.min || data.max || data.step) !== undefined;
    if (!data.type) {
      if (data.options) {
        setting.type = 'select';
        setting.data ??= data.options;
      } else if (slider) {
        setting.type = 'slider';
      }
    }
    if (slider) {
      setting.data = {
        min: data.min,
        max: data.max,
        step: data.step,
        ...setting.data,
      };
    } else if (setting.type === 'select' && !setting.data && data.options) {
      setting.data = data.options;
    }
    if (!isSettingType(setting.type)) {
      switch (typeof setting.type) {
        case 'string':
          setting.type = registry.get(setting.type);
          break;
        case 'object':
          try {
            const left = data.type.key || data.type.left || data.type[0];
            const right = data.type.value || data.type.right || data.type[1];
            const type = new AdvancedMap(left, right);
            setting.type = type;
            registerTypeStyle(type);
          } catch (e) {
            const logger = data.page?.logger || console;
            logger.error('Error setting up AdvancedMap', e);
            setting.type = undefined;
          }
          break;
      }
    }
    if (!isSettingType(setting.type)) return undefined;
    const conf = init$5(page);
    const registeredSetting = new RegisteredSetting(setting);
    conf.settings[key] = registeredSetting;
    settingReg[key] = registeredSetting;
    return {
      get key() { return key; },
      value: () => registeredSetting.value,
      set: (val) => registeredSetting.update(val),
      on: (func) => {
        events$3.on(key, func);
      },
      get disabled() { return registeredSetting.disabled; },
      show(scroll) {
        const opening = !isOpen();
        open$3(page);
        if (!scroll) return;
        if (opening) {
          events$3.once('open', () => events$3.emit(`scroll:${key}`));
        } else {
          events$3.emit(`scroll:${key}`);
        }
      },
      refresh: () => {
        events$3.emit(`refresh:${key}`);
      },
    };
  }
  function open$3(page = 'main') {
    const test = page.name || page;
    if (typeof test !== 'string') throw new Error(`Attempted to open unknown page, ${test} (${typeof page})`);
    getPage(page).setActive();
    if (page.name) {
      getPage('Plugins').setActive();
    }
    if (isOpen()) {
      getScreen().render(true);
      return;
    }
    dialog$1.open({
      title: `${Translation.Setting('title')}`,
      message() {
        return getScreen().render(true);
      },
    });
  }
  function setDisplayName(name, page = 'main') {
    if (name) {
      init$5(page).name = name;
      getPage(page).setName(name);
      return true;
    }
    return false;
  }
  function isOpen() {
    return dialog$1.isOpen();
  }
  function value(key) {
    const setting = settingReg[key];
    if (setting) {
      return setting.value;
    }
    return localStorage.getItem(key);
  }
  function remove$1(key) {
    const setting = settingReg[key];
    if (!setting) return;
    removeSetting(setting, $(`[id='${key}']`));
  }
  function removeSetting(setting, el) {
    const { key, page } = setting;
    localStorage.removeItem(key);
    delete configs.get(page).settings[key];
    delete settingReg[key];
    if (el) {
      el.parent().remove();
    }
  }
  function exists(key) {
    return key in settingReg;
  }
  init$5('main');
  eventManager.once(':menu:opening', () => {
    const note = Translation.Menu('settings.note');
    addButton({
      text: Translation.Menu('settings'),
      action: () => {
        open$3('main');
      },
      enabled() {
        return typeof BootstrapDialog !== 'undefined';
      },
      note() {
        if (!this.enabled()) {
          return note;
        }
        return undefined;
      },
    });
  });
  function on(...args) {
    events$3.on(...args);
  }
  function registerType(type, addStyle = style.add) {
    if (!isSettingType(type)) throw new Error(`SettingType: Tried to register object of: ${typeof type}`);
    const name = type.name;
    if (!name || registry.has(name)) throw new Error(`SettingType: "${name}" already exists`);
    registry.set(name, type);
    registerTypeStyle(type, addStyle);
  }
  function registerTypeStyle(type, addStyle = style.add) {
    if (type instanceof AdvancedMap && type.isRegistered) return;
    addStyle(...type.styles().map((s) => `.underscript-dialog .${getCSSName(type.name)} ${s}`));
  }
  each(types, (Type) => registerType(new Type()));
  function getCSSName(name = '', prefix = 'setting-') {
    return `${prefix}${name.replaceAll(/[^_a-zA-Z0-9-]/g, '-')}`;
  }
  function untilClose(key, callback, ...extra) {
    events$3.on(key, callback);
    events$3.once(['close', ...extra].join(' ').trim(), () => {
      events$3.off(key, callback);
    });
  }
  function getLogger({ page } = defaultSetting) {
    return page.logger || console;
  }
  dialog$1.onOpen((diag) => {
    events$3.emit('open');
    eventManager.emit('Settings:open', diag.getModalBody());
  });
  dialog$1.onClose(() => {
    events$3.emit('close');
  });

  register$4({
    name: 'Send anonymous statistics',
    key: 'underscript.analytics',
    default: () => window.GoogleAnalyticsObject !== undefined,
    enabled: () => window.GoogleAnalyticsObject !== undefined,
    hidden: true,
    note: () => {
      if (window.GoogleAnalyticsObject === undefined) {
        return 'Analytics has been disabled by your adblocker.';
      }
      return undefined;
    },
  });
  const config = {
    app_name: 'underscript',
    app_version: scriptVersion,
    version: scriptVersion,
    handler: GM_info.scriptHandler,
    anonymize_ip: true,
    custom_map: {
      dimension1: 'version',
    },
  };
  eventManager.on('login', (id) => {
    config.user_id = id;
  });
  window.dataLayer = window.dataLayer || [];
  gtag('js', new Date());
  gtag('config', 'G-32N9M5BWMR', config);
  function gtag() {
    dataLayer.push(arguments);
  }

  const prefix = 'underscript.history.';
  const history$1 = {};
  eventManager.on(':preload', () => {
    each(localStorage, (data, key = '') => {
      if (!key.startsWith(prefix)) return;
      const id = key.substring(prefix.length);
      history$1[id] = JSON.parse(data);
    });
  });
  eventManager.on('preChat:getPrivateMessage', function storeHistory(data) {
    if (!this.canceled || data.open) return;
    const userId = data.idRoom;
    const list = history$1[userId] || [];
    if (!list.length) history$1[userId] = list;
    list.push(JSON.parse(data.chatMessage));
    const overflow = list.length - 50;
    if (overflow > 0) {
      list.splice(0, overflow);
    }
    localStorage.setItem(`${prefix}${userId}`, JSON.stringify(list));
  });
  globalSet('openPrivateRoom', function openPrivateRoom(id, username) {
    if (history$1[id]) {
      global('privateChats')[id] = [...history$1[id]];
      global('refreshChats')();
    }
    this.super(id, username);
    if (history$1[id]) {
      delete history$1[id];
      localStorage.removeItem(`${prefix}${id}`);
    }
  }, {
    throws: false,
  });

  eventManager.on(':preload:GamesList', () => {
    eventManager.singleton.emit('enterCustom');
    const socket = global('socket');
    const oHandler = socket.onmessage;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { action } = data;
      if (eventManager.cancelable.emit(`preCustom:${action}`, data).canceled) return;
      oHandler(event);
      eventManager.emit(`Custom:${action}`, data);
    };
  });

  function max$1(rarity) {
    switch (rarity) {
      case 'DETERMINATION':
      case 'LEGENDARY': return 1;
      case 'EPIC': return 2;
      case 'RARE':
      case 'BASE':
      case 'COMMON': return 3;
      case 'TOKEN':
      case 'GENERATED': return 0;
      default:
        debug(`Unknown rarity: ${rarity}`);
        return undefined;
    }
  }
  function isShiny(el) {
    return el.classList.contains('shiny');
  }
  function find$1(id, shiny) {
    const elements = document.querySelectorAll(`[id="${id}"]`);
    if (shiny !== undefined) {
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i];
        if (shiny === isShiny(el)) {
          return el;
        }
      }
    }
    return elements[0];
  }
  function rarity(el) {
    return getCardData(el.id).rarity;
  }
  function quantity(el) {
    return parseInt(el.querySelector('.cardQuantity .nb, #quantity .nb, .quantity .nb').textContent, 10);
  }
  function totalDust() {
    return parseInt(document.querySelector('span#dust').textContent, 10);
  }
  function craftable(el) {
    const r = rarity(el);
    if (quantity(el) >= max$1(r)) {
      return false;
    }
    const s = isShiny(el);
    switch (r) {
      case 'DETERMINATION': return fragCost(r, s) <= totalFrags();
      case 'LEGENDARY':
      case 'EPIC':
      case 'RARE':
      case 'COMMON':
      case 'BASE': {
        const dust = dustCost(r, s);
        return dust !== null && dust <= totalDust();
      }
      case 'TOKEN':
      case 'GENERATED': return false;
      default: {
        debug(`Unknown Rarity: ${r}`);
        return false;
      }
    }
  }
  function totalFrags() {
    return Number(document.querySelector('span#nbDTFragments').textContent);
  }
  function fragCost(r, s) {
    if (typeof r === 'object') {
      if (typeof s !== 'boolean') {
        s = isShiny(r);
      }
      r = rarity(r);
    }
    switch (r) {
      case 'DETERMINATION': return s ? 8 : 4;
      default: return null;
    }
  }
  function dustCost(r, s) {
    if (typeof r === 'object') {
      if (typeof s !== 'boolean') {
        s = isShiny(r);
      }
      r = rarity(r);
    }
    switch (r) {
      case 'DETERMINATION': return null;
      case 'LEGENDARY': return s ? 3200 : 1600;
      case 'EPIC': return s ? 1600 : 400;
      case 'RARE': return s ? 800 : 100;
      case 'COMMON': return s ? 400 : 40;
      case 'BASE': return s ? 400 : null;
      default: return null;
    }
  }
  function dustGain(r, s) {
    if (typeof r === 'object') {
      if (typeof s !== 'boolean') {
        s = isShiny(r);
      }
      r = rarity(r);
    }
    switch (r) {
      case 'TOKEN':
      case 'GENERATED':
      case 'DETERMINATION': return null;
      case 'LEGENDARY': return s ? 1600 : 400;
      case 'EPIC': return s ? 400 : 100;
      case 'RARE': return s ? 100 : 20;
      case 'COMMON': return s ? 40 : 5;
      case 'BASE': return s ? 40 : null;
      default: {
        debug(`Unknown Rarity: ${r}`);
        return null;
      }
    }
  }
  function getCardData(id) {
    const cards = global('allCards').filter((card) => card.id === parseInt(id, 10));
    if (cards.length) return cards[0];
    throw new Error(`Unknown card ${id}`);
  }
  function cardName(card, fallback = card.name) {
    return translateText(`card-name-${card.fixedId || card.id}`, {
      args: [1],
      fallback,
    });
  }
  mod.utils.rarity = Object.freeze({
    max(cardRarity = '') {
      if (!cardRarity) throw new Error('Rarity required!');
      return max$1(cardRarity);
    },
    cost(cardRarity = '', shiny = false) {
      if (!cardRarity) throw new Error('Rarity required!');
      return dustCost(cardRarity, shiny);
    },
    dust(cardRarity = '', shiny = false) {
      if (!cardRarity) throw new Error('Rarity required!');
      return dustGain(cardRarity, shiny);
    },
  });

  function getPageName() {
    const { pathname } = location;
    const length = pathname.length;
    let temp = pathname.indexOf('.');
    if (temp === -1 && (temp = pathname.lastIndexOf('/')) <= 0) {
      temp = null;
    }
    return pathname.substring(1, temp || length);
  }
  function onPage(name, callback, prefix) {
    const r = getPageName() === name;
    if (typeof callback === 'function' && r) {
      wrap(callback, prefix);
    }
    return r;
  }
  register$5('onPage', onPage);

  onPage('Crafting', () => {
    eventManager.on('jQuery', () => {
      $(document).ajaxComplete((event, xhr, options) => {
        if (options.url !== 'CraftConfig') return;
        if (!options.data) {
          eventManager.emit('Craft:Loaded');
          return;
        }
        const data = JSON.parse(options.data);
        const response = xhr.responseJSON;
        const success = response.status === 'success';
        if (data.action === 'craft') {
          if (success) {
            const card = response.card ? JSON.parse(response.card) : {};
            const id = card.id || response.cardId;
            eventManager.emit('craftcard', {
              id,
              name: cardName(card) || response.cardName,
              dust: response.dust,
              shiny: data.isShiny || response.shiny || false,
            });
          } else {
            eventManager.emit('crafterrror', response.message, response.status);
          }
        } else {
          eventManager.emit(`Craft:${data.action}`, success, response, data);
        }
      });
    });
    eventManager.on(':preload', () => {
      globalSet('showPage', function showPage(...args) {
        const prevPage = global('currentPage');
        this.super(...args);
        eventManager.emit('Craft:RefreshPage', global('currentPage'), prevPage);
      });
    });
  });

  eventManager.on('Chat:send', function chatCommand({ input, room }) {
    const raw = input.value;
    if (this.canceled || !raw.startsWith('/')) return;
    const index = raw.includes(' ') ? raw.indexOf(' ') : undefined;
    const command = raw.substring(1, index);
    const text = index === undefined ? '' : raw.substring(index + 1);
    const data = { room, input, command, text, output: undefined };
    const event = eventManager.cancelable.emit('Chat:command', data);
    this.canceled = event.canceled;
    if (data.output === undefined) return;
    input.value = data.output;
  });

  onPage('Decks', function deckPage() {
    eventManager.on('jQuery', () => {
      $(document).ajaxSuccess((event, xhr, options) => {
        if (options.url !== 'DecksConfig' || !options.data) return;
        const { action } = JSON.parse(options.data);
        const data = xhr.responseJSON;
        const obj = Object.freeze({ action, data, options, xhr });
        eventManager.emit('Deck:Change', obj);
        eventManager.emit(`Deck:${action}`, obj);
      });
      $(document).ajaxComplete((event, xhr, options) => {
        if (options.url !== 'DecksConfig') return;
        const data = xhr.responseJSON;
        if (options.type === 'GET') {
          eventManager.singleton.emit('Deck:Loaded', data);
          return;
        }
        const { action } = JSON.parse(options.data);
        const obj = Object.freeze({ action, data, options, xhr });
        eventManager.emit('Deck:postChange', obj);
        eventManager.emit(`Deck:${action}`, obj);
      });
      globalSet('updateSoul', function updateSoul() {
        this.super();
        const val = $('#selectSouls').val();
        eventManager.emit('Deck:Soul', val);
      });
    });
  });

  const selector$1 = 'a[href="/cdn-cgi/l/email-protection"]';
  function hexAt(str = '', index = 0) {
    const r = str.substring(index, index + 2);
    return parseInt(r, 16);
  }
  function decrypt(ciphertext) {
    let output = '';
    const key = hexAt(ciphertext, 0);
    for (let i = 2; i < ciphertext.length; i += 2) {
      const plaintext = hexAt(ciphertext, i) ^ key;
      output += String.fromCharCode(plaintext);
    }
    return decodeURIComponent(escape(output));
  }
  function decode$1(doc) {
    if (typeof jQuery === 'function' && doc instanceof jQuery) {
      doc.find(selector$1).replaceWith(function decryption() {
        return decrypt(this.dataset.cfemail);
      });
    } else {
      [...doc.querySelectorAll(selector$1)].forEach(function decryption(el) {
        el.replaceWith(decrypt(el.dataset.cfemail));
      });
    }
    return doc;
  }

  function debugToast(arg, permission = 'debugging') {
    if (!value$1(permission) && !value$1('debugging.*')) return false;
    if (typeof arg === 'string') {
      arg = {
        text: arg,
      };
    }
    const defaults = {
      background: '#c8354e',
      textShadow: '#e74c3c 1px 2px 1px',
      css: { 'font-family': 'inherit' },
      button: {
        background: '#e25353',
        textShadow: '#46231f 0px 0px 3px',
      },
    };
    return toast$6(merge(defaults, arg));
  }

  function length(obj) {
    if (obj instanceof Map) {
      return obj.size;
    }
    if (typeof obj?.length === 'number') {
      return obj.length;
    }
    if (typeof obj === 'object') {
      return Object.keys(obj).length;
    }
    throw new Error('Unable to find length of', JSON.stringify(obj));
  }

  function getFromEl(el) {
    const link = el.find('a:first').attr('href');
    const id = link.substring(link.indexOf('=') + 1);
    const name = el.contents()[0].nodeValue.trim();
    return { id, name };
  }
  let validated = 0;
  function loadFriends(validate) {
    if (typeof window.jQuery === 'undefined') return undefined;
    return axios.get('/Friends').then((response) => {
      const data = decode$1($(response.data));
      if (data.find(`span[data-i18n="[html]error-not-allowed"]`).length) {
        eventManager.singleton.emit(':GuestMode');
        return true;
      }
      const requests = {};
      data.find('p:contains(Friend requests)').parent().children('li').each(function fR() {
        const f = getFromEl($(this));
        requests[f.id] = f.name;
      });
      const count = length(requests);
      if (count !== validated && count > 3 && !validate) {
        return loadFriends(count);
      }
      if (validate) {
        validated = count;
        if (validate !== count) debugToast(`Friends: Validation failed (found ${validate}, got ${count})`);
      }
      eventManager.emit('preFriends:requests', requests);
      eventManager.emit('Friends:requests', requests);
      return false;
    }).catch((e) => {
      debugToast(`Friends: ${e.message}`);
    }).then((error) => {
      if (error) return;
      sleep(10000).then(loadFriends);
    });
  }
  sleep().then(loadFriends);

  class Item extends Constant {
    static GOLD = new Item('Gold', 'gold', 'GOLD', 'reward-gold');
    static UCP = new Item('UCP', 'ucp', 'item-ucp', 'reward-ucp');
    static DUST = new Item('Dust', 'dust', 'DUST', 'item-dust', 'reward-dust');
    static EXP = new Item('XP', 'xp', 'exp', 'experience', 'stat-xp', 'reward-xp');
    static ELO = new Item('elo');
    static DT_FRAGMENT = new Item('DT Fragment', 'fragment', 'dt fragment', 'dt frag', 'dtfrag', 'item-dt-fragment', 'reward-dt-fragment');
    static UT_PACK = new Item('Pack', 'pack', 'PACK', 'reward-pack');
    static DR_PACK = new Item('DR Pack', 'dr pack', 'DRPack', 'DR_PACK', 'reward-dr-pack');
    static UTY_PACK = new Item('UTY Pack', 'uty pack', 'UTYPack', 'UTY_PACK', 'reward-uty-pack');
    static SHINY_PACK = new Item('Shiny Pack', 'ShinyPack', 'shiny pack', 'SHINY_PACK', 'reward-shiny-pack');
    static SUPER_PACK = new Item('Super Pack', 'SuperPack', 'super pack', 'reward-super-pack');
    static FINAL_PACK = new Item('Final Pack', 'FinalPack', 'final pack', 'reward-final-pack');
    static CARD = new Item('Card', 'card');
    static SKIN = new Item('Card Skin', 'Skin', 'card skin', 'skin', 'reward-card-skin');
    static AVATAR = new Item('Avatar', 'avatar', 'reward-avatar');
    static EMOTE = new Item('Emote', 'emote', 'reward-emote');
    static PROFILE = new Item('Profile Skin', 'Profile', 'profile skin', 'profile', 'reward-profile-skin');
    static find(value) {
      if (value instanceof Item) return value;
      return items.find((item) => item.equals(value));
    }
  }
  const items = Object.values(Item);
  mod.item = Object.fromEntries(Object.entries(Item));

  eventManager.on(':preload:Friendship', () => {
    eventManager.singleton.emit('Friendship:load');
    $(document).ajaxComplete((event, xhr, settings) => {
      if (settings.url !== 'FriendshipConfig') return;
      if (settings.type === 'GET') {
        eventManager.singleton.emit('Friendship:loaded');
      } else if (xhr.responseJSON) {
        const data = xhr.responseJSON;
        if (data.status === 'success') {
          const {
            idCard,
            reward,
            quantity,
            claim,
          } = data;
          eventManager.emit('Friendship:claim', {
            data: global('friendshipItems')[idCard],
            reward: Item.find(reward) || reward,
            quantity,
            claim,
          });
        } else if (data.status === 'errorMaintenance') {
          eventManager.emit('Friendship:claim', {
            error: JSON.parse(data.message),
          });
        }
      } else {
        eventManager.emit('Friendship:claim', {
          error: true,
        });
      }
    });
    eventManager.on('ShowPage', (page) => eventManager.emit('Friendship:page', page));
  });

  function gameHook() {
    debug('Playing Game');
    eventManager.singleton.emit('GameStart');
    eventManager.singleton.emit('PlayingGame');
    eventManager.on(':preload', () => {
      function callGameHooks(data, original) {
        const run = !eventManager.cancelable.emit('PreGameEvent', data).canceled;
        if (run) {
          wrap(() => original(data));
        }
        eventManager.emit('GameEvent', data);
      }
      function hookEvent(event) {
        callGameHooks(event, this.super);
      }
      if (undefined !== window.bypassQueueEvents) {
        globalSet('runEvent', hookEvent);
        globalSet('bypassQueueEvent', hookEvent);
      } else {
        debug('Update your code yo');
      }
    });
  }
  onPage('Game', gameHook);

  eventManager.on('GameStart', function gameEvents() {
    let finished = false;
    eventManager.on('GameEvent', function logEvent(data) {
      if (finished) {
        debugToast(`Extra action: ${data.action}`, 'debugging.events.extra');
        return;
      }
      debug(data.action, 'debugging.events.name');
      debug(data, 'debugging.events.raw');
      const emitted = eventManager.emit(data.action, data).ran;
      if (!emitted) {
        debugToast(`Unknown action: ${data.action}`);
      }
    });
    eventManager.on('PreGameEvent', function callPreEvent(data) {
      if (finished) return;
      const emit = this.cancelable ? eventManager.cancelable.emit : eventManager.emit;
      const event = emit(`${data.action}:before`, data);
      if (!event.ran) return;
      this.canceled = event.canceled;
    });
    eventManager.on('getVictory getDefeat getResult', function finish() {
      finished = true;
    });
    eventManager.on('getBattleLog', (data) => {
      const log = JSON.parse(data.battleLog);
      const { ran } = eventManager.emit(`Log:${log.battleLogType}`, log);
      if (!ran) {
        debugToast(`Unknown action: Log:${log.battleLogType}`);
      }
    });
  });

  function handle(event) {
    const click = event instanceof MouseEvent;
    [...hotkeys].forEach((v) => {
      const key = click ? event.button : event.key;
      if (click ? v.clickbound(key) : v.keybound(key)) {
        v.run(event);
      }
    });
  }
  eventManager.on(':preload', function always() {
    document.addEventListener('mouseup', (event) => {
      handle(event);
    });
    document.addEventListener('keyup', (event) => {
      if (event.target.tagName === 'INPUT') return;
      handle(event);
    });
  });

  eventManager.on(':preload:leaderboard', () => {
    globalSet('pageName', location.pathname.substr(1));
    globalSet('action', 'ranked');
  });

  onPage('Disconnect', function logout() {
    eventManager.singleton.emit('logout');
  });

  compound(
    'translation:underscript',
    () => eventManager.singleton.emit('underscript:ready'),
  );

  if (typeof Sentry !== 'undefined') {
    init$7();
    eventManager.on('login', login$1);
    eventManager.on('logout', logout);
  }

  eventManager.on(':preload:Play', function hook() {
    if (undefined !== window.bypassQueueEvents) {
      location.href = '/Game';
      return;
    }
    function opened(socket) {
      eventManager.emit('socketOpen', socket);
    }
    globalSet('onOpen', function onOpen(event) {
      this.super(event);
      opened(global('socketQueue'));
    });
    globalSet('onMessage', function onMessage(event) {
      const data = JSON.parse(event.data);
      eventManager.emit(`pre:${data.action}`, data);
      wrap(() => this.super(event));
      eventManager.emit('Play:Message', data);
      eventManager.emit(data.action, data);
    });
    const socketQueue = global('socketQueue', { throws: false });
    if (socketQueue) {
      if (socketQueue.readyState === WebSocket.OPEN) {
        opened(socketQueue);
      }
      socketQueue.onopen = global('onOpen');
      socketQueue.onmessage = global('onMessage');
    }
  });

  onPage('Spectate', () => {
    eventManager.singleton.emit('GameStart');
    eventManager.on(':preload', () => {
      function callGameHooks(data, original) {
        const run = !eventManager.cancelable.emit('PreGameEvent', data).canceled;
        if (run) {
          wrap(() => original(data));
        }
        eventManager.emit('GameEvent', data);
      }
      function hookEvent(event) {
        callGameHooks(event, this.super);
      }
      if (undefined !== window.bypassQueueEvents) {
        globalSet('runEvent', hookEvent);
        globalSet('bypassQueueEvent', hookEvent);
      } else {
        debug(`You're a fool.`);
      }
    });
  });

  const READY = 'translationReady';
  let fallback;
  eventManager.on(':preload', () => {
    if (global(READY, { throws: false })) {
      eventManager.singleton.emit('translation:loaded');
    } else {
      document.addEventListener(READY, () => {
        eventManager.singleton.emit('translation:loaded', fallback);
      }, {
        once: true,
      });
    }
  });
  eventManager.on(':load', () => {
    const translationReady = global(READY, { throws: false });
    if (translationReady !== false || !$?.i18n.messageStore.messages.en) return;
    fallback = true;
    globalSet(READY, true);
    document.dispatchEvent(global('translationEvent'));
  });

  const regex$1 = /\B\/\/ ==UserScript==\r?\n([\S\s]*?)\r?\n\/\/ ==\/UserScript==/;
  function extractMeta(text = '') {
    try {
      const [, rawMeta] = text.match(regex$1);
      const meta = rawMeta ? rawMeta.split(/[\r\n]/) : [];
      if (!Array.isArray(meta)) throw new Error('Invalid meta block');
      return meta.reduce((acc, line) => {
        if (!line) return acc;
        const [key, ...rest] = line.replace(/\/\/ @/, '').trim().split(/\s+/);
        const value = rest.join(' ');
        const current = acc[key];
        if (current === undefined) {
          acc[key] = value;
        } else if (!Array.isArray(current)) {
          acc[key] = [current, value];
        } else {
          current.push(value);
        }
        return acc;
      }, {});
    } catch (err) {
      console.error(err);
      debug(err, 'debugging.extractMeta');
      return null;
    }
  }

  class FileParser {
    #updateURL;
    #downloadURL;
    constructor(updateURL, downloadURL) {
      this.#updateURL = updateURL;
      this.#downloadURL = downloadURL;
    }
    parseData(data) {
      if (
        typeof data === 'string' &&
        data.includes('// ==UserScript==') &&
        data.includes('// ==/UserScript==')
      ) {
        return extractMeta(data);
      }
      return data;
    }
    parseVersion({ version } = {}) {
      return version;
    }
    parseDownload({ downloadURL } = {}) {
      return downloadURL;
    }
    async getUpdateData(url = this.#updateURL) {
      const { data } = await axios.get(url);
      return this.parseData(data);
    }
    async getVersion(data = this.getUpdateData()) {
      const resolvedData = await Promise.resolve(data);
      if (!resolvedData) throw new Error('File not found', this.#updateURL);
      const version = this.parseVersion(resolvedData);
      if (!version || typeof version !== 'string') throw new Error('Version not found');
      return version;
    }
    async getDownload(data) {
      if (this.#downloadURL) return this.#downloadURL;
      const resolvedData = await Promise.resolve(data || this.getUpdateData());
      const downloadURL = this.parseDownload(resolvedData);
      if (!downloadURL || typeof downloadURL !== 'string') throw new Error('URL not found');
      return downloadURL;
    }
  }

  class Gist extends FileParser {
    #filename;
    constructor(updateUrl, downloadUrl) {
      const url = new URL(updateUrl);
      if (url.hostname === 'gist.github.com') {
        const parts = url.pathname.split('/');
        super(
          `https://api.github.com/gists/${parts[2]}`,
          downloadUrl,
        );
        this.#filename = parts.pop();
      } else {
        throw new Error('This parser is for github gists only');
      }
    }
    parseData({ files = {} } = {}) {
      const file = files[this.#filename];
      return super.parseData(file?.content);
    }
  }

  class GithubRaw extends FileParser {
    constructor(updateUrl, downloadUrl) {
      const url = new URL(updateUrl);
      if (url.hostname === 'github.com') {
        url.hostname = 'raw.githubusercontent.com';
      } else if (url.hostname !== 'raw.githubusercontent.com') {
        throw new Error('This parser is for github content only');
      }
      super(`${url}`.replace('/raw/', '/'), downloadUrl);
    }
  }

  class GithubRelease extends FileParser {
    constructor(updateURL = '', downloadURL = undefined) {
      if (updateURL.split('/').length !== 2) {
        throw new Error('GithubRelease parser requires the following format: `owner/repo`');
      }
      super(`https://api.github.com/repos/${updateURL}/releases/latest`, downloadURL);
    }
    parseVersion({ tag_name: version }) {
      return version;
    }
    parseDownload({ assets = [] } = {}) {
      const file = assets.find(({ name = '' }) => name.endsWith('.user.js'));
      return file?.browser_download_url;
    }
  }

  function createParser({
    downloadURL,
    updateURL,
  }) {
    if (!downloadURL && !updateURL) throw new Error('URL not provided');
    const uri = updateURL || downloadURL;
    if (typeof uri !== 'string') throw new Error('URL must be a string');
    const Parser = getParser(uri);
    if (Parser === GithubRelease) {
      if (uri.split('/').length === 2) {
        return new Parser(uri, downloadURL);
      }
      const [, owner, repo] = new URL(uri).pathname.split('/');
      return new Parser(`${owner}/${repo}`, downloadURL);
    }
    return new Parser(uri, downloadURL);
  }
  function getParser(uri = '') {
    if (uri.split('/').length === 2) {
      return GithubRelease;
    }
    const url = new URL(uri);
    if (url.hostname === 'gist.github.com') {
      return Gist;
    }
    if (url.hostname === 'github.com') {
      if (uri.includes('/releases/')) {
        return GithubRelease;
      }
      return GithubRaw;
    }
    if (url.hostname === 'raw.githubusercontent.com') {
      return GithubRaw;
    }
    return FileParser;
  }

  const arrays = new Map();
  const translations = (async () => {
    const response = await fetch(
      'https://raw.githubusercontent.com/UCProjects/UnderScript/refs/heads/master/lang/underscript.json',
      {
        cache: 'default',
      },
    );
    const data = await response.text();
    const text = typeof GM_getResourceText === 'undefined' ?
      data :
      GM_getResourceText('underscript.json') || data;
    return JSON.parse(text, function reviver(key, value) {
      if (Array.isArray(value)) {
        if (!arrays.has(key)) {
          arrays.set(key, value.map(
            (_, i) => new Translation(`${key}.${i + 1}`, { prefix: null }),
          ));
        }
        value.forEach((val, i) => {
          this[`${key}.${i + 1}`] = val;
        });
        return undefined;
      }
      return value;
    });
  })();
  eventManager.on('translation:loaded', async () => {
    await $.i18n().load(await translations);
    eventManager.singleton.emit('translation:underscript');
  });
  function getTranslationArray(key) {
    return clone(arrays.get(key)) ?? [];
  }

  const css$1 = ".updates {\n  --silent: dimgray;\n}\n\n.updates fieldset.silent {\n  border-color: var(--silent);\n}\n\n.updates fieldset {\n  text-align: center;\n}\n\n.updates .modal-body .btn {\n  width: 100%;\n}\n\n.updates .silent legend {\n  color: var(--silent);\n}\n\n.updates .btn-skip {\n  background-color: var(--silent);\n  color: white;\n  display: block;\n  margin-top: 5px;\n}";

  const CHECKING = 'underscript.update.checking';
  const LAST = 'underscript.update.last';
  const PREFIX$1 = 'underscript.pending.';
  let autoTimeout;
  let toast$4;
  style.add(css$1);
  const disabled$4 = register$4({
    name: Translation.Setting('update'),
    key: 'underscript.disable.updates',
    category: Translation.CATEGORY_UPDATES,
  });
  const silent$3 = register$4({
    name: Translation.Setting('update.silent'),
    key: 'underscript.updates.silent',
    category: Translation.CATEGORY_UPDATES,
  });
  const keys$1 = {
    frequency: Translation.Setting('update.frequency.option').key,
    toast: Translation.Toast('updater'),
    button: Translation.OPEN,
    checking: Translation.Toast('update.checking'),
    skip: Translation.General('update.skip'),
    updateNote: Translation.Menu('update.note', 1),
    available: Translation.Toast('update.available', 1),
    title: Translation.General('updates'),
    updateCurrent: Translation.General('update.current', 1),
    updateNew: Translation.General('update.new', 1),
  };
  const frequency = register$4({
    name: Translation.Setting('update.frequency'),
    key: 'underscript.updates.frequency',
    data: () => {
      const tls = getTranslationArray(keys$1.frequency);
      return [0, HOUR, DAY].map((val, i) => (tls ? [
        tls[i],
        val,
      ] : val));
    },
    default: HOUR,
    type: 'select',
    category: Translation.CATEGORY_UPDATES,
    transform(value) {
      return Number(value) || 0;
    },
  });
  const dialog = new DialogHelper();
  const pendingUpdates = new Map();
  function register$3({
    plugin,
    version,
    ...rest
  }) {
    const key = plugin.name || plugin;
    const data = { version, ...rest };
    localStorage.setItem(`${PREFIX$1}${key}`, JSON.stringify(data));
    pendingUpdates.set(key, data);
  }
  function registerPlugin(plugin, data = {}) {
    validate$1(plugin);
    const parser = createParser(data);
    const { version } = plugin;
    let finished = false;
    plugin.events.until(':update', async () => {
      if (finished || !plugin.canUpdate) return finished;
      const info = await parser.getUpdateData();
      const newVersion = await parser.getVersion(info);
      if (finished || !plugin.canUpdate) return finished;
      if (newVersion !== version) {
        const cached = pendingUpdates.get(plugin.name);
        if (cached?.newVersion === newVersion) {
          return false;
        }
        register$3({
          plugin,
          newVersion,
          version,
          url: await parser.getDownload(info),
        });
      } else {
        unregister(plugin);
      }
      return false;
    });
    return () => {
      finished = true;
    };
  }
  function validate$1(plugin) {
    const key = plugin.name || plugin;
    const existing = pendingUpdates.get(key);
    if (existing) {
      const version = key === UNDERSCRIPT ? scriptVersion : plugin.version;
      const isValid = existing.version === undefined || existing.version === version;
      const isNotUpdated = existing.newVersion !== version;
      if (isNotUpdated && isValid) {
        return existing;
      }
      unregister(plugin);
    }
    return false;
  }
  function unregister(plugin) {
    const key = plugin.name || plugin;
    localStorage.removeItem(`${PREFIX$1}${key}`);
    return pendingUpdates.delete(key);
  }
  function notify$3(text, addButton = false) {
    if (toast$4?.exists()) {
      toast$4.setText(`${text}`);
    } else {
      toast$4 = toast$6({
        title: keys$1.toast,
        text,
        className: 'dismissable',
        buttons: addButton ? {
          text: keys$1.button,
          className: 'dismiss',
          css: buttonCSS,
          onclick: open$2,
        } : undefined,
      });
    }
  }
  async function check$1(auto = true) {
    if (sessionStorage.getItem(CHECKING)) return;
    sessionStorage.setItem(CHECKING, true);
    if (autoTimeout) {
      clearTimeout(autoTimeout);
      autoTimeout = 0;
    }
    const previousState = !pendingUpdates.size;
    if (!auto || !disabled$4.value()) {
      await eventManager.async.emit(':update', auto);
    }
    if (!pendingUpdates.size !== previousState) {
      dirty();
    }
    function finish() {
      toast$4?.close();
      eventManager.emit(':update:finished', auto);
    }
    const updateFound = [...pendingUpdates.values()].filter(({ announce = true }) => announce).length;
    if (updateFound) {
      finish();
      notify$3(keys$1.available.withArgs(updateFound), true);
    } else {
      notify$3(keys$1.available.withArgs(0));
      const delay = !auto ? 3000 : 1000;
      sleep(delay).then(finish);
    }
    const timeout = frequency.value() || HOUR;
    autoTimeout = setTimeout(check$1, timeout);
    localStorage.setItem(LAST, Date.now());
    sessionStorage.removeItem(CHECKING);
  }
  function setup$2() {
    const last = Number(localStorage.getItem(LAST));
    const now = Date.now();
    const timeout = last - now + frequency.value();
    if (!last || timeout <= 0) {
      check$1();
    } else {
      autoTimeout = setTimeout(check$1, timeout);
    }
    const updateFound = [...pendingUpdates.values()].filter(({ announce = true }) => announce).length;
    if (updateFound) {
      notify$3(keys$1.available.translate(updateFound), true);
    }
  }
  function open$2() {
    dialog.open({
      title: `${keys$1.title}`,
      cssClass: 'underscript-dialog updates',
      message: build,
    });
  }
  addButton({
    text: Translation.Menu('update'),
    action() {
      check$1(false);
    },
    note() {
      const last = Number(localStorage.getItem(LAST));
      const when = last ? luxon.DateTime.fromMillis(last).toLocaleString(luxon.DateTime.DATETIME_FULL) : 'never';
      return keys$1.updateNote.translate(when);
    },
  });
  addButton({
    text: Translation.Menu('update.pending'),
    action: open$2,
    hidden() {
      return !pendingUpdates.size;
    },
  });
  eventManager.on(':update', (auto) => {
    toast$4?.close();
    if (auto && silent$3.value()) return;
    notify$3(keys$1.checking);
  });
  each(localStorage, (data, key) => wrap(() => {
    if (!key.startsWith(PREFIX$1)) return;
    if (disabled$4.value()) {
      localStorage.removeItem(key);
      return;
    }
    const name = key.substring(key.lastIndexOf('.') + 1);
    pendingUpdates.set(name, JSON.parse(data));
  }, key));
  sessionStorage.removeItem(CHECKING);
  compound('underscript:ready', ':load', setup$2);
  function build() {
    let addedRefresh = false;
    const container = $('<div>');
    function refreshButton() {
      if (addedRefresh) return;
      dialog.prependButton({
        label: `${Translation.General('refresh')}`,
        cssClass: 'btn-success',
        action() {
          location.reload();
        },
      });
      addedRefresh = true;
    }
    function add(data) {
      const {
        announce = true,
        name,
        newVersion,
        url,
        version,
      } = data;
      const isPlugin = name !== UNDERSCRIPT;
      const skip = isPlugin && !announce;
      const wrapper = $('<fieldset>')
        .toggleClass('silent', skip);
      const button = $('<a>')
        .text(keys$1.updateNew.translate(newVersion))
        .attr({
          href: url,
          rel: 'noreferrer',
          target: 'updateUserScript',
        })
        .addClass('btn')
        .toggleClass('btn-success', !skip)
        .toggleClass('btn-skip', skip)
        .on('click auxclick', () => {
          refreshButton();
          button
            .removeClass()
            .addClass('btn btn-primary');
        })
        .prepend(
          $('<span class="glyphicon glyphicon-arrow-up"></span>'),
          ' ',
        );
      const silence = $('<button>')
        .text(keys$1.skip)
        .addClass('btn btn-skip')
        .on('click', () => {
          register$3({
            ...data,
            plugin: name,
            announce: false,
          });
          wrapper.remove();
        });
      container.append(wrapper.append(
        $('<legend>').text(name),
        $('<div>').text(keys$1.updateCurrent.translate(version || Translation.UNKNOWN)),
        button,
        announce && isPlugin && silence,
      ));
    }
    const underscript = pendingUpdates.get(UNDERSCRIPT);
    if (underscript) {
      add({
        ...underscript,
        name: UNDERSCRIPT,
      });
    }
    [...pendingUpdates.entries()].forEach(
      ([name, data]) => {
        if (name === UNDERSCRIPT) return;
        add({
          ...data,
          name,
        });
      },
    );
    return container.children();
  }

  eventManager.on(':preload', () => {
    function unload() {
      eventManager.emit(':unload');
      eventManager.emit(`:unload:${getPageName()}`);
      const chat = window.socketChat;
      if (chat && chat.readyState <= WebSocket.OPEN) chat.close(SOCKET_SCRIPT_CLOSED, 'unload');
    }
    window.onbeforeunload = unload;
  });

  eventManager.on(':preload', () => {
    if (typeof jQuery === 'undefined') return;
    eventManager.singleton.emit('jQuery', jQuery);
  });

  const page = getPageName();
  function loaded$1() {
    if (eventManager.singleton.emit(':loaded').ran) {
      console.warn('`:loaded` event is depricated, please migrate to `:preload`.');
    }
    eventManager.singleton.emit(':preload');
    if (eventManager.singleton.emit(`:loaded:${page}`).ran) {
      console.warn(`\`:loaded:${page}\` event is depricated, please migrate to \`:preload:${page}\``);
    }
    eventManager.singleton.emit(`:preload:${page}`);
  }
  function done() {
    eventManager.singleton.emit(':load');
    eventManager.singleton.emit(`:load:${page}`);
  }
  if (!location.host.includes('feildmaster')) {
    console.log(`UnderScript(v${scriptVersion}): Loaded`);
    if (document.title.includes('Undercards')) {
      register$2();
    }
  }
  function register$2() {
    document.addEventListener('DOMContentLoaded', loaded$1);
    window.addEventListener('load', () => sleep().then(done));
    const COMPLETE = document.readyState === 'complete';
    if (document.readyState === 'interactive' || COMPLETE) {
      loaded$1();
    }
    if (COMPLETE) {
      done();
    }
  }

  eventManager.on(':preload', () => {
    if (onPage('Settings') || onPage('SignUp') || onPage('SignIn')) return;
    const type = 'input[type="text"]';
    [...document.querySelectorAll(type)].forEach((el) => {
      el.dataset.lpignore = true;
    });
    eventManager.on('Chat:getHistory', (data) => {
      document.querySelector(`#${data.room} ${type}`).dataset.lpignore = true;
    });
  });

  class Priority extends Constant {
    static FIRST = new Priority('first', 'top');
    static HIGHEST = new Priority('highest');
    static HIGH = new Priority('high');
    static NORMAL = new Priority('normal');
    static LOW = new Priority('low');
    static LOWEST = new Priority('lowest');
    static LAST = new Priority('last', 'bottom');
    static get(value) {
      if (value instanceof Priority) return value;
      return values.find((v) => v.equals(value));
    }
  }
  const values = Object.values(Priority);
  mod.priority = Object.fromEntries(Object.entries(Priority));

  const constants = mod.constants;
  Object.entries(Item).forEach((([key, value]) => {
    Object.defineProperty(constants, key, {
      get() {
        console.warn(`'underscript.constants.${key}' is deprecated, use 'underscript.items.${key}' instead.`);
        return value;
      },
    });
  }));
  constants.getItem = (value) => Item.find(value);
  constants.isItem = (other) => Item.find(other) !== undefined;
  constants.getPriority = (value) => Priority.find(value);
  constants.isPriority = (other) => Priority.find(other) !== undefined;

  function ignoreUser(name, key, set = false) {
    const setting = register$4({
      key,
      name,
      type: 'remove',
      page: 'Chat',
      category: Translation.CATEGORY_CHAT_IGNORED,
    });
    if (set) {
      setting.set(name);
    }
  }

  const ignorePrefix = 'underscript.ignore.';
  function ignore(user) {
    const name = user.username || user.name;
    const id = user.id || user.idUser;
    if (!name || !id) throw new Error('Invalid user');
    if (isIgnored$1(user)) return;
    const key = `${ignorePrefix}${id}`;
    ignoreUser(name, key, true);
  }
  function unignore(user) {
    const name = user.username || user.name;
    const id = user.id || user.idUser;
    if (!name || !id) throw new Error('Invalid user');
    const key = `${ignorePrefix}${id}`;
    remove$1(key);
  }
  function isIgnored$1(user) {
    const name = user.username || user.name;
    const id = user.id || user.idUser;
    if (!name || !id) throw new Error('Invalid user');
    const key = `${ignorePrefix}${id}`;
    return !!value(key);
  }
  const user$1 = mod.user;
  user$1.ignore = ignore;
  user$1.unIgnore = unignore;
  user$1.isIgnored = isIgnored$1;

  const lib = mod.lib;
  lib.tippy = tippy;
  lib.axios = axios;
  lib.luxon = luxon;
  lib.showdown = showdown;

  class Hotkey {
    constructor(name, func, {
      keys = [],
      clicks = [],
    } = {}) {
      try {
        this.name = name;
        this.fn = func;
        this.keys = [];
        this.clicks = [];
        if (Array.isArray(keys)) {
          keys.forEach((k) => this.bindKey(k));
        } else if (typeof keys === 'string') {
          this.bindKey(keys);
        }
        if (Array.isArray(clicks)) {
          clicks.forEach((c) => this.bindClick(c));
        } else if (clicks) {
          this.bindClick(clicks);
        }
      } catch (_) {
      }
    }
    has(x, a = []) {
      return a.some((v) => v === x);
    }
    del(x, a) {
      a.some((v, i) => {
        if (x === v) {
          a.splice(i, 1);
          return true;
        }
        return false;
      });
    }
    bindKey(x) {
      if (!this.keybound(x)) {
        this.keys.push(x);
      }
      return this;
    }
    unbindKey(x) {
      this.del(x, this.keys);
      return this;
    }
    keybound(x) {
      return this.has(x, this.keys);
    }
    bindClick(x) {
      if (!this.clickbound(x)) {
        this.clicks.push(x);
      }
      return this;
    }
    unbindClick(x) {
      this.del(x, this.clicks);
      return this;
    }
    clickbound(x) {
      return this.has(x, this.clicks);
    }
    run(x, ...rest) {
      if (typeof x === 'function') {
        this.fn = x;
        return this;
      }
      if (typeof this.fn === 'function') {
        return this.fn(x, ...rest);
      }
      return undefined;
    }
    toString() {
      return `${this.name || 'Hotkey'}: Bind{Keys:${JSON.stringify(this.keys)}, Clicks:${JSON.stringify(this.clicks)}}, FN:${this.fn !== null}`;
    }
  }

  const setting$U = register$4({
    key: 'underscript.notification.dismissPrompt',
    hidden: true,
  });
  function requestPermission() {
    if (window.Notification) {
      if (isType()) {
        return Notification.requestPermission();
      }
    }
    return Promise.resolve(false);
  }
  function isType(type = 'default') {
    return window.Notification && Notification.permission === type;
  }
  function notify$2(text, title = 'Undercards') {
    const n = new Notification(title, {
      body: text,
      icon: 'images/favicon.ico',
    });
    sleep(5000).then(() => n.close());
  }
  if (isType() && !setting$U.value()) {
    compound(':load:Play', 'underscript.ready', () => show$1());
  }
  function show$1() {
    const buttons = [{
      css: buttonCSS,
      text: Translation.Toast('game.request'),
      className: 'dismiss',
      onclick() {
        requestPermission().then((result) => {
          const key = result === 'granted' ? 'allowed' : 'denied';
          toast$6(Translation.Toast(`game.request.${key}`));
        });
      },
    }, {
      css: buttonCSS,
      text: Translation.DISMISS,
      className: 'dismiss',
      onclick() {
        setting$U.set(true);
      },
    }];
    toast$6({
      buttons,
      text: Translation.Toast('game.request.message'),
      className: 'dismissable',
    });
  }

  function shuffle(array = []) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const some = (o, f, t) => o && Object.keys(o).some((x) => f.call(t, o[x], x, o));

  const rand = (max, min = 0, inclusive = false) => Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0))) + min;

  const utils = mod.utils;
  utils.each = each;
  utils.eventEmitter = eventEmitter;
  utils.sleep = sleep;
  utils.global = global;
  utils.globalSet = globalSet;
  utils.Hotkey = Hotkey;
  utils.hover = {
    hide: hide$1,
    show: show$2,
    tip,
    new: (...args) => {
      console.error('Deprecation warning: Use `tip` instead!');
      return tip(...args);
    },
  };
  utils.notify = notify$2;
  utils.shuffle = shuffle;
  utils.some = some;
  utils.tabManager = TabManager;
  utils.translateText = translateText;
  utils.VarStore = VarStore;
  utils.rand = rand;
  utils.SettingType = SettingType;

  let selfData;
  function self$1() {
    if (!selfData) {
      selfData = Object.freeze({
        id: global('selfId'),
        username: global('selfUsername'),
        mainGroup: global('selfMainGroup'),
      });
    }
    return selfData;
  }
  function name$1(user) {
    return user.username;
  }
  function isMod(user) {
    return isPriority(user, 4);
  }
  function isStaff(user) {
    return isPriority(user, 6);
  }
  function isPriority(user, priority) {
    if (typeof user?.mainGroup?.priority !== 'number') throw new Error('Invalid user');
    return user.mainGroup.priority <= priority;
  }
  function getCollection() {
    return getDeckConfig().then(({ collection: data }) => parse$1(data));
  }
  function getDecks() {
    return getDeckConfig().then(({ decks: data }) => parse$1(data))
      .then((decks) => decks.reduce((val, { soul: { name: soul }, cardsList: cards, artifacts }) => {
        val[soul] = { artifacts, cards };
        return val;
      }, {}));
  }
  function getArtifacts() {
    return getDeckConfig().then(({ artifacts: data }) => parse$1(data));
  }
  function getAllArtifacts() {
    return getDeckConfig().then(({ allArtifacts: data = [] }) => parse$1(data));
  }
  function getDeckConfig() {
    return new Promise((res) => {
      eventManager.on('Deck:Loaded', (data) => res(data));
      sleep(500).then(() => res());
    }).then((res) => {
      if (res) return res;
      return axios.get('DecksConfig').then(({ data }) => {
        eventManager.singleton.emit('Deck:Loaded', data);
        return data;
      });
    });
  }
  function parse$1(data) {
    return typeof data === 'string' ? JSON.parse(data) : data;
  }
  function getUCP() {
    return axios.get(`CardSkinsConfig?action=profile&time=${Date.now()}`)
      .then(({ data: { ucp = 0 } }) => ucp);
  }
  function getCardSkins() {
    return axios.get('CardSkinsConfig?action=profile')
      .then(({ data: { cardSkins = '' } }) => JSON.parse(cardSkins));
  }
  const user = mod.user;
  user.isMod = isMod;
  user.isStaff = isStaff;
  user.getCollection = getCollection;
  user.getDecks = getDecks;
  user.getArtifacts = getArtifacts;
  user.getAllArtifacts = getAllArtifacts;
  user.getUCP = getUCP;
  user.getCardSkins = getCardSkins;

  const setting$T = register$4({
    name: Translation.Setting('autocomplete.friends'),
    key: 'underscript.autocomplete.friends.online',
    page: 'Chat',
  });
  eventManager.on('@autocomplete', ({ list }) => {
    list.splice(0, 0, ...global('selfFriends')
      .filter(({ online }) => !setting$T.value() || online)
      .map(name$1)
      .filter((name) => !list.includes(name)));
  });

  const setting$S = register$4({
    name: Translation.Setting('autocomplete'),
    key: 'underscript.autocomplete',
    default: true,
    page: 'Chat',
  });
  let current = false;
  const lists = {};
  style.add(
    `
  .autobox {
    position: absolute;
    border: 1px solid #D4D4D4;
    border-bottom: none;
    border-top: none;
    bottom: 100%;
    left: 0;
    right: 0;
  }
  .autobox div {
    padding: 10px;
    cursor: pointer;
    background-color: rgba(0, 0, 0, 90%);
    border-top: 1px solid #D4D4D4;
    border-bottom: 1px solid #D4D4D4;
  }
  .autobox div:hover {
    background-color: #666;
  }
  div.autobox-active {
    background-color: #333;
    color: #FFF;
  }
  `,
  );
  function autocomplete(input, room) {
    const list = lists[room];
    let el;
    function listener(event) {
      let el2;
      const { text, replace } = getWord(this);
      closeList();
      if (text === undefined) return;
      debug(`"${text}"`);
      el = document.createElement('div');
      el.setAttribute('id', 'autobox');
      el.setAttribute('class', 'autobox');
      this.parentNode.appendChild(el);
      let x = 0;
      const localList = [...list];
      eventManager.emit('@autocomplete', {
        list: localList,
      });
      const listLength = localList.length;
      for (let i = 1; i <= listLength && x < 5; i++) {
        const item = localList[listLength - i];
        if (item.substr(0, text.length).toUpperCase() !== text.toUpperCase()) continue;
        x += 1;
        el2 = document.createElement('div');
        el2.innerHTML = `<strong>${item.substr(0, text.length)}</strong>${item.substr(text.length)}`;
        el2.addEventListener('click', (e) => {
          replace(item);
          closeList();
        });
        el.appendChild(el2);
      }
      if (x === 0) return;
      current = 0;
      addActive(el.getElementsByTagName('div'));
    }
    input.addEventListener('input', listener);
    input.addEventListener('focus', listener);
    input.addEventListener('keydown', (e) => {
      if (e.which === 39) return;
      if (current === false) return;
      const x = el.getElementsByTagName('div');
      if (!x.length) return;
      let active = true;
      switch (e.which) {
        case 40:
          current += 1;
          break;
        case 38:
          current -= 1;
          break;
        case 13:
        case 9:
          x[current].click();
          active = false;
          break;
        case 37:
          return;
        case 27:
          closeList();
        default: return;
      }
      if (active) addActive(x);
      e.preventDefault();
    });
    function addActive(x) {
      if (!x) return;
      removeActive(x);
      if (current >= x.length) current = 0;
      if (current < 0) current = (x.length - 1);
      x[current].classList.add('autobox-active');
    }
    function removeActive(x) {
      for (let i = 0; i < x.length; i++) {
        x[i].classList.remove('autobox-active');
      }
    }
    function closeList() {
      current = false;
      if (!el) return;
      el.parentNode.removeChild(el);
      el = undefined;
    }
  }
  const boundaries = ['', ' '];
  function getWord(input) {
    const text = input.value;
    let start = -1;
    let end = 0;
    if (text.includes('@')) {
      let x = text.indexOf(' ');
      if (x === -1) {
        if (text.startsWith('@')) {
          start = 1;
          end = text.length;
        }
      }
      if (start === -1) {
        const cursor = input.selectionStart;
        if (boundaries.includes(text.substring(cursor, cursor + 1))) {
          let str = text.substring(0, cursor);
          x = str.lastIndexOf('@');
          if (x > -1) {
            if (x === 0 || boundaries.includes(str[x - 1])) {
              str = str.substr(x + 1);
              if (!str.length || str[0] !== ' ' && str.indexOf(' ') === str.lastIndexOf(' ')) {
                start = x + 1;
                end = cursor;
              }
            }
          }
        }
      }
    }
    if (start === -1) return {};
    function replace(str) {
      input.value = `${text.substring(0, start)}${str} ${text.substring(end)}`;
      input.selectionStart = start + str.length + 1;
      input.selectionEnd = input.selectionStart;
      input.focus();
    }
    return {
      replace,
      text: text.substring(start, end),
    };
  }
  function add(name, list) {
    if (!list || name === global('selfUsername')) return;
    const slot = list.indexOf(name);
    if (slot > -1) list.splice(slot, 1);
    list.push(name);
  }
  eventManager.on('Chat:getHistory', ({ room, history }) => {
    if (lists[room] === undefined) {
      lists[room] = [];
    }
    const list = lists[room];
    JSON.parse(history).forEach(({ user }) => add(name$1(user), list));
    autocomplete($(`#${room} input.chat-text`)[0], room);
  });
  eventManager.on('Chat:getMessage', ({ room, chatMessage }) => {
    add(name$1(JSON.parse(chatMessage).user), lists[room]);
  });
  eventManager.on('ChatDetected', () => {
    globalSet('autoComplete', function autoComplete(...args) {
      if (setting$S.value()) return;
      this.super(...args);
    }, {
      throws: false,
    });
  });

  const setting$R = register$4({
    name: Translation.Setting('broadcast'),
    key: 'underscript.disable.broadcast',
    page: 'Chat',
  });
  eventManager.on('Chat:getMessageBroadcast', function broadcast({ message }) {
    if (setting$R.value()) return;
    infoToast({
      title: Translation.Toast('broadcast'),
      text: `<span style="color: #ff00ff;">${message}</span>`,
      footer: 'info-chan via UnderScript',
    });
  });

  eventManager.on('Chat:Disconnected', () => {
    $('.chat-box').each((i, e) => {
      global('scroll')($(e), true);
    });
  });

  function decode(string) {
    return $('<textarea>').html(string).val();
  }

  const setting$Q = register$4({
    name: Translation.Setting('chat.rightclick'),
    key: 'underscript.disable.chatContext',
    page: 'Chat',
  });
  style.add(`
  .chatContext {
    background-color: #F4F4F4;
    margin: 10px;
    color: #333;
    border: 1px dashed #000;
    position: absolute;
    z-index: 20;
    text-align: center;
    border-radius: 10px;
  }
  .chatContext header {
    padding: 0 5px;
    height: auto;
  }
  /* TODO: Why is this !important? */
  .chatContext select {
    background-color: transparent !important;
  }
  .chatContext li {
    list-style: none;
    margin: 0;
    padding: 3px;
    border-top: 1px solid #CCC;
    cursor: pointer;
  }
  .chatContext .disabled {
    background-color: #CCC;
    cursor: not-allowed;
  }
  .chatContext li:not(.disabled):hover {
    background-color: #036;
    color: #F2F2F2;
  }
  .chatContext > :last-child {
    border-radius: 0 0 10px 10px;
  }
`);
  let toast$3;
  eventManager.on('jQuery', () => {
    const ignorePrefix = 'underscript.ignore.';
    const context = (() => {
      const container = $('<div class="chatContext">');
      const profile = $('<li>Profile</li>');
      const message = $('<li>Message</li>');
      const ignore = $('<li>Ignore</li>');
      const mention = $('<li>Mention</li>');
      const mute = $('<li>Mute</li>');
      const muteTime = $('<select>');
      const header = $('<header>');
      eventManager.on('underscript:ready', () => {
        each({
          profile,
          message,
          ignore,
          mention,
          mute,
        }, (value, key) => {
          value.text(Translation.General(key));
        });
      });
      container.append(header, profile, mention, ignore).hide();
      $('body').append(container);
      const times = {
        1: '1s',
        60: '1m',
        600: '10m',
        3600: '1h',
        21600: '6h',
        43200: '12h',
        86400: '1d',
      };
      each(times, (item, key) => {
        muteTime.append($(`<option value="${key}"${key === '3600' ? ' selected' : ''}>${item}</option>`));
      });
      mute.append(' ', muteTime);
      function open(event) {
        if (event.ctrlKey || setting$Q.value()) return;
        if (toast$3) {
          toast$3.close('opened');
        }
        if (value('underscript.disable.ignorechat')) {
          ignore.detach();
        } else {
          mention.after(ignore);
        }
        close();
        const { id, name, staff, mod } = event.data;
        const selfId = global('selfId');
        const selfMod = selfId !== id && global('selfMainGroup').priority <= 4;
        if (selfMod || global('isFriend')(id)) {
          profile.before(message);
        } else {
          message.detach();
        }
        event.preventDefault();
        if (selfMod) {
          container.append(mute);
        }
        header.html(name);
        let left = event.pageX;
        const containerWidth = container.outerWidth(true);
        if (left + containerWidth > window.innerWidth) {
          left -= containerWidth;
        }
        container.css({
          top: `${event.pageY}px`,
          left: `${left}px`,
        });
        container.show();
        const disabled = staff || id === selfId;
        const muteDisabled = mod || id === selfId;
        container.on('click.script.chatContext', 'li', (e) => {
          if (!$(e.target).is('li')) {
            return;
          }
          if (e.target === profile[0]) {
            global('getInfo')(event.target);
          } else if (e.target === mention[0]) {
            const input = $(event.target).closest('.chat-box').find('.chat-text');
            let text = input.val();
            if (text.length !== 0 && text[text.length - 1] !== ' ') {
              text += ' ';
            }
            text += `@${decode(name)} `;
            input.val(text).focus();
          } else if (e.target === ignore[0]) {
            if (disabled) return;
            const key = `${ignorePrefix}${id}`;
            if (!value(key)) {
              toast$6({
                text: Translation.IGNORED.translate(name),
                css: {
                  'background-color': 'rgba(208, 0, 0, 0.6)',
                },
                buttons: [{
                  css: buttonCSS,
                  text: Translation.UNDO,
                  className: 'dismiss',
                  onclick: () => {
                    remove$1(key);
                    updateIgnoreText(id);
                  },
                }],
                className: 'dismissable',
              });
              ignoreUser(name, key, true);
            } else {
              remove$1(key);
            }
            updateIgnoreText(id);
          } else if (e.target === mute[0]) {
            if (muteDisabled) return;
            global('timeout')(`${id}`, muteTime.val());
          } else if (e.target === message[0]) {
            global('openPrivateRoom')(id, name);
          }
          close();
        });
        if (disabled) {
          ignore.addClass('disabled');
        } else {
          ignore.removeClass('disabled');
        }
        if (muteDisabled) {
          mute.addClass('disabled');
          muteTime.prop('disabled', true);
        } else {
          mute.removeClass('disabled');
          muteTime.prop('disabled', false);
        }
        updateIgnoreText(id);
        $('html').on('mousedown.chatContext', (e) => {
          if ($(e.target).closest('.chatContext').length === 0) {
            close();
          }
        });
      }
      function updateIgnoreText(id) {
        if (value(`${ignorePrefix}${id}`)) {
          ignore.text(Translation.General('unignore'));
        } else {
          ignore.text(Translation.General('ignore'));
        }
      }
      function close() {
        container.hide();
        container.off('.chatContext');
        $('html').off('chatContext');
      }
      return {
        open,
        close,
      };
    })();
    function processMessage(message, room) {
      const id = message.id;
      const user = message.user;
      let info = $(`#${room} #message-${id} #info-${user.id}`);
      if (!info.length) {
        info = $(`#${room} #message-${id} #info-${id}`);
      }
      info.on('contextmenu.script.chatContext', {
        name: name$1(user),
        staff: user.mainGroup.priority <= 6,
        mod: user.mainGroup.priority <= 4,
        id: user.id,
      }, context.open);
    }
    eventManager.on('Chat:getHistory', (data) => {
      JSON.parse(data.history).forEach((message) => {
        processMessage(message, data.room);
      });
    });
    eventManager.on('Chat:getMessage', function parse(data) {
      if (this.canceled) return;
      processMessage(JSON.parse(data.chatMessage), data.room);
    });
  });
  eventManager.on('ChatDetected', () => {
    toast$3 = infoToast({
      text: Translation.Toast('ignore.info'),
      onClose: (reason) => {
        toast$3 = null;
      },
    }, 'underscript.ignoreNotice', '1');
  });

  const setting$P = register$4({
    name: Translation.Setting('large.avatar'),
    key: 'underscript.chat.largeIcons',
    default: true,
    page: 'Chat',
    onChange: update$3,
  });
  const styles$1 = style.add();
  function update$3() {
    if (styles$1) {
      styles$1.remove();
    }
    if (setting$P.value()) {
      styles$1.append(
        '.message-group { clear: both; }',
        '.chat-messages .avatarGroup { float: left; padding-right: 10px; }',
        '.chat-messages li .avatar, .chat-messages li .rainbowAvatar { height: 45px; }',
        '.chat-message { display: block; }',
      );
    }
  }
  eventManager.on('ChatDetected', () => {
    update$3();
    const value = setting$P.value();
    const buttons = {
      text: value ? 'Revert it!' : 'Enable it!',
      className: 'dismiss',
      css: buttonCSS,
      onclick: (e) => {
        setting$P.set(!value);
      },
    };
    infoToast({
      text: `There's a new Large Icon mode setting for chat`,
      className: 'dismissable',
      buttons,
    }, 'underscript.notice.largeIcons', '1');
  });

  const baseSetting = {
    key: 'underscript.emotes.disable',
    page: 'Chat',
    category: Translation.Setting('category.chat.emotes'),
  };
  const originalEmotes = [{
    id: 0,
    image: '',
    name: '',
    ucpCost: 0,
    code: '::',
  }];
  originalEmotes.shift();
  function init$4() {
    originalEmotes.push(...global('chatEmotes'));
    makeSettings();
    updateEmotes();
  }
  const EmojiName = Translation.Setting('emote.disable', 1);
  function makeSettings() {
    originalEmotes.forEach((emote) => {
      const setting = {
        ...baseSetting,
        name: `<img height="32px" src="images/emotes/${emote.image}.png"/> ${EmojiName.translate(emote.name)}`,
        onChange: updateEmotes,
      };
      setting.key += `.${emote.id}`;
      register$4(setting);
    });
  }
  function updateEmotes() {
    if (!originalEmotes.length) return;
    const filtered = originalEmotes.filter(({ id }) => !value(`${baseSetting.key}.${id}`));
    globalSet('chatEmotes', filtered);
    globalSet('gameEmotes', filtered, {
      throws: false,
    });
  }
  compound('Chat:Connected', 'underscript:ready', init$4);
  eventManager.on('connect', updateEmotes);

  const pendingIgnore = VarStore();

  const setting$O = register$4({
    name: Translation.Setting('ignore'),
    key: 'underscript.disable.ignorechat',
    page: 'Chat',
    category: Translation.CATEGORY_CHAT_IGNORED,
  });
  const how = register$4({
    name: Translation.Setting('ignore.how'),
    key: 'underscript.ignorechat.how',
    type: 'select',
    options: [
      [Translation.Setting('ignore.option.1'), 'remove'],
      [Translation.Setting('ignore.option.2'), 'hide'],
      [Translation.Setting('ignore.option.3'), 'none'],
    ],
    page: 'Chat',
    category: Translation.CATEGORY_CHAT_IGNORED,
  });
  function shouldIgnore(message, self = false) {
    if (setting$O.value()) return false;
    const user = message.user;
    const id = user.id;
    if (id === global('selfId')) return self;
    if (isMod(user)) return false;
    return !!value(`underscript.ignore.${id}`);
  }
  let count;
  function processMessage$1(message, room, history = false) {
    debug(message, 'debugging.chat.message');
    if (!shouldIgnore(message) || global('isFriend')(message.user.id)) {
      $(`#${room}`).removeData('container');
      return;
    }
    const msg = $(`#${room} #message-${message.id}`);
    const type = how.value();
    if (type === 'hide') {
      if (!history) {
        pendingIgnore.set(true);
        return;
      }
      msg.find(`.chat-message`)
        .html(`<span class="gray">${Translation.General('message.hidden')}</span>`)
        .removeClass().addClass('chat-message');
    } else if (type === 'remove') {
      debug(`removed ${name$1(message.user)}`, 'debugging.chat');
      let container = $(`#${room}`).data('container');
      if (!container) {
        count = 1;
        container = $('<li class="ignored-chat">');
        if (history) {
          msg.after(container);
          msg.remove();
        } else {
          const messages = $(`#${room} .chat-messages`);
          messages.append(container);
          global('scroll')($(`#${room}`), true);
        }
        $(`#${room}`).data('container', container);
      } else if (history) {
        msg.remove();
      }
      container.text(Translation.General('message.removed').translate(count));
      count += 1;
      return true;
    } else if (type === 'none') {
      if (history) msg.remove();
      else return true;
    }
  }
  eventManager.on('Chat:getHistory', (data) => {
    JSON.parse(data.history).forEach((message) => {
      processMessage$1(message, data.room, true);
    });
  });
  eventManager.on('preChat:getMessage', function preProcess(data) {
    if (this.canceled) return;
    this.canceled = processMessage$1(JSON.parse(data.chatMessage), data.room);
  });
  eventManager.on('Chat:getMessage', function hideMessage(data) {
    if (how.value() !== 'hide') return;
    const message = JSON.parse(data.chatMessage);
    if (!shouldIgnore(message) || global('isFriend')(message.user.id)) return;
    $(`#${data.room} #message-${message.id} .chat-message`)
      .html(`<span class="gray">${Translation.General('message.hidden')}</span>`)
      .removeClass().addClass('chat-message');
  });

  const isFriend = (name) => global('selfFriends', { throws: false })?.some((friend) => name$1(friend) === name) ?? false;

  const category$4 = Translation.Setting('category.announce.user');
  const setting$N = register$4({
    name: Translation.Setting('announce'),
    key: 'underscript.announcement.legend',
    options: ['Chat', 'Toast', 'Both', 'Hidden'],
    default: 'Toast',
    type: 'select',
    page: 'Chat',
    category: category$4,
  });
  const ignoreSelf$1 = register$4({
    name: Translation.Setting('announce.notSelf'),
    key: 'underscript.announcement.legend.notSelf',
    page: 'Chat',
    category: category$4,
    default: true,
  });
  const friends$2 = register$4({
    name: Translation.Setting('announce.friendsOnly'),
    key: 'underscript.announcement.legend.friendsOnly',
    page: 'Chat',
    category: category$4,
  });
  const events$2 = ['chat-new-legend'];
  eventManager.on('preChat:getMessageAuto', function legend(data) {
    const [type, user] = JSON.parse(JSON.parse(data.message).args);
    if (this.canceled || !events$2.includes(type)) return;
    if (ignoreSelf$1.value() && name$1(self$1()) === user) {
      this.canceled = true;
      return;
    }
    const handling = setting$N.value();
    const friendsOnly = friends$2.value();
    if (handling === 'Chat' && !friendsOnly) return;
    const hidden = handling === 'Hidden';
    this.canceled = hidden || handling === 'Toast';
    if (hidden) return;
    if (friendsOnly && !isFriend(user)) {
      this.canceled = true;
      return;
    }
    toast$6({
      text: global('translateFromServerJson')(data.message),
      css: {
        color: 'yellow',
        footer: { color: 'white' },
      },
    });
  });

  const category$3 = Translation.Setting('category.announce.draw');
  const setting$M = register$4({
    name: Translation.Setting('announce'),
    key: 'underscript.announcement.draws',
    type: 'select',
    options: ['chat', 'toast', 'both', 'hidden'],
    default: 'toast',
    page: 'Chat',
    category: category$3,
  });
  const ignoreSelf = register$4({
    name: Translation.Setting('announce.notSelf'),
    key: 'underscript.announcement.draws.notSelf',
    page: 'Chat',
    category: category$3,
    default: true,
  });
  const toasts$3 = [];
  let toastIndex = 0;
  function getToast(user) {
    const now = Date.now();
    return toasts$3.find(({ exists, owner, time }) => exists() && owner === user && time + 1000 > now);
  }
  const events$1 = ['chat-legendary-notification', 'chat-legendary-shiny-notification'];
  eventManager.on('preChat:getMessageAuto', function drawAnnouncement(data) {
    const [event, user, card] = JSON.parse(JSON.parse(data.message).args);
    if (this.canceled || !events$1.includes(event)) return;
    if (ignoreSelf.value() && name$1(self$1()) === user) {
      this.canceled = true;
      return;
    }
    const type = setting$M.value();
    if (type === 'chat') return;
    const both = type === 'both';
    this.canceled = !both;
    if (both || type === 'toast') {
      const translateFromServerJson = global('translateFromServerJson');
      const last = getToast(user);
      if (last) {
        last.cards.unshift(card);
        const newText = last.cards.join(', ');
        last.setText(translateFromServerJson(JSON.stringify({ args: JSON.stringify([event, user, newText]) })));
        last.time = Date.now();
        return;
      }
      if (toasts$3[toastIndex]) {
        toasts$3[toastIndex].close();
      }
      const toast = toast$6({
        text: translateFromServerJson(data.message),
        css: {
          color: 'yellow',
          footer: {
            color: 'white',
          },
        },
      });
      toast.cards = [card];
      toast.owner = user;
      toast.time = Date.now();
      toasts$3[toastIndex] = toast;
      toastIndex = (toastIndex + 1) % 3;
    }
  });

  const setting$L = register$4({
    name: Translation.Setting('links'),
    key: 'underscript.disable.linkify',
    page: 'Chat',
  });
  eventManager.on('ChatDetected', () => {
    const regex = /\b((?:https?:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))/gi;
    globalSet('linkify', function linkify(text) {
      if (setting$L.value()) {
        return this.super(text);
      }
      return text.replace(regex, (i, $1) => {
        const link = migrate(`${$1.substr(0, 4) !== 'http' ? 'http://' : ''}${$1}`);
        return `<a href="${link}" target="_blank" rel="noopener" onclick="return link('${link}') || false;">${$1}</a>`;
      });
    });
  });
  function migrate(link) {
    const goto = new URL(link);
    if (goto.hostname.endsWith('undercards.net')) {
      const host = location.hostname;
      if (goto.hostname !== host) {
        goto.hostname = host;
      }
    }
    return goto.toString();
  }

  eventManager.on('Chat:getHistory', (data) => {
    $(`#${data.room} input[type="text"]`)
      .on('focusin.script', () => {
        eventManager.emit('Chat:focused', data);
      })
      .on('focusout.script', () => {
        eventManager.emit('Chat:unfocused', data);
      });
  });

  eventManager.on('ChatDetected', function override() {
    globalSet('scroll', function scroll(room, force = false) {
      if (!force) return this.super(room);
      const container = room.find(`.chat-messages`);
      container.scrollTop(container.prop('scrollHeight'));
    });
  });
  function scrollToBottom(room) {
    global('scroll')($(`#${room}`), true);
  }
  eventManager.on('Chat:getHistory', ({ room }) => scrollToBottom(room));
  let force = false;
  eventManager.on('preChat:getMessage', function preProcess({ room }) {
    if (this.canceled) return;
    const container = $(`#${room} .chat-messages`);
    force = container.scrollTop() + 100 > container.prop('scrollHeight') - container.height();
  });
  eventManager.on('Chat:getMessage', ({ room }) => force && scrollToBottom(room));

  const tag$1 = register$4({
    name: 'Highlight <span class="friend">friends</span> in chat',
    key: 'underscript.tag.friend',
    default: true,
    page: 'Chat',
  });
  const color = register$4({
    name: 'Friend color',
    key: 'underscript.tag.friend.color',
    type: 'color',
    default: '#b1bfbe',
    page: 'Chat',
    onChange: setColor,
    reset: true,
  });
  setColor(color.value());
  let toast$2;
  function processMessage(message, room) {
    if (!tag$1.value()) return;
    if (global('isFriend')(message.user.id)) {
      if (!toast$2) {
        toast$2 = infoToast('<span class="friend">Friends</span> are now highlighted in chat.', 'underscript.notice.highlighting', '1');
      }
      $(`#${room} #message-${message.id} .chat-user`).addClass('friend');
      if (message.me) {
        $(`#${room} #message-${message.id} .chat-message`).addClass('friend');
      }
    }
  }
  eventManager.on('Chat:getHistory', (data) => {
    JSON.parse(data.history).forEach((message) => {
      processMessage(message, data.room);
    });
  });
  eventManager.on('Chat:getMessage', function tagFriends(data) {
    processMessage(JSON.parse(data.chatMessage), data.room);
  });
  function setColor(newColor) {
    style.add(`.friend { color: ${newColor} !important; }`);
  }

  const filter = /(\||\\|\(|\)|\*|\+|\?|\.|\^|\$|\[|\{|\})/g;
  const atReplace = 'atSign<@>';
  class AtSafeRegExp extends RegExp {
    test(string) {
      return super.test(string.replace('@', atReplace));
    }
    replace(text, mask) {
      return text.replace('@', atReplace).replace(this, mask).replace(atReplace, '@');
    }
  }
  function filterMeta(text) {
    return text.replace(filter, '\\$1').replace('@', atReplace);
  }
  function pingRegex() {
    const extras = value('underscript.ping.extras');
    if (!extras.length) {
      return {
        test() {
          return false;
        },
      };
    }
    const exp = `\\b((?:${extras.map(filterMeta).join(')|(?:')}))(?!.*">)\\b`;
    return new AtSafeRegExp(exp, 'gi');
  }

  const category$2 = Translation.Setting('category.chat.ping');
  const setting$K = register$4({
    name: Translation.Setting('ping.toast'),
    key: 'underscript.enable.pingToast',
    default: true,
    category: category$2,
    page: 'Chat',
  });
  const globalPing = register$4({
    name: Translation.Setting('ping.toast'),
    key: 'underscript.enable.ping.global',
    category: category$2,
    page: 'Chat',
  });
  const pingExtras = register$4({
    name: Translation.Setting('ping.on'),
    key: 'underscript.ping.extras',
    type: 'array',
    default: ['@underscript'],
    category: category$2,
    page: 'Chat',
  });
  eventManager.on('Chat:getMessage', function pingToast(data) {
    if (this.canceled || !setting$K.value()) return;
    if (globalPing.value() && !data.open) return;
    const msg = JSON.parse(data.chatMessage);
    if (shouldIgnore(msg, true)) return;
    if (!msg.message.toLowerCase().includes(`@${global('selfUsername').toLowerCase()}`) && !pingRegex().test(msg.message)) return;
    const avatar = !value('chatAvatarsDisabled') ? `<img src="/images/avatars/${msg.user.avatar.image}.${msg.user.avatar.extension || 'png'}" class="avatar ${msg.user.avatar.rarity}" height="35" style="float: left; margin-right: 7px;">` : '';
    const chatNames = global('chatNames');
    toast$6({
      title: `${avatar}${name$1(msg.user)} (${chatNames[data.idRoom - 1] ? $.i18n(chatNames[data.idRoom - 1]) : data.idRoom || 'UNKNOWN'})`,
      text: msg.message,
    });
  });

  style.add('.highlight { color: yellow; }');
  const setting$J = register$4({
    name: Translation.Setting('ping'),
    key: 'underscript.disable.ping',
    page: 'Chat',
  });
  const mask = '<span class="highlight">$1</span>';
  let disabled$3 = false;
  let notified = false;
  eventManager.on('preChat:getHistory Chat:getHistory', function enable(data) {
    if (disabled$3 || global('soundsEnabled')) {
      if (disabled$3 !== 'history') {
        globalSet('soundsEnabled', this.event === 'Chat:getHistory');
      }
      disabled$3 = !disabled$3;
    } else {
      disabled$3 = 'history';
    }
  });
  eventManager.on('ChatDetected', () => {
    globalSet('notif', function newNotify(original) {
      if (!setting$J.value() && !pendingIgnore.get()) {
        const text = this.super(original);
        const regex = pingRegex();
        if (regex.test(text)) {
          if (global('soundsEnabled') && original === text) {
            (new Audio('sounds/highlight.wav')).play();
          }
          notify$1();
          return regex.replace(text, mask);
        }
        return text;
      }
      return original;
    });
  });
  function notify$1() {
    if (disabled$3 || notified) return;
    notified = true;
    if (!pingExtras.value().includes('@underscript')) return;
    infoToast({
      text: Translation.Toast('ping'),
      buttons: [{
        text: Translation.Toast('ping.settings'),
        className: 'dismiss',
        onclick() {
          pingExtras.show(true);
        },
      }, {
        text: Translation.Toast('ping.remove'),
        className: 'dismiss',
        onclick() {
          const words = pingExtras.value();
          pingExtras.set(words.filter((word) => word !== '@underscript'));
        },
      }, {
        text: Translation.DISMISS,
        className: 'dismiss',
      }],
      className: 'dismissable',
      css: {
        button: {
          ...buttonCSS,
          'white-space': 'normal',
        },
      },
    }, 'underscript.alert.ping');
  }

  eventManager.on('Chat:getMessage', (data) => {
    if (!data.idRoom) return;
    const history = global('publicChats')[data.idRoom];
    if (Array.isArray(history) && history.length > 50) {
      history.splice(0, history.length - 50);
    }
  });

  const base$1 = {
    key: 'underscript.safelink.',
    page: 'Chat',
    category: Translation.Setting('category.chat.links'),
  };
  const setting$I = register$4({
    ...base$1,
    name: Translation.Setting('safelink'),
    default: true,
    key: 'underscript.enabled.safelink',
  });
  const safeLinks = new Set();
  const cache$1 = VarStore(false);
  each(localStorage, (host, key) => {
    if (!key.startsWith(base$1.key)) return;
    register$1(host);
  });
  function register$1(host) {
    const s = register$4({
      ...base$1,
      name: host,
      key: `${base$1.key}${host}`,
      type: 'remove',
    });
    if (s) {
      s.set(host);
      safeLinks.add(host);
    }
  }
  const TrustDomain = Translation.Setting('safelink.trust', 1);
  eventManager.on('BootstrapDialog:show', (dialog) => {
    if (dialog.getTitle() !== 'Leaving Warning' || !setting$I.value()) return;
    const host = cache$1.value;
    const after = dialog.options.buttons[0];
    dialog.options.buttons.unshift({
      label: TrustDomain.translate(host),
      cssClass: 'btn-danger',
      action(ref) {
        register$1(host);
        after.action(ref);
      },
    });
    dialog.updateButtons();
  });
  eventManager.on('ChatDetected', () => {
    safeLinks.add(location.hostname);
    globalSet('link', function link(l) {
      const url = new URL(l).hostname;
      if (setting$I.value() && safeLinks.has(url)) return true;
      cache$1.value = url;
      return this.super(l);
    });
  });

  const category$1 = Translation.Setting('category.announce.winstreak');
  const setting$H = register$4({
    name: Translation.Setting('announce'),
    key: 'underscript.winstreak',
    options: ['Chat', 'Toast', 'Both', 'Hidden'],
    default: 'Both',
    type: 'select',
    page: 'Chat',
    category: category$1,
  });
  const friends$1 = register$4({
    name: Translation.Setting('announce.friendsOnly'),
    key: 'underscript.winstreak.friendsOnly',
    page: 'Chat',
    category: category$1,
  });
  const toasts$2 = {
    v: [],
    i: 0,
    add(toast) {
      this.v[this.i]?.close();
      this.v[this.i] = toast;
      this.i = (this.i + 1) % 3;
      return toast;
    },
  };
  function checkFriend(name) {
    return !friends$1.value() || isFriend(name);
  }
  function checkCount(amt) {
    return true;
  }
  const events = ['chat-user-ws', 'chat-user-ws-stop'];
  eventManager.on('preChat:getMessageAuto', function winstreaks(data) {
    const message = JSON.parse(JSON.parse(data.message).args);
    if (this.canceled || !events.includes(message[0])) return;
    const handling = setting$H.value();
    if (handling === 'Chat' && !friends$1.value()) return;
    this.canceled = handling !== 'Chat' && handling !== 'Both';
    if (handling === 'Hidden') return;
    const username = message[message.length - 2];
    message[message.length - 1];
    if (!checkFriend(username) || !checkCount()) {
      this.canceled = true;
      return;
    }
    const toast = toasts$2.add(toast$6({
      text: global('translateFromServerJson')(data.message),
      css: {
        color: 'yellow',
        footer: { color: 'white' },
      },
    }));
    toast.time = Date.now();
  });

  function removeClass(el, className) {
    el.forEach((e) => e.classList.remove(className));
  }
  function containsText(el, text, { mutex, single } = {}) {
    if (el.forEach) {
      const ret = [];
      for (let i = 0; i < el.length; i++) {
        const element = mutex ? mutex(el[i]) : el[i];
        if (~getText(element).indexOf(text)) {
          ret.push(element);
        }
      }
      return single ? ret[0] : ret;
    }
    return !!~(el.textContent || el.innerText).indexOf(text);
  }
  function getText(el) {
    return el.value || el.textContent || el.innerText;
  }
  function setText(el, text) {
    const set = Object.getOwnPropertyDescriptor(el, 'textContent') ? 'textContent' : 'innerText';
    el[set] = text;
    return el;
  }
  function containsHTML(el, text, { mutex, single } = {}) {
    if (el.forEach) {
      const ret = [];
      for (let i = 0; i < el.length; i++) {
        const element = mutex ? mutex(el[i]) : el[i];
        if (~element.innerHTML.indexOf(text)) {
          ret.push(element);
        }
      }
      return single ? ret[0] : ret;
    }
    return !!~el.innerHTML.indexOf(text);
  }
  function setHTML(el, text) {
    el.innerHTML = text;
    return el;
  }
  function getHTML(el) {
    return el.innerHTML;
  }
  const text$1 = {
    contains: containsText,
    set: setText,
    get: getText,
  };
  const html$1 = {
    contains: containsHTML,
    set: setHTML,
    get: getHTML,
  };
  const $el = {
    removeClass,
    text: text$1,
    html: html$1,
  };

  const setting$G = register$4({
    name: Translation.Setting('friend.add'),
    key: 'underscript.friend.add',
    default: true,
    page: 'Friends',
  });
  onPage('Friends', function addFriend() {
    const single = true;
    const input = document.querySelector('input[name="username"]');
    const sent = Translation.Toast('friend.request.sent');
    const failed = Translation.Toast('friend.request.failed');
    style.add('.green { color: green; }');
    function submit() {
      if (typeof URLSearchParams === 'undefined' || !setting$G.value()) return undefined;
      const name = input.value.trim();
      if (name) {
        input.value = '';
        input.focus();
        const params = new URLSearchParams();
        params.append('username', name);
        params.append('addFriend', 'Add friend');
        axios.post('/Friends', params).then((results) => {
          const page = new DOMParser().parseFromString(results.data, 'text/html').querySelector('div.mainContent');
          const result = page.querySelector('form[action="Friends"] + p');
          if (result) {
            const success = result.classList.contains('green');
            const text = success ? sent : failed;
            toast$6(text.withArgs(name));
            if (success) {
              const element = text$1.contains(decode$1(page).querySelectorAll('a[href^="Friends?delete="]'), `${name} LV`, { mutex, single });
              text$1.contains(document.querySelectorAll('p'), 'Pending requests', { single }).parentElement.append(element);
              eventManager.emit('newElement', element);
            }
          }
        });
      }
      return false;
    }
    function mutex(el) {
      return el.parentElement;
    }
    input.addEventListener('keydown', (e) => {
      if ([e.code, e.key].contains('Enter')) {
        if (submit() === false) e.preventDefault();
      }
    });
    document.querySelector('form[action="Friends"]').onsubmit = submit;
  });

  const setting$F = register$4({
    name: Translation.Setting('friend.background'),
    key: 'underscript.removeFriend.background',
    default: true,
    page: 'Friends',
  });
  let reminded = false;
  const failed = Translation.Toast('friend.delete.failed', 1);
  function remove(e) {
    if (!setting$F.value()) return;
    e.preventDefault();
    process($(this));
  }
  function process(btn) {
    const parent = btn.parent();
    btn.detach();
    const link = btn.attr('href');
    axios.get(link).then((response) => {
      const onlineFriends = $(response.data).find(`#onlineFriends`);
      if (!onlineFriends.length) {
        errorToast(Translation.Toast('login'));
        return;
      }
      const found = decode$1(onlineFriends).find(`a[href="${link}"]`);
      if (found.length) {
        const name = found.parent().find('span:nth-child(3)').text();
        toast$6(failed.withArgs(name));
        btn.appendTo(parent);
      } else {
        if (!reminded) {
          toast$6({
            title: Translation.Toast('note'),
            text: Translation.Toast('friend.delete'),
          });
          reminded = true;
        }
        parent.addClass('deleted');
      }
    }).catch(captureError);
  }
  eventManager.on(':preload:Friends', () => {
    style.add('.deleted { text-decoration: line-through; }');
    $('a[href^="Friends?"]').click(remove);
    globalSet('updateFriends', function updateFriends() {
      this.super();
      $('a.crossDelete').click(remove);
    });
  });
  eventManager.on('newElement', (e) => $(e).find('a').click(remove));
  eventManager.on('friendAction', process);

  const disabled$2 = register$4({
    name: Translation.Setting('friend.auto'),
    key: 'userscript.autodecline.disable',
    page: 'Friends',
    category: Translation.CATEGORY_AUTO_DECLINE,
  });
  const silent$2 = register$4({
    name: Translation.Setting('friend.auto.silent'),
    key: 'underscript.autodecline.silent',
    default: true,
    page: 'Friends',
    category: Translation.CATEGORY_AUTO_DECLINE,
  });
  const chat = register$4({
    name: Translation.Setting('friend.auto.ignore'),
    key: 'underscript.autodecline.ignored',
    default: true,
    page: 'Friends',
    category: Translation.CATEGORY_AUTO_DECLINE,
  });
  each(localStorage, (name, key) => {
    if (!key.startsWith('underscript.autodecline.user.')) return;
    register(key, name);
  });
  function register(key, name, set = false) {
    register$4({
      key,
      name,
      type: 'remove',
      page: 'Friends',
      category: Translation.CATEGORY_AUTO_DECLINE,
    });
    if (set) {
      localStorage.setItem(key, name);
    }
  }
  function post$1(id, name) {
    axios.get(`/Friends?delete=${id}`).then(() => {
      if (!name) return;
      const message = Translation.Toast('friend.request.auto').translate(name);
      debug(message);
      if (!silent$2.value()) {
        toast$6(message);
      }
    }).catch(captureError);
  }
  function isBlocked(id) {
    return !!value(`underscript.autodecline.user.${id}`);
  }
  function isIgnored(id) {
    return chat.value() && !!value(`underscript.ignore.${id}`);
  }
  eventManager.on('preFriends:requests', function filter(requests) {
    if (disabled$2.value()) return;
    each(requests, (name, id) => {
      if (isBlocked(id) || isIgnored(id)) {
        debug(`Blocking ${name}[${id}]`);
        delete requests[id];
        post$1(id, name);
      }
    });
  });
  onPage('Friends', function blockRequests() {
    eventManager.on('jQuery', () => {
      const block = $('<span class="material-icons md-light clickable">').css({
        'font-size': '14px',
      }).text('block');
      $('p:contains("Friend requests")').parent().find('li').each(function elements() {
        const el = $(this);
        const name = el.text().substring(0, el.text().lastIndexOf(' LV '));
        el.append(' ', block.clone().click(function onClick() {
          hide$1();
          const link = el.find('a:first').attr('href');
          const id = link.substring(link.indexOf('=') + 1);
          register(`underscript.autodecline.user.${id}`, name, true);
          post$1(id);
          el.find('a[href^="Friends?"]').remove();
          el.addClass('deleted');
          $(this).remove();
        }).hover(show$2(Translation.General('friend.block').withArgs(name))));
      });
    });
  });

  register$4({
    name: Translation.Setting('friend.decline'),
    key: 'underscript.disable.declineAll',
    refresh: true,
    page: 'Friends',
  });
  onPage('Friends', function groupButtons() {
    eventManager.on('jQuery', () => {
      if (value('underscript.disable.declineAll')) return;
      const declineAll = $('<span>');
      const container = $('p:contains("Friend requests")').append(' ', declineAll).parent();
      declineAll.text(' ')
        .addClass('glyphicon glyphicon-remove red')
        .css({
          cursor: 'pointer',
        })
        .hover(show$2(Translation.General('friend.decline')))
        .click(() => {
          container.find('a[href^="Friends?delete="]').each(function declineFriend() {
            eventManager.emit('friendAction', $(this));
          });
        });
    });
  });

  const setting$E = register$4({
    name: Translation.Setting('friend.request'),
    key: 'underscript.disable.friend.notifications',
    page: 'Friends',
  });
  eventManager.on('Friends:requests', (friends) => {
    if (setting$E.value()) return;
    each(friends, (friend, id) => {
      const key = `underscript.request.${id}`;
      if (sessionStorage.getItem(key)) return;
      const css = {
        background: 'inherit',
      };
      toast$6({
        title: Translation.Toast('friend.request'),
        text: friend,
        buttons: [{
          css,
          text: ' ',
          className: 'glyphicon glyphicon-ok green',
          onclick: post.bind(null, id),
        }, {
          css,
          text: ' ',
          className: 'glyphicon glyphicon-remove red',
          onclick: post.bind(null, id, false),
        }],
      });
      sessionStorage.setItem(key, friend);
    });
  });
  eventManager.on('logout', () => {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('underscript.request.')) {
        sessionStorage.removeItem(key);
      }
    });
  });
  const request = {
    accept: Translation.Toast('friend.request.accept', 1),
    delete: Translation.Toast('friend.request.decline', 1),
  };
  function post(id, accept = true) {
    const action = accept ? 'accept' : 'delete';
    axios.get(`/Friends?${action}=${id}`).then(() => {
      const key = `underscript.request.${id}`;
      const name = sessionStorage.getItem(key);
      sessionStorage.removeItem(key);
      toast$6(request[action].withArgs(name));
    }).catch(noop);
  }

  const setting$D = register$4({
    name: Translation.Setting('friend.online'),
    key: 'underscript.enable.onlinefriends',
    default: true,
    page: 'Friends',
  });
  let popper;
  function updateTip() {
    if (!popper) return;
    popper.querySelector('.onlineFriends').innerHTML = global('selfFriends').filter(({ online }) => online).map((user) => name$1(user)).join('<br>') || 'None';
  }
  eventManager.on(':preload', () => {
    const px = 12;
    style.add(
      '.tippy-tooltip.undercards-theme { background-color: rgba(0,0,0,0.9); font-size: 13px; border: 1px solid #fff; }',
      `.tippy-popper[x-placement^='top'] .tippy-tooltip.undercards-theme .tippy-arrow { border-top-color: #fff; bottom: -${px}px; }`,
      `.tippy-popper[x-placement^='bottom'] .tippy-tooltip.undercards-theme .tippy-arrow { border-bottom-color: #fff; top: -${px}px; }`,
      `.tippy-popper[x-placement^='left'] .tippy-tooltip.undercards-theme .tippy-arrow { border-left-color: #fff; right: -${px}px; }`,
      `.tippy-popper[x-placement^='right'] .tippy-tooltip.undercards-theme .tippy-arrow { border-right-color: #fff; left: -${px}px; }`,
    );
    const el = document.querySelector('a span.nbFriends');
    if (!el) return;
    tip('<div class="onlineFriends">(Loading)</div>', el.parentElement, {
      arrow: true,
      distance: 0,
      follow: false,
      offset: null,
      footer: 'short',
      placement: 'top-start',
      onShow: () => setting$D.value(),
    });
    popper = el.parentElement._tippy.popper;
    eventManager.on('Chat:Connected', updateTip);
    eventManager.on('underscript:ready', () => {
      popper.querySelector('.onlineFriends').textContent = Translation.General('loading');
    });
  });

  eventManager.on('preChat:getFriends', function updateFriends(data) {
    this.canceled = true;
    const friends = JSON.parse(data.friends).reduce((ret, friend) => {
      ret[friend.id] = friend;
      return ret;
    }, {});
    const selfFriends = global('selfFriends');
    selfFriends.forEach((friend) => {
      const id = friend.id;
      const now = friends[id];
      delete friends[id];
      if (now && friend.online !== now.online) {
        friend.online = now.online;
      }
    });
    $('.nbFriends').text(selfFriends.filter((friend) => friend.online).length);
    updateTip();
  });
  eventManager.on('ChatDetected', () => {
    const timeout = 5000;
    function refresh() {
      const socketChat = global('socketChat');
      if (socketChat.readyState !== 1) return;
      socketChat.send(JSON.stringify({ action: 'getFriends' }));
      sleep(timeout).then(refresh);
    }
    sleep(timeout).then(refresh);
  });

  const clear$2 = (obj) => Object.keys(obj).forEach((key) => delete obj[key]);

  const setting$C = register$4({
    name: Translation.Setting('friendship'),
    key: 'underscript.disable.friendship.collect',
    page: 'Library',
    category: Translation.CATEGORY_FRIENDSHIP,
  });
  const maxClaim = 200 / 5;
  let button;
  let collecting = false;
  const rewards = {};
  let pending$1 = 0;
  function canClaim({ notClaimed, claim }) {
    return notClaimed && claim < maxClaim;
  }
  function canCollect() {
    return some(global('friendshipItems'), canClaim);
  }
  function claimReward(data) {
    if (canClaim(data)) {
      global('claim')(data.idCard);
      pending$1 += 1;
    }
  }
  function collect() {
    if (!canCollect() || collecting) return;
    collecting = true;
    pending$1 = 0;
    clear$2(rewards);
    each(global('friendshipItems'), claimReward);
  }
  function getLabel(type = '') {
    switch (type) {
      case Item.GOLD: return '<img src="/images/icons/gold.png" class="height-16">';
      case Item.DUST: return '<img src="/images/icons/dust.png" class="height-16">';
      case Item.UT_PACK: return '<img src="/images/icons/pack.png" class="height-16">';
      case Item.DR_PACK: return '<img src="/images/icons/drPack.png" class="height-16">';
      case Item.UTY_PACK: return '<img src="/images/icons/utyPack.png" class="height-16">';
      case Item.SHINY_PACK: return '<img src="/images/icons/shinyPack.png" class="height-16">';
      default: return type.valueOf().toLowerCase();
    }
  }
  function updateButton(enabled = canCollect()) {
    button.prop('disabled', !enabled);
  }
  function setupButton(disabled) {
    if (disabled) {
      button.addClass('hidden');
      updateButton(false);
    } else {
      button.removeClass('hidden');
      updateButton();
    }
  }
  eventManager.on('Friendship:claim', ({
    data, reward, quantity, error,
  }) => {
    if (!pending$1 || !collecting) return;
    pending$1 -= 1;
    if (!error) {
      rewards[reward] = (rewards[reward] || 0) + quantity;
      claimReward(data);
    }
    if (pending$1) return;
    eventManager.emit('Friendship:results', error);
  });
  eventManager.on('Friendship:results', (error) => {
    const lines = [];
    each(rewards, (count, type) => {
      lines.push(`- ${count} ${getLabel(type)}`);
    });
    const toast = error ? errorToast : toast$6;
    toast({
      title: new Translation('toast.friendship', {
        fallback: 'Claimed Friendship Rewards',
      }),
      text: lines.join('<br>'),
    });
    updateButton();
    collecting = false;
  });
  eventManager.on('Friendship:loaded', () => {
    setupButton(setting$C.value());
  });
  eventManager.on(':preload:Friendship', () => {
    button = $('<button class="btn btn-info">Collect All</button>');
    setting$C.on(setupButton);
    button.on('click.script', collect)
      .hover(show$2(Translation.General('collect.note')));
    eventManager.on('underscript:ready', () => {
      button.text(Translation.General('collect'));
    });
    $('p[data-i18n="[html]crafting-all-cards"]').css('display', 'inline-block').after(' ', button);
  });

  const disabled$1 = 'No';
  const setting$B = register$4({
    name: Translation.Setting('friendship.rank'),
    key: 'underscript.friendship.leaderboard',
    options: ['Yes', disabled$1],
    page: 'Library',
    category: Translation.CATEGORY_FRIENDSHIP,
  });
  const URI = 'Leaderboard?action=friendship&idCard=';
  const cache = {
    loaded: false,
  };
  function updateCache({
    card,
    user = global('selfId'),
    timestamp = Date.now(),
    base,
    xp,
    rank,
    save = false,
  }) {
    if (!user) throw new Error('User missing');
    loadCache();
    const key = `${card};${user}`;
    const cachee = cache[key] = cache[key] || {};
    cachee.timestamp = timestamp;
    cachee.baseline = base || 0;
    if (xp && xp !== cachee.xp || rank !== cachee.rank) {
      cachee.xp = xp;
      cachee.rank = rank;
    }
    if (save) {
      saveCache();
    }
    return cachee;
  }
  function loadCache() {
    if (cache.loaded) return;
    const local = localStorage.getItem('underscript.cache.friendship');
    if (local) {
      const obj = JSON.parse(local);
      each(obj, (val, key) => {
        cache[key] = val;
      });
    }
    cache.loaded = true;
  }
  function saveCache() {
    const local = { ...cache };
    delete local.loaded;
    localStorage.setItem('underscript.cache.friendship', JSON.stringify(local));
  }
  function getCachedData(card, user) {
    if (!user) {
      throw new Error('User not provided!');
    }
    loadCache();
    const key = `${card};${user}`;
    const { xp, rank, baseline, timestamp } = cache[key] = cache[key] || {};
    return { xp, rank, baseline, timestamp };
  }
  function updateCacheCard(id, xp) {
    const user = global('selfId');
    const cached = getCachedData(id, user);
    const notExpired = cached.timestamp !== undefined && cached.timestamp > Date.now() - HOUR;
    const xpTooLow = cached.baseline !== undefined && xp < cached.baseline && !cached.rank;
    const xpSame = cached.xp !== undefined && xp === cached.xp && notExpired;
    if (xpTooLow || xpSame) {
      cached.cached = true;
      return Promise.resolve(cached);
    }
    return axios.get(`${URI}${id}`).then((response) => {
      if (response.data) {
        const data = JSON.parse(response.data.leaderboard);
        const base = data[data.length - 1].xp;
        const rank = xp >= base ? data.findIndex(({ user: { id: userid } }) => userid === user) + 1 : 0;
        return updateCache({ card: id, user, rank, xp, base });
      }
      return getCachedData(id, user);
    });
  }
  function displayRank(card, rank) {
    $(`#${card} > .rank`).remove();
    if (rank > 0) {
      $(`#${card}`).append(`<div class="rank"${rank <= 5 ? ' top' : ''} val="${rank}"></div>`);
    }
  }
  eventManager.on(':preload:Friendship', () => {
    style.add(
      `.rank {
      position: relative;
      z-index: 9;
      width: 32px;
      height: 32px;
      left: 76px;
      top: 99px;
      opacity: 0.9;
      background-image: url(images/friendship.png);
      background-repeat: no-repeat;
      background-position: center center;
    }`,
      `.rank:not([top])[val]::after {
      content: attr(val);
      font-size: 17px;
      text-align: center;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-shadow: -1px -1px 0 #000, 1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000;
    }`,
      `.rank[top]::after {
      content: ' ';
      background-repeat: no-repeat;
      background-position: center center;
      position: absolute;
      width: 100%;
      height: 100%;
    }`,
      '.rank[val="1"]::after { background-image: url(images/rarity/DELTARUNE_DETERMINATION.png); }',
      '.rank[val="2"]::after { background-image: url(images/rarity/DELTARUNE_LEGENDARY.png); }',
      '.rank[val="3"]::after { background-image: url(images/rarity/DELTARUNE_EPIC.png); }',
      '.rank[val="4"]::after { background-image: url(images/rarity/DELTARUNE_RARE.png); }',
      '.rank[val="5"]::after { background-image: url(images/rarity/DELTARUNE_COMMON.png); }',
    );
    const pending = [];
    let loaded = false;
    function pendingUpdate(id, xp) {
      if (loaded) {
        return updateCacheCard(id, xp);
      }
      return new Promise((res) => {
        eventManager.on('Chat:Connected', () => res(updateCacheCard(id, xp)));
      });
    }
    eventManager.on('Chat:Connected', () => {
      loaded = true;
    });
    eventManager.on('Friendship:page', () => {
      if (!pending.length) return;
      Promise.all(pending.splice(0))
        .then((vals = []) => {
          const notAllCached = vals.some((val) => !val);
          if (notAllCached) {
            saveCache();
          }
        });
    });
    globalSet('appendCardFriendship', function func(card, ...args) {
      const ret = this.super(card, ...args);
      if (setting$B.value() !== disabled$1) {
        const id = card.idCard || card.fixedId || card.id;
        pending.push(pendingUpdate(id, card.xp)
          .then(({ rank, cached }) => {
            displayRank(id, rank);
            return cached;
          }));
      }
      return ret;
    });
  });

  const getLevel$1 = (xp) => Math.ceil(0.1 * (Math.sqrt(8 * xp + 156033) - 395));

  const setting$A = register$4({
    name: Translation.Setting('friendship.notification'),
    key: 'underscript.disable.friendship.notification',
    page: 'Library',
    category: Translation.CATEGORY_FRIENDSHIP,
  });
  const max = 200 / 5;
  function getFriendship() {
    if (setting$A.value()) return;
    axios.get('/FriendshipConfig').then((resp) => {
      const items = JSON.parse(resp.data.friendshipItems)
        .filter((item) => {
          const lvl = getLevel$1(item.xp);
          return lvl > 0 && item.claim < Math.min(Math.floor(lvl / 5), max);
        }).map((item) => $.i18n(`card-name-${item.idCard}`, 1));
      if (!items.length) return;
      toast$6({
        title: Translation.Toast('friendship.notification'),
        text: `- ${items.join('\n- ')}`,
        className: 'dismissable',
        buttons: {
          text: Translation.General('go!'),
          className: 'dismiss',
          css: buttonCSS,
          onclick: (e) => {
            location.href = '/Friendship';
          },
        },
      });
    });
  }
  eventManager.on('getVictory getDefeat', getFriendship);

  onPage('Game', () => {
    const regex = /(^| )@o\b/gi;
    let toast = infoToast('You can mention opponents with @o', 'underscript.notice.mention', '1');
    function convert({ input }) {
      if (toast) {
        toast.close('processed');
        toast = null;
      }
      $(input).val($(input).val()
        .replace(regex, `$1@${$('#enemyUsername').text()}`));
    }
    eventManager.on('Chat:send', convert);
    eventManager.on('@autocomplete', ({ list = [] }) => {
      const name = $('#enemyUsername').text();
      if (!name) return;
      const pos = list.indexOf(name);
      if (pos > -1) {
        list.splice(pos, 1);
      }
      list.push(name);
    });
  });

  let self;
  const spectating = onPage('Spectate');
  const spectate = register$4({
    name: 'Show when spectating',
    key: 'underscript.emote.spectate',
    default: true,
    page: 'Game',
    category: 'Emotes',
  });
  const friends = register$4({
    name: 'Friends only',
    key: 'underscript.emote.friends',
    page: 'Game',
    category: 'Emotes',
  });
  const enemy = register$4({
    name: 'Disable enemy',
    key: 'underscript.emote.enemy',
    page: 'Game',
    category: 'Emotes',
  });
  compound('GameStart', ':preload', () => {
    self = global('selfId', { throws: false });
    if (disableSpectating()) {
      globalSet('gameEmotesEnabled', false);
      debug('Hiding emotes (spectator)');
    } else {
      const muteEnemy = enemy.value();
      globalSet('enemyMute', muteEnemy);
      if (muteEnemy) {
        debug('Hiding emotes (enemy)');
        $('#enemyMute').toggle(!spectating);
      }
    }
  });
  eventManager.on('getEmote:before', function hideEmotes(data) {
    if (this.canceled || !global('gameEmotesEnabled')) return;
    if (friendsOnly(data.idUser)) {
      debug('Hiding emote (friends)');
      this.canceled = true;
    }
  });
  function disableSpectating() {
    return spectating && !spectate.value();
  }
  function friendsOnly(id) {
    return self && friends.value() && id !== self && !global('isFriend')(id);
  }

  const setting$z = register$4({
    name: 'Disable End Turn Waiting',
    key: 'underscript.disable.endTurnDelay',
    page: 'Game',
  });
  register$4({
    name: 'End Turn Wait Time',
    key: 'underscript.endTurnDelay',
    type: 'select',
    options: [],
    disabled: true,
    hidden: true,
    page: 'Game',
  });
  eventManager.on('PlayingGame', function endTurnDelay() {
    eventManager.on('getTurnStart', function checkDelay() {
      if (global('userTurn') !== global('userId')) return;
      if (global('turn') > 3 && !setting$z.value()) {
        debug('Waiting');
        $('#endTurnBtn').prop('disabled', true);
        sleep(3000).then(() => {
          $('#endTurnBtn').prop('disabled', false);
        });
      }
    });
  });

  const NONE = 'None';
  const levels = [{
    text: 'Legend',
    rank: 'LEGEND',
    val: 0,
  }, {
    text: 'Master',
    rank: 'MASTER',
    val: 7,
  }, {
    text: 'Onyx',
    rank: 'ONYX',
    val: 8,
  }, {
    text: 'Diamond',
    rank: 'DIAMOND',
    val: 1,
  }, {
    text: 'Ruby',
    rank: 'RUBY',
    val: 2,
  }, {
    text: 'Amethyst',
    rank: 'AMETHYST',
    val: 3,
  }, {
    text: 'Saphire',
    rank: 'SAPHIRE',
    val: 4,
  }, {
    text: 'Emerald',
    rank: 'EMERALD',
    val: 5,
  }, {
    text: 'Gold',
    rank: 'GOLD',
    val: 6,
  }, {
    text: NONE,
    val: 100,
  }];
  levels.forEach((level, index) => {
    level.index = index;
    const classes = ['PRIORITY'];
    if (level.rank) {
      classes.push(level.rank);
    }
    level.class = classes.join(' ');
  });
  style.add(
    '.sortedList .PRIORITY.GOLD { --color: #ffe455; }',
    '.sortedList .PRIORITY.EMERALD { --color: #00ca78; }',
    '.sortedList .PRIORITY.SAPHIRE { --color: #1f37ff; }',
    '.sortedList .PRIORITY.RUBY { --color: #ff0303; }',
    '.sortedList .PRIORITY.DIAMOND { --color: #00ced2; }',
    '.sortedList .PRIORITY.AMETHYST { --color: #ff00ff; }',
    '.sortedList .PRIORITY.ONYX { --color: #3d1f8d; }',
    '.sortedList .PRIORITY.MASTER { --color: #ffb100; }',
    '.sortedList .PRIORITY.LEGEND { animation-name: rainbowSetting; animation-duration: 7s; animation-timing-function: linear; animation-iteration-count: infinite; }',
    '@keyframes rainbowSetting { 0% { box-shadow: inset 0px 0px 20px 1px #f00; } 17% { box-shadow: inset 0px 0px 20px 1px #ff0; } 33% { box-shadow: inset 0px 0px 20px 1px #0f0; } 50% { box-shadow: inset 0px 0px 20px 1px #0ff; } 67% { box-shadow: inset 0px 0px 20px 1px #00f; } 84% { box-shadow: inset 0px 0px 20px 1px #f0f; } 100% { box-shadow: inset 0px 0px 20px 1px #f00; } }',
    '.sortedList .PRIORITY { padding-left: 5px; margin-bottom: 5px; box-shadow: inset 0px 0px 20px 1px var(--color); }',
    '.OLD_ONYX { -webkit-box-shadow: inset 0 0 20px 2px #3d1f8d; box-shadow: inset 0 0 20px 1px #3d1f8d; }',
  );
  const notify = register$4({
    name: 'Notify',
    key: 'underscript.board.priority.notify',
    default: true,
    page: 'Game',
    category: 'Board Background',
  });
  const setting$y = register$4({
    name: 'Priority',
    key: 'underscript.board.priority',
    type: 'list',
    page: 'Game',
    category: 'Board Background',
    data: levels,
  });
  eventManager.on('connect', (data) => {
    const { oldDivision = '' } = JSON.parse(data.you);
    const oldRank = getRank(oldDivision);
    const level = getLevel(oldRank);
    if (!level) return;
    $('#yourSide').removeClass(`OLD_${oldRank}`);
    const value = setting$y.value().find(({ index }) => index >= level.index);
    if (value.text === NONE) {
      if (notify.value()) {
        infoToast('Your board background has been disabled');
      }
      return;
    }
    const division = value.text.toUpperCase();
    $('#yourSide').addClass(`OLD_${division}`);
    if (notify.value() && oldRank !== division) {
      infoToast(`Your board background has been set to "${division}"`);
    }
  });
  function getLevel(rank = '') {
    return levels.find(({ rank: text }) => text === rank);
  }
  function getRank(rank = '') {
    if (rank === 'LEGEND') return rank;
    return rank.substring(0, rank.indexOf('_'));
  }

  const find = (o, f, t) => o && o[Object.keys(o).find((x) => f.call(t, o[x], x, o))] || undefined;

  let loaded = false;
  function extend(data) {
    $.extend($.i18n.parser.emitter, data);
  }
  eventManager.on('translation:loaded', () => loaded = true);
  function extendLangParser(data = {}) {
    if (loaded) {
      extend(data);
    } else {
      eventManager.on('translation:loaded', () => extend(data));
    }
  }

  let extract = false;
  function extractImageName(mode = false) {
    extract = mode;
  }
  extendLangParser({
    image(nodes) {
      const [img, name, width = 64, height = 16, card = 0] = nodes;
      if (!img || !name) return '';
      if (extract) {
        return name;
      }
      const mouseOver = card ? `onmouseover="displayCardHelp(this, ${card});" onmouseleave="removeCardHover();" ` : '';
      return `<div><img style="width: ${width}px; height: ${height}px;" class="inserted-img" ${mouseOver}src="/images/inserted/${img}.png" alt="${name}"/></div>`;
    },
  });

  register$4({
    name: 'Disable Battle Log',
    key: 'underscript.disable.logger',
    page: 'Game',
    onChange: (to, from) => {
      if (!onPage('Game') && !onPage('Spectate')) return;
      if (to) {
        $('#history').hide();
      } else {
        $('#history').show();
      }
    },
  });
  register$4({
    name: 'Hide Dust Counter',
    key: 'underscript.disable.dust',
    type: 'select',
    default: 'spectating',
    options: ['never', 'playing', 'spectating', 'always'],
    page: 'Game',
  });
  eventManager.on('GameStart', function battleLogger() {
    const ignoreEvents = Object.keys({
      getEmote: 'Player is using emote',
      getConnectedFirst: '',
      refreshTimer: 'Never need to know about this one',
      getPlayableCards: 'On turn start, selects cards player can play',
      getTurn: 'Turn update',
      getCardDrawed: 'Add card to your hand',
      updateSpell: '',
      getFakeDeath: 'Card "died" and respawns 1 second later',
      getMonsterTemp: 'You\'re about to play a monster',
      getSpellTemp: 'You\'re about to play a spell',
      getTempCancel: 'Temp card cancelled',
      getShowMulligan: 'Switching out hands, ignore it',
      getHideMulligan: 'Hide the mulligan, gets called twice',
      getUpdateHand: 'Updates full hand',
      getError: 'Takes you to "home" on errors, can be turned into a toast',
      getGameError: 'Takes you to "play" on game errors, can be turned into a toast',
      getBattleLog: 'In-game battle log',
      getBotDelay: '...',
      clearSpell: '',
      getPlaySound: '',
      getAnimation: '',
      getArtifactDoingEffect: 'artifact activates, handled by getBattleLog',
    });
    const turnText = '>>> Turn';
    const surrendered = 'surrendered';
    const overwhelmed = 'was overwhelmed';
    let baseLives = 1;
    let turn = 0;
    let currentTurn = 0;
    const players = {};
    let monsters = {};
    let lastEffect;
    const other = {};
    let yourDust;
    let enemyDust;
    let lastSP;
    function getDust(id) {
      return global('dustpile').filter(({ ownerId }) => ownerId === id).length;
    }
    function addDust(player, dust = getDust(player)) {
      if (!player || !players[player]) return;
      const display = player === global('userId') ? yourDust : enemyDust;
      display.html(dust);
    }
    const make = {
      player: function makePlayer(player, title = false) {
        const c = $('<span>');
        c.append(`<img src="images/souls/${player.class}.png">`, name$1(player));
        c.addClass(player.class);
        if (!title) {
          c.css('text-decoration', 'underline');
          const data = `${player.hp} hp, ${player.gold} gold<br />${getDust(player.id)} dust`;
          c.hover(show$2(data, '2px solid white'));
        }
        return c;
      },
      card: function makeCard(card) {
        const c = $('<span>');
        extractImageName(true);
        c.text(cardName(card));
        extractImageName(false);
        c.css('text-decoration', 'underline');
        const d = $('<div>');
        const appendCard = global('appendCard');
        try {
          appendCard(card, d);
        } catch {
          appendCard(d, card);
        }
        c.hover(show$2(d));
        return c;
      },
      artifact(art, appendName) {
        const c = $('<span>');
        c.append(`<img src="images/artifacts/${art.image}.png">`);
        if (appendName) {
          c.append(art.name);
        }
        return c;
      },
    };
    eventManager.on('connect', function initBattle(data) {
      debug(data, 'debugging.raw.game');
      const you = JSON.parse(data.you);
      const enemy = JSON.parse(data.enemy);
      const gold = JSON.parse(data.golds);
      you.gold = gold[you.id];
      enemy.gold = gold[enemy.id];
      JSON.parse(data.board).forEach((card, i) => {
        if (card === null) return;
        card.owner = i < 4 ? enemy.id : you.id;
        monsters[card.id] = card;
      });
      you.level = data.yourLevel;
      you.class = window.yourSoul?.name ?? data.yourSoul;
      you.rank = data.yourRank;
      enemy.level = data.enemyLevel;
      enemy.class = window.enemySoul?.name ?? data.enemySoul;
      enemy.rank = data.enemyRank;
      debug({ you, enemy }, 'debugging.game');
      turn = data.turn || 0;
      players[you.id] = you;
      players[enemy.id] = enemy;
      const disableDust = value('underscript.disable.dust');
      yourDust = $('<span class="stats-value dust-counter">');
      enemyDust = $('<span class="stats-value dust-counter">');
      if (disableDust === 'never' || (disableDust !== 'always' && disableDust !== (this.event === 'getAllGameInfos' ? 'spectating' : 'playing'))) {
        $('.btn-dustpile').wrap('<span class="stats-group">');
        $(`#user${global('opponentId')} .btn-dustpile`).after(enemyDust);
        $(`#user${global('userId')} .btn-dustpile`).after(yourDust);
      }
      if (data.lives) {
        const lives = JSON.parse(data.lives);
        you.lives = lives[you.id];
        enemy.lives = lives[enemy.id];
      } else {
        baseLives = 0;
        updateSoul({
          idPlayer: you.id,
          soul: you.soul,
        });
        updateSoul({
          idPlayer: enemy.id,
          soul: enemy.soul,
        });
      }
      other[you.id] = enemy.id;
      other[enemy.id] = you.id;
      updateDust(data, you.id);
      log.init();
      if (value('underscript.disable.logger')) {
        $('#history').hide();
      }
      $('div#history div.handle').html('').append(`[${data.gameType}] `, make.player(you), ' vs ', make.player(enemy));
      log.add(`${turnText} ${turn}`);
      if (data.userTurn) {
        currentTurn = data.userTurn;
        log.add(make.player(players[data.userTurn]), '\'s turn');
      }
    });
    eventManager.on('getUpdateDustpile', updateDust);
    function updateDust({ dustpile }, player = global('userId')) {
      const dust = JSON.parse(dustpile);
      const count = dust.filter(({ ownerId }) => ownerId === player).length;
      addDust(player, count);
      addDust(other[player], dust.length - count);
    }
    eventManager.on('getFight getFightPlayer', function fight(data) {
      const target = this.event === 'getFightPlayer' ? make.player(players[data.defendPlayer]) : make.card(monsters[data.defendMonster]);
      log.add(make.card(monsters[data.attackMonster]), ' attacked ', target);
    });
    eventManager.on('getUpdatePlayerHp', function updateHP(data) {
      debug(data, 'debugging.raw.updateHP');
      const player = players[data.playerId];
      const oHp = player.hp;
      player.hp = data.hp;
      if (oHp !== data.hp) {
        const hp = data.hp - oHp;
        log.add(make.player(player), ` ${hp < 0 ? 'lost' : 'gained'} ${Math.abs(hp)} hp`);
      }
      if (data.hp === 0 && player.lives > baseLives && player.lostLife !== true) {
        log.add(make.player(player), ' lost a life');
        player.lostLife = true;
      }
    });
    eventManager.on('getDoingEffect', function doEffect(data) {
      debug(data, 'debugging.raw.effect');
      if (data.card) {
        const card = JSON.parse(data.card);
        monsters[card.id] = card;
        data.monsterId = card.id;
      }
      if (lastEffect === `m${data.monsterId}`) return;
      lastEffect = `m${data.monsterId}`;
      log.add(make.card(monsters[data.monsterId]), '\'s effect activated');
    });
    eventManager.on('Log:ARTIFACT_EFFECT', ({ artifactActor: artifact, playerId, targetCards = [], targetPlayers = [] }) => {
      const bits = [make.player(players[playerId]), `'s `, make.artifact(artifact, true), ' activated', ...targets(targetCards, targetPlayers)];
      log.add(...bits);
    });
    eventManager.on('Log:SOUL_EFFECT', ({ playerActor, playerId, targetCards = [], targetPlayers = [] }) => {
      const bits = [
        make.player(players[playerId]),
        `'s soul activated`,
        ...targets(targetCards, targetPlayers),
      ];
      log.add(...bits);
    });
    function targets(targetCards = [], targetPlayers = []) {
      if (!targetCards.length && !targetPlayers.length) return [];
      const bits = [' on '];
      targetCards.forEach((card, i) => {
        if (i) bits.push(', ');
        bits.push(make.card(card));
      });
      targetPlayers.forEach((player, i) => {
        if (i || targetCards.length) bits.push(', ');
        bits.push(make.player(players[player.id]));
      });
      if (bits.length > 2) {
        bits[bits.length - 2] = ' and ';
      }
      return bits;
    }
    eventManager.on('getTurnStart', function turnStart(data) {
      debug(data, 'debugging.raw.turnStart');
      lastEffect = 0;
      if (data.numTurn !== turn) {
        turn = data.numTurn;
        log.add(`${turnText} ${turn}`);
      }
      if (currentTurn !== data.idPlayer) {
        currentTurn = data.idPlayer;
        log.add(make.player(players[currentTurn]), '\'s turn');
      }
    });
    eventManager.on('getTurnEnd', function turnEnd(data) {
      debug(data, 'debugging.raw.turnEnd');
      if (global('time') <= 0) {
        log.add(make.player(players[data.idPlayer]), ' timed out');
      }
      delete players[data.idPlayer].lostLife;
      delete players[other[data.idPlayer]].lostLife;
      lastEffect = 0;
      lastSP = 0;
    });
    eventManager.on('getUpdateBoard', function updateGame(data) {
      debug(data, 'debugging.raw.boardUpdate');
      monsters = {};
      JSON.parse(data.board).forEach((card, i) => {
        if (card === null) return;
        card.owner = global(i < 4 ? 'opponentId' : 'userId');
        monsters[card.id] = card;
      });
    });
    eventManager.on('updateMonster updateCard', function updateCard(data) {
      data.monster = JSON.parse(data.monster || data.card);
      debug(data, 'debugging.raw.updateMonster');
      const card = data.monster;
      monsters[card.id] = merge(monsters[card.id], card);
    });
    eventManager.on('getMonsterDestroyed', function monsterKilled(data) {
      debug(data, 'debugging.raw.kill');
      log.add(make.card(monsters[data.monsterId]), ' was killed');
      delete monsters[data.monsterId];
    });
    eventManager.on('getCardBoard getMonsterPlayed', function playCard(data) {
      debug(data, 'debugging.raw.boardAdd');
      const card = JSON.parse(data.card);
      card.owner = data.idPlayer;
      monsters[card.id] = card;
      log.add(make.player(players[data.idPlayer]), ' played ', make.card(card));
    });
    eventManager.on('getSpellPlayed', function useSpell(data) {
      debug(data, 'debugging.raw.spell');
      const card = JSON.parse(data.card);
      if (lastSP === card.id) return;
      lastSP = card.id;
      card.owner = data.idPlayer;
      monsters[card.id] = card;
      log.add(make.player(players[data.idPlayer]), ' used ', make.card(card));
    });
    eventManager.on('getShowCard', function showCard(data) {
      const card = JSON.parse(data.card);
      log.add(make.player(players[data.idPlayer]), ' exposed ', make.card(card));
    });
    eventManager.on('getCardDestroyedHandFull', function destroyCard(data) {
      debug(data, 'debugging.raw.fullHand');
      const card = JSON.parse(data.card);
      debug(data.card, 'debugging.destroyed.card');
      log.add(make.player(players[data.idPlayer || card.ownerId]), ' discarded ', make.card(card));
    });
    eventManager.on('getPlayersStats', function updatePlayer(data) {
      debug(data, 'debugging.raw.stats');
      let temp = JSON.parse(data.handsSize);
      Object.keys(temp).forEach((key) => {
      });
      temp = JSON.parse(data.golds);
      Object.keys(temp).forEach((key) => {
        players[key].gold = temp[key];
      });
      if (data.lives) {
        temp = JSON.parse(data.lives);
        Object.keys(temp).forEach((key) => {
          players[key].lives = temp[key];
        });
      }
      if (data.artifacts) {
        temp = JSON.parse(data.artifacts);
        each(temp, (array = [], user = 0) => {
          players[user].overwhelmed = array.some((art) => art.id === 34 && art.custom === 0);
        });
      }
    });
    eventManager.on('getVictory getDefeat', function gameEnd(data) {
      debug(data, 'debugging.raw.end');
      const userId = global('userId');
      const opponentId = global('opponentId');
      const you = make.player(players[userId]);
      const enemy = make.player(players[opponentId]);
      if (this.event === 'getDefeat') {
        const player = players[userId];
        if (player.overwhelmed) {
          log.add(you.clone(), ` ${overwhelmed}.`);
        } else if (player.hp > 0 && player.maxHp > 0) {
          log.add(you.clone(), ` ${surrendered}.`);
        }
        log.add(enemy, ' beat ', you);
        return;
      }
      if (data.disconnected) {
        log.add(enemy.clone(), ' left the game.');
      } else if (players[opponentId].hp > 0 && players[opponentId].maxHp > 0) {
        const msg = players[opponentId].overwhelmed ? overwhelmed : surrendered;
        log.add(enemy.clone(), ` ${msg}.`);
      }
      log.add(you, ' beat ', enemy);
    });
    eventManager.on('getResult', function endSpectating(data) {
      debug(data, 'debugging.raw.end');
      const loser = lookupPlayer(data.looser);
      let loseReason = '';
      if (data.cause === 'game-end-surrender') {
        loseReason = surrendered;
      } else if (data.cause === 'game-end-disconnection') {
        loseReason = 'left the game';
      } else if (loser.overwhelmed) {
        loseReason = overwhelmed;
      }
      const lost = make.player(loser);
      if (loseReason) {
        log.add(lost.clone(), ` ${loseReason}.`);
      }
      if (typeof music !== 'undefined') {
        global('music').addEventListener('playing', () => {
          if (localStorage.getItem('gameMusicDisabled')) {
            global('music').pause();
          }
        });
      }
      const winner = lookupPlayer(data.winner);
      log.add(make.player(winner), ` beat `, lost);
    });
    eventManager.on(ignoreEvents.join(' '), function ignore(data) {
      debug(data, 'debugging.raw.ignore');
      debug(data, `debugging.raw.ignore.${this.event}`);
    });
    eventManager.on('getUpdateSoul', function blah(data) {
      updateSoul({
        idPlayer: data.idPlayer,
        soul: JSON.parse(data.soul),
      });
    });
    function updateSoul({ idPlayer, soul = {} }) {
      const player = players[idPlayer];
      player.lives = soul.lives || 0;
      player.dodge = soul.dodge || 0;
    }
    function lookupPlayer(name) {
      return find(players, (player) => name$1(player) === name);
    }
    style.add(
      '#history { border: 2px solid white; background-color: rgba(0,0,0,0.9); position: absolute; right: 10px; top: 10px; z-index: 20; user-select: text; }',
      '#history .handle { border-bottom: 1px solid white; text-align: center; }',
      '#history #log { display: flex; flex-direction: column-reverse; align-items: flex-start; overflow-y: auto; max-height: 600px; }',
      '#history img { height: 16px; padding-right: 4px; }',
      '#history #log div { position: relative; width: 100% }',
      '#history #log div:after { content: ""; border-bottom: 1px dashed rgb(133,133,133); position: absolute; left: 0; right: 0; bottom: -1px; }',
      '.dust-counter { pointer-events: none; }',
    );
    const log = {
      init() {
        const hi = $('<div id=\'history\'></div>');
        const ha = $('<div class=\'handle\'>History</div>');
        const lo = $('<div id=\'log\'></div>');
        const mainContent = $('div.mainContent');
        mainContent.css('position', 'initial');
        const pos = parseInt(mainContent.css('width'), 10) + parseInt(mainContent.css('margin-left'), 10);
        mainContent.css('position', '');
        hi.css({
          width: `${window.innerWidth - pos - 20}px`,
        });
        hi.append(ha);
        hi.append(lo);
        $('body').append(hi);
      },
      add(...args) {
        const div = $('<div>');
        args.forEach((a) => {
          if (a) div.append(a);
        });
        if (!div.html()) return;
        $('div#history div#log').prepend(div);
      },
    };
  });

  const setting$x = register$4({
    name: 'Disable Error Toast',
    key: 'underscript.disable.errorToast',
    page: 'Game',
    category: 'Notifications',
  });
  eventManager.on('getError:before getGameError:before', function toast(data) {
    if (setting$x.value() || this.canceled) return;
    this.canceled = true;
    errorToast({
      title: $.i18n('dialog-error'),
      text: global('translateFromServerJson')(data.message),
      onClose() {
        document.location.href = 'Play';
      },
    });
  });

  eventManager.on('PlayingGame', function fixEndTurn() {
    eventManager.on(':load', () => {
      let endedTurn = false;
      globalSet('endTurn', function endTurn() {
        if (endedTurn || $('#endTurnBtn').prop('disabled')) return;
        if (eventManager.cancelable.emit('player:endTurn').canceled) return;
        endedTurn = true;
        this.super();
      });
      eventManager.on('getTurnStart', function turnStarted() {
        if (global('userTurn') !== global('userId')) return;
        endedTurn = false;
      });
    });
  });

  eventManager.on('getTurnEnd getTurnStart getPlayableCards', function hideSpells() {
    const spells = $('.spellPlayed');
    if (spells.length) {
      spells.remove();
      debug(`(${this.event}) Removed spell`);
    }
  });

  style.add(
    '#game-history.left { width: 75px; left: -66px; top: 70px; overflow-y: auto; right: initial; height: 426px; }',
    '#game-history.left::-webkit-scrollbar { width: 8px; background-color: unset;  }',
    '#game-history.left::-webkit-scrollbar-thumb { background-color: #555; }',
    '#game-history.hidden { display: none; }',
    '.timer.active { left: -65px; height: 26px; line-height: 22px; top: 497px; }',
  );
  let gameActive = false;
  const BattleLogSetting = 'underscript.disable.logger';
  const setting$w = register$4({
    name: 'Disable Undercards Battle Log',
    key: 'underscript.disable.gamelog',
    page: 'Game',
    onChange: (to) => {
      if (gameActive) toggle$5(to);
    },
  });
  eventManager.on('GameStart', () => {
    gameActive = true;
    eventManager.on(':load', () => {
      if (setting$w.value()) toggle$5(true);
      if (!value(BattleLogSetting)) {
        toggle$5(true, 'left');
        timer(true);
      }
    });
    on(BattleLogSetting, ({ val: to }) => {
      toggle$5(!to, 'left');
      timer(!to);
    });
  });
  function toggle$5(to, clazz = 'hidden') {
    $('#game-history').toggleClass(clazz, to);
  }
  function timer(apply) {
    $('div.timer').toggleClass('active', apply);
  }

  const startsWith = 'quest-s';
  let season = Number(sessionStorage.getItem('undercards.season')) || -1;
  function getSeasonMonth() {
    if (season === -1) throw new Error('Season not loaded');
    return ((season - 66) % 12) + 1;
  }
  eventManager.on('translation:loaded', () => {
    const messageKeys = Object.keys($.i18n.messageStore.messages.en);
    const seasonKey = messageKeys.reverse().find((key) => key.startsWith(startsWith) && key.endsWith('-start-1'));
    if (!seasonKey) return;
    season = Number(seasonKey.substring(startsWith.length, seasonKey.indexOf('-', startsWith.length)));
    sessionStorage.setItem('undercards.season', season);
    eventManager.singleton.emit('undercards:season', season);
  });

  const AUDIO = 'fishMusics';
  const IMAGES = 'fishImages';
  function isApril() {
    return getSeasonMonth() === 4;
  }

  const year = `${new Date().getFullYear()}`;
  const aprilFools = register$4({
    name: Translation.Setting('fishday'),
    key: 'underscript.disable.fishday',
    note: Translation.Setting('fishday.note'),
    data: { extraValue: year },
    hidden: () => !isApril() || isSoftDisabled(),
    onChange() {
      toggleFish($('body'));
    },
  });
  function isSoftDisabled() {
    return localStorage.getItem(aprilFools.key) === year;
  }
  const basePath = 'images';
  function toggleFish($el) {
    const disabled = aprilFools.value();
    const search = disabled ? IMAGES : basePath;
    const replace = disabled ? basePath : IMAGES;
    $el.find(`img[src*="undercards.net/${search}/"],img[src^="/${search}/"],img[src^="${search}/"]`).each((_, img) => {
      img.src = img.src.replace(search, replace);
    }).one('error', () => aprilFools.set(year));
    $el.find(`[style*="url(\\"${search}/"]`).each((i, img) => {
      img.style.background = img.style.background.replace(search, replace);
    }).one('error', () => aprilFools.set(year));
  }
  eventManager.on('undercards:season', () => {
    if (!isApril() || isSoftDisabled()) return;
    eventManager.on(':load', () => {
      toggleFish($('body'));
    });
    eventManager.on('func:appendCard', (card, container) => {
      toggleFish(container);
    });
    eventManager.on('Chat:getMessage', ({ chatMessage }) => {
      const { id } = JSON.parse(chatMessage);
      toggleFish($(`#message-${id}`));
    });
    eventManager.on('Chat:getHistory', ({ room }) => {
      toggleFish($(`#${room}`));
    });
    eventManager.on('Home:Refresh', () => {
      toggleFish($('table.spectateTable'));
    });
  });

  const setting$v = register$4({
    name: 'Persist Arena (Background and Music)',
    key: 'underscript.persist.bgm',
    default: true,
    refresh: () => window.gameId !== undefined,
    page: 'Game',
  });
  const ignoreModes = ['BOSS', 'STORY', 'TUTORIAL'];
  eventManager.on('GameStart', () => {
    eventManager.on('connect', (data) => {
      const val = sessionStorage.getItem(`underscript.bgm.${data.gameId}`);
      if (setting$v.value() && val) {
        const path = isApril() && !aprilFools.value() ? IMAGES : 'images';
        $('body').css('background-image', `url('${path}/backgrounds/${val}.png')`);
        if (!ignoreModes.includes(data.gameType) && global('profileSkinsEnabled')) {
          global('checkSpecialProfileSkin')(JSON.parse(data.yourProfileSkin));
        }
      }
    });
    eventManager.on('playBackgroundMusic', (data) => {
      if (!setting$v.value()) return;
      const key = `underscript.bgm.${global('gameId')}`;
      const background = sessionStorage.getItem(key);
      if (background) {
        data.name = background;
      } else {
        sessionStorage.setItem(key, data.name);
      }
    });
  });

  class Base {
    #id;
    constructor(data) {
      this.#id = data.id;
    }
    get id() {
      return this.#id;
    }
    update(data) {}
    toJSON() {
      return {
        id: this.id,
      };
    }
  }

  class Skin extends Base {
    #author;
    #card;
    #image;
    #name;
    #type;
    constructor({
      cardId = 0,
      skinAuthor = '',
      skinImage = '',
      skinName = '',
      skinType = 0,
      author = skinAuthor,
      card = cardId,
      image = skinImage,
      name = skinName,
      id = name || 0,
      type = skinType,
    }) {
      super({ id });
      this.#author = author;
      this.#card = Number(card);
      this.#image = image;
      this.#name = name;
      this.#type = Number(type);
    }
    get author() {
      return this.#author;
    }
    get authorName() {
      return this.#author;
    }
    get card() {
      return this.#card;
    }
    get cardId() {
      return this.#card;
    }
    get image() {
      return this.#image;
    }
    get imageSrc() {
      return `/images/cards/${this.image}.png`;
    }
    get name() {
      return this.#name;
    }
    get type() {
      return this.#type;
    }
    get typeSkin() {
      return this.#type;
    }
    toJSON() {
      return {
        author: this.author,
        card: this.card,
        image: this.image,
        src: this.imageSrc,
        name: this.name,
        type: this.type,
      };
    }
  }

  class Reward {
    #reward;
    #type;
    constructor(el) {
      this.#reward = el;
    }
    get reward() {
      this.#process();
      return this.#reward;
    }
    get type() {
      this.#process();
      return this.#type;
    }
    #process() {
      if (!(this.#reward instanceof Element)) return;
      const { type, value } = rewardType(this.#reward);
      this.#reward = value;
      this.#type = type;
    }
    toJSON() {
      return {
        reward: this.reward,
        type: this.type,
      };
    }
  }
  function rewardType(el) {
    let temp = el.querySelector('[data-i18n-tips]');
    if (temp) {
      const type = temp.dataset.i18nTips;
      return {
        type: Item.find(type) || type,
        value: temp.parentElement.textContent.trim().substring(1),
      };
    }
    temp = el.querySelector('[data-i18n-custom="quests-ucp"]');
    if (temp) {
      return {
        type: Item.UCP,
        value: temp.dataset.i18nArgs,
      };
    }
    temp = el.querySelector('.card-skin-bordered');
    if (temp) {
      const { textContent: text } = temp.attributes.onmouseover;
      return {
        type: Item.CARD,
        value: text.substring(text.indexOf(',') + 1, text.indexOf(')')).trim(),
      };
    }
    temp = el.querySelector('[data-skin-type]');
    if (temp) {
      return {
        type: Item.SKIN,
        value: new Skin(temp.dataset),
      };
    }
    temp = el.querySelector('.avatar');
    if (temp) {
      return {
        type: Item.AVATAR,
        value: {
          image: temp.src,
          rarity: temp.classList[1],
        },
      };
    }
    temp = el.querySelector('[src*="/emotes/"]');
    if (temp) {
      return {
        type: Item.EMOTE,
        value: temp.src,
      };
    }
    temp = el.querySelector('[src*="/profiles/"]');
    if (temp) {
      return {
        type: Item.PROFILE,
        value: temp.src,
      };
    }
    throw new Error('unknown reward type');
  }

  class Progress {
    #max;
    #value;
    constructor({
      max = 0,
      value = 0,
    } = {}) {
      this.#max = max;
      this.#value = value;
    }
    get max() {
      return this.#max;
    }
    get value() {
      return this.#value;
    }
    get complete() {
      return this.max === this.value;
    }
    compare(other) {
      if (!(other instanceof Progress)) throw new Error('invalid object');
      return Math.abs(this.value - other.value);
    }
    toJSON() {
      return {
        complete: this.complete,
        max: this.max,
        value: this.value,
      };
    }
  }

  class Quest extends Base {
    #args;
    #claimable = false;
    #key;
    #progress = new Progress();
    #reward = new Reward();
    constructor(data) {
      const id = isQuest(data) ? data.id : getId(data);
      super({ id });
      if (isQuest(data)) {
        this.#args = data.#args;
        this.#key = data.#key;
      } else if (data instanceof Element) {
        const el = data.querySelector('[data-i18n-custom^="quest"]');
        if (!el) throw new Error('Malformed quest');
        this.#args = el.dataset.i18nArgs?.split(',') || [];
        this.#key = el.dataset.i18nCustom;
      }
      this.update(data);
    }
    update(data) {
      if (data instanceof Element) {
        this.#claimable = data.querySelector('input[type="submit"][value="Claim"]:not(:disabled)') !== null;
        this.#progress = new Progress(data.querySelector('progress'));
        this.#reward = new Reward(data.querySelector('td:nth-last-child(2)'));
      } else if (isQuest(data)) {
        this.#claimable = data.claimable;
        this.#progress = data.progress;
        this.#reward = data.reward;
      }
    }
    get name() {
      return translateText(this.#key, {
        args: this.#args,
      });
    }
    get reward() {
      return this.#reward;
    }
    get progress() {
      return this.#progress;
    }
    get claimable() {
      return this.#claimable;
    }
    get claimed() {
      return !this.claimable && this.progress.complete;
    }
    clone() {
      return new Quest(this);
    }
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        reward: this.reward,
        progress: this.progress,
        claimable: this.claimable,
        claimed: this.claimed,
      };
    }
  }
  function isQuest(data) {
    return data instanceof Quest;
  }
  function getId(element) {
    return element.querySelector('[name="questId"]')?.value ?? element.querySelector('[data-i18n-custom^="quest"]')?.dataset.i18nCustom;
  }

  const quests = new Map();
  let fetching = false;
  function getQuests() {
    return [...quests.values()];
  }
  function update$2(data, { callback, event = true }) {
    const previous = getQuests().map((q) => q.clone());
    $(data).find('.questTable progress').parentsUntil('tbody', 'tr').each((_, el) => {
      const id = getId(el);
      if (!id) return;
      if (quests.has(id)) {
        quests.get(id).update(el);
      } else {
        quests.set(id, new Quest(el));
      }
    });
    const updated = getQuests();
    if (event) eventManager.emit('questProgress', updated, previous);
    if (typeof callback === 'function') {
      callback({
        quests: updated,
        previous,
      });
    }
  }
  function fetch$1(callback, event = true) {
    if (fetching) return;
    fetching = true;
    axios.get('/Quests').then((response) => {
      fetching = false;
      update$2(response.data, { callback, event });
    }).catch((error) => {
      fetching = false;
      console.error(error);
      if (typeof callback === 'function') callback({ error });
    });
  }
  eventManager.on(':load:Quests', () => {
    update$2(document, { event: false });
  });
  eventManager.on('getVictory getDefeat', fetch$1);

  const setting$u = register$4({
    name: 'Disable Quest Toast',
    key: 'underscript.disable.questNotifications',
    page: 'Game',
    category: 'Notifications',
  });
  onPage('Game', () => {
    if (setting$u.value()) return;
    function setup(results) {
      const cache = new Map(results.map((q) => [q.id, q.clone()]));
      eventManager.once('questProgress', updateQuests);
      function updateQuests(quests) {
        const changes = quests.filter((quest) => {
          if (quest.claimed) return false;
          const previous = cache.get(quest.id);
          return previous && quest.progress.compare(previous.progress);
        }).sort((a, b) => b.claimable - a.claimable);
        if (!changes.length) return;
        const message = (() => {
          const lines = [];
          let completed = true;
          changes.forEach((e, i) => {
            if (!i && e.claimable) {
              lines.push('### Completed');
            } else if (completed && !e.claimable) {
              completed = false;
              if (i) lines.push('\n');
              lines.push('### Progression');
            }
            lines.push(`- ${e.name} (+${e.progress.compare(cache.get(e.id).progress)})`);
          });
          return lines.join('\n');
        })();
        toast$6({
          title: 'Quest Progress!',
          text: `${message}\nClick to go to Quests page`,
          onClose: () => {
            location.href = '/Quests';
          },
        });
      }
    }
    fetch$1(({ quests }) => quests && setup(quests), false);
  });

  eventManager.once('getReconnection connect', () => {
    let playing = false;
    global('music').addEventListener('play', () => {
      playing = true;
    });
    function restoreSound() {
      if (playing || value('gameMusicDisabled')) return;
      global('music').play();
    }
    document.addEventListener('click', restoreSound, { once: true, passive: true });
  });

  const setting$t = register$4({
    name: 'Disable Screen Shake',
    key: 'underscript.disable.rumble',
    options: ['Never', 'Always', 'Spectate'],
    type: 'select',
    page: 'Game',
  });
  compound('GameStart', ':preload', function rumble() {
    const spectating = onPage('Spectate');
    globalSet('shakeScreen', function shakeScreen(...args) {
      if (!disabled()) this.super(...args);
    });
    function disabled() {
      switch (setting$t.value()) {
        case 'Spectate': return spectating;
        case 'Always': return true;
        default: return false;
      }
    }
  });

  const setting$s = register$4({
    name: 'Disable Result Toast',
    key: 'underscript.disable.resultToast',
    page: 'Game',
    category: 'Notifications',
  });
  eventManager.on('getResult:before', function resultToast() {
    if (setting$s.value()) return;
    globalSet('finish', true);
    this.canceled = true;
    const toast = {
      title: 'Game Finished',
      text: 'Return Home',
      buttons: {
        className: 'skiptranslate',
        text: '🏠',
      },
      css: {
        'font-family': 'inherit',
        button: { background: 'rgb(0, 0, 20)' },
      },
      onClose: () => {
        document.location.href = '/';
      },
    };
    toast$6(toast);
  });

  const baseVolumeSettings = { type: 'slider', page: 'Audio', max: 0.5, step: 0.01, default: 0.2, reset: true };
  let active$1 = false;
  function updateVolume(key, volume) {
    const audio = global(key, { throws: false });
    if (!(audio instanceof Audio)) return;
    audio.volume = volume;
  }
  const enable = register$4({
    name: 'Enable Audio Override',
    key: 'underscript.audio.override',
    default: true,
    page: 'Audio',
    note: 'Disabling this disables all other Audio settings!',
  });
  const aprilFoolsMusic = register$4({
    name: 'Enable April Fools Music',
    key: 'underscript.audio.override.aprilFools',
    default: true,
    hidden: () => !isApril() || isSoftDisabled(),
    page: 'Audio',
  });
  const bgmEnabled = register$4({
    name: 'Enable BGM',
    key: 'underscript.audio.bgm',
    default: () => !value('gameMusicDisabled'),
    page: 'Audio',
    note: 'This setting overrides the game setting!',
    onChange(val) {
      if (!active$1) return;
      if (val) {
        overrideMusic(global('numBackground'));
      } else {
        pauseMusic();
      }
    },
  });
  const bgmVolume = register$4({
    ...baseVolumeSettings,
    name: 'BGM volume',
    key: 'underscript.audio.bgm.volume',
    default: 0.1,
    onChange(val) {
      updateVolume('music', val);
    },
  });
  const resultEnabled = register$4({
    name: 'Enable result music',
    key: 'underscript.audio.result',
    default: () => !value('gameMusicDisabled'),
    page: 'Audio',
    note: 'This setting overrides the game setting!',
  });
  const resultVolume = register$4({
    ...baseVolumeSettings,
    name: 'Result volume',
    key: 'underscript.audio.result.volume',
  });
  const soundEnabled = register$4({
    name: 'Enable SFX',
    key: 'underscript.audio.sfx',
    default: () => !value('gameSoundsDisabled'),
    page: 'Audio',
    note: 'This setting overrides the game setting!',
  });
  const soundVolume = register$4({
    ...baseVolumeSettings,
    name: 'SFX volume',
    key: 'underscript.audio.sfx.volume',
  });
  const jingleEnabled = register$4({
    name: 'Enable card jingles',
    key: 'underscript.audio.jingle',
    default: () => !value('gameSoundsDisabled'),
    page: 'Audio',
    note: 'This setting overrides the game setting!',
  });
  const jingleVolume = register$4({
    ...baseVolumeSettings,
    name: 'Card jingle volume',
    key: 'underscript.audio.jingle.volume',
    onChange(val) {
      updateVolume('jingle', val);
    },
  });
  function pauseMusic() {
    [global('music'), global('jingle')]
      .forEach((audio) => audio.pause());
  }
  function enableAprilFools() {
    return isApril() && aprilFoolsMusic.value() && !isSoftDisabled();
  }
  function musicPath() {
    return enableAprilFools() ? AUDIO : 'musics';
  }
  function overrideResult(name) {
    const data = { name, origin: name };
    const event = eventManager.cancelable.emit('playMusic', data);
    if (!resultEnabled.value() || !data.name || event.canceled) return;
    pauseMusic();
    if (!enable.value()) {
      this.super(data.name, resultVolume.value());
      return;
    }
    createAudio(`/${musicPath()}/${data.name}.ogg`, {
      volume: resultVolume.value(),
      repeat: true,
      set: 'music',
    });
  }
  function overrideMusic(name) {
    const data = { name, origin: name };
    const event = eventManager.cancelable.emit('playBackgroundMusic', data);
    if (!bgmEnabled.value() || !data.name || event.canceled) return;
    pauseMusic();
    if (!enable.value()) {
      this.super(data.name, bgmVolume.value());
      return;
    }
    createAudio(`/${musicPath()}/themes/${data.name}.ogg`, {
      volume: bgmVolume.value(),
      repeat: true,
      set: 'music',
    });
  }
  function overrideSound(name) {
    const data = { name, origin: name };
    const event = eventManager.cancelable.emit('playSound', data);
    if (!soundEnabled.value() || !data.name || event.canceled) return;
    if (!enable.value()) {
      this.super(data.name, soundVolume.value());
      return;
    }
    createAudio(`/sounds/${data.name}.wav`, {
      volume: soundVolume.value(),
      set: 'audio',
    });
  }
  function overrideJingle(name = '') {
    const data = { name, origin: name };
    const event = eventManager.cancelable.emit('playJingle', data);
    if (!jingleEnabled.value() || !data.name || event.canceled) return;
    pauseMusic();
    if (!enable.value()) {
      this.super(data.name, jingleVolume.value());
      return;
    }
    createAudio(`/${musicPath()}/cards/${data.name.replace(/ /g, '_')}.ogg`, {
      volume: jingleVolume.value(),
      set: 'jingle',
      listener: global('jingleEnd'),
    });
  }
  function createAudio(path, {
    volume = 0.2,
    repeat = false,
    set = '',
    listener,
    play = true,
  }) {
    const audio = new Audio(path);
    audio.volume = volume;
    audio.loop = repeat;
    if (listener) {
      audio.addEventListener('ended', listener, false);
    }
    if (set) globalSet(set, audio);
    if (play) audio.play();
    return audio;
  }
  eventManager.on(':preload', () => {
    if (typeof window.playMusic !== 'function') return;
    active$1 = true;
    globalSet('playMusic', overrideResult);
    globalSet('playBackgroundMusic', overrideMusic);
    globalSet('playSound', overrideSound);
    globalSet('playJingle', overrideJingle);
  });

  onPage('Game', () => {
    eventManager.on('jQuery', () => {
      $(document).off('keyup');
    });
    function canSurrender() {
      return global('turn') >= 5;
    }
    addButton({
      text: Translation.Menu('surrender'),
      enabled: canSurrender,
      top: true,
      note: () => {
        if (!canSurrender()) {
          return Translation.Menu('surrender.note');
        }
        return undefined;
      },
      action: () => {
        const socket = global('socketGame');
        if (socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ action: 'surrender' }));
      },
    });
  });

  const tag = register$4({
    name: 'Highlight <span class="opponent">opponents</span> in chat',
    key: 'underscript.tag.opponent',
    default: true,
    page: 'Chat',
  });
  style.add('.opponent { color: #d94f41 !important; }');
  eventManager.on('PlayingGame', function tagOpponent() {
    let toast;
    function processMessage(message, room) {
      if (message.user.id === global('opponentId') && tag.value()) {
        if (!toast) {
          toast = infoToast('<span class="opponent">Opponents</span> are now highlighted in chat.', 'underscript.notice.highlighting.opponent', '1');
        }
        $(`#${room} #message-${message.id} .chat-user`).addClass('opponent');
        if (message.me) {
          $(`#${room} #message-${message.id} .chat-message`).addClass('opponent');
        }
      }
    }
    eventManager.on('Chat:getHistory', (data) => {
      JSON.parse(data.history).forEach((message) => {
        processMessage(message, data.room);
      });
    });
    eventManager.on('Chat:getMessage', function tagFriends(data) {
      processMessage(JSON.parse(data.chatMessage), data.room);
    });
  });

  const setting$r = register$4({
    name: Translation.Setting('gamelist'),
    key: 'underscript.disable.adjustSpectateView',
    refresh: () => onPage(''),
    category: Translation.CATEGORY_HOME,
  });
  eventManager.on(':load:', () => {
    if (setting$r.value()) return;
    const spectate = $('#liste');
    const tbody = spectate.find('tbody');
    const footer = $('.mainContent footer');
    function doAdjustment() {
      tbody.css({
        height: 'auto',
        'max-height': `${footer.offset().top - spectate.offset().top}px`,
      });
    }
    $('.mainContent > br').remove();
    doAdjustment();
    $(window).on('resize.script', doAdjustment);
  });

  const setting$q = register$4({
    name: Translation.Setting('gamelist.refresh'),
    key: 'undercards.disable.lobbyRefresh',
    default: false,
    category: Translation.CATEGORY_HOME,
    onChange(val) {
      onPage('', setup$1);
    },
  });
  let id;
  let refreshing = false;
  function clear$1() {
    if (id) {
      clearTimeout(id);
      id = null;
    }
  }
  function refresh$1() {
    clear$1();
    if (refreshing || document.visibilityState === 'hidden' || setting$q.value()) return;
    refreshing = true;
    axios.get('/').then((response) => {
      const data = decode$1($(response.data));
      const list = data.find('#liste');
      const live = $('#liste');
      live.find('tbody').html(translate(list.find('tbody')).html());
      live.prev('p').html(translate(list.prev()).html());
      eventManager.emit('Home:Refresh');
    }).catch((e) => {
      debugToast(`Index: ${e.message}`);
    }).then(() => {
      refreshing = false;
      setup$1();
    });
  }
  function setup$1(delay = 10000) {
    clear$1();
    id = setTimeout(refresh$1, delay);
  }
  onPage('', function refreshGameList() {
    document.addEventListener('visibilitychange', refresh$1);
    setup$1();
    const text = Translation.Toast('gamelist.refresh');
    infoToast(text, 'underscript.notice.refreshIndex', '1');
  });

  function cleanData(prefix, ...except) {
    for (let i = localStorage.length; i > 0; i--) {
      const key = localStorage.key(i - 1);
      if (key.startsWith(prefix) && !except.includes(key) && !except.includes(key.substring(prefix.length))) {
        localStorage.removeItem(key);
      }
    }
  }

  const setting$p = register$4({
    name: Translation.Setting('game.season'),
    key: 'underscript.season.disable',
    refresh: () => onPage(''),
    category: Translation.CATEGORY_HOME,
  });
  eventManager.on(':preload:', () => {
    if (setting$p.value()) return;
    document.querySelectorAll('.infoIndex').forEach((el) => {
      const patch = el.querySelector('[data-i18n-custom="home-patch-message"]');
      if (!patch) return;
      const element = $(el);
      const version = patch.dataset.i18nArgs;
      el.remove();
      const prefix = 'underscript.season.dismissed.';
      const key = `${prefix}${version}`;
      cleanData(prefix, key);
      eventManager.on('underscript:ready', () => {
        const translateElement = global('translateElement');
        element.find('[data-i18n-custom],[data-i18n]').each((i, e) => translateElement($(e)));
        const value = element.text();
        if (localStorage.getItem(key) === value) return;
        dismissable({
          key,
          text: element.html(),
          title: Translation.Toast('game.update'),
          value,
        });
      });
    });
  });

  hotkeys.push(new Hotkey('Open Menu', () => {
    if (typeof BootstrapDialog !== 'undefined' && length(BootstrapDialog.dialogs)) {
      return;
    }
    if (isOpen$1()) {
      close();
    } else {
      open$4();
    }
  }, {
    keys: ['Escape'],
  }));

  onPage('Hub', () => {
    style.add('.container { display: flex; flex-wrap: wrap; }');
  });

  style.add(
    '.missingArt { color: yellow; }',
    '.missing { color: orange; }',
    '.missingDT { color: red; }',
  );
  function init$3() {
    eventManager.on('ShowPage', (page) => thing(page * 10));
    dismissable({
      title: Translation.INFO,
      text: `The import arrow is colored to symbolize <span class="missingDT">missing DT(s)</span>, <span class="missing">missing card(s)</span>, and <span class="missingArt">missing artifact(s)</span>`,
      key: 'underscript.notice.hubImport',
      value: '2',
    });
  }
  function thing(start) {
    const pages = global('pages');
    for (let i = start; i < start + 10 && i < pages.length; i++) {
      check(pages[i]);
    }
  }
  function check({ code, id }) {
    const checkArt = global('ownArtifactHub');
    const deck = JSON.parse(atob(code));
    const allCards = toObject(global('allCards'));
    const missingCards = getMissingCards(deck.cardIds);
    const missingDT = missingCards.some((i) => allCards[i].rarity === ' ');
    const missingCard = missingCards.length > 0;
    const missingArt = deck.artifactIds.filter((art) => !checkArt(art));
    $(`#hub-deck-${id} .show-button`)
      .toggleClass('missingArt', missingArt.length > 0)
      .toggleClass('missing', missingCard)
      .toggleClass('missingDT', missingDT);
    missingArt.forEach((i) => {
      $(`#hub-deck-${id} .hubDeckArtifacts span[onclick$="(${i});"] img`)
        .toggleClass('notOwnedArtifact', true);
    });
  }
  function getMissingCards(ids = []) {
    const collection = toObject(global('collection').filter(({ id }) => ids.includes(id)));
    return ids.filter((id) => {
      const card = collection[id];
      if (!card) {
        return true;
      }
      const ret = card.quantity <= 0;
      card.quantity -= 1;
      return ret;
    });
  }
  function toObject(cards = []) {
    return cards.reduce((o, card) => {
      const exists = o[card.id];
      if (exists) {
        exists.quantity += card.quantity;
      } else {
        o[card.id] = { ...card };
      }
      return o;
    }, {});
  }
  eventManager.on(':preload:Hub', init$3);

  let showFriends = false;
  let ready = 0;
  const friendRanks = [];
  let pageNumber = -1;
  let btn;
  eventManager.once('Rankings:init', init$2);
  eventManager.once('Chat:Connected', () => {
    if (onPage('leaderboard')) init$2();
  });
  function toggle$4() {
    showFriends = !showFriends;
    localStorage.removeItem('rankedLeaderboardPage');
    global('setupLeaderboard')();
    if (btn) {
      btn.classList.toggle('active', showFriends);
    }
  }
  function init$2() {
    if (ready === -1) return;
    ready += 1;
    if (ready !== 2) return;
    ready = -1;
    style.add('#navButtons > .active > .glyphicon-user { color: orange; }');
    globalSet('getMaxPage', function getMaxPage() {
      if (showFriends) return Math.floor((friendRanks.length - 1) / global('maxDisplayPage'));
      return this.super();
    });
    eventManager.on('preShowPage', function showPage(page) {
      if (showFriends) {
        show(page);
        this.canceled = true;
      }
    });
    globalSet('getUserPageNum', function getUserPageNum() {
      if (showFriends) return pageNumber;
      return this.super();
    });
    btn = document.createElement('button');
    btn.classList.add('btn', 'btn-primary');
    btn.addEventListener('click', toggle$4);
    btn.innerHTML = '<span class="glyphicon glyphicon-user green"></span>';
    document.querySelectorAll('button.btn-lg').forEach((el) => el.classList.remove('btn-lg'));
    document.querySelector('#navButtons').append(btn);
    tip('Toggle friend rankings', btn);
    const leaderboard = global('leaderboard');
    const selfId = global('sessionIdUser');
    const selfIndex = leaderboard.findIndex(({ id }) => id === selfId);
    if (selfIndex >= 0) {
      pageNumber = Math.floor(selfIndex / global('maxDisplayPage'));
      global('userPageNumbers').push(pageNumber);
    }
    const friends = global('selfFriends');
    friendRanks.push(...leaderboard
      .filter(({ id }) => id === selfId || friends.some(({ id: uid }) => id === uid))
      .map((i) => leaderboard.indexOf(i)));
  }
  function show(page = 0) {
    $('.leaderboardSlot').remove();
    $('#btnSelf').prop('disabled', true);
    $('#btnNext').prop('disabled', page === global('getMaxPage')());
    const addSlot = global('addLeaderboardSlot');
    const max = global('maxDisplayPage');
    const start = page * max;
    friendRanks
      .slice(start, start + max)
      .forEach((row) => addSlot(row));
  }

  eventManager.on('jQuery', () => {
    $.fn.random = function random() {
      const i = Math.floor(Math.random() * this.length);
      return $(this[i]);
    };
  });

  const category = Translation.CATEGORY_HOME;
  const bundle = register$4({
    name: Translation.Setting('toast.bundle'),
    key: 'underscript.toast.bundle',
    default: true,
    refresh: () => onPage(''),
    category,
  });
  const skin = register$4({
    name: Translation.Setting('toast.skins'),
    key: 'underscript.toast.skins',
    default: true,
    refresh: () => onPage(''),
    category,
  });
  const emotes = register$4({
    name: Translation.Setting('toast.emotes'),
    key: 'underscript.toast.emotes',
    default: true,
    refresh: () => onPage(''),
    category,
  });
  const quest = register$4({
    name: Translation.Setting('toast.pass'),
    key: 'underscript.toast.quests',
    default: true,
    refresh: () => onPage(''),
    category,
  });
  const card = register$4({
    name: Translation.Setting('toast.cards'),
    key: 'underscript.toast.cards',
    default: true,
    refresh: () => onPage(''),
    category,
  });
  eventManager.on(':preload:', function toasts() {
    if (bundle.value()) toast$1('bundle');
    if (skin.value()) toast$1('skins');
    if (emotes.value()) toast$1('emotes');
    if (quest.value()) toast$1('pass');
    if (card.value()) toast$1('card');
  });
  function toast$1(type) {
    const names = [];
    const links = [];
    const sType = selector(type);
    [...document.querySelectorAll(`td a[href="${sType}"] img, p a[href="${sType}"] img, p img[class*="${sType}"]`)].forEach((el) => {
      names.push(imageName(el.src));
      let a = el.parentElement;
      while (a.parentElement !== a && a.nodeName !== 'TD' && a.nodeName !== 'P') a = a.parentElement;
      links.push(a.innerHTML);
      a.remove();
    });
    const prefix = `underscript.dismiss.${type}.`;
    const key = `${prefix}${names.join(',')}`;
    cleanData(prefix, key);
    if (value(key) || !links.length) return;
    dismissable({
      key,
      text: links.join('').replace(/\n/g, ''),
      title: title(type, links.length > 1),
    });
  }
  function title(type, plural = false) {
    switch (type) {
      case 'bundle':
      case 'skins':
      case 'emotes':
      case 'pass':
      case 'card': return Translation.Toast(`new.${type}`).withArgs(plural + 1);
      default: throw new Error(`Unknown Type: ${type}`);
    }
  }
  function selector(type) {
    switch (type) {
      case 'bundle': return 'Bundle';
      case 'skins': return 'CardSkinsShop';
      case 'emotes': return 'CosmeticsShop';
      case 'pass': return 'Quests';
      case 'card': return 'card-preview';
      default: throw new Error(`Unknown Type: ${type}`);
    }
  }
  function imageName(src) {
    return src.substring(src.lastIndexOf('/') + 1, src.lastIndexOf('.'));
  }

  eventManager.on(':load', () => {
    addMenuButton(`Leaderboard+`, 'https://ucprojects.github.io/Leaderboard/');
  });

  const disable$1 = register$4({
    name: Translation.Setting('page.select'),
    key: 'underscript.disable.pageselect',
  });
  const select = document.createElement('select');
  select.value = 0;
  select.id = 'selectPage';
  select.onchange = () => {
    changePage(select.value);
    if (onPage('leaderboard')) {
      eventManager.emit('Rankings:selectPage', select.value);
    }
  };
  function init$1() {
    const maxPage = global('getMaxPage')();
    if (maxPage - 1 === select.length) return;
    const local = $(select).empty();
    for (let i = 0; i <= maxPage; i++) {
      local.append(`<option value="${i}">${i + 1}</option>`);
    }
    select.value = global('currentPage');
  }
  function changePage(page) {
    select.value = page;
    if (typeof page !== 'number') page = parseInt(page, 10);
    globalSet('currentPage', page);
    global('showPage')(page);
    $('#btnNext').prop('disabled', page === global('getMaxPage')());
    $('#btnPrevious').prop('disabled', page === 0);
  }
  eventManager.on(':preload', () => {
    globalSet('showPage', function showPage(page) {
      if (!eventManager.cancelable.emit('preShowPage', page).canceled) {
        this.super(page);
      }
      eventManager.emit('ShowPage', page);
    }, { throws: false });
    if (disable$1.value() || !global('getMaxPage', { throws: false })) return;
    $('#currentPage').after(select).hide();
    globalSet('applyFilters', function applyFilters(...args) {
      this.super(...args);
      sleep().then(init$1);
    }, { throws: false });
    globalSet('setupLeaderboard', function setupLeaderboard(...args) {
      this.super(...args);
      sleep().then(() => {
        init$1();
        eventManager.emit('Rankings:init');
      });
    }, { throws: false });
    eventManager.on('ShowPage', (page) => {
      select.value = page;
    });
  });

  function set(type, value, replace = true) {
    if (history.state &&
      hasOwn(history.state, type) &&
      history.state[type] === value) return;
    const func = replace && !userLast() ? history.replaceState : history.pushState;
    const o = {};
    o[type] = value;
    func.call(history, o, document.title, `?${type}=${value}`);
  }
  function load$2({ page, user } = {}) {
    if (user) {
      $('#searchInput').val(user).submit();
    } else if (page !== undefined) {
      changePage(page);
    }
  }
  function getData() {
    const params = new URLSearchParams(location.search);
    return Object.fromEntries(params.entries());
  }
  function userLast() {
    return history.state && history.state.user;
  }
  if (onPage('leaderboard')) {
    const data = getData();
    const skip = VarStore(true);
    let replacePage;
    window.addEventListener('popstate', () => {
      if (!history.state) return;
      if (document.readyState === 'complete') load$2(history.state);
      else eventManager.on(':preload', () => debug('!!!pop unready'), load$2(history.state));
    });
    eventManager.on('Rankings:selectPage', () => {
      replacePage = false;
    });
    eventManager.on('Rankings:init', () => load$2(data));
    eventManager.on(':preload', () => {
      eventManager.on('ShowPage', function showPage(page) {
        if (skip.get()) return;
        set('page', page, replacePage);
        replacePage = undefined;
      });
      globalSet('findUserRow', function findUserRow(user) {
        const row = this.super(user);
        skip.set(row !== -1);
        set('user', user, false);
        return row;
      });
    });
    eventManager.on('Rankings:selectPage', () => {
      replacePage = false;
    });
  }

  const toasts$1 = {};
  eventManager.on(':preload:leaderboard', () => {
    globalSet('findUserRow', function findUserRow(user) {
      const row = this.super(user);
      if (row === -1) {
        if (!toasts$1[user] || !toasts$1[user].exists()) {
          toasts$1[user] = toast$6({
            title: 'Not ranked',
            text: `Unfortunately ${user} has not qualified to be ranked, or the user does not exist.`,
          });
        }
      }
      return row;
    });
  });

  const crafting = onPage('Crafting');
  const decks = onPage('Decks');
  const filters = [
    function templateFilter(card, removed) {
      return removed;
    },
  ];
  filters.shift();
  const base = {
    onChange: () => applyLook(),
    category: Translation.Setting('category.filter'),
    page: 'Library',
    default: true,
  };
  const setting$o = register$4({
    ...base,
    default: false,
    name: Translation.Setting('filter.disable'),
    key: 'underscript.deck.filter.disable',
  });
  const tribe = register$4({
    ...base,
    name: Translation.Setting('filter.tribe'),
    key: 'underscript.deck.filter.tribe',
  });
  const owned = register$4({
    ...base,
    name: Translation.Setting('filter.collection'),
    key: 'underscript.deck.filter.collection',
  });
  const shiny = register$4({
    ...base,
    name: Translation.Setting('filter.shiny'),
    key: 'underscript.deck.filter.shiny',
    options: () => {
      const { key } = Translation.Setting('filter.shiny.option');
      const options = getTranslationArray(key);
      return ['Never (default)', 'Deck', 'Always'].map((val, i) => [
        options[i],
        val,
      ]);
    },
    default: 'Deck',
  });
  style.add(
    '#collectionType { margin-bottom: 10px; }',
    '.filter input+* {  opacity: 0.4; }',
    '.filter input:checked+* {  opacity: 1; }',
    '.filter input:disabled, .filter input:disabled+* { display: none; }',
  );
  function applyLook(refresh = decks || crafting) {
    $('input[onchange^="applyFilters();"]').parent().parent().toggleClass('filter', !setting$o.value());
    if (crafting && !setting$o.value()) {
      $('input[rarity]:checked').prop('checked', false);
    }
    if (setting$o.value()) {
      $('#allTribeInput').parent().remove();
    } else if (!$('#allTribeInput').length) {
      $('#monsterInput').parent().before(allTribeButton(), ' ');
    }
    $('#allTribeInput').prop('disabled', !tribe.value());
    const allCardsElement = $('[data-i18n="[html]crafting-all-cards"]');
    if (setting$o.value() || !owned.value()) {
      $('#collectionType').remove();
      allCardsElement.removeClass('invisible');
    } else if (!$('#collectionType').length) {
      eventManager.on('underscript:ready', () => {
        allCardsElement.addClass('invisible')
          .after(ownSelect());
      });
    }
    if (!$('#shinyInput').length) {
      $('#utyInput').parent().after(shinyButton());
    }
    $('#shinyInput').prop('disabled', mergeShiny());
    if (refresh) {
      global('applyFilters')();
      global('showPage')(0);
    }
  }
  eventManager.on(':preload:Decks :preload:Crafting', () => {
    applyLook(false);
    globalSet('isRemoved', function newFilter(card) {
      if (setting$o.value()) return this.super(card);
      const results = new Map();
      return filters.reduce((removed, func) => {
        if (typeof func !== 'function') return removed;
        const val = func.call(this, card, removed, Object.fromEntries(results));
        const key = func.displayName || func.name;
        if (typeof val === 'boolean') {
          results.set(key, val !== removed);
          return val;
        }
        results.set(key, null);
        return removed;
      }, false);
    });
  });
  function mergeShiny() {
    return shiny.value() === 'Always' || (decks && shiny.value() === 'Deck');
  }
  function allTribeButton() {
    return $(`
  <label>
    <input type="checkbox" id="allTribeInput" onchange="applyFilters(); showPage(currentPage);">
    <img src="images/tribes/ALL.png">
  </label>`);
  }
  function shinyButton() {
    return $(`
  <label>
    <input type="checkbox" id="shinyInput" onchange="applyFilters(); showPage(currentPage);">
    <span class="rainbowText">S</span>
  </label>`);
  }
  function ownSelect() {
    return $(`
  <select id="collectionType" onchange="applyFilters(); showPage(0);">
    <option value="all">${Translation.Vanilla('crafting-all-cards')}</option>
    <option value="owned">${Translation.General('cards.owned')}</option>
    <option value="unowned">${Translation.General('cards.unowned')}</option>
    <option value="maxed">${Translation.General('cards.maxed')}</option>
    <option value="surplus">${Translation.General('cards.surplus')}</option>
    <option value="craftable">${Translation.General('cards.craftable')}</option>
  </select>
  `);
  }
  filters.push(
    Priority.FIRST,
    function shiny(card, removed) {
      if (removed) return null;
      if (mergeShiny()) return false;
      return card.shiny !== $('#shinyInput').prop('checked');
    },
    function rarity(card, removed) {
      if (removed) return null;
      const rarities = $('.rarityInput:checked').map(function getRarity() {
        return this.getAttribute('rarity');
      }).get();
      return rarities.length > 0 && !rarities.includes(card.rarity);
    },
    function type(card, removed) {
      if (removed) return null;
      const monster = $('#monsterInput').prop('checked');
      const spell = $('#spellInput').prop('checked');
      const cardType = monster ? 0 : 1;
      return monster !== spell && card.typeCard !== cardType;
    },
    function extension(card, removed) {
      if (removed) return null;
      const extensions = [];
      if ($('#undertaleInput').prop('checked')) {
        extensions.push('BASE');
      }
      if ($('#deltaruneInput').prop('checked')) {
        extensions.push('DELTARUNE');
      }
      if ($('#utyInput').prop('checked')) {
        extensions.push('UTY');
      }
      return extensions.length > 0 && !extensions.includes(card.extension);
    },
    function search(card, removed) {
      if (removed) return null;
      const text = $('#searchInput').val().toLowerCase();
      if (!text.length) return false;
      function includes(dirty) {
        return dirty.replace(/(<.*?>)/g, '').toLowerCase().includes(text);
      }
      extractImageName(true);
      const result = (
        !includes($.i18n(`card-name-${card.id}`, 1)) &&
        !includes($.i18n(`card-${card.id}`)) &&
        !(card.soul?.name && includes($.i18n(`soul-${card.soul.name.toLowerCase().replace(/_/g, '-')}`))) &&
        !card.tribes.some((t) => includes($.i18n(`tribe-${t.toLowerCase().replace(/_/g, '-')}`)))
      );
      extractImageName(false);
      return result;
    },
    Priority.HIGHEST,
    Priority.HIGH,
    crafting && function baseGenFilter(card, removed) {
      if (removed || $('.rarityInput:checked').length) return null;
      return ['BASE', 'TOKEN'].includes(card.rarity);
    },
    function tribeFilter(card, removed) {
      if (removed || !tribe.value()) return null;
      return $('#allTribeInput').prop('checked') && !card.tribes.length;
    },
    crafting && function ownedFilter(card, removed) {
      if (removed || !owned.value()) return null;
      switch ($('#collectionType').val()) {
        case 'owned': return !card.quantity;
        case 'unowned': return card.quantity > 0;
        case 'maxed': return card.quantity < max$1(card.rarity);
        case 'surplus': return card.quantity <= max$1(card.rarity);
        case 'craftable': return card.quantity >= max$1(card.rarity);
        case 'all':
        default: return false;
      }
    },
    Priority.NORMAL,
    Priority.LOW,
    Priority.LOWEST,
    Priority.LAST,
  );

  const setting$n = register$4({
    key: 'underscript.library.hidebuttons',
    name: Translation.Setting('filter.trim'),
    options() {
      const { key } = Translation.Setting('filter.trim.option');
      const array = getTranslationArray(key);
      return ['Always', 'Deck', 'Crafting', 'Never'].map(
        (val, i) => [array[i], val],
      );
    },
    page: 'Library',
    category: Translation.Setting('category.filter'),
    onChange: refresh,
  });
  const styles = style.add();
  function apply() {
    switch (setting$n.value()) {
      case 'Always': return decks || crafting;
      case 'Deck': return decks;
      case 'Crafting': return crafting;
      case 'Never':
      default: return false;
    }
  }
  function refresh() {
    if (apply()) {
      styles.replace(
        '.filter input { display: none; }',
        '.filter input+* { margin: 0 2px; opacity: 0.2; }',
        '.filter .rainbowText { padding: 0px 5px; font-size: 22px; }',
      );
    } else {
      styles.remove();
    }
  }
  eventManager.on(':preload:Decks :preload:Crafting', refresh);

  const name = Translation.Setting('custom.friends');
  const setting$m = register$4({
    name,
    key: 'underscript.custom.friendsOnly',
    note: Translation.Setting('custom.friends.note'),
    page: 'Lobby',
    category: Translation.CATEGORY_CUSTOM,
  });
  const container = document.createElement('span');
  let flag = setting$m.value();
  function init() {
    $(container)
      .append($(`<input id="friends" type="checkbox">`).prop('checked', flag).on('change', () => {
        flag = !flag;
      }))
      .append(' ', $('<label for="friends">').text('Friends only'));
    $('#state2 span.opponent').parent().after(container);
    eventManager.on('underscript:ready', () => {
      $('label[for="friends"]').text(name);
    });
  }
  function joined({ username }) {
    if (this.canceled || !flag || isFriend(username)) return;
    debug(`Kicked: ${username}`);
    errorToast({
      title: Translation.Toast('custom.ban'),
      text: Translation.Toast('custom.ban.user').withArgs(username),
    });
    this.canceled = true;
    global('banUser')();
  }
  eventManager.on('enterCustom', init);
  eventManager.on('preCustom:getPlayerJoined', joined);

  const setting$l = register$4({
    name: Translation.Setting('library.scrollwheel'),
    key: 'underscript.disable.scrolling',
    refresh: onPage('Decks') || onPage('Crafting'),
    page: 'Library',
    category: Translation.CATEGORY_HOTKEYS,
  });
  eventManager.on(':preload:Decks :preload:Crafting', function scrollwheelLoaded() {
    globalSet('onload', function onload() {
      this.super?.();
      if (setting$l.value()) $('#collection').off('mousewheel DOMMouseScroll');
    });
  });

  eventManager.on(':load:GamesList', () => {
    let toast = infoToast({
      text: Translation.Toast('custom.enter'),
      onClose: (reason) => {
        toast = null;
      },
    }, 'underscript.notice.customGame', '1');
    $('#state1 button:contains(Create)').on('mouseup.script', () => {
      $(window).one('shown.bs.modal', () => {
        const input = $('.bootstrap-dialog-message input');
        if (!input.length) return;
        $(input[0]).focus();
        input.on('keydown.script', (e) => {
          if (e.key === 'Enter') {
            toast?.close('processed');
            e.preventDefault();
            $('.bootstrap-dialog-footer-buttons button:first').trigger('click');
          }
        });
      });
    });
  });

  onPage('Play', () => {
    const title = document.title;
    compound('getWaitingQueue', 'underscript:ready', function updateTitle() {
      if (title !== document.title) return;
      document.title = `Undercards - ${Translation.General('match.found')}`;
    });
    eventManager.on('getLeaveQueue', function restoreTitle() {
      document.title = title;
    });
  });

  onPage('Play', setup);
  let waiting = true;
  function setup() {
    eventManager.on('socketOpen', (socket) => {
      socket.addEventListener('close', announce);
      globalSet('onbeforeunload', function onbeforeunload() {
        socket.removeEventListener('close', announce);
        this.super();
      });
    });
    eventManager.on('Play:Message', (data) => {
      switch (data.action) {
        case 'getLeaveQueue':
          waiting = true;
          break;
        default:
          waiting = false;
      }
    });
  }
  function announce() {
    if (waiting) {
      eventManager.emit('closeQueues', 'Disconnected from queue. Please refresh page.');
    }
    errorToast({
      name: 'An Error Occurred',
      message: 'You have disconnected from the queue, please refresh the page.',
    });
  }

  const active = () => document.visibilityState === 'visible';

  onPage('Play', () => {
    compound('getWaitingQueue', 'underscript:ready', function gameFound() {
      if (!active()) {
        notify$2(Translation.General('match.found'));
      }
    });
  });

  const volume = register$4({
    name: Translation.Setting('volume.match.found'),
    key: 'underscript.volume.gameFound',
    type: 'slider',
    default: 0.3,
    max: 1,
    step: 0.1,
    page: 'Lobby',
    reset: true,
  });
  eventManager.on('getWaitingQueue', function lowerVolume() {
    global('audioQueue').volume = parseFloat(volume.value());
  });

  onPage('GamesList', function keepAlive() {
    setInterval(() => {
      const socket = global('socket');
      if (socket.readyState !== WebSocket.OPEN) return;
      socket.send(JSON.stringify({ ping: 'pong' }));
    }, 5000);
  });

  const setting$k = register$4({
    name: Translation.Setting('minigame'),
    key: 'underscript.minigames.disabled',
    page: 'Lobby',
    refresh: onPage('Play'),
    category: Translation.CATEGORY_MINIGAMES,
  });
  compound(':preload:Play', 'pre:getJoinedQueue', () => {
    if (setting$k.value() && global('miniGameLoaded')) globalSet('miniGameLoaded', false);
  });

  const unpause = VarStore(false);
  eventManager.on('Chat:focused', () => {
    const game = global('game', {
      throws: false,
    });
    if (game && game.input) {
      if (!game.paused) {
        game.paused = unpause.set(true);
      }
      const keyboard = game.input.keyboard;
      if (keyboard.disableGlobalCapture) {
        keyboard.disableGlobalCapture();
      } else {
        keyboard.enabled = false;
      }
    }
  });
  eventManager.on('Chat:unfocused', () => {
    const game = global('game', {
      throws: false,
    });
    if (game && game.input) {
      if (unpause.get()) {
        game.paused = false;
      }
      const keyboard = game.input.keyboard;
      if (keyboard.enableGlobalCapture) {
        keyboard.enableGlobalCapture();
      } else {
        keyboard.enabled = true;
      }
    }
  });

  onPage('Play', () => {
    let queues;
    let disable = true;
    let restarting = false;
    eventManager.on('jQuery', function onPlay() {
      restarting = $('p.infoMessage[data-i18n-custom="header-info-restart"]').length !== 0;
      if (disable || restarting) {
        queues = $('#standard-mode, #ranked-mode, button.btn.btn-primary');
        closeQueues(restarting ? 'Joining is disabled due to server restart.' : 'Waiting for connection to be established.');
      }
    });
    eventManager.on('socketOpen', checkButton);
    eventManager.on('closeQueues', closeQueues);
    const timeout = setTimeout(() => {
      checkButton();
      applyMessage('Auto enabled buttons, connection was not detected.');
    }, 10000);
    function checkButton() {
      disable = false;
      clearTimeout(timeout);
      if (queues && !restarting) {
        queues.off('.script');
        queues.toggleClass('closed', false);
        hide$1();
      }
    }
    function closeQueues(message) {
      queues.toggleClass('closed', true);
      applyMessage(message);
    }
    function applyMessage(message) {
      queues
        .on('mouseenter.script', show$2(message))
        .on('mouseleave.script', () => hide$1());
    }
  });

  wrap(() => {
    if (!(crafting || decks)) return;
    const name = 'addFilter';
    let counter = 0;
    function mod(plugin) {
      return (filter, priority = Priority.NORMAL) => {
        const fixedPriority = Priority.get(priority);
        if (!fixedPriority) throw new Error('Must pass a valid priority');
        if (typeof filter !== 'function') throw new Error('Must pass a function');
        counter += 1;
        const functionName = filter.displayName || filter.name || `filter${counter}`;
        function customFilter(...args) {
          try {
            return filter.call(this, ...args);
          } catch (e) {
            plugin.logger.error(`Failed to apply filter [${functionName}]`, e);
          }
          return undefined;
        }
        customFilter.displayName = `${plugin.name}:${functionName}`;
        const index = filters.indexOf(fixedPriority);
        filters.splice(index, 0, customFilter);
      };
    }
    registerModule(name, mod);
  });

  wrap(() => {
    const name = 'addStyle';
    function mod(plugin) {
      const style = newStyle(plugin);
      return (...styles) => style.add(...styles);
    }
    registerModule(name, mod);
  });

  const setting$j = register$4({
    name: Translation.Setting('minigame.wasd'),
    key: 'underscript.minigames.wasd',
    page: 'Lobby',
    category: Translation.CATEGORY_MINIGAMES,
  });
  function onCreate() {
    this.super();
    if (!setting$j.value()) return;
    const game = global('game');
    const KeyCode = global('Phaser').KeyCode;
    const cursors = game.input.keyboard.addKeys({ up: KeyCode.W, down: KeyCode.S, left: KeyCode.A, right: KeyCode.D });
    globalSet('cursors', cursors);
  }
  onPage('Play', () => {
    let bound = false;
    eventManager.on('pre:getJoinedQueue', () => {
      if (bound) return;
      const create = global('create', { throws: false });
      if (!create) return;
      globalSet('create', onCreate);
      bound = true;
    });
  });

  wrap(() => {
    const options = ['cancelable', 'canceled', 'singleton', 'async'];
    const name = 'events';
    function mod(plugin) {
      function log(error, event, args, meta) {
        capturePluginError(plugin, error, {
          args,
          ...meta,
        });
        plugin.logger.error(`Event error (${event}):\n`, error, '\n', JSON.stringify({
          args,
          event: meta,
        }));
      }
      function wrapper(fn, event) {
        function listener(...args) {
          try {
            const val = fn.call(this, ...args);
            if (val instanceof Promise) {
              return val.catch((error) => log(error, event, args, this));
            }
            return val;
          } catch (e) {
            log(e, event, args, this);
          }
          return undefined;
        }
        listener.plugin = plugin;
        return listener;
      }
      const obj = {
        ...eventManager,
        compound(...events) {
          const fn = events.pop();
          if (typeof fn !== 'function') throw new Error('Must pass a function');
          if (!events.length) throw new Error('Must pass events');
          if (events.length === 1) throw new Error('Use `events.on` for single events');
          compound(...events, wrapper(fn, `Compound[${events.join(';')}]`));
        },
        on(event, fn) {
          if (typeof fn !== 'function') throw new Error('Must pass a function');
          if (event.split(' ').includes(':loaded')) {
            plugin.logger.warn('Event manager: `:loaded` is deprecated, ask author to update to `:preload`!');
          }
          eventManager.on.call(obj, event, wrapper(fn, event));
        },
        emit(...args) {
          return eventManager.emit(...args);
        },
      };
      options.forEach((key) => {
        Object.defineProperty(obj.emit, key, {
          get: () => {
            eventManager[key];
            return obj.emit;
          },
        });
      });
      return Object.freeze(obj);
    }
    registerModule(name, mod);
  });

  class PluginHotkey extends Hotkey {
    constructor(plugin, hotkey) {
      super();
      this.plugin = plugin;
      this.hotkey = hotkey;
    }
    get name() {
      return `[${this.hotkey.name}]`;
    }
    get keys() {
      return this.hotkey.keys;
    }
    get clicks() {
      return this.hotkey.clicks;
    }
    run(...args) {
      try {
        return this.hotkey.run(...args);
      } catch (e) {
        capturePluginError(this.plugin, e, {
          hotkey: this.name,
        });
        this.plugin.logger.error(`Hotkey${this.name || ''}${e instanceof Error ? '' : ' Error:'}`, e);
      }
      return undefined;
    }
  }
  wrap(() => {
    const name = 'hotkey';
    function mod(plugin) {
      const registry = new Map();
      return {
        register(hotkey) {
          validate(hotkey);
          if (registry.has(hotkey)) return;
          const wrapper = new PluginHotkey(plugin, hotkey);
          registry.set(hotkey, wrapper);
          hotkeys.push(wrapper);
        },
        unregister(hotkey) {
          validate(hotkey);
          const wrapper = registry.get(hotkey);
          if (!wrapper) return;
          registry.delete(hotkey);
          hotkeys.splice(hotkeys.indexOf(wrapper), 1);
        },
      };
    }
    registerModule(name, mod);
  });
  function validate(hotkey) {
    if (!(hotkey instanceof Hotkey)) throw new Error('Not valid hotkey');
  }

  wrap(() => {
    const name = 'quests';
    function mod(plugin) {
      return {
        getQuests,
        update(event = false) {
          return new Promise((res, rej) => {
            fetch$1(({ error, ...rest }) => {
              if (error) {
                rej(error);
              } else {
                res({ ...rest });
              }
            }, event);
          });
        },
      };
    }
    registerModule(name, mod);
  });

  wrap(() => {
    const name = 'logger';
    function mod(plugin) {
      const obj = {};
      ['info', 'error', 'log', 'warn', 'debug'].forEach((key) => {
        obj[key] = (...args) => console[key](
          `[%c${plugin.name}%c/${key}]`,
          'color: #436ad6;',
          'color: inherit;',
          ...args,
        );
      });
      return Object.freeze(obj);
    }
    registerModule(name, mod);
  });

  wrap(() => {
    const name = 'settings';
    function add(plugin) {
      const prefix = `underscript.plugin.${plugin.name}`;
      return (data = {}) => {
        if (!data.key) throw new Error('Key must be provided');
        const setting = {
          ...data,
          key: `${prefix}.${data.key}`,
          name: data.name || data.key,
          page: plugin,
        };
        return register$4(setting);
      };
    }
    function mod(plugin) {
      const obj = {
        add: add(plugin),
        on: (...args) => on(...args),
        open: () => open$3(plugin),
        isOpen: () => isOpen(),
        addType(type) {
          if (!(type instanceof SettingType)) {
            plugin.logger.error('SettingType: Attempted to register object of:', typeof type);
            return;
          }
          if (!type.name.startsWith(`${plugin.name}:`)) {
            type.name = `${plugin.name}:${type.name}`;
          }
          registerType(type, plugin.addStyle);
        },
        value(key) {
          if (!exists(key)) return undefined;
          return value(key);
        },
      };
      return () => Object.freeze(obj);
    }
    registerModule(name, mod);
  });

  const text = Translation.Setting('update.plugin');
  const setting$i = register$4({
    name: text,
    key: 'underscript.disable.plugins.update',
    category: 'Plugins',
  });
  wrap(() => {
    const name = 'updater';
    function mod(plugin) {
      if (!plugin.version) return undefined;
      let updater = false;
      const update = plugin.settings().add({
        name: text,
        key: 'plugin.update',
        default: () => setting$i.value(),
        disabled: () => setting$i.value(),
        hidden: () => !updater,
      });
      setting$i.on(() => update.refresh());
      Object.defineProperty(plugin, 'canUpdate', {
        get: () => updater && !setting$i.value() && !update.value(),
      });
      return (data = {}) => {
        if (!['string', 'object'].includes(typeof data)) throw new Error();
        if (updater) throw new Error('Already registered');
        const {
          downloadURL = typeof data === 'string' ? data : undefined,
          updateURL,
        } = data;
        updater = registerPlugin(plugin, { downloadURL, updateURL });
        return () => {
          updater();
          updater = false;
        };
      };
    }
    registerModule(name, mod, 'events', 'settings');
  });

  wrap(() => {
    const questSelector = 'input[type="submit"][value="Claim"]:not(:disabled)';
    function collectQuests() {
      const quests = document.querySelectorAll(questSelector);
      if (quests.length) {
        const block = getBlock();
        const table = block.querySelector('.questTable tbody');
        quests.forEach((quest) => {
          const row = quest.parentElement.parentElement.parentElement.cloneNode(true);
          if (row.childElementCount !== 4) {
            row.firstElementChild.remove();
          }
          table.append(row);
        });
        document.querySelector('#event-list').after(block);
      }
    }
    eventManager.on(':preload:Quests', collectQuests);
    function getBlock() {
      const block = document.createElement('div');
      const h3 = document.createElement('h3');
      h3.classList.add('event-title');
      h3.textContent = 'Completed Quests';
      eventManager.on('underscript:ready', () => {
        h3.textContent = Translation.General('quest.pending');
      });
      const table = document.createElement('table');
      table.classList.add('table', 'questTable');
      const tbody = document.createElement('tbody');
      table.append(tbody);
      block.append(h3, table);
      return block;
    }
  });

  wrap(function localTime() {
    compound(':load:Quests', 'underscript:ready', updateTime);
    function updateTime() {
      const time = luxon.DateTime.fromObject({ hour: 6, minute: 0, zone: 'Europe/Paris' })
        .toLocal()
        .toLocaleString(luxon.DateTime.TIME_SIMPLE);
      const text = Translation.General('time.local').translate(time);
      $('[data-i18n="[html]quests-reset"],[data-i18n="[html]quests-day"]').append(` (${text})`);
    }
  });

  wrap(() => {
    const name = 'toast';
    function pluginToast(plugin, data) {
      const toast = typeof data === 'object' ? { ...data } : { text: data };
      toast.footer = `${plugin.name} • via UnderScript`;
      if (toast.error) return errorToast(toast);
      return toast$6(toast);
    }
    function mod(plugin) {
      return (data) => pluginToast(plugin, data);
    }
    registerModule(name, mod);
  });

  eventManager.on(':preload:Quests', () => {
    style.add('.dailyMissed { background: repeating-linear-gradient(45deg, red, black 0.488em); }');
    const date = luxon.DateTime.now().setZone('Europe/Paris');
    $('#viewDaily + table td:not(.dailyClaimed)').slice(date.daysInMonth - date.day).addClass('dailyMissed');
  });

  wrap(() => {
    function buyPacks({
      type, count, gold,
    }) {
      const rawCost = document.querySelector(`#btn${gold ? '' : 'Ucp'}${type}Add`).nextElementSibling.textContent;
      const cost = Number(rawCost);
      if (gold) {
        const g = parseInt($('#golds').text(), 10);
        if (g < cost * count) {
          throw new Error('Not enough Gold');
        }
      } else {
        const ucp = parseInt($('#ucp').text(), 10);
        if (ucp < cost * count) {
          throw new Error('Not enough UCP');
        }
      }
      $.fx.off = true;
      const addPack = global('addPack');
      for (let i = 0; i < count; i++) {
        sleep(i * 10).then(() => {
          globalSet('canAdd', true);
          addPack(`add${type}Pack${gold ? '' : 'Ucp'}`, true);
        });
      }
      sleep(500).then(() => {
        $.fx.off = false;
      });
    }
    function getCount(e, cost, baseCost) {
      if (e.ctrlKey) return Math.floor(parseInt($(cost ? '#ucp' : '#golds').text(), 10) / baseCost);
      if (e.altKey) return 10;
      return 1;
    }
    eventManager.on(':preload:Packs', () => {
      const types = ['', 'DR', 'UTY'];
      types.forEach((type) => {
        ['', 'Ucp'].forEach((cost) => {
          const el = document.querySelector(`#btn${cost}${type}Add`);
          if (!el) return;
          el.onclick = null;
          el.addEventListener('click', (e) => {
            const price = Number(el.nextElementSibling.textContent);
            const count = getCount(e, cost, price);
            if (!count) return;
            const data = {
              count,
              type,
              gold: !cost,
            };
            if (cost && !e.shiftKey) {
              global('BootstrapDialog').show({
                title: `${Translation.PURCHASE}`,
                message: Translation.General('purchase.pack.cost').translate(count, count * price),
                buttons: [{
                  label: `${Translation.CONTINUE}`,
                  cssClass: 'btn-success',
                  action(diag) {
                    buyPacks(data);
                    diag.close();
                  },
                }, {
                  label: `${Translation.CANCEL}`,
                  cssClass: 'btn-danger',
                  action(diag) {
                    diag.close();
                  },
                }],
              });
            } else {
              buyPacks(data);
            }
          });
          eventManager.on('underscript:ready', () => {
            const { key } = Translation.General('purchase.pack.note');
            const array = [...getTranslationArray(key)];
            if (cost) {
              array.push(Translation.General('bypass.shift'));
            }
            $(el).hover(show$2(array.join('<br>')));
          });
        });
      });
      register$5('buyPacks', (count, { type = '', gold = true } = {}) => {
        if (!types.includes(type)) throw new Error(`Unsupported Pack: ${type}`);
        if (!Number.isInteger(count) || count < 1) throw new Error(`Count(${count}) must be a number`);
        buyPacks({
          type,
          count,
          gold: !!gold,
        });
      });
    });
  });

  const html = `<div class="col-sm-2">
  <div class="avatarGroup">
    <span class="avatar MYTHIC glyphicon glyphicon-random"></span>
  </div>
  <br>
  <br>
  <button class="btn btn-sm btn-primary">Random</button>
</div>`;

  const css = ".avatar.glyphicon-random {\n  width: 64px;\n  text-align: center;\n  margin: auto;\n  height: 64px;\n  padding-top: 24px;\n}";

  wrap(() => {
    function random() {
      $('input[name="changeAvatar"]').random().click();
    }
    eventManager.on(':preload:Avatars', () => {
      const wrapper = $(html);
      $('.avatarsList').prepend(wrapper);
      const button = wrapper.find('button');
      button.click(random);
      eventManager.on('underscript:ready', () => {
        button.text(Translation.General('random'));
      });
    });
    style.add(css);
  });

  wrap(() => {
    eventManager.on(':preload:CosmeticsShop', () => {
      $('form[action=CosmeticsShop] button')
        .hover(show$2(Translation.General('bypass.shift')), hide$1)
        .click(function click(e) {
          if (e.shiftKey) return;
          e.preventDefault();
          const form = $(e.currentTarget).parent();
          const parent = getParent(form);
          const image = parent.find('img')[0]?.outerHTML || '[Failed to detect image]';
          const cost = parent.find('span[class=ucp]:first').text();
          BootstrapDialog.show({
            title: `${Translation.PURCHASE}`,
            message: `<div style="overflow: hidden;">${image}</div> ${
            Translation.General('purchase.item.cost').translate(cost)
          }`,
            buttons: [{
              label: `${Translation.CONTINUE}`,
              cssClass: 'btn-success',
              action(diag) {
                form.submit();
                diag.close();
              },
            }, {
              label: `${Translation.CANCEL}`,
              cssClass: 'btn-danger',
              action(diag) {
                diag.close();
              },
            }],
          });
        });
    });
  });
  function getParent(form) {
    const table = $(form.parents('table, div')[0]);
    if (table.find('img').length) {
      return table;
    }
    return table.parent().parent();
  }

  const silent$1 = 'Yes (silent)';
  const disabled = 'No';
  const data$1 = [
    [Translation.Setting('streamer.option.1'), 'Yes'],
    [Translation.Setting('streamer.option.2'), silent$1],
    [Translation.Setting('streamer.option.3'), disabled],
  ];
  const mode = register$4({
    name: Translation.Setting('streamer'),
    key: 'underscript.streamer',
    note: Translation.Setting('streamer.note'),
    data: data$1,
    default: disabled,
    onChange: (val) => {
      if (val === disabled) {
        update$1(false);
      } else {
        dirty();
      }
    },
    type: 'select',
    category: Translation.CATEGORY_STREAMER,
  });
  const setting$h = register$4({
    key: 'underscript.streaming',
    hidden: true,
  });
  register$5('streamerMode', streaming);
  const ON = Translation.Menu('streamer.on');
  const OFF = Translation.Menu('streamer.off');
  addButton({
    text: () => (streaming() ? ON : OFF),
    hidden: () => mode.value() === disabled,
    action: () => update$1(!streaming()),
  });
  eventManager.on(':preload', alert);
  function alert() {
    if (!streaming() || mode.value() === silent$1) return;
    toast$6(Translation.Toast('streamer'));
  }
  function update$1(value) {
    setting$h.set(value);
    dirty();
    alert();
  }
  function streaming() {
    return setting$h.value();
  }

  eventManager.on(':preload:Settings', () => {
    if (!streaming()) return;
    text$1.contains(document.querySelectorAll('p'), 'Mail :').forEach((e) => {
      e.innerText = 'Mail : <hidden>';
    });
  });

  const busyMessage = ':me:is in do not disturb mode';
  const allow = 'Allow';
  const hide = 'Hide';
  const silent = 'Hide (silent)';
  const setting$g = register$4({
    name: 'Private Messages',
    key: 'underscript.streamer.pms',
    options: [allow, hide, silent],
    default: hide,
    category: 'Streamer Mode',
  });
  const toasts = {};
  eventManager.on('preChat:getPrivateMessage', function streamerMode(data) {
    if (!streaming() || data.open) return;
    const val = setting$g.value();
    if (val === allow) return;
    debug(data);
    const message = JSON.parse(data.chatMessage);
    const user = message.user;
    if (isMod(user)) return;
    this.canceled = true;
    const userId = user.id;
    const privateChats = global('privateChats');
    const history = privateChats[userId] || [];
    history.push(message);
    if (userId === global('selfId')) return;
    global('sendPrivateMessage')(busyMessage, `${userId}`);
    if (val === silent || toasts[userId]) return;
    toasts[userId] = toast$6({
      text: `Message from ${name$1(user)}`,
      buttons: [{
        css: buttonCSS,
        text: 'Open',
        className: 'dismiss',
        onclick: () => {
          open$1(user);
        },
      }],
      className: 'dismissable',
    });
  });
  eventManager.on(':unload', closeAll);
  function open$1(user) {
    const { id } = user;
    global('openPrivateRoom')(id, name$1(user).replace('\'', ''));
    delete toasts[id];
  }
  function closeAll() {
    each(toasts, (t) => t.close());
  }

  const formatNumber = (number, options) => Number(number).toLocaleString(undefined, options);

  onPage('Packs', async function quickOpenPack() {
    const collection = await getCollection();
    const results = {
      packs: 0,
      cards: [],
    };
    const status = {
      state: 'waiting',
      pack: '',
      original: 0,
      total: 0,
      remaining: 0,
      pending: 0,
      pingTimeout: 0,
      errors: 0,
    };
    const events = eventEmitter();
    let timeoutID;
    function setupPing(reset = true) {
      if (status.state === 'waiting') return;
      clearPing(reset);
      timeoutID = setTimeout(() => {
        status.pingTimeout += 1;
        if (status.pingTimeout > 10) {
          events.emit('cancel');
        }
        setupPing(false);
        events.emit('next');
      }, 200);
    }
    function clearPing(safe = true) {
      if (safe) status.pingTimeout = 0;
      if (timeoutID) clearTimeout(timeoutID);
      timeoutID = 0;
    }
    function open(pack, count) {
      status.pending = 0;
      const openPack = global('openPack');
      for (let i = 0; i < count; i++) {
        status.pending += 1;
        globalSet('canOpen', true);
        openPack(pack);
      }
    }
    function showCards() {
      const show = global('revealCard', 'show');
      $('.slot .cardBack').each((i, e) => { show(e, i); });
    }
    events.on('start', ({
      pack = '',
      count: amt = 0,
      offset = false,
    }) => {
      if (openingPacks()) return;
      results.packs = 0;
      results.cards = [];
      status.state = 'processing';
      status.pack = pack;
      status.total = amt;
      status.remaining = amt - offset;
      status.pending = 0;
      status.errors = 0;
      if (!offset) {
        events.emit('next');
      }
      setupPing();
    });
    let toast = blankToast();
    events.on('pack', (cards = []) => {
      status.pending -= 1;
      results.packs += 1;
      cards.forEach((card) => {
        const cCard = collection.find((c) => c.id === card.id && c.shiny === card.shiny);
        if (!cCard) {
          collection.push({
            ...card,
            quantity: 1,
          });
          card.new = true;
        }
      });
      results.cards.push(...cards);
      events.emit('next');
      setupPing();
    });
    events.on('next', () => {
      if (status.state === 'waiting') return;
      if (status.state === 'processing') {
        if (status.remaining > 0 && status.pending <= 0) {
          const count = Math.min(status.remaining, 5);
          status.remaining -= count;
          open(status.pack, count);
        }
        events.emit('update');
      }
      const notWaiting = status.pending <= 0;
      const finishedOpening = results.packs === status.total;
      const canceled = status.state === 'canceled';
      const timedout = canceled && status.pingTimeout;
      if (timedout || notWaiting && (finishedOpening || canceled)) {
        events.emit('finished');
      }
    });
    events.on('update', () => {
      if (toast.exists()) {
        toast.setText(`<progress value="${results.packs}" max="${status.total}"></progress>`);
      } else {
        toast = toast$6({
          title: `Opening ${formatNumber(status.total)} packs`,
          text: `<progress value="${results.packs}" max="${status.total}"></progress>`,
          className: 'dismissable',
          buttons: {
            text: 'Stop',
            className: 'dismiss',
            css: buttonCSS,
            onclick: (e) => {
              events.emit('cancel');
            },
          },
        });
      }
    });
    const rarity = ['DETERMINATION', 'LEGENDARY', 'EPIC', 'RARE', 'COMMON'];
    events.on('finished', () => {
      if (status.state === 'waiting') return;
      status.state = 'waiting';
      clearPing();
      $(`#nb${status.pack.substring(4, status.pack.length - 4)}Packs`).text(status.original - results.packs);
      const event = eventManager.cancelable.emit('openedPacks', {
        count: results.packs,
        cards: Object.freeze([...results.cards]),
      });
      if (!event.canceled) {
        const cardResults = {
          shiny: 0,
        };
        rarity.forEach((type) => {
          cardResults[type] = {};
        });
        results.cards.forEach((card) => {
          const r = cardResults[card.rarity];
          const c = r[card.name] = r[card.name] || { total: 0, shiny: 0, new: false };
          c.total += 1;
          if (card.new) c.new = true;
          if (card.shiny) {
            if (status.pack !== 'openShinyPack') {
              cardResults.shiny += 1;
            }
            c.shiny += 1;
          }
        });
        let limit = Math.min(Math.max(Math.floor(window.innerHeight / 38), 6), 26);
        rarity.forEach((key) => {
          if (!length(cardResults[key])) {
            limit += 1;
          }
        });
        let text = '';
        rarity.forEach((key) => {
          const cards = cardResults[key];
          const keys = Object.keys(cards);
          if (!keys.length) return;
          const buffer = [];
          let count = 0;
          let shiny = 0;
          if (keys.length > limit) keys.sort((a, b) => cards[b].new - cards[a].new);
          keys.forEach((name) => {
            const card = cards[name];
            count += card.total;
            shiny += card.shiny;
            if (limit) {
              limit -= 1;
              buffer.push(`${card.new ? `<span class="yellow">{${$.i18n('cosmetics-new')}}</span>` : ''}${card.shiny ? '<span class="yellow">S</span> ' : ''}${name}${card.total > 1 ? ` (${formatNumber(card.total)}${card.shiny ? `, ${card.shiny}` : ''})` : ''}${limit ? '' : '...'}`);
            }
          });
          text += `${key} (${count}${shiny ? `, ${shiny} shiny` : ''}):${buffer.length ? `\n- ${buffer.join('\n- ')}` : ' ...'}\n`;
        });
        const total = results.cards.length;
        toast$6({
          title: `Results: ${formatNumber(results.packs)} Packs${cardResults.shiny ? ` (${total % 4 ? `${formatNumber(total)}, ` : ''}${formatNumber(cardResults.shiny)} shiny)` : total % 4 ? ` (${formatNumber(total)})` : ''}`,
          text,
          css: { 'font-family': 'inherit' },
        });
        showCards();
      }
      toast.close();
    });
    events.on('cancel', () => {
      if (status.state === 'processing') {
        status.state = 'canceled';
        clearPing();
      }
    });
    events.on('error', (err) => {
      status.pending -= 1;
      setupPing();
      if (status.state !== 'processing') return;
      status.errors += 1;
      if (status.errors <= status.total * 3) {
        status.remaining += 1;
      }
    });
    let autoOpen = false;
    eventManager.on('BootstrapDialog:preshow', function cancel(dialog) {
      if (openingPacks() && dialog.getTitle() === $.i18n('dialog-error')) {
        this.canceled = true;
      }
    });
    eventManager.on('jQuery', () => {
      globalSet('translateFromServerJson', function override(message) {
        try {
          return this.super(message);
        } catch {
          return message;
        }
      });
      $(document).ajaxComplete((event, xhr, s) => {
        if (s.url !== 'PacksConfig' || !s.data) return;
        const data = xhr.responseJSON;
        const error = data.action === 'getError';
        if (data.action !== 'getCards' && !error) return;
        if (data.cards) {
          events.emit('pack', JSON.parse(data.cards));
        }
        if (openingPacks()) {
          if (data.status || error) {
            events.emit('error', data.message);
          }
        } else if (autoOpen && !data.status) {
          showCards();
        }
      });
      $('[id^="btnOpen"]').on('click.script', (event) => {
        autoOpen = event.ctrlKey;
        const type = $(event.target).prop('id').substring(7);
        const count = autoOpen ? 1 : parseInt($(`#nb${type}Packs`).text(), 10);
        if (event.shiftKey) {
          openPacks(type, count, 1);
          hide$1();
        } else if (count === 1) {
          hide$1();
        }
      }).on('mouseenter.script', show$2(`<span style="font-style: italic;">
        * CTRL Click to auto reveal one (1) pack<br />
        * Shift Click to auto open ALL packs
      </span>`)).on('mouseleave.script', hide$1);
    });
    function openingPacks() {
      return status.state !== 'waiting';
    }
    function openPacks(type, count, start = 0) {
      if (openingPacks()) return;
      const packs = parseInt($(`#nb${type}Packs`).text(), 10);
      count = Math.max(Math.min(count, packs), 0);
      if (count === 0) return;
      status.original = packs;
      events.emit('start', {
        pack: `open${type}Pack`,
        count,
        offset: start,
      });
    }
    const types = ['', 'DR', 'UTY', 'Shiny', 'Super', 'Final'];
    const packTypes = [Item.UT_PACK, Item.DR_PACK, Item.UTY_PACK, Item.SHINY_PACK, Item.SUPER_PACK, Item.FINAL_PACK];
    register$5('openPacks', (count, type = '') => {
      if (openingPacks()) throw new Error('Currently opening packs');
      if (type instanceof Item) {
        const index = packTypes.indexOf(type);
        if (index === -1) throw new Error(`Unsupported Item: ${type}`);
        openPacks(types[index], count);
        return;
      }
      if (!types.includes(type)) throw new Error(`Unsupported Pack: ${type}`);
      openPacks(type, count);
    });
    register$5('openingPacks', openingPacks);
  }, 'quickPacks');

  style.add(
    '.clickable { cursor: pointer; }',
    '.mainContent { margin-bottom: 55px; }',
  );

  eventManager.on(':preload', () => {
    const el = document.createElement('link');
    el.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    el.rel = 'stylesheet';
    document.head.append(el);
  });

  style.add(
    '.chat-message { overflow-wrap: break-word; }',
    '.chat-messages { user-select: text; }',
    '.chat-messages { height: calc(100% - 30px); }',
    '.chat-messages { min-height: 100px; }',
  );

  eventManager.on('translation:loaded', () => {
    const CLASSES = ['cost-color', 'atk-color', 'hp-color'];
    $.extend($.i18n.parser.emitter, {
      stats: (nodes) => CLASSES
        .slice(Math.max(0, 3 - nodes.length))
        .map((clazz, i) => nodes[i].replace(/\d+/, `<span class="${clazz}">$&</span>`))
        .join('/'),
    });
  });

  eventManager.on(':preload:Translate', () => {
    loadLanguages();
    globalSet('createTranslator', newTranslator);
    eventManager.on('ShowPage', newShowPage);
  });
  function newTranslator(translator) {
    return `<div id="preview"></div>${this.super(translator)}`;
  }
  function newShowPage() {
    const textarea = $('#translators textarea');
    const preview = $('#preview');
    textarea.on('input', () => {
      const text = textarea.val().trim();
      preview.html(text ? `${getPreview('decks-preview')}: ${getPreview(text)}` : '');
    });
  }
  function getPreview(id, locale = getLocale()) {
    return toLocale({
      locale,
      id,
      data: [1],
    });
  }
  function getLocale() {
    return document.querySelector('#selectLanguage').value.toLowerCase();
  }
  function loadLanguages() {
    const languages = {};
    const version = global('translateVersion');
    $('#selectLanguage option').each(function languageOption() {
      const lang = this.value.toLowerCase();
      languages[lang] = `/translation/${lang}.json?v=${version}`;
    });
    $.i18n().load(languages);
  }

  style.add(`
  #AlertToast {
    height: 0;
  }
  #AlertToast .dismissable > span {
    display: block;
    text-align: center;
  }
  #AlertToast .dismissable .dismiss {
    background-color: transparent;
    border: 1px solid #fff;
    display: block;
    font-family: DTM-Mono;
    font-size: 14px;
    margin: 5px auto;
    max-width: 80%;
    min-width: 160px;
    text-transform: capitalize;
  }
  #AlertToast .dismissable .dismiss:hover {
    opacity: 0.6;
  }
`);

  const changelog = {};
  const keys = {
    title: Translation.General('changelog'),
    text: Translation.Menu('changelog'),
    note: Translation.Menu('changelog.note'),
    loading: Translation.General('changelog.loading'),
    unavailable: Translation.General('changelog.unavailable'),
  };
  style.add(`
  .us-changelog h2 {
    font-size: 24px;
  }

  .us-changelog h3 {
    font-size: 20px;
  }

  extended {
    display: contents;
  }
`);
  function getMarkdown() {
    if (!changelog.markdown) {
      changelog.markdown = new showdown.Converter({
        noHeaderId: true,
        strikethrough: true,
        disableForced4SpacesIndentedSublists: true,
      });
    }
    return changelog.markdown;
  }
  function getAxios() {
    if (!changelog.axios) {
      changelog.axios = axios.create({ baseURL: 'https://unpkg.com/' });
    }
    return changelog.axios;
  }
  function open(message) {
    BootstrapDialog.show({
      message,
      title: `${keys.title}`,
      cssClass: 'mono us-changelog',
      buttons: [{
        label: `${Translation.CLOSE}`,
        action(self) {
          self.close();
        },
      }],
    });
  }
  function get(version = 'latest', short = false) {
    const cache = version.includes('.');
    const key = `${version}${short ? '_short' : ''}`;
    if (cache && changelog[key]) return Promise.resolve(changelog[key]);
    const extension = `underscript@${version}/changelog.md`;
    return getAxios().get(extension).then(({ data: text }) => {
      const first = text.indexOf(`\n## ${cache ? `Version ${version}` : ''}`);
      let end;
      if (!~first) throw new Error('Invalid Changelog');
      if (short) {
        const index = text.indexOf('\n## ', first + 1);
        if (index !== -1) end = index;
      }
      const parsedHTML = getMarkdown().makeHtml(text.substring(first, end).trim()).replace(/\r?\n/g, '');
      if (cache) changelog[key] = parsedHTML;
      return parsedHTML;
    });
  }
  function load$1(version = 'latest', short = false) {
    const container = $('<div>').text(keys.loading);
    open(container);
    get(version, short).catch((e) => {
      console.error(e);
      return `${keys.unavailable}`;
    }).then((m) => container.html(m));
  }
  addButton({
    text: keys.text,
    action() {
      load$1(scriptVersion === 'L' ? 'latest' : scriptVersion);
    },
    enabled() {
      return typeof BootstrapDialog !== 'undefined';
    },
    note() {
      if (!this.enabled()) {
        return keys.note;
      }
      return undefined;
    },
  });

  eventManager.on(':load', () => {
    addMenuButton(`<img src="images/social/discord.png" style="height: 16px;"> Discord`, 'https://discord.gg/D8DFvrU');
  });

  wrap(function patchNotes() {
    const setting = register$4({
      name: Translation.Setting('patches'),
      key: 'underscript.disable.patches',
    });
    const installed = register$4({
      key: 'underscript.update.installed',
      type: 'text',
      hidden: true,
      converter() {
        const key = `underscript.update.${scriptVersion}`;
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          return scriptVersion;
        }
        return undefined;
      },
    });
    if (
      setting.value() ||
      !scriptVersion.includes('.') ||
      installed.value() === scriptVersion
    ) return;
    style.add(`
    #AlertToast div.uschangelog span:nth-of-type(2) {
      max-height: 300px;
      overflow-y: auto;
      display: block;
    }

    #AlertToast div.uschangelog extended {
      display: none;
    }
  `);
    get(scriptVersion, true)
      .then((text) => eventManager.on('underscript:ready', () => notify(text)))
      .catch(noop);
    function notify(text) {
      toast$6({
        text,
        title: Translation.Toast('patch.notes'),
        footer: `v${scriptVersion}`,
        className: 'uschangelog',
        onClose() {
          installed.set(scriptVersion);
        },
      });
    }
  });

  const regex = /^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-(\d+))?$/;
  function parse(string = '') {
    const [
      _,
      major = 0,
      minor = 0,
      patch = 0,
      pre,
    ] = regex.exec(string) || [];
    return {
      major: parseInt(major, 10),
      minor: parseInt(minor, 10),
      patch: parseInt(patch, 10),
      pre: pre !== undefined ? parseInt(pre, 10) : undefined,
    };
  }
  function compare(to, from = scriptVersion) {
    if (from === 'L') return false;
    const h = parse(from);
    const d = parse(to);
    if (h.major === d.major) {
      if (h.minor === d.minor) {
        if (h.patch === d.patch) {
          if (h.pre === undefined && d.pre === undefined) {
            return undefined;
          }
          const noLongerPre = h.pre !== undefined && d.pre === undefined;
          return noLongerPre || h.pre < d.pre;
        }
        return h.patch < d.patch;
      }
      return h.minor < d.minor;
    }
    return h.major < d.major;
  }
  function emptyString(...args) {
    return args.some((arg) => typeof arg !== 'string' || !arg.trim());
  }
  register$5('semver', {
    isNewer: (ver, current) => {
      if (emptyString(ver)) throw new Error('Expected non-empty string');
      return compare(ver.trim(), current) === true;
    },
    atLeast: (ver, current) => {
      if (emptyString(ver)) throw new Error('Expected non-empty string');
      return compare(ver.trim(), current) !== false;
    },
    isOlder: (ver, current) => {
      if (emptyString(ver)) throw new Error('Expected non-empty string');
      return compare(ver.trim(), current) !== true;
    },
    compare: (newer, current) => {
      if (emptyString(newer, current)) throw new Error('Expected non-empty strings');
      return compare(newer.trim(), current.trim());
    },
  });

  const plugin = Plugin('UnderScript');

  wrap(() => {
    style.add(`
    #AlertToast h2,
    #AlertToast h3 {
      margin: 0;
      font-size: 20px;
    }

    #AlertToast h3 {
      font-size: 17px;
    }
  `);
    const checker = createParser({ updateURL: 'UCProjects/UnderScript' });
    const DEBUG = 'underscript.update.debug';
    let updateToast;
    function isNewer(data) {
      const version = scriptVersion;
      if (version === 'L' && !localStorage.getItem(DEBUG)) return false;
      if (version.includes('-')) return compare(data.newVersion, version);
      return data.newVersion !== version;
    }
    function compareAndToast(data) {
      if (!data || !isNewer(data)) {
        updateToast?.close('invalid');
        return false;
      }
      eventManager.once(':update:finished :update:force', () => {
        updateToast?.close('stale');
        if (data.announce) return;
        updateToast = toast$6({
          title: Translation.Toast('update.title'),
          text: Translation.Toast('update.text').withArgs(data.newVersion),
          className: 'dismissable',
          buttons: [{
            text: Translation.Toast('update'),
            className: 'dismiss',
            css: buttonCSS,
            onclick() {
              const url = data.url || `https://github.com/UCProjects/UnderScript/releases/download/${data.version}/undercards.user.js`;
              window.open(url, 'updateUserScript', 'noreferrer');
            },
          }],
        });
      });
      return true;
    }
    eventManager.on(':update', async (auto) => {
      if (!auto) {
        unregister(plugin);
      }
      try {
        const data = await checker.getUpdateData();
        const update = {
          url: await checker.getDownload(data),
          newVersion: await checker.getVersion(data),
          time: data.assets.find(({ name }) => name.endsWith('.user.js')).updated_at,
          announce: silent$3.value(),
          version: scriptVersion.includes('.') ? scriptVersion : undefined,
          plugin,
        };
        if (compareAndToast(update)) {
          register$3(update);
        }
      } catch (error) {
        debugToast(error);
      }
    });
    eventManager.on('underscript:ready', () => {
      compareAndToast(validate$1(plugin));
      eventManager.emit(':update:force');
    });
  });

  const setting$f = register$4({
    name: Translation.Setting('card.text.outline'),
    key: 'underscript.card.text.outline',
    page: 'Library',
    default: true,
    onChange: toggle$3,
    category: Translation.CATEGORY_OUTLINE,
  });
  const art$3 = VarStore();
  function toggle$3(add = setting$f.value()) {
    if (art$3.isSet()) {
      if (add) return;
      art$3.get().remove();
    }
    if (add) {
      art$3.set(style.add(
        '.card { text-shadow: -1px -1px black, 1px 1px black, -1px 1px black, 1px -1px black; }',
      ));
    }
  }
  eventManager.on(':preload', toggle$3);

  const argExtractor = {
    appendCardCardSkinShop: (...args) => args,
    appendCardFriendship: (_, ...args) => args,
    showCardHover: (...args) => args,
  };
  function getExtras(key, args = []) {
    const extractor = argExtractor[key];
    if (!extractor) return undefined;
    return extractor(...args);
  }

  const PREFIX = 'appendCard';
  const internal = eventEmitter();
  let event = PREFIX;
  let data = [];
  const extras = VarStore();
  internal.on('set', (e = PREFIX) => {
    event = e;
  }).on('pre', (...args) => {
    eventManager.emit(`pre:func:${event}`, ...args);
    if (event !== PREFIX) eventManager.emit(`pre:func:${PREFIX}`, ...args);
  }).on('post', (...args) => {
    if (event === PREFIX || !args.length) {
      const eventData = [
        ...data,
        ...args,
      ];
      if (eventData.length) {
        eventManager.emit(`func:${event}`, ...eventData);
        if (event !== PREFIX) eventManager.emit(`func:${PREFIX}`, ...eventData);
      }
      data = [];
      event = PREFIX;
    } else {
      data = args;
      if (extras.isSet()) data.push(...extras.value);
    }
  });
  eventManager.on(':preload', () => {
    const set = globalSet(PREFIX, function appendCard(card, container) {
      internal.emit('pre', card);
      const element = this.super(card, container);
      if (eventManager.emit(`${PREFIX}()`, { card, element, container }).ran) {
        console.warn(`'${PREFIX}()' is deprecated, please use 'func:${PREFIX}' instead`);
      }
      internal.emit('post', card, element);
      return element;
    }, {
      throws: false,
    });
    if (set === undefined) return;
    function override(key) {
      globalSet(key, function func(...args) {
        extras.value = getExtras(key, args);
        internal.emit('set', key);
        const ret = this.super(...args);
        internal.emit('post');
        return ret;
      });
    }
    const otherKeys = ['showCardHover'];
    each(window, (_, key = '') => {
      if (key !== PREFIX && key.startsWith(PREFIX) || otherKeys.includes(key)) {
        override(key);
      }
    });
  });

  const setting$e = register$4({
    name: Translation.Setting('card.tribe.outline'),
    key: 'underscript.card.tribe.outline',
    page: 'Library',
    default: true,
    onChange: toggle$2,
    category: Translation.CATEGORY_OUTLINE,
  });
  const art$2 = VarStore();
  function toggle$2(add = setting$e.value()) {
    if (art$2.isSet()) {
      if (add) return;
      art$2.get().remove();
    }
    if (add) {
      art$2.set(style.add(
        '.cardTribes .tribe { color: rgb(0, 0, 0); filter: drop-shadow(0px 0px) drop-shadow(0px 0px); }',
      ));
    }
  }
  eventManager.on(':preload', toggle$2);

  const setting$d = register$4({
    name: Translation.Setting('skins.basic'),
    key: 'underscript.hide.card-skins',
    page: 'Library',
    category: Translation.CATEGORY_CARD_SKINS,
  });
  function createCard$1(card) {
    const image = card.baseImage;
    if (setting$d.value() && image && image !== card.image) {
      card.typeSkin = 0;
      card.originalImage = card.image;
      card.image = image;
    }
    return this.super(card);
  }
  eventManager.on(':preload', () => {
    if (!window.createCard) return;
    globalSet('createCard', createCard$1);
  });

  const def = 'Breaking (Default)';
  const tran = 'Covered (Transparent)';
  const dis = 'Covered';
  const setting$c = register$4({
    name: Translation.Setting('skins.breaking'),
    key: 'underscript.hide.breaking-skin',
    options: () => {
      const { key } = Translation.Setting('skins.breaking.option');
      const options = getTranslationArray(key);
      return [def, tran, dis].map((val, i) => [
        options[i],
        val,
      ]);
    },
    page: 'Library',
    onChange: update,
    category: Translation.CATEGORY_CARD_SKINS,
    converter(value) {
      switch (value) {
        case '0': return def;
        case '1': return dis;
        default: return undefined;
      }
    },
  });
  const art$1 = VarStore();
  const type1 = 'rgb(0, 0, 0)';
  const type2 = 'rgba(0, 0, 0, 0.2)';
  function update(value) {
    if (art$1.isSet()) {
      art$1.get().remove();
    }
    if (value === def) return;
    const color = value === tran ? type2 : type1;
    art$1.set(style.add(
      `.breaking-skin .cardHeader, .breaking-skin .cardFooter { background-color: ${color}; }`,
      '.breaking-skin .cardImage { z-index: 1; }',
    ));
  }
  eventManager.on(':preload', () => {
    update(setting$c.value());
  });

  const setting$b = register$4({
    name: Translation.Setting('skins.full'),
    key: 'underscript.hide.full-skin',
    page: 'Library',
    onChange: toggle$1,
    category: Translation.CATEGORY_CARD_SKINS,
  });
  const art = VarStore();
  function toggle$1() {
    if (art.isSet()) {
      art.get().remove();
    } else {
      art.set(style.add(
        '.full-skin .cardHeader, .full-skin .cardFooter { background-color: rgb(0, 0, 0); }',
      ));
    }
  }
  eventManager.on(':preload', () => {
    if (setting$b.value()) toggle$1();
  });

  function wrapper(...rest) {
    this.super(...rest);
    $('#hover-card').click(function hoverCard() {
      $(this).remove();
    });
  }
  eventManager.on(':preload', () => {
    const options = {
      throws: false,
    };
    globalSet('displayCardDeck', wrapper, options);
    globalSet('displayCardHelp', wrapper, options);
  });

  style.add(
    '.navbar.navbar-default.sticky { position: sticky; top: 0; z-index: 10; -webkit-transform: translateZ(0); transform: translateZ(0); }',
  );
  const setting$a = register$4({
    name: Translation.Setting('header.sticky'),
    key: 'underscript.disable.header.scrolling',
    onChange: (to) => {
      toggle(!to);
    },
  });
  eventManager.on(':preload', () => {
    toggle(!setting$a.value());
  });
  function toggle(val) {
    if (onPage('Decks')) return;
    const el = document.querySelector('.navbar.navbar-default');
    if (!el) return;
    el.classList.toggle('sticky', val);
  }

  const setting$9 = register$4({
    name: Translation.Setting('card.name.english'),
    key: 'underscript.standardized.cardname',
  });
  function createCard(card, ...rest) {
    if (!setting$9.value() || $.i18n().locale === 'en') {
      return this.super(card, ...rest);
    }
    const c = $(this.super(card, ...rest));
    c.find('.cardName').text(toEnglish(`card-name-${card.fixedId}`, 1));
    return c[0].outerHTML;
  }
  eventManager.on(':preload', () => {
    if (!window.createCard || !$.i18n) return;
    globalSet('createCard', createCard);
  });

  eventManager.on('jQuery', () => {
    const text = `<li class="computerLink">
    <a href="https://undercard.feildmaster.com" target="_blank" rel="noreferrer" title="Card Editor">
      <img src="./images/cardBacks/BASECardDETERMINATION.png">
    </a>
  </li>`;
    const $text = $(text);
    $('a[data-i18n-title="footer-wiki"]').parent().after($text);
  });
  eventManager.on(':load', () => {
    const img = '<img src="./images/cardBacks/BASECardDETERMINATION.png" style="height: 16px;">';
    addMenuButton(`${img} Card Editor`, 'https://undercard.feildmaster.com');
  });

  const disable = register$4({
    name: Translation.Setting('page.jump'),
    key: 'underscript.disable.quickpages',
  });
  function ignoring(e) {
    const ignore = disable.value() || !e.ctrlKey;
    if (ignore && [0, global('getMaxPage')()].includes(global('currentPage'))) hide$1();
    return ignore;
  }
  function firstPage(e) {
    if (ignoring(e)) return;
    e.preventDefault();
    hide$1();
    setPage(0);
  }
  function lastPage(e) {
    if (ignoring(e)) return;
    e.preventDefault();
    hide$1();
    const page = global('getMaxPage')();
    setPage(page, page);
  }
  function setPage(page, max = global('getMaxPage')()) {
    global('showPage')(page);
    globalSet('currentPage', page);
    $('#currentPage').text(page + 1);
    $('#btnNext').prop('disabled', page === max);
    $('#btnPrevious').prop('disabled', page === 0);
  }
  eventManager.on(':preload', () => {
    if (!global('getMaxPage', { throws: false })) return;
    const next = $('#btnNext').on('click.script', lastPage);
    const prev = $('#btnPrevious').on('click.script', firstPage);
    eventManager.on('underscript:ready', () => {
      prev.hover(show$2(`${Translation.General('page.first')}`));
      next.hover(show$2(`${Translation.General('page.last')}`));
    });
  });

  const icons = {
    gold: 'Gold',
    dust: 'Dust<hr>Used to craft cards',
    pack: 'Undertale Pack',
    packPlus: 'Undertale Pack',
    drPack: 'Deltarune Pack',
    drPackPlus: 'Deltarune Pack',
    'shinyPack.gif': 'Shiny Pack<hr>All cards are shiny',
    'superPack.gif': 'Super Pack<hr>Contains: <ul><li>Common x1</li><li>Rare x1</li><li>Epic x1</li><li>Legendary x1</li></ul>',
    'finalPack.gif': 'Final Pack<hr>Contains: <ul><li>Rare x1</li><li>Epic x1</li><li>Legendary x1</li><li>Determination x1</li></ul>',
  };
  eventManager.on(':preload', () => {
    each(icons, (text, type) => {
      makeTip(`img[src="images/icons/${type}${!~type.indexOf('.') ? '.png' : ''}"]`, text);
    });
  });
  function makeTip(selector, content) {
    tippy(selector, {
      content,
      theme: 'undercards info',
      animateFill: false,
      a11y: false,
      ignoreAttributes: true,
    });
  }
  style.add(
    '.info-theme hr { margin: 5px 0; }',
    '.info-theme hr + * {text-align: left;}',
  );

  addButton({
    text: Translation.Menu('gamelog'),
    action() {
      window.location = './gameUpdates.jsp';
    },
  });

  wrap(() => {
    const setting = register$4({
      name: Translation.Setting('quest.highlight'),
      key: 'underscript.disable.questHighlight',
    });
    const clear = register$4({
      key: 'underscript.quest.clear',
      hidden: true,
    });
    const skip = register$4({
      key: 'underscript.quest.skip',
      hidden: true,
    });
    if (setting.value()) return;
    const questSelector = 'input[type="submit"][value="Claim"]:not(:disabled)';
    eventManager.on(':preload', () => $el.removeClass(document.querySelectorAll('.yellowLink[href="Quests"]'), 'yellowLink'));
    style.add('a.highlightQuest {color: gold !important;}');
    function highlightQuest() {
      $('a[href="Quests"]').toggleClass('highlightQuest', clear.value());
    }
    function clearHighlight() {
      clear.set(null);
    }
    function updateQuests(quests) {
      const completed = quests.filter((q) => q.claimable);
      if (completed.length) {
        clear.set(true);
      } else {
        clearHighlight();
      }
      highlightQuest();
    }
    if (onPage('') && !clear.value() && !skip.value()) {
      fetch$1(({ quests }) => quests && updateQuests(quests), false);
    }
    eventManager.on('questProgress', updateQuests);
    eventManager.on('logout', clearHighlight);
    eventManager.on('jQuery', function questHighlight() {
      const quests = $('a[href="Quests"]');
      if (quests.length) {
        if (quests.text().includes('(0)')) {
          skip.set(true);
          clearHighlight();
        } else {
          skip.set(null);
        }
      }
      if (onPage('Quests') && !$(questSelector).length) {
        clearHighlight();
      }
      highlightQuest();
    });
  });

  eventManager.on(':preload', () => {
    const fetchAllCards = global('fetchAllCards', { throws: false });
    if (!fetchAllCards) return;
    addButton({
      text: Translation.Menu('reload'),
      action() {
        localStorage.removeItem('cardsVersion');
        fetchAllCards();
      },
    });
  });

  [
    {
      name: Translation.Vanilla('settings-language'),
      key: 'language',
      options() {
        return ['en', 'fr', 'ru', 'es', 'pt', 'cn', 'it', 'pl', 'de']
          .map((locale) => [
            Translation.Vanilla(`chat-${locale}`),
            locale,
          ]);
      },
      refresh: true,
      remove: false,
    },
    {
      name: Translation.Setting('vanilla.chat.rainbow'),
      key: 'chatRainbowDisabled',
      category: 'Chat',
    },
    {
      name: Translation.Setting('vanilla.chat.sound'),
      key: 'chatSoundsDisabled',
      category: 'Chat',
    },
    {
      name: Translation.Setting('vanilla.chat.avatar'),
      key: 'chatAvatarsDisabled',
      category: 'Chat',
    },
    {
      name: Translation.Setting('vanilla.card.shiny'),
      key: 'gameShinyDisabled',
      category: 'Game',
    },
    {
      name: Translation.Setting('vanilla.game.music'),
      key: 'gameMusicDisabled',
      category: 'Game',
    },
    {
      name: Translation.Setting('vanilla.game.sound'),
      key: 'gameSoundsDisabled',
      category: 'Game',
    },
    {
      name: Translation.Setting('vanilla.game.profile'),
      key: 'profileSkinsDisabled',
      category: 'Game',
    },
    {
      name: Translation.Setting('vanilla.game.emote'),
      key: 'gameEmotesDisabled',
      category: 'Game',
    },
    {
      name: Translation.Setting('vanilla.card.skin'),
      key: 'breakingDisabled',
      category: 'Game',
    },
    {
      name: Translation.Setting('vanilla.game.shake'),
      key: 'shakeDisabled',
      category: 'Animation',
    },
    {
      name: Translation.Setting('vanilla.game.stats'),
      key: 'statsDisabled',
      category: 'Animation',
    },
    {
      name: Translation.Setting('vanilla.game.vfx'),
      key: 'vfxDisabled',
      category: 'Animation',
    },
    { key: 'deckBeginnerInfo' },
    { key: 'firstVisit' },
    { key: 'playDeck' },
  ].forEach((setting) => {
    const { name, category } = setting;
    const refresh = category === 'Game' || category === 'Animation' ?
      () => onPage('Game') || onPage('gameSpectating') :
      undefined;
    register$4({
      refresh,
      remove: true,
      ...setting,
      page: 'game',
      hidden: name === undefined,
    });
  });
  setDisplayName('Undercards', 'game');

  eventManager.on(':load', () => {
    [
      global('tippy', { throws: false }),
      tippy,
    ].forEach((tip) => {
      if (!tip) return;
      const defaults = tip.setDefaultProps || tip.setDefaults;
      defaults({
        theme: 'undercards',
        animateFill: false,
      });
    });
  });

  const command$1 = 'scroll';
  const setting$8 = register$4({
    name: Translation.DISABLE_COMMAND_SETTING.withArgs(command$1),
    key: `underscript.command.${command$1}`,
    note: `/${command$1}`,
    page: 'Chat',
    category: Translation.CATEGORY_CHAT_COMMAND,
  });
  eventManager.on('Chat:command', function process(data) {
    debug(data);
    if (this.canceled || data.command !== command$1 || setting$8.value()) return;
    debug('Scroll command');
    this.canceled = true;
    global('scroll')($(`#${data.room}`), true);
  });

  const command = 'spectate';
  const setting$7 = register$4({
    name: Translation.DISABLE_COMMAND_SETTING.withArgs(command),
    key: 'underscript.command.spectate',
    note: '/spectate [text (optional)]<br/>Output:<br/>You vs Enemy: url [text]',
    page: 'Chat',
    category: Translation.CATEGORY_CHAT_COMMAND,
  });
  let toast;
  eventManager.on('Chat:command', function spectateCommand(data) {
    if (this.canceled || data.command !== command || setting$7.value()) return;
    if (typeof gameId === 'undefined' || global('finish')) {
      this.canceled = true;
      return;
    }
    if (toast) toast.close();
    data.output = `${$('#yourUsername').text()} vs ${$('#enemyUsername').text()}: ${location.origin}/Spectate?gameId=${global('gameId')}&playerId=${global('userId')}${data.text ? ` - ${data.text}` : ''}`;
  });
  eventManager.on('GameStart', () => {
    toast = infoToast({
      text: 'You can send a spectate URL in chat by typing /spectate',
      onClose() {
        toast = null;
      },
    }, 'underscript.notice.spectatecommand', '1');
  });

  eventManager.on('ChatDetected', function goodGame() {
    const list = ['good game', 'gg', 'Good Game', 'Good game'];
    const command = 'gg';
    const setting = register$4({
      name: Translation.DISABLE_COMMAND_SETTING.withArgs(command),
      key: `underscript.command.${command}`,
      note: `/${command}`,
      page: 'Chat',
      category: Translation.CATEGORY_CHAT_COMMAND,
    });
    if (!onPage('Game')) return;
    eventManager.on('Chat:command', function ggCommand(data) {
      if (this.canceled || data.command !== command || setting.value()) return;
      if (typeof gameId === 'undefined') {
        this.canceled = true;
        return;
      }
      data.output = `@${text$1.get(document.querySelector('#enemyUsername'))} ${list[rand(list.length)]}`;
    });
  });

  const BUTTON = Object.freeze({
    Left: 0,
    Middle: 1,
    Right: 2,
    Back: 3,
    Forward: 4,
  });
  mod.utils.mouse = BUTTON;

  const fullDisable = register$4({
    name: Translation.Setting('endTurn'),
    key: 'underscript.disable.endTurn',
    page: 'Game',
    category: Translation.CATEGORY_HOTKEYS,
    onChange() {
      spaceDisable.refresh();
      mouseDisable.refresh();
    },
  });
  const spaceDisable = register$4({
    name: Translation.Setting('endTurn.keyboard'),
    key: 'underscript.disable.endTurn.space',
    disabled: () => fullDisable.value(),
    page: 'Game',
    category: Translation.CATEGORY_HOTKEYS,
  });
  const mouseDisable = register$4({
    name: Translation.Setting('endTurn.mouse'),
    key: 'underscript.disable.endTurn.middleClick',
    disabled: () => fullDisable.value(),
    page: 'Game',
    category: Translation.CATEGORY_HOTKEYS,
  });
  eventManager.on('PlayingGame', function bindHotkeys() {
    const hotkey = new Hotkey('End turn', (e) => {
      if (fullDisable.value()) return;
      const disabled = e instanceof KeyboardEvent ? spaceDisable.value() : mouseDisable.value();
      if (disabled) return;
      if (!$(e.target).is('#endTurnBtn') && global('userTurn') === global('userId')) global('endTurn')();
    }, {
      keys: ' ',
      clicks: BUTTON.Middle,
    });
    hotkeys.push(hotkey);
    if (!fullDisable.value() && !spaceDisable.value() && !mouseDisable.value()) {
      infoToast({
        text: 'You can skip turns with <code>space</code> and <code>middle mouse button</code>. (These can be disabled in settings)',
        className: 'dismissable',
        buttons: {
          text: Translation.General('settings'),
          className: 'dismiss',
          css: buttonCSS,
          onclick: (_) => {
            fullDisable.show(true);
          },
        },
      }, 'underscript.notice.endTurn.hotkeys', '1');
    }
  });

  const setting$6 = register$4({
    name: Translation.Setting('craft.border'),
    key: 'underscript.disable.craftingborder',
    onChange: () => {
      if (onPage('Crafting')) {
        sleep().then(() => eventManager.emit('refreshhighlight'));
      }
    },
    category: Translation.CATEGORY_LIBRARY_CRAFTING,
    page: 'Library',
  });
  onPage('Crafting', function craftableCards() {
    style.add(
      '.craftable .cardFrame { -webkit-filter: grayscale(100%) brightness(45%) sepia(100%) hue-rotate(80deg) saturate(400%) contrast(1.5); filter: grayscale(100%) brightness(45%) sepia(100%) hue-rotate(80deg) saturate(400%) contrast(1.5); }',
      '.highlight-green { text-shadow: 0px 0px 10px #008000; color: #00cc00; }',
    );
    function highlight(el) {
      const set = !setting$6.value() && craftable(el);
      el.classList.toggle('craftable', set);
    }
    function update({ id, shiny, dust }) {
      if (dust >= dustCost('LEGENDARY', true)) {
        const el = find$1(id, shiny);
        if (el) highlight(el);
      } else {
        highlightCards();
      }
    }
    function highlightCards() {
      document.querySelectorAll('div.card, table.cardBoard, table.card').forEach(highlight);
    }
    eventManager.on('craftcard', update);
    eventManager.on('refreshhighlight', highlightCards);
    eventManager.on('Craft:RefreshPage', () => eventManager.emit('refreshhighlight'));
    eventManager.on('underscript:ready', () => {
      infoToast(Translation.Toast('craftable'), 'underscript.notice.craftingborder', '1');
    });
  });

  const setting$5 = register$4({
    name: Translation.Setting('disenchant'),
    key: 'underscript.disable.disenchant',
    default: true,
    refresh: onPage('Crafting'),
    note: Translation.Setting('disenchant.note'),
    category: Translation.CATEGORY_LIBRARY_CRAFTING,
    page: 'Library',
  });
  onPage('Crafting', function disenchantWrapper() {
    if (setting$5.disabled || setting$5.value()) return;
    let processing = false;
    eventManager.on('jQuery', () => {
      const button = $('<button class="btn btn-info">Smart Disenchant</button>');
      button.click(onclick);
      $('#dust').after(' ', button);
    });
    function onclick() {
      const normals = calcCards({ shiny: false });
      const shinies = calcCards({ shiny: true });
      const pNormal = calcCards({ shiny: false, priority: true });
      const pShiny = calcCards({ shiny: true, priority: true });
      BootstrapDialog.show({
        title: 'Smart Disenchant',
        message: `Note: Smart Disenchant will not disenchant DETERMINATION or Shiny BASE cards.<br>
      Normal/Shiny will disenchant <b>ALL</b> normal/shiny cards until you have 0.<br>
      Prioritize will count normal/shiny together and disenchant extra non normal/shiny cards.`,
        onshow(dialog) {
          const window = dialog.getModalFooter();
          window.find('.us-normal').hover(show$2('Disenchant all normal cards')).prop('disabled', !normals.length);
          window.find('.us-shiny').hover(show$2('Disenchant all shiny cards')).prop('disabled', !shinies.length);
          window.find('.us-normal-p').hover(show$2('Disenchant extra shiny cards<br />Note: Also disenchants normals > max')).prop('disabled', !pNormal.length);
          window.find('.us-shiny-p').hover(show$2('Disenchant extra normal cards<br />Note: Also disenchants shinies > max')).prop('disabled', !pShiny.length);
        },
        onhide: hide$1,
        buttons: [{
          label: `All Normal (+${calcDust(normals)})`,
          cssClass: 'btn-danger us-normal',
          action(dialog) {
            disenchant(normals);
            dialog.close();
          },
        }, {
          label: `All Shiny (+${calcDust(shinies)})`,
          cssClass: 'btn-danger us-shiny',
          action(dialog) {
            disenchant(shinies);
            dialog.close();
          },
        }, {
          label: `Prioritize Normal (+${calcDust(pNormal)})`,
          cssClass: 'btn-danger us-normal-p',
          action(dialog) {
            disenchant(pNormal);
            dialog.close();
          },
        }, {
          label: `Prioritize Shiny (+${calcDust(pShiny)})`,
          cssClass: 'btn-danger us-shiny-p',
          action(dialog) {
            disenchant(pShiny);
            dialog.close();
          },
        }],
      });
    }
    function updateOrToast(toast, message) {
      processing = false;
      if (toast.exists()) {
        toast.setText(message);
      } else {
        toast$6(message);
      }
    }
    function disenchant(cards) {
      if (!cards.length || processing) return;
      processing = true;
      const toast = toast$6('Please wait while disenchanting.<br />(this may take a while)');
      axios.all(build(cards.splice(0)))
        .then(process)
        .then((response) => {
          if (!response) throw new Error('All errored out');
          const data = response.data;
          const gained = data.dust - parseInt($('#dust').text(), 10);
          $('#dust').text(data.dust);
          $('#totalDisenchant').text(data.totalDisenchant);
          $('#nbDTFragments').text(data.DTFragments);
          $('#btnCraftDT').prop('disabled', data.DTFragments < 2);
          if (data.DTFragments) {
            $('#DTFragmentsDiv').show();
          }
          global('applyFilters')();
          global('showPage')(global('currentPage'));
          updateOrToast(toast, `Finished disenchanting.\n+${gained} dust`);
        }).catch((e) => {
          captureError(e);
          console.error(e);
          updateOrToast(toast, 'Could not complete disenchanting.');
        });
    }
    function build(cards) {
      const promises = [];
      cards.forEach((data) => {
        const limit = data.quantity;
        for (let x = 0; x < limit; x++) {
          promises.push(axios.post('CraftConfig', {
            action: 'disenchant',
            idCard: parseInt(data.id, 10),
            isShiny: data.shiny,
          }, {
            headers: {
              'Content-Type': 'application/json',
            },
          }));
        }
      });
      debug(cards);
      debug(promises.length);
      return promises;
    }
    function process(responses) {
      let last = null;
      const redo = [];
      responses.forEach((response) => {
        debug(response);
        if (response.data === '') {
          const { idCard, isShiny } = JSON.parse(response.config.data);
          redo.push({
            quantity: 1,
            id: idCard,
            shiny: isShiny,
          });
          return;
        }
        if (response.data.status !== 'success') {
          return;
        }
        if (!last || response.data.dust > last.data.dust) {
          debug('set');
          last = response;
        }
        global('updateQuantity')(JSON.parse(response.data.card), -1);
      });
      if (redo.length) {
        debug(`Redoing ${redo.length}`);
        return axios.all(build(redo)).then(process);
      }
      debug('last', last);
      return last;
    }
    function cardFilter(card, shiny, priority, family) {
      return card.quantity > 0 && include(card.rarity) && (priority || card.shiny === shiny);
    }
    function calcCards({ shiny, priority, deltarune }) {
      const cards = {};
      const extras = [];
      global('collection').filter((card) => cardFilter(card, shiny, priority))
        .forEach(({ id, name, shiny: isShiny, rarity, quantity }) => {
          if (priority) {
            if (!hasOwn(cards, id)) {
              const max = max$1(rarity);
              if (!max) return;
              cards[id] = {
                max, rarity, name,
              };
            }
            cards[id][isShiny ? 'shiny' : 'normal'] = quantity;
          } else {
            extras.push({
              id, name, rarity, quantity, shiny,
            });
          }
        });
      if (priority) {
        each(cards, (data, id) => {
          const name = data.name;
          const rarity = data.rarity;
          const max = data.max;
          if (data.shiny && data.normal) {
            const prioritized = shiny ? data.shiny : data.normal;
            const other = shiny ? data.normal : data.shiny;
            if (prioritized > max) {
              extras.push({
                id,
                shiny,
                rarity,
                name,
                quantity: prioritized - max,
              });
            }
            const slots = Math.max(max - prioritized, 0);
            if (other > slots) {
              extras.push({
                id,
                rarity,
                name,
                shiny: !shiny,
                quantity: other - slots,
              });
            }
          } else {
            const quantity = data.shiny || data.normal;
            if (quantity > max) {
              extras.push({
                id,
                rarity,
                name,
                quantity: quantity - max,
                shiny: !!data.shiny,
              });
            }
          }
        });
      }
      debug(extras, undefined, shiny, priority);
      return extras;
    }
    function calcDust(cards) {
      let total = 0;
      cards.forEach((card) => {
        total += dustGain(card.rarity, card.shiny) * card.quantity;
      });
      return total;
    }
    function include(rarity) {
      switch (rarity) {
        case 'BASE':
        case 'GENERATED':
        case 'TOKEN':
        case 'DETERMINATION': return false;
        case 'LEGENDARY':
        case 'EPIC':
        case 'RARE':
        case 'COMMON': return true;
        default:
          debugToast(`Unknown Rarity: ${rarity}`);
          return false;
      }
    }
  });

  let locked = false;
  let bypass = false;
  const craft = mod.craft;
  craft.bypassProtection = setBypass;
  function setBypass(value) {
    bypass = value === true;
  }
  function override$1(...args) {
    if (locked && !bypass) return;
    locked = true;
    this.super(...args);
  }
  eventManager.on(':preload:Crafting', () => {
    globalSet('auto', override$1);
    globalSet('craft', override$1);
    globalSet('disenchant', override$1);
  });
  eventManager.on('Craft:auto Craft:disenchant craftcard crafterrror', () => {
    locked = false;
  });

  const setting$4 = register$4({
    name: Translation.Setting('craft.hotkey'),
    key: 'underscript.disable.craftMax',
    category: Translation.CATEGORY_LIBRARY_CRAFTING,
    onChange() {
      eventManager.emit('refreshhighlight');
    },
    page: 'Library',
  });
  onPage('Crafting', function craftMax() {
    eventManager.on('refreshhighlight', calculate);
    function calculate() {
      hide$1();
      document.querySelectorAll('div.card, table.cardBoard, table.card').forEach(checkCard);
    }
    function checkCard(el) {
      const card = $(el);
      card.off('hover');
      if (setting$4.value()) return;
      const rarity$1 = rarity(el);
      if (rarity$1 === 'DETERMINATION') return;
      const max = max$1(rarity$1);
      const amount = quantity(el);
      if (amount >= max) return;
      const cost = dustCost(el);
      const total = totalDust();
      eventManager.on('underscript:ready', () => {
        if (cost > total) {
          card.hover(show$2('CTRL Click: insufficient dust'));
        } else {
          card.hover(show$2(`CTRL Click: Craft up to max(${max})`));
        }
      });
      if (cost > total) return;
      card.off('click').on('click.script', (e) => {
        const id = parseInt(card.attr('id'), 10);
        const shiny = card.hasClass('shiny');
        if (e.ctrlKey) {
          hide$1();
          const count = max - quantity(el);
          if (count <= 0) return;
          craftCards(id, shiny, count, cost, total);
        } else {
          global('action')(id, shiny);
        }
      });
    }
    let crafting = false;
    function craftCards(id, shiny, count, cost, total) {
      if (crafting) return;
      crafting = true;
      setBypass(true);
      const craft = global('craft');
      let dust = total;
      let remaining = count;
      do {
        dust -= cost;
        craft(id, shiny);
        remaining -= 1;
      } while (remaining && dust >= cost);
      sleep(1000).then(() => {
        calculate();
        crafting = false;
        setBypass(false);
      });
    }
  });

  const setting$3 = register$4({
    name: Translation.Setting('deck.average'),
    key: 'underscript.disable.deck.average',
    refresh: onPage('Decks'),
    page: 'Library',
  });
  eventManager.on(':preload:Decks', () => {
    if (setting$3.value()) return;
    const label = $('<span>');
    const avg = $('<span>');
    $('#soulInfo span').after(label, ' ', avg).remove();
    function round(amt, dec = 2) {
      return Number.parseFloat(amt).toFixed(dec);
    }
    function count() {
      let val = 0;
      const list = global('decks')[global('soul')];
      list.forEach(({ cost }) => val += cost);
      avg.text(`(${round(list.length ? val / list.length : val)})`);
    }
    eventManager.on('Deck:Soul Deck:Change Deck:Loaded', count);
    eventManager.on('underscript:ready', () => {
      label.text(Translation.General('passive'));
      avg.hover(show$2(Translation.General('deck.average')));
    });
  });

  eventManager.on(':preload:Decks', () => {
    globalSet('ajaxUrl', 'DecksConfig');
  });
  eventManager.on('Deck:Loaded', () => {
    const params = new URLSearchParams(location.search);
    const deckCode = params.get('deckCode') || params.get('deck');
    if (!deckCode) return;
    global('loadDeckCode')(deckCode);
  });

  eventManager.on(':preload:Decks', () => {
    const collection = $('#collection');
    collection.css({
      width: '717px',
      padding: '0',
    });
    collection.parent().css({
      width: '717px',
    });
  });

  const setting$2 = register$4({
    name: Translation.Setting('import.shiny'),
    key: 'underscript.import.shiny',
    default: true,
    page: 'Library',
    category: Translation.CATEGORY_CHAT_IMPORT,
  });
  function override(idCard, list = []) {
    if (setting$2.value()) {
      list.sort((a, b) => b.shiny - a.shiny);
    }
    return this.super(idCard, list);
  }
  eventManager.on(':preload:Decks', () => {
    globalSet('getCardInList', override);
  });

  const setting$1 = register$4({
    name: Translation.Setting('deck.preview'),
    key: 'underscript.disable.deckPreview',
    onChange(val, val2) {
      if (!onPage('Decks') || typeof cardHoverEnabled === 'undefined') return;
      globalSet('cardHoverEnabled', !val);
    },
    page: 'Library',
  });
  eventManager.on(':preload:Decks', function previewLoaded() {
    if (typeof displayCardDeck === 'function') {
      globalSet('cardHoverEnabled', !setting$1.value());
    }
  });

  const actions = ['addCard', 'removeCard', 'removeAllCards', 'clearArtifacts', 'addArtifact'];
  const mockLastOpenedDialog = { close() {} };
  const pending = [];
  let templastOpenedDialog;
  function clear() {
    pending.splice(0, pending.length);
  }
  function processNext() {
    if (global('lastOpenedDialog') === mockLastOpenedDialog) {
      globalSet('lastOpenedDialog', templastOpenedDialog);
    }
    const job = pending.shift();
    if (!job) return;
    if (job.action === 'validate') {
      load({ ...job, validate: true });
    } else if (job.action === 'clear') {
      global('removeAllCards')();
    } else if (job.action === 'remove') {
      global('removeCard')(parseInt(job.id, 10), job.shiny === true);
    } else if (job.action === 'clearArtifacts') {
      global('clearArtifacts')();
    } else if (job.action === 'addArtifact') {
      templastOpenedDialog = global('lastOpenedDialog');
      globalSet('lastOpenedDialog', mockLastOpenedDialog);
      global('addArtifact')(job.id);
    } else {
      global('addCard')(parseInt(job.id, 10), job.shiny === true);
    }
  }
  eventManager.on('Deck:postChange', ({ action, data }) => {
    if (!actions.includes(action) || !data) return;
    if (data.status === 'error') {
      clear();
    } else {
      processNext();
    }
  });
  function load({ cards = [], artifacts = [], validate = false }) {
    if (!onPage('Decks')) return;
    clear();
    if (cards.length > 25 || artifacts.length > 2) return;
    let clearDeck = false;
    const cDeck = global('decks')[global('soul')];
    if (cDeck.length) {
      const deck = [...cards];
      const removals = cDeck.map(({ id, shiny }) => ({
        id,
        shiny,
        action: 'remove',
      })).filter((card) => !deck.some((card2, ind) => {
        const found = card2.id === card.id && (card.shiny || false) === (card2.shiny || false);
        if (found) {
          deck.splice(ind, 1);
        }
        return found;
      }));
      if (removals.length > 13 || removals.length === cDeck.length) {
        clearDeck = true;
        pending.push({ action: 'clear' });
        pending.push(...cards);
      } else {
        pending.push(...removals);
        pending.push(...deck);
      }
    } else {
      pending.push(...cards);
    }
    const cArts = global('decksArtifacts')[global('soul')];
    if (clearDeck || !cArts.every((art) => artifacts.includes(art) || artifacts.includes(art.id))) {
      if (!clearDeck) pending.push({ action: 'clearArtifacts' });
      artifacts.forEach((art) => {
        pending.push({
          id: art.id || art,
          action: 'addArtifact',
        });
      });
    } else {
      const ids = cArts.map((art) => art.id);
      artifacts.forEach((art) => {
        const id = art.id || art;
        if (ids.includes(id)) return;
        pending.push({
          id,
          action: 'addArtifact',
        });
      });
    }
    if (pending.length) {
      if (validate) debug([...pending]);
      pending.push({
        action: 'validate',
        cards: cards.map(({ id, shiny }) => ({ id, shiny })),
        artifacts: artifacts.map((art) => art.id || art),
      });
      processNext();
    }
  }

  const limits = {
    BASE: 3,
    COMMON: 3,
    RARE: 3,
    EPIC: 2,
    LEGENDARY: 1,
    DETERMINATION: 1,
  };
  function buildPool(shinyFilter) {
    const cards = [{ id: 0, shiny: false, rarity: '' }];
    cards.shift();
    const collection = global('deckCollections')[global('soul')];
    collection.forEach((card = { id: 0, quantity: 0, shiny: false }) => {
      if (shinyFilter !== undefined && card.shiny !== shinyFilter) return;
      for (let i = 0; i < card.quantity; i++) {
        cards.push(card);
      }
    });
    shuffle(cards);
    return cards;
  }
  function buildArtifacts() {
    const current = [...global('decksArtifacts')[global('soul')]];
    const available = [...global('userArtifacts')].filter((a) => !current.includes(a));
    if (current.length === 0) {
      current.push(random(available));
    }
    if (current.length < 2 && !current[0].legendary) {
      const commons = available.filter((a) => !a.legendary && a !== current[0]);
      current.push(random(commons));
    }
    return current;
  }
  function fillDeck(e) {
    const cDeck = global('decks')[global('soul')];
    const cArts = global('decksArtifacts')[global('soul')];
    const artifacts = buildArtifacts();
    if (cDeck.length === 25 && cArts.length === artifacts.length) return;
    const counts = new Map();
    const cards = [];
    let dtFlag = false;
    function addCard(card) {
      const amt = counts.get(card.id) || 0;
      if (amt === limits[card.rarity]) return;
      if (card.rarity === 'DETERMINATION') {
        if (dtFlag) return;
        dtFlag = true;
      }
      cards.push(card);
      counts.set(card.id, amt + 1);
    }
    cDeck.forEach(addCard);
    const pool = buildPool(getMode(e));
    while (cards.length < 25 && pool.length) {
      addCard(pool.shift());
    }
    load({
      cards,
      artifacts,
    });
  }
  eventManager.on(':preload:Decks', () => {
    style.add('.btn { padding: 5px 6px; }');
    const button = $('<button>');
    const inner = $('<span>');
    inner.addClass('glyphicon glyphicon-random');
    button.addClass('btn btn-sm btn-primary');
    button.append(inner);
    button.click(fillDeck);
    eventManager.on('underscript:ready', () => {
      button.hover(show$2(
        getTranslationArray('underscript.general.deck.fill')
          .join('<br>'),
      ), hide$1);
    });
    const clearDeck = $('#yourCardList > button:last');
    clearDeck.after(' ', button);
  });
  function getMode({ ctrlKey = false, shiftKey = false }) {
    if (ctrlKey) return true;
    if (shiftKey) return false;
    return undefined;
  }
  function random(array = []) {
    return array[rand(array.length)];
  }

  const setting = register$4({
    name: 'Disable Deck Storage',
    key: 'underscript.storage.disable',
    refresh: () => onPage('Decks'),
    page: 'Library',
  });
  const rows = register$4({
    name: 'Deck Storage Rows',
    key: 'underscript.storage.rows',
    type: 'select',
    options: ['1', '2', '3', '4', '5', '6'],
    refresh: () => onPage('Decks'),
    extraPrefix: 'underscript.deck.',
    page: 'Library',
  });
  onPage('Decks', function deckStorage() {
    if (setting.value()) return;
    style.add('.btn-storage { margin-top: 5px; margin-right: 6px; width: 30px; padding: 5px 0; }');
    function getFromLibrary(id, library = [], shiny = undefined) {
      return library.find((card) => card.id === id && (shiny === undefined || card.shiny === shiny));
    }
    function getCardData(id, shiny) {
      const library = global('deckCollections', 'collections');
      return getFromLibrary(id, library[global('soul')], shiny);
    }
    eventManager.on('jQuery', () => {
      const container = $('<p>');
      const buttons = [];
      for (let i = 1, x = Math.max(parseInt(rows.value(), 10), 1) * 5; i <= x; i++) {
        buttons.push($('<button>')
          .text(i)
          .addClass('btn btn-sm btn-danger btn-storage'));
      }
      container.append(buttons);
      $('#deckCardsCanvas').prev('br').remove();
      $('#deckCardsCanvas').before(container);
      eventManager.on('Deck:Soul', loadStorage);
      function fixDeck(id) {
        const key = getKey(id);
        const deck = JSON.parse(localStorage.getItem(key));
        if (!deck) return;
        if (!hasOwn(deck, 'cards')) {
          localStorage.setItem(key, JSON.stringify({
            cards: deck,
            artifacts: [],
          }));
        }
      }
      function saveDeck(i) {
        const deck = {
          cards: [],
          artifacts: [],
        };
        const clazz = global('soul');
        global('decks')[clazz].forEach(({ id, shiny }) => {
          const card = { id };
          if (shiny) {
            card.shiny = true;
          }
          deck.cards.push(card);
        });
        global('decksArtifacts')[clazz].forEach(({ id }) => deck.artifacts.push(id));
        if (!deck.cards.length && !deck.artifacts.length) return;
        localStorage.setItem(getKey(i), JSON.stringify(deck));
      }
      function loadDeck(i) {
        if (i === null) return;
        load({
          cards: getDeck(i, true),
          artifacts: getArtifacts(i),
        });
      }
      function getKey(id) {
        return `underscript.deck.${global('selfId')}.${global('soul')}.${id}`;
      }
      function getDeck(deckId, trim) {
        fixDeck(deckId);
        const key = getKey(deckId);
        const deck = JSON.parse(localStorage.getItem(key));
        if (!deck) return null;
        if (trim) {
          return deck.cards.filter(({ id, shiny }) => getCardData(id, shiny));
        }
        return deck.cards;
      }
      function getArtifacts(id) {
        fixDeck(id);
        const key = getKey(id);
        const deck = JSON.parse(localStorage.getItem(key));
        if (!deck) return [];
        const userArtifacts = global('userArtifacts');
        const arts = (deck.artifacts || [])
          .filter((art) => userArtifacts.some(({ id: artID }) => artID === art));
        if (arts.length > 1) {
          const legend = arts.find((art) => {
            const artifact = userArtifacts.find(({ id: artID }) => artID === art);
            if (artifact) {
              return !!artifact.legendary;
            }
            return false;
          });
          if (legend) {
            return [legend];
          }
        }
        return arts;
      }
      function cards(list) {
        const names = [];
        list.forEach((card) => {
          let data = getCardData(card.id, card.shiny);
          const name = data ?
            `<span class="${data.rarity}">${cardName(data)}</span>` :
            `<span style="color: orange;">${(data = getFromLibrary(card.id, global('allCards'))) && cardName(data) || 'Deleted'} (Missing)</span>`;
          names.push(`- ${card.shiny ? '<span style="color: yellow;">S</span> ' : ''}${name}`);
        });
        return names.join('<br />');
      }
      function artifacts(id) {
        const list = [];
        const userArtifacts = global('userArtifacts');
        getArtifacts(id).forEach((art) => {
          const artifact = userArtifacts.find(({ id: artID }) => artID === art);
          if (artifact) {
            const name = translateText(`artifact-name-${artifact.id}`);
            list.push(`<span class="${artifact.legendary ? 'yellow' : ''}"><img style="height: 16px;" src="images/artifacts/${artifact.image}.png" /> ${name}</span>`);
          }
        });
        return list.join(', ');
      }
      function loadStorage() {
        buttons.forEach(loadButton);
      }
      function loadButton(button, i) {
        const soul = global('soul');
        const deckKey = getKey(i);
        const nameKey = `${deckKey}.name`;
        button.off('.deckStorage');
        function refreshHover() {
          hide$1();
          button.trigger('mouseenter');
        }
        function saveButton() {
          saveDeck(i);
          refreshHover();
        }
        function fixClass(loaded = true) {
          return button
            .toggleClass('btn-danger', !loaded)
            .toggleClass('btn-primary', loaded);
        }
        function hoverButton(e) {
          let text = '';
          if (e.type === 'mouseenter') {
            const deck = getDeck(i);
            fixClass(!!deck);
            const SOUL = `${Translation.Vanilla(`soul-${soul}`)}-${i + 1}`;
            if (deck) {
              const note = Translation.General('storage.note').key;
              text = `
              <div id="deckName">${localStorage.getItem(nameKey) || SOUL}</div>
              <div><input id="deckNameInput" maxlength="28" style="border: 0; border-bottom: 2px solid #00617c; background: #000; width: 100%; display: none;" type="text" placeholder="${SOUL}" value="${localStorage.getItem(nameKey) || ''}"></div>
              <div style="font-size: 13px;">${artifacts(i)}</div>
              <div>${Translation.General('storage.load').translate(deck.length)}</div>
              <div style="font-size: 13px;">${cards(deck)}</div>
              <div style="font-style: italic; color: #b3b3b3;">
                ${getTranslationArray(note).join('<br>')}
              </div>
            `;
            } else {
              text = `
              <div id="name">${SOUL}</div>
              <div>${Translation.General('storage.save')}</div>`;
            }
          }
          show$2(text)(e);
        }
        fixClass(!!localStorage.getItem(deckKey))
          .on('click.script.deckStorage', (e) => {
            if (!localStorage.getItem(deckKey)) {
              saveButton();
              return;
            }
            if (e.ctrlKey && e.shiftKey) {
              return;
            }
            if (e.ctrlKey) {
              localStorage.removeItem(nameKey);
              localStorage.removeItem(deckKey);
              refreshHover();
            } else if (e.shiftKey) {
              saveButton();
            } else {
              loadDeck(i);
            }
          })
          .on('contextmenu.script.deckStorage', (e) => {
            e.preventDefault();
            const input = $('#deckNameInput');
            const display = $('#deckName');
            function storeInput() {
              localStorage.setItem(nameKey, input.val());
              display.text(input.val()).show();
              refreshHover();
            }
            display.hide();
            input.show()
              .focus()
              .select()
              .on('keydown.script.deckStorage', (e) => {
                if (e.key === 'Escape' || e.key === 'Enter') {
                  e.preventDefault();
                  storeInput();
                }
              })
              .on('focusout.script.deckStorage', () => {
                storeInput();
              });
          });
        eventManager.on('underscript:ready', () => {
          button.hover(hoverButton);
        });
      }
      compound('Deck:Loaded', 'Chat:Connected', loadStorage);
      $('#yourCardList > button[onclick="removeAllCards();"]').on('click', () => {
        clear();
      });
      eventManager.on('Deck:Soul', () => clear());
    });
  });

  eventManager.on(':load', () => {
    each(localStorage, (name, key) => {
      if (!key.startsWith('underscript.ignore.')) return;
      ignoreUser(name, key);
    });
  });

})();