import test from "node:test";
import assert from "node:assert/strict";
import { toIsoDate } from "../src/lib/dates.ts";
import { coerceValue, normalizeSheetLead, normalizeSheetActivity, BadValueError } from "../src/lib/normalize.ts";

test("toIsoDate handles ISO, D/M/Y and Buddhist years; rejects times and junk", () => {
  assert.equal(toIsoDate("2026-08-12"), "2026-08-12");
  assert.equal(toIsoDate("2026/8/2"), "2026-08-02");
  assert.equal(toIsoDate("12/08/2569"), "2026-08-12");
  assert.equal(toIsoDate("10:30"), null);
  assert.equal(toIsoDate("2026-02-31"), null);
  assert.equal(toIsoDate("hello"), null);
});

test("coerceValue maps sheet values to column types", () => {
  assert.equal(coerceValue("has_trade_in", "มีรถเทิร์น"), true);
  assert.equal(coerceValue("has_trade_in", "ไม่มี"), false);
  assert.equal(coerceValue("has_trade_in", ""), null);
  assert.equal(coerceValue("test_drive_done", "Y"), true);
  assert.equal(coerceValue("test_drive_done", ""), false);
  assert.equal(coerceValue("next_follow_up", ""), null);
  assert.equal(coerceValue("lead_temperature", "warm"), "WARM");
  assert.equal(coerceValue("lead_temperature", ""), null);
  assert.equal(coerceValue("call_attempts", "3"), 3);
  assert.equal(coerceValue("customer_name", "  ปัน "), "ปัน");
  assert.throws(() => coerceValue("next_follow_up", "soon"), BadValueError);
  assert.throws(() => coerceValue("lead_status", "DONE"), BadValueError);
});

test("normalizeSheetLead lowercases headers, reports unknown ones, never drops a lead for a bad cell", () => {
  const { row, ignored } = normalizeSheetLead({
    Lead_ID: "20260812-100001", Customer_Name: "ปัน", Next_Follow_Up: "garbage", Lead_Status: "", Mystery_Col: "x",
  });
  assert.equal(row.lead_id, "20260812-100001");
  assert.equal(row.next_follow_up, null);
  assert.equal(row.lead_status, "NEW");
  assert.deepEqual(ignored, ["Mystery_Col"]);
});

test("normalizeSheetActivity converts Bangkok time to an offset timestamp", () => {
  const a = normalizeSheetActivity({ Activity_ID: "L_1", Lead_ID: "L", Activity_Date: "2026-08-12", Activity_Time: "09:05:03" });
  assert.equal(a.activity_at, "2026-08-12T09:05:03+07:00");
});
