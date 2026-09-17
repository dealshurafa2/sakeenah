/* سكينة — الشاشة الأولى: لوحة الحملة · Screen 1: campaign roster */
(() => {
  'use strict';
  let db = null;
  const T = (k) => window.I18N.t(k);
  const F = (o, f) => window.I18N.f(o, f);

  function render() {
    if (!db) return;
    document.getElementById('campaign-name').textContent = F(db.campaign, 'name');
    document.getElementById('campaign-sub').textContent =
      `${F(db.campaign, 'season')} · ${T('roster.leader')} ${F(db.campaign, 'leader')} · ${T('roster.id')} ${db.campaign.id}`;
    document.getElementById('count').textContent = `${db.pilgrims.length} ${T('roster.count')}`;

    const risk = (r) =>
      r === 'مرتفع' ? `<span class="pill high">${T('risk.high')}</span>`
      : r === 'متوسط' ? `<span class="pill mid">${T('risk.mid')}</span>`
      : `<span class="pill">${T('risk.low')}</span>`;

    const meds = (list) =>
      !list || !list.length
        ? `<span style="color:var(--muted-2);font-size:12.5px">${T('meds.none')}</span>`
        : list
            .map(
              (m) =>
                `<span class="med-line"><b>${F(m, 'name')}</b> ${F(m, 'dose')} — <span class="med-time">${m.times.join(' · ')}</span></span>`
            )
            .join('');

    document.getElementById('rows').innerHTML = db.pilgrims
      .map(
        (p) => `
      <tr class="${p.isDemoPilgrim ? 'demo-row' : ''}">
        <td>
          ${F(p, 'name')}${p.isDemoPilgrim ? ` <span class="pill gold">${T('demo.badge')}</span>` : ''}
          <span class="cell-sub">${F(p, 'nationality')} · ${F(p, 'notes')}</span>
        </td>
        <td>${p.age}</td>
        <td>${F(p, 'condition')}<span class="cell-sub">${risk(p.riskLevel)}</span></td>
        <td>${meds(p.medications)}</td>
        <td><span class="pill mono">${p.earpieceId}</span></td>
        <td>${F(p, 'groupId')}</td>
        <td>${F(p.emergencyContact, 'name')}<span class="cell-sub"><span class="ltr">${p.emergencyContact.phone}</span></span></td>
      </tr>`
      )
      .join('');
  }

  document.addEventListener('langchange', render);

  (async () => {
    db = await fetch('/api/campaign').then((r) => r.json());
    render();
  })();
})();
