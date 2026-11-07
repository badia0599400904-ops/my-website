const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('.'));
let users = {};
const ADMIN_KEY = "ABO-SHIFAA-123";
function makeCode() {
  return "GOLD-" + Math.random().toString(36).slice(2,8).toUpperCase();
}
app.post('/admin/create', (req, res) => {
  if (req.body.adminKey !== ADMIN_KEY) return res.json({ ok: false, msg: "ممنوع" });
  let code = makeCode();
  let expiresAt = Date.now() + 20 * 24 * 60 * 60 * 1000;
  users[code] = { expiresAt, devices: [], active: true, name: req.body.name || "مشترك" };
  res.json({ ok: true, code, days: 20 });
});
app.post('/admin/stop', (req, res) => {
  if (req.body.adminKey !== ADMIN_KEY) return res.json({ ok: false });
  if (!users[req.body.code]) return res.json({ ok: false, msg: "الكود مش موجود" });
  users[req.body.code].active = false;
  users[req.body.code].devices = [];
  res.json({ ok: true, msg: "تم الفصل" });
});
app.post('/admin/start', (req, res) => {
  if (req.body.adminKey !== ADMIN_KEY) return res.json({ ok: false });
  if (!users[req.body.code]) return res.json({ ok: false });
  users[req.body.code].active = true;
  res.json({ ok: true, msg: "رجع يشتغل" });
});
app.get('/admin/list', (req, res) => {
  if (req.query.adminKey !== ADMIN_KEY) return res.json({ ok: false });
  res.json(users);
});
app.post('/check', (req, res) => {
  let { code, deviceId } = req.body;
  let u = users[code];
  if (!u) return res.json({ ok: false, msg: "كود غلط" });
  if (!u.active) return res.json({ ok: false, msg: "تم فصلك من الادمن" });
  if (Date.now() > u.expiresAt) return res.json({ ok: false, msg: "خلص اشتراكك" });
  if (!u.devices.includes(deviceId)) {
    if (u.devices.length >= 10) return res.json({ ok: false, msg: "وصلت 10 اجهزة" });
    u.devices.push(deviceId);
  }
  let leftDays = Math.ceil((u.expiresAt - Date.now()) / (24*60*60*1000));
  res.json({ ok: true, msg: "تمام - شغال", leftDays, devices: u.devices.length + "/10", name: u.name });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("شغال على " + PORT));
