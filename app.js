"use strict";
const editor = document.querySelector("#text");
const status = document.querySelector("#status");
const count = document.querySelector("#count");
let epoch = 0;
// Preserve ordinary multilingual text; remove control, bidi override and zero-width markup.
function clean(text) { return text.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u061C\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, ""); }
// A single mutable binding lets lifecycle clearing replace the native control.
let active = editor;
function locationEditor(element) { active = element; active.value = ""; wireEditor(); count.textContent = "0 characters"; }
function recount() { count.textContent = `${Array.from(active.value).length} characters`; }
function insert(text) { const safe = clean(text); active.setRangeText(safe, active.selectionStart, active.selectionEnd, "end"); recount(); status.textContent = "Plain text pasted."; }
function wipe(message = "Editor cleared.") { epoch++; active.value = ""; active.defaultValue = ""; const fresh = active.cloneNode(false); active.replaceWith(fresh); locationEditor(fresh); status.textContent = message; }
function wireEditor() {
 active.addEventListener("input", () => { const pos = active.selectionStart; const before = active.value; const prefix = clean(before.slice(0,pos)); if(clean(before) !== before) { active.value = clean(before); active.setSelectionRange(prefix.length,prefix.length); } recount(); });
 active.addEventListener("paste", event => { event.preventDefault(); if (event.clipboardData) insert(event.clipboardData.getData("text/plain")); });
 active.addEventListener("drop", event => event.preventDefault());
}
wireEditor(); wipe("Ready when you are.");
document.querySelector("#paste").addEventListener("click", async () => {
 const token = epoch;
 try { const text = await navigator.clipboard.readText(); if(token !== epoch || document.hidden) return; insert(text); }
 catch { if(token === epoch && !document.hidden) status.textContent = "Paste unavailable. Touch and hold in the editor, then choose Paste."; }
});
document.querySelector("#copy").addEventListener("click", async () => {
 const token = epoch;
 try { await navigator.clipboard.writeText(clean(active.value)); if(token === epoch && !document.hidden) status.textContent = "Copied as plain text."; }
 catch { if(token === epoch && !document.hidden) { active.focus(); active.select(); status.textContent = "Copy unavailable. Use the selection menu to copy."; } }
});
document.querySelector("#clear").addEventListener("click", () => wipe());
window.addEventListener("blur", () => wipe("Cleared when you left the app."));
document.addEventListener("visibilitychange", () => { if(document.hidden) wipe("Cleared when you left the app."); else checkUpdate(); });
window.addEventListener("pagehide", () => wipe("Cleared when you left the app."));
window.addEventListener("pageshow", event => { if(event.persisted) wipe(); });
document.addEventListener("freeze", () => wipe());
let registration;
function checkUpdate() { if(registration && navigator.onLine) registration.update().catch(() => {}); }
if("serviceWorker" in navigator) {
 let controlled = !!navigator.serviceWorker.controller;
 navigator.serviceWorker.addEventListener("controllerchange", () => { if(controlled) { wipe("Updating…"); location.reload(); } controlled = true; });
 navigator.serviceWorker.register("./sw.js", {updateViaCache:"none"}).then(r => { registration = r; checkUpdate(); }).catch(() => { status.textContent = "Offline setup unavailable. You can still edit text."; });
 window.addEventListener("online", checkUpdate);
 setInterval(checkUpdate, 60000);
}
