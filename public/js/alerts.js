/* سكينة — الشاشة الثالثة: التنبيهات الحيّة · Screen 3: live alerts */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const T = (k) => window.I18N.t(k);
  const F = (o, f) => window.I18N.f(o, f);
  const socket = io();

  const store = { alerts: [], events: [], resolved: [] };

  const esc = (s) =>
    String(s == null ? '' : s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  function medsText(list) {
    if (!list || !list.length) return T('meds.none');
    return list.map((m) => `${F(m, 'name')} ${F(m, 'dose')} (${m.times.join(' · ')})`).join(' — ');
  }

  function alertHTML(a) {
    const p = a.pilgrim;
    return `
      <div class="alert-head">
        <div>
          <span class="alert-tag">${T('alert.tag')}</span>
          <h3>${esc(F(p, 'name'))} · ${esc(p.age)} ${T('card.years')}</h3>
        </div>
        <span class="when">${esc(a.at)} · ${esc(a.id)}</span>
      </div>

      <div class="kv-grid">
        <div class="kv"><span class="k">${T('alert.condition')}</span><span class="v">${esc(F(p, 'condition'))}</span></div>
        <div class="kv"><span class="k">${T('alert.meds')}</span><span class="v">${esc(medsText(p.medications))}</span></div>
        <div class="kv"><span class="k">${T('alert.earpiece')}</span><span class="v">${esc(p.earpieceId)}</span></div>
        <div class="kv"><span class="k">${T('alert.group')}</span><span class="v">${esc(F(p, 'groupId'))}</span></div>
        <div class="kv"><span class="k">${T('alert.contact')}</span><span class="v">${esc(F(p.emergencyContact, 'name'))}<br><span class="ltr">${esc(p.emergencyContact.phone)}</span></span></div>
        <div class="kv"><span class="k">${T('alert.distance')}</span><span class="v">${esc(a.location.distanceFromGroup)} ${T('alert.metres')} ${esc(a.ritualStep + 1)}</span></div>
      </div>

      ${a.signals && a.signals.length
        ? `<div class="kv" style="margin-bottom:10px"><span class="k">${T('alert.signals')}</span><span class="v">${a.signals.map(esc).join(' · ')}</span></div>`
        : ''}

      <div class="quote">${T('alert.said')} “${esc(a.spoken)}”</div>

      <ul class="log-list" id="log-${a.id}">${(a.notifications || [])
        .map((n) => `<li><span class="t">${esc(n.at)}</span><span>${esc(F(n, 'text'))}</span></li>`)
        .join('')}</ul>`;
  }

  function renderAll() {
    // التنبيهات · alerts
    const host = $('alerts');
    if (!store.alerts.length) {
      host.innerHTML = `<div class="empty" id="alerts-empty"><span class="big">☾</span>${T('alerts.empty')}<br><span style="font-size:12.5px">${T('alerts.emptySub')}</span></div>`;
      $('alert-count').textContent = T('alerts.none');
    } else {
      host.innerHTML = store.alerts
        .map((a) => `<div class="alert-card" id="alert-${a.id}">${alertHTML(a)}</div>`)
        .join('');
      $('alert-count').textContent = `${store.alerts.length} ${T('alerts.count')}`;
    }

    // الأحداث · events
    const ev = $('events');
    if (!store.events.length) {
      ev.innerHTML = `<div class="empty" id="events-empty" style="padding:26px">${T('alerts.noEvents')}</div>`;
    } else {
      ev.innerHTML = store.events
        .slice()
        .reverse()
        .map(
          (e) => `
        <div class="event-row ${e.type}">
          <span class="dot"></span>
          <div class="body">
            <div class="t1">${esc(F(e, 'title'))} — ${esc(F(e, 'pilgrimName'))} <span class="pill mono">${esc(e.earpieceId)}</span></div>
            <div class="t2">${esc(e.detail)}</div>
            <div class="t3">${esc(e.at)} · ${esc(e.id)}</div>
          </div>
        </div>`
        )
        .join('');
    }

    // الأرشيف · resolved
    $('resolved').innerHTML = store.resolved
      .map(
        (r) => `
      <div class="event-row drift_resolved">
        <span class="dot"></span>
        <div class="body">
          <div class="t1">${esc(F(r, 'type'))} — ${esc(F(r, 'pilgrimName'))} <span class="pill mono">${esc(r.earpieceId)}</span></div>
          <div class="t2">${esc(F(r, 'outcome'))}</div>
          <div class="t3">${esc(F(r, 'at'))} · ${esc(r.id)} · ${T('alerts.closed')}</div>
        </div>
      </div>`
      )
      .join('');
  }

  function renderConn() {
    $('conn').innerHTML = socket.connected
      ? T('agent.connected') + ' <span class="live-dot"></span>'
      : '· ' + T('agent.disconnected');
  }
  socket.on('connect', renderConn);
  socket.on('disconnect', renderConn);

  socket.on('bootstrap', (d) => {
    store.alerts = d.alerts || [];
    store.events = d.events || [];
    store.resolved = d.resolvedIncidents || [];
    renderAll();
  });

  socket.on('alert', (a) => {
    store.alerts.unshift(a);
    renderAll();
    document.title = '⚠ ' + (window.I18N.lang === 'en' ? 'Emergency · Sakeenah' : 'تنبيه طارئ · سكينة');
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 880; g.gain.value = 0.05;
      o.start(); o.stop(ctx.currentTime + 0.22);
    } catch (_) {}
  });

  socket.on('alert-log', (line) => {
    const a = store.alerts.find((x) => x.id === line.alertId);
    if (a) {
      a.notifications = a.notifications || [];
      a.notifications.push(line);
    }
    const ul = $('log-' + line.alertId);
    if (ul) {
      const li = document.createElement('li');
      li.innerHTML = `<span class="t">${esc(line.at)}</span><span>${esc(F(line, 'text'))}</span>`;
      ul.appendChild(li);
    }
  });

  socket.on('event', (e) => { store.events.push(e); renderAll(); });

  document.addEventListener('langchange', () => { renderAll(); renderConn(); });
})();
