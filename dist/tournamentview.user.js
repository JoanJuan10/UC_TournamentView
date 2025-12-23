// ==UserScript==
// @name        UC Tournament View
// @version     0.1.0
// @author      JoanJuan10
// @description Plugin para UnderScript que mejora la vista de espectador en Undercards.net con plantillas modernas
// @homepage    https://github.com/JoanJuan10/UC_TournamentView
// @match       https://*.undercards.net/*
// @namespace   https://uc.feildmaster.com/
// @exclude     https://*.undercards.net/*/*
// @updateURL   https://github.com/JoanJuan10/UC_TournamentView/releases/latest/download/tournamentview.meta.js
// @downloadURL https://github.com/JoanJuan10/UC_TournamentView/releases/latest/download/tournamentview.user.js
// @require     https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js
// @grant       none
// ==/UserScript==

!function(e){var n={};function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}t.m=e,t.c=n,t.d=function(e,n,r){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)t.d(r,o,function(n){return e[n]}.bind(null,o));return r},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=0)}([function(e,n){const t=window.underscript.plugin("TournamentView",GM_info.version),r=t.settings().add({key:"enabled",name:"Activar Tournament View",type:"boolean",default:!0});t.events.on(":preload",()=>{r.value&&console.log("TournamentView plugin loaded")})}]);