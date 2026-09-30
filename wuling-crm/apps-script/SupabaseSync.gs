/**
 * Google Sheet -> Supabase feed for the Wuling Sales CRM (add as a new file next to Code.gs).
 *
 * One-time setup:
 *  1. Project Settings > Script properties, add:
 *       CRM_SYNC_URL    = https://<your-vercel-domain>/api/sync
 *       CRM_SYNC_SECRET = <same value as SYNC_SECRET in Vercel>
 *  2. Run backfillAll() once (authorise when asked) — imports every lead and its ACTIVITY_LOG history.
 *  3. Run installTrigger() once — new rows in SHEET_1_TEL are then pushed every 5 minutes.
 *
 * The sync is INSERT-ONLY: a Lead_ID that already exists in Supabase is never overwritten, so edits made
 * in the CRM are safe. Once everyone works in the CRM, run removeTrigger().
 */

var CHUNK = 200;

function props_() {
  var p = PropertiesService.getScriptProperties();
  return { url: p.getProperty('CRM_SYNC_URL'), secret: p.getProperty('CRM_SYNC_SECRET') };
}

function readTab_(name) {
  var sh = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sh) return [];
  var v = sh.getDataRange().getDisplayValues();
  if (v.length < 2) return [];
  var head = v[0].map(function (h) { return String(h).trim(); });
  var out = [];
  for (var i = 1; i < v.length; i++) {
    var o = {}, empty = true;
    for (var c = 0; c < head.length; c++) {
      if (!head[c]) continue;
      o[head[c]] = String(v[i][c]).trim();
      if (o[head[c]]) empty = false;
    }
    if (!empty) out.push(o);
  }
  return out;
}

function push_(table, rows) {
  var cfg = props_();
  if (!cfg.url || !cfg.secret) throw new Error('ตั้งค่า CRM_SYNC_URL และ CRM_SYNC_SECRET ใน Script properties ก่อน');
  var total = 0;
  for (var i = 0; i < rows.length; i += CHUNK) {
    var part = rows.slice(i, i + CHUNK);
    var res = UrlFetchApp.fetch(cfg.url, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'x-sync-secret': cfg.secret },
      payload: JSON.stringify({ table: table, rows: part }),
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) {
      throw new Error(table + ' sync failed (' + res.getResponseCode() + '): ' + res.getContentText());
    }
    total += part.length;
  }
  Logger.log(table + ': sent ' + total + ' rows');
}

/** Push every lead row (existing ones are skipped server-side). Also the 5-minute trigger handler. */
function syncLeads() {
  push_('leads', readTab_('SHEET_1_TEL'));
}

/** Push ACTIVITY_LOG history (needs the leads to exist first). */
function syncActivity() {
  push_('activity_log', readTab_('ACTIVITY_LOG'));
}

function backfillAll() {
  syncLeads();
  syncActivity();
}

function installTrigger() {
  removeTrigger();
  ScriptApp.newTrigger('syncLeads').timeBased().everyMinutes(5).create();
}

function removeTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'syncLeads') ScriptApp.deleteTrigger(t);
  });
}
