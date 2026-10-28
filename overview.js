// Titan AI Studio overview page (src/client/overview/overview.html): capability matrix, coverage explorer and release history.
// Lives in its own file because the MV3 extension-page CSP blocks inline scripts. Reads the release list from the #releases-data JSON block.
(function () {
  // Capability matrix. Column order: WEB, new builder, FORM1, DocsTitan, Salesforce, SmartV.
  // a Available · b Beta · p Planned · x Not available · n Not applicable · c To confirm. "a:Source" overrides the label; "_" stands for a space.
  var LABEL = { a: 'Available', b: 'Beta', p: 'Planned', x: 'Not available', n: 'Not applicable', c: 'To confirm' };
  var ROWS = [
    ['Build from a prompt'],
    ['Forms', 'single-page forms with validation', 'a a n a a n'],
    ['Step-by-step wizards', 'native Stepper with per-step validation', 'a a n a a n'],
    ['Customer portals', 'navigation, views, record lists', 'a b n a a n'],
    ['Landing pages', 'hero, features, pricing, lead form', 'a a n a n n'],
    ['Multi-page websites', 'several pages with shared navigation', 'a b n a n n'],
    ['Choose the build depth', 'UI only, or with Salesforce mapping', 'a a n a a n'],
    ['Template library', 'ready-made starting points', 'a b n a b n'],
    ['Plan assistant and Discovery', 'brief first, or a suggestion from your website', 'a b n a a n'],
    ['Import and convert'],
    ['Convert FORM1 to WEB', 'one click; rules, repeats, tables', 'a x a:Source a b b'],
    ['Convert FORM1 to the new builder', 'one click from the FORM1 designer', 'x b a:Source x b b'],
    ['Keep or modernize the look', 'on a FORM1 conversion: the original look or the modern design', 'a b a:Source a n n'],
    ['FORM1 project overview', 'what a form does, before converting', 'n n a:Source a a b'],
    ['Rebuild from a web address', 'live site or web app, forms and wizard steps', 'a b n a n n'],
    ['Build from a design spec', 'exact look, no AI call', 'a x n a a a'],
    ['Build from a design-canvas ZIP or HTML app', 'every screen, including ones behind clicks', 'a x n a a a'],
    ['Build from a screenshot', 'image read by the AI', 'a b n a n n'],
    ['Design plus a brief or business document', 'one logic pass on top of the design', 'a x n a a n'],
    ['Generate and convert documents', 'Generate with AI, Convert Documents', 'n n n a a n'],
    ['Refine'],
    ['Edit in plain words, with Pick', 'any project, AI-built or hand-built', 'a a n a a b:WEB_only'],
    ['Five design styles and style switcher', 'audience-matched, readable contrast', 'a b n a n n'],
    ['Normalize a project', 'tidy spacing, type and colour in one pass', 'a x n a n n'],
    ['Translations and language switcher', 'every caption, option and message', 'a a a a n n'],
    ['Add a language later', 'on an existing project', 'a a a a n n'],
    ['Right-to-left layouts', 'Hebrew, Arabic', 'a b a a n n'],
    ['Desktop, tablet and phone layouts', 'written for every device layer', 'a b a a n n'],
    ['Show and hide rules', 'native conditions and flows', 'a b a a a n'],
    ['Buttons that do things', 'navigation, validation, save, submit', 'a b a a a n'],
    ['Restore earlier versions', 'go back to a previous build', 'a x n a n n'],
    ['Salesforce and login'],
    ['Read Salesforce records', 'prefill fields and lists', 'a b a:Source a a n'],
    ['Create and update records on submit', 'Case, Contact, Lead and custom objects', 'a b a:Source a a n'],
    ['Tables fed from Salesforce', 'columns, filters and paging', 'a b a:Source a a n'],
    ['Field names checked against your org', 'no guessed API names', 'a b n a a n'],
    ['Import Salesforce validation rules', 'reuse rules you already have', 'a b n a a n'],
    ['SmartV sign-in pages', 'from a prompt, a design or FORM1', 'a x a:Source a a a'],
    ['Verify'],
    ['QA audit', 'around 30 checks, both builders', 'a b n a a a'],
    ['Design score', '0–100 with a fix-first list', 'a b n a n n'],
    ['Test scenarios and Excel round trip', 'derived from one sentence', 'a a n a a a'],
    ['Live test run in Preview', 'pause, stop, take over', 'a x n a b:Sandbox_only a'],
    ['Content quality checks', 'no placeholder or instruction text', 'a a n a n n'],
    ['Colour and contrast checks', 'readable text on every background', 'a a n a n n'],
    ['Build summary', 'what was built and what was left out', 'a a a a a n'],
    ['Insight review', 'written health review of a project', 'a b n a a n'],
    ['Panel and tools'],
    ['Voice prompts', 'Chrome and Edge', 'a a n a n n'],
    ['Attach images, PDFs and documents', 'as context for a build or an edit', 'a a a a n n'],
    ['Command palette', 'jump to any template, tool or setting', 'a a n a n n'],
    ['Integrations hub', 'webhooks, Slack, Zapier and more', 'a b n a n n'],
    ['Ask Platform', 'questions about Titan, answered on the dashboard', 'a a n a a n'],
    ['Dark mode and bug reports', 'panel preferences and local diagnostics', 'a a n a n n']
  ];

  var body = document.getElementById('matrix-body');
  ROWS.forEach(function (row) {
    var tr = document.createElement('tr');
    if (row.length === 1) {
      tr.className = 'sec';
      var th = document.createElement('th');
      th.scope = 'rowgroup';
      th.textContent = row[0];
      tr.appendChild(th);
      var filler = document.createElement('td');
      filler.colSpan = 6;
      tr.appendChild(filler);
      body.appendChild(tr);
      return;
    }
    var name = document.createElement('th');
    name.scope = 'row';
    name.textContent = row[0];
    var hint = document.createElement('small');
    hint.textContent = row[1];
    name.appendChild(hint);
    tr.appendChild(name);
    row[2].split(' ').forEach(function (cell) {
      var parts = cell.split(':');
      var code = parts[0];
      var td = document.createElement('td');
      var badge = document.createElement('span');
      badge.className = 'st st-' + code;
      badge.textContent = parts[1] ? parts[1].replace(/_/g, ' ') : LABEL[code];
      td.appendChild(badge);
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });

  // Platform coverage: meters and the info popup are drawn from coverage_details.js (generated from the coverage matrices by
  // tools/overview/gen_coverage_details.mjs), so every count equals the length of the lists behind it.
  var DETAILS = window.TITAN_COVERAGE_DETAILS;
  var CARDS = [
    { key: 'web', title: 'FormTitan WEB', meters: 'meters-web', unverified: false },
    { key: 'nb', title: 'New builder', meters: 'meters-nb', unverified: true },
    { key: 'f1', title: 'FORM1 to WEB conversion', meters: 'meters-f1', unverified: false }
  ];
  var GROUPS = [['planned', 'Planned'], ['partly', 'Partly converted'], ['byHand', 'Add by hand in the editor']];
  function rowTotal(row) { return row.covered.length + row.planned.length + row.partly.length + row.byHand.length; }
  function textEl(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function nameList(names) {
    var ul = textEl('ul', 'cd-list');
    names.forEach(function (n) { ul.appendChild(textEl('li', null, n)); });
    return ul;
  }
  function detailSection(title, count, names, cls) {
    var sec = textEl('section', 'cd-sec ' + cls);
    sec.appendChild(textEl('h4', null, title + ' (' + count + ')'));
    sec.appendChild(count ? nameList(names) : textEl('p', 'cd-none', 'Nothing in this group.'));
    return sec;
  }
  function notYetSection(row) {
    var count = rowTotal(row) - row.covered.length;
    var sec = textEl('section', 'cd-sec cd-not');
    sec.appendChild(textEl('h4', null, 'Not yet (' + count + ')'));
    if (!count) sec.appendChild(textEl('p', 'cd-none', 'Nothing left in this group.'));
    GROUPS.forEach(function (g) {
      if (!row[g[0]].length) return;
      sec.appendChild(textEl('h5', null, g[1] + ' (' + row[g[0]].length + ')'));
      sec.appendChild(nameList(row[g[0]]));
    });
    return sec;
  }
  var dialog = document.getElementById('cov-dialog');
  var lastOpener = null;
  function openDetails(card, row, opener) {
    var data = DETAILS[card.key];
    var total = rowTotal(row);
    var body = document.getElementById('cov-dialog-body');
    body.textContent = '';
    document.getElementById('cov-dialog-title').textContent = card.title + ': ' + row.label;
    var sub = row.covered.length + ' of ' + total + ' covered (' + Math.round(row.covered.length / total * 100) + '%) - measured ' + data.measured;
    body.appendChild(textEl('p', 'cd-sub', sub));
    if (row.newBuilder) {
      var nb = row.newBuilder;
      body.appendChild(textEl('p', 'cd-nb', 'In the new builder (early access): ' + nb.covered + ' of ' + nb.total + ' covered' + (nb.byHand ? ', ' + nb.byHand + ' have no native counterpart and are added by hand' : '') + '.'));
    }
    body.appendChild(detailSection('Covered', row.covered.length, row.covered, 'cd-yes'));
    body.appendChild(notYetSection(row));
    body.appendChild(textEl('p', 'cd-foot', 'Anything not covered can still be added by hand in the editor.'));
    lastOpener = opener;
    if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
    body.scrollTop = 0;
  }
  function closeDetails() {
    if (dialog.close) dialog.close(); else dialog.removeAttribute('open');
    if (lastOpener) lastOpener.focus();
  }
  dialog.addEventListener('click', function (e) { if (e.target === dialog) closeDetails(); });
  dialog.addEventListener('cancel', function (e) { e.preventDefault(); closeDetails(); });
  document.getElementById('cov-dialog-close').addEventListener('click', closeDetails);
  function meterRow(card, row) {
    var total = rowTotal(row), covered = row.covered.length;
    var pct = Math.round(covered / total * 100);
    var li = document.createElement('li');
    li.className = 'meter' + (card.unverified ? ' unverified' : '');
    li.title = row.label + ': ' + covered + ' of ' + total + ' (' + pct + '%)' + (card.unverified ? ', from code, not yet verified live' : '');
    var lbl = textEl('div', 'lbl', row.label);
    var info = textEl('button', 'cov-info', 'i');
    info.type = 'button';
    info.setAttribute('aria-label', 'What is covered in ' + row.label);
    info.setAttribute('aria-haspopup', 'dialog');
    info.addEventListener('click', function () { openDetails(card, row, info); });
    lbl.appendChild(info);
    lbl.appendChild(textEl('small', null, row.hint));
    var val = textEl('div', 'val');
    val.appendChild(textEl('b', null, pct + '%'));
    val.appendChild(document.createTextNode(covered + ' of ' + total));
    var bar = textEl('div', 'bar');
    bar.setAttribute('role', 'img'); bar.setAttribute('aria-label', pct + ' percent');
    var fill = document.createElement('i'); fill.style.width = pct + '%'; bar.appendChild(fill);
    li.appendChild(lbl); li.appendChild(val); li.appendChild(bar);
    return li;
  }
  CARDS.forEach(function (card) {
    var ul = document.getElementById(card.meters);
    DETAILS[card.key].rows.forEach(function (row) { ul.appendChild(meterRow(card, row)); });
  });
  // Header dates and the FORM1 partial counts come from the same data.
  document.getElementById('cov-web-date').textContent = 'Platform census, ' + DETAILS.web.measured;
  document.getElementById('cov-nb-date').textContent = 'Early access · builder code, ' + DETAILS.nb.measured;
  document.getElementById('cov-f1-date').textContent = 'Measured ' + DETAILS.f1.measured;
  document.getElementById('cov-f1-partial').textContent = DETAILS.f1.rows.map(function (r, i) {
    return r.partly.length + ' ' + ['elements', 'rule actions', 'operators', 'calculations', 'settings tabs', 'integrations'][i];
  }).join(', ');

  // Element explorer. Per palette category: "Type:s" where s = y built by AI, s built in some routes only, h add by hand.
  var EL_WEB = {"Containers":"Accordion:y CarouselContainer:y DrawerEl:y Modal:y MultiStepper:y RepeatAutoFit:y Scroll:h Section:y Stack:y Stepper:y Tab:y TwoSideSection:h","Widget":"AddressFinder:h Badge:y BarcodeGenerator:h BarcodeReader:h Breadcrumb:y Capture:h Counter:y DateRange:h DiffViewer:h ExternalLookup:h FileViewer:s GoogleMap:s InteractiveDocument:h Kanban:h PageSearch:h Progress:y Scheduler:h SmartVLoginForm:h SmartVOtpForm:y Spreadsheet:h Stripe:s TablePricing:h TextReview:h Ticker:y Tracker:y TreeView:h VerticalCard:y infoBox:h","Media":"Animation:h ExtendedGallery:y Image:y ImageAnnotator:h InteractiveImage:y TestimonialsCarousel:y Vimeo:s YouTube:s galleryCarousel:y galleryGrid:y iframe:y","Survey":"CES:h ImageChoice:y Matrix:y Range:y Ranking:h Rating:y StarRating:y SurveyList:h TextCounter:y YesNo:h","Forms and inputs":"Form:y FormField:y CircleSlider:y Search:y ContinualForm:h titanForm:h GenieForm:h","Text, buttons and shapes":"Button:y Link:y Typography:y ItemList:h Line:y Svg:y Strip:y Component:y","Tables and charts":"PowerTable:y list:y table:y chart:h","Not in palette":"Banner:h ECommerceCartIcon:y ECommerceCatalogue:h ECommerceCategories:h ECommerceProduct:y ECommerceRelatedProducts:y FlexStrip:h PageConditionalForm:h Widget:y"};
  var EL_NB = {"Containers":"accordion:y footer:y form:y header:y stepper:y tabs:y","Text and buttons":"button-primary:y button-secondary:y info-box:h link:y typography-caption:y typography-heading:y typography-paragraph:y typography-subhead:y typography-title:y","Text inputs":"email-input:h text-input:y textarea:y url-input:h","Choices and pickers":"checkbox:y chip-selector:y radio-group:y dropdown:y lookup:y multi-select:y switch:y","Numbers and dates":"currency-input:y numeric-input:y range-slider:h date-picker:y date-range-picker:h datetime-picker:y inline-date-range-picker:h time-picker:y","Other inputs":"file-upload-input:y phone:y signature:y","Commerce and media":"add-extras:y cart-button:y cart-lines:y category-menu:y file-viewer:y gallery-carousel:y google-map:y icon:y iframe:y image:y line:y order-summary:y product-card:y product-carousel:y product-detail:y product-grid:y quick-cart:y quick-view:y stripe:y table-view:y testimonial-carousel:y vimeo:y youtube:y","Structure":"nav:y page:y password-input:y repeat:y section:y stack:y submit-button:y"};
  var EX_LABEL = { y: ['a', 'Built by AI'], s: ['b', 'Some routes'], h: ['n', 'Add by hand'] };
  var exState = { t: 'web', q: '', f: 'all' };
  function renderExplorer() {
    var data = exState.t === 'web' ? EL_WEB : EL_NB;
    var host = document.getElementById('ex-groups');
    host.textContent = '';
    var shown = 0, total = 0, built = 0;
    Object.keys(data).forEach(function (cat) {
      var rows = data[cat].split(' ').map(function (s) { var p = s.split(':'); return { name: p[0], s: p[1] }; });
      total += rows.length;
      built += rows.filter(function (r) { return r.s === 'y'; }).length;
      var vis = rows.filter(function (r) {
        return (exState.f === 'all' || r.s === exState.f) && r.name.toLowerCase().indexOf(exState.q) !== -1;
      });
      if (!vis.length) return;
      shown += vis.length;
      var g = document.createElement('div'); g.className = 'ex-group';
      var h = document.createElement('h4'); h.textContent = cat;
      var c = document.createElement('span');
      c.textContent = rows.filter(function (r) { return r.s === 'y'; }).length + ' of ' + rows.length + ' built';
      h.appendChild(c); g.appendChild(h);
      var ul = document.createElement('ul');
      vis.forEach(function (r) {
        var li = document.createElement('li');
        var code = document.createElement('code'); code.textContent = r.name;
        var st = document.createElement('span'); st.className = 'st st-' + EX_LABEL[r.s][0]; st.textContent = EX_LABEL[r.s][1];
        li.appendChild(code); li.appendChild(st); ul.appendChild(li);
      });
      g.appendChild(ul); host.appendChild(g);
    });
    var who = exState.t === 'web' ? 'FormTitan WEB' : 'New builder (early access; from code, not yet verified live)';
    document.getElementById('ex-sum').textContent = who + ': ' + built + ' of ' + total + ' element types built by AI. Showing ' + shown + '.';
  }
  document.querySelectorAll('.seg button').forEach(function (b) {
    b.addEventListener('click', function () {
      exState.t = b.getAttribute('data-t');
      document.querySelectorAll('.seg button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      renderExplorer();
    });
  });
  document.getElementById('ex-q').addEventListener('input', function (e) { exState.q = e.target.value.trim().toLowerCase(); renderExplorer(); });
  document.getElementById('ex-f').addEventListener('change', function (e) { exState.f = e.target.value; renderExplorer(); });
  renderExplorer();

  // Full release history, read from the embedded #releases-data block: [{v, d, h, i[], t, a[]}], newest first.
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var TYPE_LABEL = { 'new': 'New', improved: 'Improved', fixed: 'Fixed', internal: 'Behind the scenes' };
  var releases = [];
  var histState = { q: '', a: '', hideInternal: true };
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function fmtDate(iso) { var p = iso.split('-'); return MONTHS[+p[1] - 1].slice(0, 3) + ' ' + (+p[2]) + ', ' + p[0]; }
  function renderHistory() {
    var list = document.getElementById('hist-list');
    list.textContent = '';
    var q = histState.q;
    var vis = releases.filter(function (r) {
      if (histState.hideInternal && r.t === 'internal') return false;
      if (histState.a && r.a.indexOf(histState.a) === -1) return false;
      if (!q) return true;
      return (r.v + ' ' + r.h + ' ' + r.i.join(' ') + ' ' + r.a.join(' ')).toLowerCase().indexOf(q) !== -1;
    });
    var groups = [];
    vis.forEach(function (r) {
      var key = r.d.slice(0, 7);
      var last = groups[groups.length - 1];
      if (!last || last.key !== key) { last = { key: key, items: [] }; groups.push(last); }
      last.items.push(r);
    });
    groups.forEach(function (g, gi) {
      var det = el('details', 'hmonth');
      if (gi === 0 || q || histState.a) det.open = true;
      var sum = el('summary');
      var p = g.key.split('-');
      sum.appendChild(el('h4', null, MONTHS[+p[1] - 1] + ' ' + p[0]));
      sum.appendChild(el('span', null, g.items.length + (g.items.length === 1 ? ' release · ' : ' releases · ') + g.items[g.items.length - 1].v + ' – ' + g.items[0].v));
      det.appendChild(sum);
      g.items.forEach(function (r) {
        var row = el('article', 'rel');
        var ver = el('div', 'ver', r.v); ver.appendChild(el('small', null, fmtDate(r.d)));
        var body = el('div');
        var h = el('h5'); h.appendChild(el('span', 'rk rk-' + r.t, TYPE_LABEL[r.t] || r.t)); h.appendChild(document.createTextNode(r.h));
        body.appendChild(h);
        if (r.i.length) { var ul = el('ul'); r.i.forEach(function (t) { ul.appendChild(el('li', null, t)); }); body.appendChild(ul); }
        if (r.a.length) { var ar = el('div', 'areas'); r.a.forEach(function (t) { ar.appendChild(el('span', null, t)); }); body.appendChild(ar); }
        row.appendChild(ver); row.appendChild(body); det.appendChild(row);
      });
      list.appendChild(det);
    });
    document.getElementById('hist-sum').textContent = 'Showing ' + vis.length + ' of ' + releases.length + ' releases.';
  }
  Promise.resolve().then(function () { return JSON.parse(document.getElementById('releases-data').textContent); }).then(function (data) {
    releases = data;
    var areas = {};
    data.forEach(function (r) { r.a.forEach(function (a) { areas[a] = (areas[a] || 0) + 1; }); });
    var sel = document.getElementById('hist-a');
    Object.keys(areas).sort().forEach(function (a) {
      var o = document.createElement('option'); o.value = a; o.textContent = a.charAt(0).toUpperCase() + a.slice(1) + ' (' + areas[a] + ')'; sel.appendChild(o);
    });
    document.getElementById('hist-intro').textContent = data.length + ' releases from ' + data[data.length - 1].v + ' (' + fmtDate(data[data.length - 1].d) + ') to ' + data[0].v + ' (' + fmtDate(data[0].d) + '), newest first.';
    renderHistory();
  }).catch(function () {
    document.getElementById('hist-sum').textContent = 'The release list could not be loaded. Reload the page to try again.';
  });
  document.getElementById('hist-q').addEventListener('input', function (e) { histState.q = e.target.value.trim().toLowerCase(); renderHistory(); });
  document.getElementById('hist-a').addEventListener('change', function (e) { histState.a = e.target.value; renderHistory(); });
  document.getElementById('hist-int').addEventListener('change', function (e) { histState.hideInternal = e.target.checked; renderHistory(); });

})();
