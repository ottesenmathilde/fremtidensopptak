/* ═══════════════════════════════════════════
   studiestart-modal.js
   "Velg studiestart" modal for emnebestilling
   ═══════════════════════════════════════════ */

(function() {

/* ── State ── */
var _ssPending = [];   // [{btn, code, name, pts, price}, …]
var _ssStyleInjected = false;

/* ── CSS injection ── */
function injectStyles() {
  if (_ssStyleInjected) return;
  _ssStyleInjected = true;
  var css = document.createElement('style');
  css.textContent = '\
.ss-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1400;opacity:0;transition:opacity .2s}\
.ss-backdrop.open{display:block;opacity:1}\
.ss-modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%) scale(.96);background:#fff;border-radius:16px;width:90%;max-width:460px;max-height:90vh;overflow-y:auto;z-index:1401;opacity:0;transition:transform .25s,opacity .2s;box-shadow:0 8px 40px rgba(0,0,0,.18)}\
.ss-backdrop.open .ss-modal{transform:translate(-50%,-50%) scale(1);opacity:1}\
.ss-header{padding:20px 24px 0;display:flex;align-items:center;gap:12px}\
.ss-close{width:32px;height:32px;border-radius:50%;border:1.5px solid #c7c8ca;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;color:#555;flex-shrink:0;transition:background .15s}\
.ss-close:hover{background:#f0f0f0}\
.ss-title{font-size:24px;font-weight:700;color:#121212;padding:16px 24px 0}\
.ss-body{padding:16px 24px 24px;display:flex;flex-direction:column;gap:16px}\
.ss-radio-group{display:flex;flex-direction:column;gap:12px}\
.ss-radio-card{border:1.5px solid #e0e0e0;border-radius:12px;padding:20px;cursor:pointer;display:flex;align-items:flex-start;gap:14px;transition:border-color .15s,background .15s}\
.ss-radio-card:hover{background:#fafafa}\
.ss-radio-card.selected{border-color:#06f;background:#f0f7ff}\
.ss-radio-dot{width:22px;height:22px;border:2px solid #c7c8ca;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;margin-top:2px;transition:border-color .15s}\
.ss-radio-card.selected .ss-radio-dot{border-color:#06f}\
.ss-radio-card.selected .ss-radio-dot::after{content:"";width:12px;height:12px;background:#06f;border-radius:50%}\
.ss-radio-main{font-size:18px;font-weight:700;color:#121212}\
.ss-radio-sub{font-size:13px;color:#666;margin-top:4px;display:flex;align-items:center;gap:6px}\
.ss-radio-sub svg{flex-shrink:0}\
.ss-radio-desc{font-size:13px;color:#555;margin-top:8px;line-height:1.5}\
.ss-radio-link{color:#06f;text-decoration:underline;font-size:13px}\
.ss-calendar-wrap{display:none;padding:4px 0 0}\
.ss-calendar-wrap.open{display:block}\
.ss-date-input{width:100%;border:1.5px solid #c7c8ca;border-radius:8px;padding:14px 16px;font-size:15px;font-family:inherit;outline:none;transition:border-color .15s;cursor:pointer}\
.ss-date-input:focus{border-color:#06f}\
.ss-hint{font-size:12px;color:#888;margin-top:6px}\
.ss-checkbox-row{display:flex;align-items:flex-start;gap:10px;cursor:pointer}\
.ss-checkbox-box{width:22px;height:22px;border:1.5px solid #c7c8ca;border-radius:4px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s}\
.ss-checkbox-box.checked{background:#06f;border-color:#06f}\
.ss-checkbox-label{font-size:14px;color:#121212;line-height:22px}\
.ss-warning{background:#fdf6ec;border:1px solid #f0d8a8;border-radius:10px;padding:16px;margin-top:4px}\
.ss-warning-title{font-size:12px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}\
.ss-warning p{font-size:13px;color:#555;line-height:1.5;margin:0 0 8px}\
.ss-warning p:last-child{margin-bottom:0}\
.ss-warning strong{color:#121212}\
.ss-warning-email-label{font-size:13px;color:#888;margin-bottom:6px}\
.ss-warning-email{width:100%;border:1.5px solid #c7c8ca;border-radius:8px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;background:#fff}\
.ss-warning-email:focus{border-color:#06f}\
.ss-or-text{font-size:13px;color:#888}\
.ss-btn{display:flex;align-items:center;justify-content:center;gap:8px;height:52px;background:#111;color:#fff;font-family:inherit;font-size:16px;font-weight:600;border:none;border-radius:40px;cursor:pointer;width:100%;transition:background .15s}\
.ss-btn:hover{background:#333}\
.ss-btn:disabled{background:#ccc;cursor:not-allowed}\
.ss-btn svg{flex-shrink:0}\
@media(max-width:640px){\
.ss-modal{top:auto;bottom:0;left:0;right:0;transform:translateY(20px);width:100%;max-width:100%;border-radius:16px 16px 0 0;max-height:85vh}\
.ss-backdrop.open .ss-modal{transform:translateY(0)}\
}';
  document.head.appendChild(css);
}

/* ── Date scenario logic ── */
function getStudiestartScenario() {
  var now = new Date();
  var m = now.getMonth(); // 0-based
  var d = now.getDate();
  var y = now.getFullYear();

  // Oct 16 – Jan 15: vår nærmer seg
  if ((m === 9 && d >= 16) || m === 10 || m === 11 || (m === 0 && d <= 15)) {
    var semYear = (m >= 9) ? y + 1 : y;
    var semDate = new Date(semYear, 0, 16); // Jan 16
    var endDate = new Date(semYear + 1, 0, 15); // Jan 15 next year
    return {
      id: 'approaching',
      semesterLabel: '16. januar ' + semYear,
      studierettLabel: 'Studierett til 15. januar ' + (semYear + 1),
      semesterDateStr: formatDateShort(semDate),
      loanInfo: 'Anbefalt hvis du ønsker å søke lån/stipend hos Lånekassen.',
      loanLink: 'Les mer: Lånekassen: Nettstudier og samlingsbasert'
    };
  }
  // May 16 – Aug 15: høst nærmer seg
  if ((m === 4 && d >= 16) || m === 5 || m === 6 || (m === 7 && d <= 15)) {
    var semDate2 = new Date(y, 7, 16); // Aug 16
    var endDate2 = new Date(y + 1, 7, 15); // Aug 15 next year
    return {
      id: 'approaching',
      semesterLabel: '16. august ' + y,
      studierettLabel: 'Studierett til 15. august ' + (y + 1),
      semesterDateStr: formatDateShort(semDate2),
      loanInfo: 'Anbefalt hvis du ønsker å søke lån/stipend hos Lånekassen.',
      loanLink: 'Les mer: Lånekassen: Nettstudier og samlingsbasert'
    };
  }
  // Jan 16 – May 15: mellom semestre (vår pågår)
  if ((m === 0 && d >= 16) || (m >= 1 && m <= 3) || (m === 4 && d <= 15)) {
    return {
      id: 'between',
      nextSemester: 'høstsemesteret',
      nextDate: '16. august',
      nextDateBold: '16. august',
      orderOpens: '16. mai',
      orderOpensBold: '16. mai'
    };
  }
  // Aug 16 – Oct 15: mellom semestre (høst pågår)
  return {
    id: 'between',
    nextSemester: 'vårsemesteret',
    nextDate: '16. januar',
    nextDateBold: '16. januar',
    orderOpens: '16. oktober',
    orderOpensBold: '16. oktober'
  };
}

function formatDateShort(d) {
  var dd = String(d.getDate()).padStart(2, '0');
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var yy = String(d.getFullYear()).slice(-2);
  return dd + '.' + mm + '.' + yy;
}

function getCalendarMinMax() {
  var now = new Date();
  var min = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  var max = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
  return {
    min: min.toISOString().split('T')[0],
    max: max.toISOString().split('T')[0]
  };
}

/* ── Build modal HTML ── */
function buildApproachingHTML(sc) {
  var mm = getCalendarMinMax();
  return '<div class="ss-header"><button class="ss-close" onclick="closeStudiestartModal()">&times;</button></div>'
    + '<h2 class="ss-title">Velg studiestart</h2>'
    + '<div class="ss-body">'
    + '<div class="ss-radio-group">'
    // Option 1: Semester date
    + '<div class="ss-radio-card selected" onclick="ssSelectRadio(this,\'semester\')">'
    + '<div class="ss-radio-dot"></div>'
    + '<div style="flex:1">'
    + '<div class="ss-radio-main">' + sc.semesterLabel + '</div>'
    + '<div class="ss-radio-sub"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#888" stroke-width="1.5"/><path d="M12 6v6l4 2" stroke="#888" stroke-width="1.5" stroke-linecap="round"/></svg> ' + sc.studierettLabel + '</div>'
    + '<p class="ss-radio-desc">' + sc.loanInfo + '</p>'
    + '<a href="https://www.lanekassen.no/nb-NO/Stipend-og-lan/Utdanning-i-Norge/nettstudier-og-samlingsbasert/" class="ss-radio-link" target="_blank" onclick="event.stopPropagation()">' + sc.loanLink + '</a>'
    + '</div></div>'
    // Option 2: Custom date
    + '<div class="ss-radio-card" onclick="ssSelectRadio(this,\'custom\')">'
    + '<div class="ss-radio-dot"></div>'
    + '<div style="flex:1">'
    + '<div class="ss-radio-main">Valgfri oppstartsdato</div>'
    + '<div class="ss-radio-sub"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#888" stroke-width="1.5"/><path d="M12 6v6l4 2" stroke="#888" stroke-width="1.5" stroke-linecap="round"/></svg> 12 måneder studierett</div>'
    + '<p class="ss-radio-desc">Du kan starte når som helst innen 3 måneder fra dagens dato.</p>'
    + '<div class="ss-calendar-wrap" id="ss-cal-wrap">'
    + '<input type="date" class="ss-date-input" id="ss-custom-date" min="' + mm.min + '" max="' + mm.max + '">'
    + '<p class="ss-hint">Du kan kun velge oppstart tre måneder frem i tid.</p>'
    + '</div>'
    + '</div></div>'
    + '</div>'
    + '<button class="ss-btn" id="ss-confirm-btn" onclick="confirmStudiestart()">'
    + 'Gå videre <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    + '</button>'
    + '</div>';
}

function buildBetweenHTML(sc) {
  var mm = getCalendarMinMax();
  return '<div class="ss-header"><button class="ss-close" onclick="closeStudiestartModal()">&times;</button></div>'
    + '<h2 class="ss-title">Velg studiestart</h2>'
    + '<div class="ss-body">'
    // Checkbox
    + '<div class="ss-checkbox-row" onclick="ssToggleCheckbox(this)">'
    + '<div class="ss-checkbox-box" id="ss-lk-check"><svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
    + '<span class="ss-checkbox-label">Jeg planlegger å søke støtte hos Lånekassen</span>'
    + '</div>'
    // Warning banner
    + '<div class="ss-warning">'
    + '<div class="ss-warning-title">Utenfor Lånekassens semester</div>'
    + '<p>Semesteret er i gang, og oppstart nå vil muligens ikke gi støtte fra Lånekassen.</p>'
    + '<p>Neste semester (' + sc.nextSemester + ') har oppstart <strong>' + sc.nextDateBold + '</strong> og kan bestilles fra <strong>' + sc.orderOpensBold + '</strong>.</p>'
    + '<div class="ss-warning-email-label">Bli varslet når du kan bestille for ' + sc.nextSemester + '</div>'
    + '<input type="email" class="ss-warning-email" id="ss-notify-email" placeholder="mail@epost.com">'
    + '</div>'
    // Or pick date
    + '<p class="ss-or-text">Du kan likevel velge en startdato og studere uten støtte:</p>'
    + '<div style="position:relative;">'
    + '<input type="date" class="ss-date-input" id="ss-custom-date" min="' + mm.min + '" max="' + mm.max + '" onchange="ssDateChanged()">'
    + '</div>'
    + '<p class="ss-hint">Du kan kun velge oppstart tre måneder frem i tid.</p>'
    + '<button class="ss-btn" id="ss-confirm-btn" onclick="confirmStudiestart()" disabled>'
    + 'Gå videre <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    + '</button>'
    + '</div>';
}

/* ── Public API ── */

window.openStudiestartModal = function(pendingCourses, scenarioOverride) {
  injectStyles();
  _ssPending = pendingCourses || [];

  // Remove existing modal if any
  var old = document.getElementById('ss-backdrop');
  if (old) old.remove();

  var sc = scenarioOverride || getStudiestartScenario();
  var html = (sc.id === 'approaching') ? buildApproachingHTML(sc) : buildBetweenHTML(sc);

  var backdrop = document.createElement('div');
  backdrop.className = 'ss-backdrop';
  backdrop.id = 'ss-backdrop';
  backdrop.innerHTML = '<div class="ss-modal" id="ss-modal">' + html + '</div>';

  // Close on backdrop click
  backdrop.addEventListener('click', function(e) {
    if (e.target === backdrop) closeStudiestartModal();
  });

  document.body.appendChild(backdrop);

  // Store scenario for later
  backdrop._ssScenario = sc;

  // Trigger open animation
  requestAnimationFrame(function() { backdrop.classList.add('open'); });
};

window.closeStudiestartModal = function() {
  var backdrop = document.getElementById('ss-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  setTimeout(function() { backdrop.remove(); }, 250);
  _ssPending = [];
};

window.ssSelectRadio = function(card, value) {
  var group = card.closest('.ss-radio-group');
  group.querySelectorAll('.ss-radio-card').forEach(function(c) { c.classList.remove('selected'); });
  card.classList.add('selected');

  var calWrap = document.getElementById('ss-cal-wrap');
  var btn = document.getElementById('ss-confirm-btn');
  if (value === 'custom') {
    if (calWrap) calWrap.classList.add('open');
    // Disable confirm until date picked
    var dateInput = document.getElementById('ss-custom-date');
    if (btn) btn.disabled = !dateInput.value;
    if (dateInput) {
      dateInput.onchange = function() { if (btn) btn.disabled = !this.value; };
    }
  } else {
    if (calWrap) calWrap.classList.remove('open');
    if (btn) btn.disabled = false;
  }
};

window.ssToggleCheckbox = function(row) {
  var box = row.querySelector('.ss-checkbox-box');
  if (box) box.classList.toggle('checked');
};

window.ssDateChanged = function() {
  var dateInput = document.getElementById('ss-custom-date');
  var btn = document.getElementById('ss-confirm-btn');
  if (btn && dateInput) btn.disabled = !dateInput.value;
};

window.confirmStudiestart = function() {
  var backdrop = document.getElementById('ss-backdrop');
  if (!backdrop) return;
  var sc = backdrop._ssScenario;
  var dateStr = '';

  if (sc.id === 'approaching') {
    var selectedCard = document.querySelector('.ss-radio-card.selected');
    if (!selectedCard) return;
    var isSemester = selectedCard.querySelector('.ss-radio-main').textContent.indexOf('Valgfri') === -1;
    if (isSemester) {
      dateStr = sc.semesterDateStr;
    } else {
      var dateInput = document.getElementById('ss-custom-date');
      if (!dateInput || !dateInput.value) return;
      var parts = dateInput.value.split('-');
      dateStr = parts[2] + '.' + parts[1] + '.' + parts[0].slice(-2);
    }
  } else {
    // Between semesters — must pick a custom date
    var dateInput2 = document.getElementById('ss-custom-date');
    if (!dateInput2 || !dateInput2.value) return;
    var parts2 = dateInput2.value.split('-');
    dateStr = parts2[2] + '.' + parts2[1] + '.' + parts2[0].slice(-2);
  }

  // Add all pending courses with start date
  _ssPending.forEach(function(c) {
    if (typeof spCart !== 'undefined' && !spCart[c.code]) {
      spCart[c.code] = { name: c.name, pts: c.pts, price: c.price, startDate: dateStr };
      document.querySelectorAll('.sp-course-row[data-code="' + c.code + '"] .sp-add-btn').forEach(function(b) {
        b.classList.add('added');
        b.textContent = '\u2713';
      });
    }
  });

  if (typeof spSyncToBasket === 'function') spSyncToBasket();

  closeStudiestartModal();
};

})();
