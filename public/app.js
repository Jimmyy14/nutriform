// ─── STATE ────────────────────────────────────────────────────────────────────
let currentLang = 'bg';
let ingredients = [];
let searchTimeout = null;
let currentSuggestions = [];
let selectedSuggIdx = -1;
let aiNutritionCache = {};
let lastQuery = '';
const SEARCH_T = { bg:'Търси с AI', en:'Search with AI', ru:'Искать с AI', uk:'Шукати з AI' };
 
// ─── LANGUAGE ─────────────────────────────────────────────────────────────────
function selectLang(lang) {
  currentLang = lang;
  document.getElementById('lang-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  applyTranslations();
  // Set defaults based on language
  if (lang === 'bg') {
    ingredients = [
      {name:'пълнозърнесто брашно', amount:400, source:'local'},
      {name:'вода', amount:280, source:'local'},
      {name:'квас', amount:80, source:'local'},
      {name:'сол', amount:9, source:'local'},
    ];
    document.getElementById('product-name').placeholder = T.bg.productNamePh;
  } else if (lang === 'en') {
    ingredients = [
      {name:'whole wheat flour', amount:400, source:'local'},
      {name:'water', amount:280, source:'local'},
      {name:'sourdough starter', amount:80, source:'local'},
      {name:'salt', amount:9, source:'local'},
    ];
    document.getElementById('product-name').placeholder = T.en.productNamePh;
  } else if (lang === 'ru') {
    ingredients = [
      {name:'цельнозерновая мука', amount:400, source:'local'},
      {name:'вода', amount:280, source:'local'},
      {name:'соль', amount:9, source:'local'},
    ];
    document.getElementById('product-name').placeholder = T.ru.productNamePh;
  } else if (lang === 'uk') {
    ingredients = [
      {name:'цільнозернове борошно', amount:400, source:'local'},
      {name:'вода', amount:280, source:'local'},
      {name:'сіль', amount:9, source:'local'},
    ];
    document.getElementById('product-name').placeholder = T.uk.productNamePh;
  }
  renderIngredients();
}
 
function switchLang() {
  document.getElementById('app').style.display = 'none';
  document.getElementById('lang-screen').style.display = 'flex';
}
 
function applyTranslations() {
  const t = T[currentLang];
  document.getElementById('topbar-sub').textContent = t.topbarSub;
  document.getElementById('lang-switch-btn').textContent = t.langBtn;
  document.getElementById('lbl-product-info').textContent = t.productInfo;
  document.getElementById('lbl-product-name').textContent = t.productName;
  document.getElementById('lbl-serving').textContent = t.serving;
  document.getElementById('lbl-ingredients').textContent = t.ingredients;
  document.getElementById('th-name').textContent = t.thName;
  document.getElementById('th-amount').textContent = t.thAmount;
  document.getElementById('th-kcal').textContent = t.thKcal;
  document.getElementById('lbl-add-ing').textContent = t.addIng;
  document.getElementById('ing-search').placeholder = t.searchPh;
  document.getElementById('lbl-amount').textContent = t.amount;
  document.getElementById('btn-add').textContent = t.btnAdd;
  document.getElementById('lbl-total-weight').textContent = t.totalWeight;
  document.getElementById('tab-btn-nutrition').textContent = t.tabNutrition;
  document.getElementById('tab-btn-label').textContent = t.tabLabel;
  document.getElementById('tab-btn-ai').textContent = t.tabAI;
  document.getElementById('lbl-kcal').textContent = t.kcal;
  document.getElementById('lbl-prot').textContent = t.protein;
  document.getElementById('lbl-carb').textContent = t.carbs;
  document.getElementById('lbl-fat').textContent = t.fat;
  document.getElementById('lbl-macro-dist').textContent = t.macroDist;
  document.getElementById('lbl-pr-prot').textContent = t.protein.split(' ')[0];
  document.getElementById('lbl-pr-carb').textContent = t.carbs.split(' ')[0];
  document.getElementById('lbl-pr-fat').textContent = t.fat.split(' ')[0];
  document.getElementById('el-note').textContent = t.elNote;
  document.getElementById('btn-analyze').textContent = t.btnAnalyze;
  document.getElementById('lbl-allergens').textContent = t.allergensTitle;
  document.getElementById('lbl-label-size').textContent = t.labelSize;
  document.getElementById('lbl-copies').textContent = t.copies;
  document.getElementById('btn-print').textContent = t.btnPrintLabels;
  document.getElementById('lbl-goal').textContent = t.goalLbl;
  document.getElementById('btn-improve').textContent = t.btnImprove;
  const gsel = document.getElementById('improve-goal');
  gsel.options[0].text = t.goalProtein;
  gsel.options[1].text = t.goalSalt;
  gsel.options[2].text = t.goalFiber;
  gsel.options[3].text = t.goalKcal;
  gsel.options[4].text = t.goalOverall;
  document.getElementById('lbl-font').textContent = t.designFont;
  document.getElementById('lbl-border').textContent = t.designBorder;
  document.getElementById('lbl-color').textContent = t.designColor;
  const fsel = document.getElementById('label-font');
  fsel.options[0].text = t.fontNarrow; fsel.options[1].text = t.fontModern; fsel.options[2].text = t.fontClassic;
  const bsel = document.getElementById('label-border');
  bsel.options[0].text = t.borderThick; bsel.options[1].text = t.borderThin; bsel.options[2].text = t.borderNone;
  const csel = document.getElementById('label-color');
  csel.options[0].text = t.colorBlack; csel.options[1].text = t.colorGreen; csel.options[2].text = t.colorNavy; csel.options[3].text = t.colorBrown;
  csel.options[4].text = t.colorBordeaux; csel.options[5].text = t.colorPlum; csel.options[6].text = t.colorTeal;
  csel.options[7].text = t.colorOchre; csel.options[8].text = t.colorGraphite; csel.options[9].text = t.colorChocolate;
  document.getElementById('lbl-title-font').textContent = t.designTitleFont;
  document.getElementById('mode-calc').textContent = t.modeCalc;
  document.getElementById('ptype-human').textContent = t.ptypeHuman;
  document.getElementById('ptype-feed').textContent = t.ptypeFeed;
  document.getElementById('feed-note').textContent = t.feedNoteInput;
  document.getElementById('fl-protein').textContent = t.feedProtein + ' (%)';
  document.getElementById('fl-fat').textContent = t.feedFat + ' (%)';
  document.getElementById('fl-fibre').textContent = t.feedFibre + ' (%)';
  document.getElementById('fl-ash').textContent = t.feedAsh + ' (%)';
  document.getElementById('fl-moisture').textContent = t.feedMoisture + ' (%)';
  document.getElementById('fl-species').textContent = t.feedSpecies;
  const ssel = document.getElementById('feed-species');
  ssel.options[0].text = t.feedDog.charAt(0).toUpperCase() + t.feedDog.slice(1);
  ssel.options[1].text = t.feedCat.charAt(0).toUpperCase() + t.feedCat.slice(1);
  document.getElementById('fl-additives').textContent = t.feedAdditivesInput;
  document.getElementById('fl-composition').textContent = t.feedCompositionInput;
  document.getElementById('mode-lab').textContent = t.modeLab;
  document.getElementById('lab-note').textContent = t.labNoteInput;
  document.getElementById('ll-kcal').textContent = t.llKcal;
  document.getElementById('ll-fat').textContent = t.llFat;
  document.getElementById('ll-satfat').textContent = t.llSatfat;
  document.getElementById('ll-carb').textContent = t.llCarb;
  document.getElementById('ll-sugar').textContent = t.llSugar;
  document.getElementById('ll-fiber').textContent = t.llFiber;
  document.getElementById('ll-prot').textContent = t.llProt;
  document.getElementById('ll-salt').textContent = t.llSalt;
  const tfsel = document.getElementById('label-title-font');
  tfsel.options[0].text = t.tfSame; tfsel.options[1].text = t.tfScript; tfsel.options[2].text = t.tfElegant;
  tfsel.options[3].text = t.tfBold; tfsel.options[4].text = t.tfGaramond;
  document.getElementById('lbl-additives').textContent = ADD_T[currentLang].title;
  document.getElementById('lbl-additive-pick').textContent = ADD_T[currentLang].pick;
  document.getElementById('btn-add-additive').textContent = ADD_T[currentLang].add;
  document.getElementById('btn-add-custom-additive').textContent = ADD_T[currentLang].custom;
  populateAdditiveSelect();
  renderAdditives();
  document.getElementById('lbl-saved').textContent = SAVED_T[currentLang].title;
  document.getElementById('btn-save-recipe').textContent = SAVED_T[currentLang].save;
  renderSavedRecipes();
  renderAllergens();
}
 
// ─── INGREDIENT SEARCH ───────────────────────────────────────────────────────
function onIngSearch() {
  const q = document.getElementById('ing-search').value.trim();
  clearTimeout(searchTimeout);
  selectedSuggIdx = -1;
  if (q.length < 2) { hideSuggestions(); return; }
  searchTimeout = setTimeout(() => searchIngredient(q), 300);
}
 
async function searchIngredient(q) {
  const t = T[currentLang];
  lastQuery = q;
  const ql = q.toLowerCase();
  currentSuggestions = [];

  // 1. Local DB — подредени по релевантност (точно > започва с > съдържа, после по дължина), до 12
  currentSuggestions = Object.keys(LOCAL_DB)
    .filter(k => k.toLowerCase().includes(ql))
    .sort((a, b) => {
      const al = a.toLowerCase(), bl = b.toLowerCase();
      const ar = al === ql ? 0 : al.startsWith(ql) ? 1 : 2;
      const br = bl === ql ? 0 : bl.startsWith(ql) ? 1 : 2;
      return ar - br || al.length - bl.length;
    })
    .slice(0, 12)
    .map(k => ({ name: k, kcal: LOCAL_DB[k].cal, source: 'local', data: LOCAL_DB[k] }));
  renderSuggestions(); // показва локалните + бутона „Търси с AI"

  // 2. USDA search (добавя към локалните)
  showSearchStatus(t.searchingUSDA);
  try {
    const res = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&pageSize=8&api_key=DEMO_KEY`
    );
    const data = await res.json();
    if (data.foods && data.foods.length > 0) {
      const usdaItems = data.foods.slice(0, 6).map(f => {
        const nutrients = {};
        (f.foodNutrients || []).forEach(n => {
          const v = n.value || 0;
          if (n.nutrientId === 1008 || n.nutrientName?.includes('Energy')) nutrients.cal = v;
          else if (n.nutrientId === 1003 || n.nutrientName?.includes('Protein')) nutrients.prot = v;
          else if (n.nutrientId === 1005 || n.nutrientName?.includes('Carbohydrate')) nutrients.carb = v;
          else if (n.nutrientId === 1004 || n.nutrientName?.includes('Total lipid')) nutrients.fat = v;
          else if (n.nutrientId === 1079 || n.nutrientName?.includes('Fiber')) nutrients.fiber = v;
          else if (n.nutrientId === 2000 || n.nutrientName?.includes('Sugars')) nutrients.sugar = v;
          else if (n.nutrientId === 1093 || n.nutrientName?.includes('Sodium')) nutrients.sodium = v;
        });
        ['cal','prot','carb','fat','fiber','sugar','sodium'].forEach(k => nutrients[k] = nutrients[k] || 0);
        return { name: f.description, kcal: Math.round(nutrients.cal), source: 'usda', data: nutrients };
      });
      const allNames = currentSuggestions.map(s => s.name.toLowerCase());
      usdaItems.forEach(u => {
        if (!allNames.some(n => n.includes(u.name.toLowerCase().substring(0, 8)))) currentSuggestions.push(u);
      });
      renderSuggestions();
    }
  } catch(e) {}
  hideSearchStatus();

  // 3. Ако НЯМА никакъв резултат → автоматично AI търсене
  if (currentSuggestions.length === 0) {
    await aiSearchIngredient(q);
  } else {
    renderSuggestions();
  }
}

// AI търсене по заявка — извиква се автоматично (при 0 резултата) или от бутона „Търси с AI"
async function aiSearchIngredient(q) {
  const t = T[currentLang];
  const langName = { bg:'Bulgarian', en:'English', ru:'Russian', uk:'Ukrainian' }[currentLang];
  showSearchStatus(t.searchingAI);
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        max_tokens: 600,
        messages: [{ role: 'user', content:
`Provide nutritional data per 100g for this food: "${q}".
Respond ONLY with a valid JSON array, no markdown, no extra text. Format:
[{"name":"name in ${langName}","kcal":123,"prot":10.0,"carb":20.0,"fat":5.0,"fiber":2.0,"sugar":3.0,"sodium":50}]
The "name" MUST be written in ${langName}. Include the most relevant match plus common variants (e.g. raw / cooked / dried) if applicable, up to 4 items. Estimate if exact data unknown.`
        }]
      })
    });
    const d = await res.json();
    const text = d.content?.map(b => b.text || '').join('') || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    const existing = currentSuggestions.map(s => s.name.toLowerCase());
    parsed.forEach(item => {
      if (existing.includes(String(item.name).toLowerCase())) return;
      currentSuggestions.push({
        name: item.name,
        kcal: Math.round(item.kcal),
        source: 'ai',
        data: { cal:item.kcal, prot:item.prot, carb:item.carb, fat:item.fat, fiber:item.fiber, sugar:item.sugar, sodium:item.sodium }
      });
    });
  } catch(e) {}
  hideSearchStatus();
  renderSuggestions();
}
 
function renderSuggestions() {
  const t = T[currentLang];
  const el = document.getElementById('suggestions');
  el.innerHTML = '';
  if (currentSuggestions.length === 0) {
    el.innerHTML = `<div class="no-results">${t.noResults}</div>`;
  } else {
    currentSuggestions.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'suggestion-item' + (i === selectedSuggIdx ? ' selected' : '');
      const srcClass = s.source === 'usda' ? 'src-usda' : s.source === 'ai' ? 'src-ai' : 'src-local';
      const srcLabel = s.source === 'usda' ? t.srcUSDA : s.source === 'ai' ? t.srcAI : t.srcLocal;
      div.innerHTML = `<span class="sug-name">${s.name} <span class="suggestion-source ${srcClass}">${srcLabel}</span></span><span class="sug-kcal">${s.kcal} kcal/100g</span>`;
      div.onclick = () => selectSuggestion(i);
      el.appendChild(div);
    });
  }
  // Винаги — бутон „Търси с AI: '<дума>'" (намира всичко, дори да не е в базата)
  if (lastQuery && lastQuery.length >= 2) {
    const ai = document.createElement('div');
    ai.className = 'suggestion-item ai-search-action';
    ai.innerHTML = `<span>🔍 ${SEARCH_T[currentLang]}: "<b>${escapeHtml(lastQuery)}</b>"</span>`;
    ai.onmousedown = (e) => { e.preventDefault(); aiSearchIngredient(lastQuery); };
    el.appendChild(ai);
  }
  el.style.display = 'block';
}

function renderNoResults() {
  renderSuggestions();
}
 
function hideSuggestions() {
  document.getElementById('suggestions').style.display = 'none';
  currentSuggestions = [];
}
 
function selectSuggestion(i) {
  const s = currentSuggestions[i];
  document.getElementById('ing-search').value = s.name;
  aiNutritionCache[s.name.toLowerCase()] = s.data;
  hideSuggestions();
  document.getElementById('ing-amount').focus();
}
 
function onIngKeydown(e) {
  const el = document.getElementById('suggestions');
  if (el.style.display === 'none') return;
  if (e.key === 'ArrowDown') {
    selectedSuggIdx = Math.min(selectedSuggIdx + 1, currentSuggestions.length - 1);
    renderSuggestions(); e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    selectedSuggIdx = Math.max(selectedSuggIdx - 1, -1);
    renderSuggestions(); e.preventDefault();
  } else if (e.key === 'Enter' && selectedSuggIdx >= 0) {
    selectSuggestion(selectedSuggIdx); e.preventDefault();
  } else if (e.key === 'Escape') {
    hideSuggestions();
  }
}
 
function showSearchStatus(msg) {
  document.getElementById('search-status').innerHTML = `<div class="search-spinner"></div>${msg}`;
}
function hideSearchStatus() {
  document.getElementById('search-status').innerHTML = '';
}
 
// ─── INGREDIENT MANAGEMENT ───────────────────────────────────────────────────
function addIngredient() {
  const name = document.getElementById('ing-search').value.trim();
  const amount = parseFloat(document.getElementById('ing-amount').value);
  if (!name || isNaN(amount) || amount <= 0) return;
  const source = aiNutritionCache[name.toLowerCase()] ? 'ai'
    : LOCAL_DB[name.toLowerCase()] ? 'local' : 'unknown';
  ingredients.push({name, amount, source});
  document.getElementById('ing-search').value = '';
  document.getElementById('ing-amount').value = '';
  hideSuggestions();
  renderIngredients();
}
 
function removeIng(idx) {
  ingredients.splice(idx, 1);
  renderIngredients();
}
 
function getNutrition(name) {
  const key = name.toLowerCase();
  return aiNutritionCache[key] || LOCAL_DB[key] || null;
}
 
function calcNutrition() {
  const serving = parseFloat(document.getElementById('serving-size').value) || 100;
  const totalWeight = ingredients.reduce((s, i) => s + i.amount, 0);
  if (!totalWeight) return null;
  let t = {cal:0,prot:0,carb:0,fat:0,fiber:0,sugar:0,sodium:0};
  ingredients.forEach(ing => {
    const d = getNutrition(ing.name);
    if (!d) return;
    const f = ing.amount / 100;
    Object.keys(t).forEach(k => t[k] += (d[k]||0) * f);
  });
  const scale = serving / totalWeight;
  const per = {};
  Object.keys(t).forEach(k => per[k] = t[k] * scale);
  return {per, total:t, serving, totalWeight};
}
 
function renderIngredients() {
  const t = T[currentLang];
  const tbody = document.getElementById('ing-tbody');
  tbody.innerHTML = '';
  const totalWeight = ingredients.reduce((s,i) => s + i.amount, 0);
  ingredients.forEach((ing, idx) => {
    const d = getNutrition(ing.name);
    const kcal = d ? Math.round(d.cal * ing.amount / 100) : '?';
    const srcClass = ing.source === 'usda' ? 'badge-usda' : ing.source === 'ai' ? 'badge-ai' : ing.source === 'local' ? 'badge-usda' : 'badge-unk';
    const srcLabel = ing.source === 'usda' ? t.srcUSDA : ing.source === 'ai' ? t.srcAI : ing.source === 'local' ? t.srcLocal : '?';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="ing-name-cell">${ing.name}<span class="badge ${srcClass}">${srcLabel}</span></div></td>
      <td style="text-align:right">${ing.amount}${t.g}</td>
      <td style="text-align:right; color:var(--text2)">${kcal}</td>
      <td style="text-align:right"><button class="del-btn" onclick="removeIng(${idx})">✕</button></td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('total-weight-val').textContent = totalWeight.toFixed(0) + ' ' + t.g;
  syncAutoAllergens();
  renderAllergens();
  updateResults();
}
 
function updateResults() {
  const t = T[currentLang];
  const r = calcNutrition();
  const serving = parseFloat(document.getElementById('serving-size').value) || 100;
 
  if (!r) {
    ['r-cal','r-prot','r-carb','r-fat'].forEach(id => document.getElementById(id).textContent = '—');
    document.getElementById('detail-rows').innerHTML = '';
    return;
  }
  const p = r.per;
  document.getElementById('r-cal').textContent = Math.round(p.cal);
  document.getElementById('r-prot').textContent = p.prot.toFixed(1);
  document.getElementById('r-carb').textContent = p.carb.toFixed(1);
  document.getElementById('r-fat').textContent = p.fat.toFixed(1);
  document.getElementById('per-serving-label').textContent = `${t.perServing} ${serving}${t.g}`;
 
  document.getElementById('detail-rows').innerHTML = `
    <div class="detail-row"><span class="lbl">${t.fiber}</span><span class="val">${p.fiber.toFixed(1)} ${t.g}</span></div>
    <div class="detail-row"><span class="lbl">${t.sugar}</span><span class="val">${p.sugar.toFixed(1)} ${t.g}</span></div>
    <div class="detail-row"><span class="lbl">${t.sodium}</span><span class="val">${Math.round(p.sodium)} ${t.mg}</span></div>
  `;
 
  const macroKcal = p.prot*4 + p.carb*4 + p.fat*9;
  if (macroKcal > 0) {
    document.getElementById('prog-wrap').style.display = 'block';
    const pp = Math.round(p.prot*4/macroKcal*100);
    const cp = Math.round(p.carb*4/macroKcal*100);
    const fp = Math.round(p.fat*9/macroKcal*100);
    document.getElementById('pct-prot').textContent = pp + '%';
    document.getElementById('pct-carb').textContent = cp + '%';
    document.getElementById('pct-fat').textContent = fp + '%';
    document.getElementById('bar-prot').style.width = Math.min(pp,100) + '%';
    document.getElementById('bar-carb').style.width = Math.min(cp,100) + '%';
    document.getElementById('bar-fat').style.width = Math.min(fp,100) + '%';
  }
  updateLabel(r);
}
 
function updateLabel(r) {
  if (productType === 'feed') { updateFeedLabel(r); return; }
  const t = T[currentLang];
  let p, kJ, salt, satfatDisplay;
  if (labelMode === 'lab') {
    const L = getLabValues();
    p = {
      cal: isNaN(L.cal) ? 0 : L.cal,
      fat: isNaN(L.fat) ? 0 : L.fat,
      carb: isNaN(L.carb) ? 0 : L.carb,
      sugar: isNaN(L.sugar) ? 0 : L.sugar,
      fiber: isNaN(L.fiber) ? 0 : L.fiber,
      prot: isNaN(L.prot) ? 0 : L.prot
    };
    kJ = Math.round(p.cal * 4.184);
    salt = isNaN(L.salt) ? 0 : L.salt;
    satfatDisplay = isNaN(L.satfat) ? '—' : L.satfat.toFixed(1) + ' ' + t.g;
  } else {
    // EU 1169/2011: values per 100 g of product (calculated from DB)
    const f = 100 / r.serving;
    p = {};
    Object.keys(r.per).forEach(k => p[k] = r.per[k] * f);
    kJ = Math.round(p.cal * 4.184);
    salt = p.sodium * 2.5 / 1000;
    satfatDisplay = '—';
  }
  const name = document.getElementById('product-name').value || 'Product';
  document.getElementById('el-name').textContent = name;
  document.getElementById('el-batch').textContent = `${t.batchInfo}: ${r.totalWeight.toFixed(0)}${t.g}`;
  document.getElementById('el-per100').textContent = t.per100;
  document.getElementById('el-rows').innerHTML = `
    <div class="el-row bold"><span>${t.energy}</span><span>${kJ} kJ / ${Math.round(p.cal)} kcal</span></div>
    <div class="el-row bold"><span>${t.fatEU}</span><span>${p.fat.toFixed(1)} ${t.g}</span></div>
    <div class="el-row sub"><span>${t.satFatEU}</span><span>${satfatDisplay}</span></div>
    <div class="el-row bold"><span>${t.carbEU}</span><span>${p.carb.toFixed(1)} ${t.g}</span></div>
    <div class="el-row sub"><span>${t.sugarEU}</span><span>${p.sugar.toFixed(1)} ${t.g}</span></div>
    <div class="el-row"><span>${t.fiberEU}</span><span>${p.fiber.toFixed(1)} ${t.g}</span></div>
    <div class="el-row bold"><span>${t.proteinEU}</span><span>${p.prot.toFixed(1)} ${t.g}</span></div>
    <div class="el-row bold"><span>${t.saltEU}</span><span>${salt.toFixed(2)} ${t.g}</span></div>
  `;
  // Състав (задължителен по Регл. 1169/2011): съставки в низходящ ред + добавки с E-номер
  const compEl = document.getElementById('el-composition');
  const comp = buildComposition();
  if (comp) {
    compEl.innerHTML = `<b>${ADD_T[currentLang].composition}:</b> ${escapeHtml(comp)}`;
    compEl.style.display = 'block';
  } else {
    compEl.style.display = 'none';
  }
  const allergenEl = document.getElementById('el-allergens');
  if (selectedAllergens.length > 0) {
    const names = selectedAllergens.map(k => `<b>${t.allergens[k]}</b>`).join(', ');
    allergenEl.innerHTML = `${t.contains}: ${names}`;
    allergenEl.style.display = 'block';
  } else {
    allergenEl.style.display = 'none';
  }
  document.getElementById('el-note').textContent = labelMode === 'lab' ? t.labNote : t.euNote;
}
 
function onDataChange() { updateResults(); }
 
// ─── TABS ─────────────────────────────────────────────────────────────────────
function showTab(name) {
  ['nutrition','label','ai'].forEach(n => {
    document.getElementById('tab-btn-'+n).classList.toggle('active', n===name);
    document.getElementById('pane-'+n).classList.toggle('active', n===name);
  });
}
 
// ─── PRINT ────────────────────────────────────────────────────────────────────
// ─── AI ANALYSIS ──────────────────────────────────────────────────────────────
async function analyzeWithAI() {
  const t = T[currentLang];
  const r = calcNutrition();
  if (!r || !ingredients.length) return;
  const btn = document.getElementById('btn-analyze');
  btn.disabled = true;
  const output = document.getElementById('ai-output');
  output.innerHTML = `<div class="loading-row"><div class="search-spinner"></div>${t.aiLoading}</div>`;
  const ingList = ingredients.map(i => `${i.name} (${i.amount}${t.g})`).join(', ');
  const name = document.getElementById('product-name').value || '—';
  let prompt;
  if (productType === 'feed') {
    const F = getFeedValues();
    const langName = {bg:'БЪЛГАРСКИ', en:'ENGLISH', ru:'РУССКИЙ', uk:'УКРАЇНСЬКА'}[currentLang];
    prompt = `You are an animal nutrition specialist (pet food, EU Regulation 767/2009, FEDIAF guidelines). Respond in ${langName} only.
 
Product: ${name} — complete feed for ${F.species === 'dog' ? 'dogs' : 'cats'}
Ingredients: ${ingList || 'not specified'}
Composition declared: ${F.composition || '—'}
Analytical constituents: crude protein ${F.protein||'?'}%, crude fats ${F.fat||'?'}%, crude fibre ${F.fibre||'?'}%, crude ash ${F.ash||'?'}%, moisture ${F.moisture||'?'}%
 
Provide:
1. Assessment vs FEDIAF nutritional guidelines for ${F.species === 'dog' ? 'adult dogs' : 'adult cats'} (2-3 points)
2. Observations on the analytical profile (what looks good, what raises questions)
3. EU 767/2009 labelling compliance notes
4. IMPORTANT: Note that complete feed formulation changes require veterinary nutritionist validation — do NOT give specific reformulation amounts.
 
Under 220 words. Professional, specific.`;
  } else {
    prompt = t.aiPrompt(name, ingList, r.serving, r.totalWeight.toFixed(0), r.per);
  }
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({max_tokens:1000, messages:[{role:'user',content:prompt}]})
    });
    const data = await res.json();
    if (data.error) throw new Error(typeof data.error === 'string' ? data.error : data.error.message);
    const text = data.content.map(b=>b.text||'').join('');
    const scoreMatch = text.match(/(\d+)\/10/);
    let scoreHTML = '';
    if (scoreMatch) {
      const sc = parseInt(scoreMatch[1]);
      const cls = sc>=7?'score-hi':sc>=5?'score-mid':'score-lo';
      scoreHTML = `<div class="score-pill ${cls}">${sc>=7?'✅':sc>=5?'⚠️':'❌'} ${sc}/10</div>`;
    }
    const fmt = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
    output.innerHTML = `<div class="ai-result">${scoreHTML}${fmt}</div>`;
  } catch(e) {
    output.innerHTML = `<div class="err-box">${t.aiError}: ${e.message}</div>`;
  }
  btn.disabled = false;
  btn.textContent = t.btnAnalyze;
}
 
 
// ─── ALLERGENS (EU 1169/2011 Annex II) ───────────────────────────────────────
const ALLERGEN_KEYS = ['gluten','crust','eggs','fish','peanuts','soy','milk','nuts','celery','mustard','sesame','sulph','lupin','moll'];
let selectedAllergens = [];
let autoAllergens = []; // алергени, засечени по съставките

// Точна карта за съставките в базата (надеждна)
const INGREDIENT_ALLERGENS = {
  // глутен (зърнени с глутен)
  'пшенично брашно':['gluten'],'пълнозърнесто брашно':['gluten'],'ръжено брашно':['gluten'],'грис':['gluten'],
  'галета':['gluten'],'овес':['gluten'],'овесени ядки':['gluten'],'ечемик':['gluten'],'спелта брашно':['gluten'],
  'кускус':['gluten'],'грухан булгур':['gluten'],'пшенични трици':['gluten'],'квас':['gluten'],
  'wheat flour':['gluten'],'whole wheat flour':['gluten'],'rye flour':['gluten'],'oat flour':['gluten'],'oats':['gluten'],
  'semolina':['gluten'],'breadcrumbs':['gluten'],'sourdough starter':['gluten'],'wheat bran':['gluten'],'oat bran':['gluten'],
  // мляко
  'мляко':['milk'],'кисело мляко':['milk'],'извара':['milk'],'сирене':['milk'],'кашкавал':['milk'],'крема сирене':['milk'],
  'топено сирене':['milk'],'моцарела':['milk'],'сметана':['milk'],'заквасена сметана':['milk'],'сметана за готвене':['milk'],
  'сухо мляко':['milk'],'обезмаслено сухо мляко':['milk'],'кондензирано мляко':['milk'],'масло':['milk'],'суроватъчен протеин':['milk'],
  'milk':['milk'],'cheese':['milk'],'butter':['milk'],'cream':['milk'],'yogurt':['milk'],'cottage cheese':['milk'],
  'whey protein':['milk'],'sour cream':['milk'],'cream cheese':['milk'],'white cheese':['milk'],'milk powder':['milk'],'skim milk powder':['milk'],
  // яйца
  'яйца':['eggs'],'яйчен прах':['eggs'],'eggs':['eggs'],
  // риба
  'скумрия':['fish'],'хек':['fish'],'рибно брашно':['fish'],'salmon':['fish'],'tuna':['fish'],
  // соя
  'соев протеин':['soy'],'соево брашно':['soy'],'соево мляко':['soy'],'соев шрот':['soy'],'пълномаслена соя':['soy'],
  'soy protein':['soy'],'soy milk':['soy'],'tofu':['soy'],'soybean meal':['soy'],
  // ядки (дървесни)
  'орехи':['nuts'],'бадеми':['nuts'],'бадемово брашно':['nuts'],'walnuts':['nuts'],'almonds':['nuts'],'hazelnuts':['nuts'],'almond flour':['nuts'],
  // фъстъци
  'peanuts':['peanuts'],
  // сусам
  'сусам':['sesame'],'sesame seeds':['sesame'],
};

// Резервно засичане по ключови думи (за въведени/USDA имена извън базата)
const ALLERGEN_KW = {
  gluten: ['пшени','ръжен','ечемик','спелта','малц','wheat','rye','barley','spelt','malt','семолина','semolina','кускус','couscous','булгур','bulgur'],
  milk:   ['мляк','млечн','сирене','кашкавал','извара','сметан','йогурт','суроватъч','казеин','cheese','cream','yogurt','whey','casein','dairy'],
  eggs:   ['яйц','egg'],
  fish:   ['риба','рибн','тон','сьомга','скумрия','пъстърва','fish','tuna','salmon','mackerel','trout','cod','херинга','herring','аншоа','anchovy'],
  soy:    ['соя','соев','соево','tofu','soy','soya','edamame'],
  nuts:   ['орех','бадем','лешник','кашу','шамфъстък','фъстъчен','walnut','almond','hazelnut','cashew','pistachio','pecan','macadamia'],
  peanuts:['фъстък','фъстъци','peanut','arachis'],
  sesame: ['сусам','тахан','sesame','tahini'],
  celery: ['целина','celery','celeriac'],
  mustard:['горчиц','синап','mustard'],
  sulph:  ['сулфит','серен диоксид','sulphite','sulfite'],
  lupin:  ['лупин','lupin'],
  crust:  ['скарид','раци','ракообразн','shrimp','prawn','crab','lobster','crayfish','crustacean'],
  moll:   ['мида','миди','калмар','охлюв','октопод','mussel','clam','oyster','squid','octopus','snail','scallop','mollus'],
};
const PLANT_MILK = ['соев','соево','soy','кокос','coconut','бадем','almond','оризов','rice','овесен','oat','растителн','plant'];

function detectAllergens() {
  const found = new Set();
  ingredients.forEach(ing => {
    const nm = (ing.name || '').toLowerCase();
    const exact = INGREDIENT_ALLERGENS[nm];
    if (exact) exact.forEach(a => found.add(a));
    for (const [key, kws] of Object.entries(ALLERGEN_KW)) {
      if (kws.some(kw => nm.includes(kw))) {
        // не бъркай растителни «млека» с краве мляко
        if (key === 'milk' && PLANT_MILK.some(p => nm.includes(p))) continue;
        found.add(key);
      }
    }
  });
  return [...found];
}

// Засича алергените по съставките и ги слива с ръчно избраните
function syncAutoAllergens() {
  const manual = selectedAllergens.filter(k => !autoAllergens.includes(k));
  autoAllergens = detectAllergens();
  selectedAllergens = [...new Set([...manual, ...autoAllergens])];
}

function renderAllergens() {
  const t = T[currentLang];
  const grid = document.getElementById('allergen-grid');
  grid.innerHTML = '';
  ALLERGEN_KEYS.forEach(key => {
    const isAuto = autoAllergens.includes(key);
    const div = document.createElement('label');
    div.className = 'allergen-chip' + (selectedAllergens.includes(key) ? ' on' : '');
    const autoBadge = isAuto ? `<span class="auto-badge">${ADD_T[currentLang].auto}</span>` : '';
    div.innerHTML = `<input type="checkbox" ${selectedAllergens.includes(key)?'checked':''}><span>${t.allergens[key]}</span>${autoBadge}`;
    div.querySelector('input').addEventListener('change', e => {
      if (e.target.checked) { if (!selectedAllergens.includes(key)) selectedAllergens.push(key); }
      else selectedAllergens = selectedAllergens.filter(k => k !== key);
      div.classList.toggle('on', e.target.checked);
      updateResults();
    });
    grid.appendChild(div);
  });
}
 
 
 
// ─── PRODUCT TYPE (human food vs pet feed, EU 767/2009) ─────────────────────
let productType = 'human';
function setProductType(type) {
  productType = type;
  document.getElementById('ptype-human').classList.toggle('on', type === 'human');
  document.getElementById('ptype-feed').classList.toggle('on', type === 'feed');
  // Feed mode: hide calc/lab toggle + human lab inputs, show feed inputs; allergens irrelevant
  document.querySelector('.mode-toggle:not(:first-of-type)') ;
  document.getElementById('mode-calc').parentElement.style.display = type === 'feed' ? 'none' : 'flex';
  document.getElementById('feed-inputs').style.display = type === 'feed' ? 'block' : 'none';
  if (type === 'feed') {
    document.getElementById('lab-inputs').style.display = 'none';
  } else {
    document.getElementById('lab-inputs').style.display = labelMode === 'lab' ? 'block' : 'none';
  }
  updateResults();
}
function getFeedValues() {
  const v = id => parseFloat(document.getElementById(id).value);
  return {
    protein: v('feed-protein'), fat: v('feed-fat'), fibre: v('feed-fibre'),
    ash: v('feed-ash'), moisture: v('feed-moisture'),
    species: document.getElementById('feed-species').value,
    additives: document.getElementById('feed-additives').value.trim(),
    composition: document.getElementById('feed-composition').value.trim()
  };
}
function updateFeedLabel(r) {
  const t = T[currentLang];
  const F = getFeedValues();
  const fmt = x => isNaN(x) ? '—' : x.toFixed(1) + ' %';
  const name = document.getElementById('product-name').value || 'Product';
  const speciesTxt = F.species === 'dog' ? t.feedDog : t.feedCat;
  document.getElementById('el-name').textContent = name;
  document.getElementById('el-batch').textContent = `${t.feedComplete} — ${speciesTxt}`;
  document.getElementById('el-per100').textContent = t.feedAnalytical;
  document.getElementById('el-rows').innerHTML = `
    <div class="el-row bold"><span>${t.feedProtein}</span><span>${fmt(F.protein)}</span></div>
    <div class="el-row bold"><span>${t.feedFat}</span><span>${fmt(F.fat)}</span></div>
    <div class="el-row bold"><span>${t.feedFibre}</span><span>${fmt(F.fibre)}</span></div>
    <div class="el-row bold"><span>${t.feedAsh}</span><span>${fmt(F.ash)}</span></div>
    <div class="el-row bold"><span>${t.feedMoisture}</span><span>${fmt(F.moisture)}</span></div>
    ${F.composition ? `<div class="el-row" style="display:block; border-bottom:0.5px solid #999; padding:2px 0"><b>${t.feedCompositionLbl}:</b> ${F.composition}</div>` : ''}
    ${F.additives ? `<div class="el-row" style="display:block; border-bottom:0.5px solid #999; padding:2px 0"><b>${t.feedAdditivesLbl}:</b> ${F.additives}</div>` : ''}
  `;
  const compFeed = document.getElementById('el-composition');
  if (compFeed) compFeed.style.display = 'none';
  document.getElementById('el-allergens').style.display = 'none';
  document.getElementById('el-note').textContent = t.feedNote;
}
 
// ─── LABEL DATA MODE (calculated vs lab analysis) ────────────────────────────
let labelMode = 'calc';
function setLabelMode(mode) {
  labelMode = mode;
  document.getElementById('mode-calc').classList.toggle('on', mode === 'calc');
  document.getElementById('mode-lab').classList.toggle('on', mode === 'lab');
  document.getElementById('lab-inputs').style.display = mode === 'lab' ? 'block' : 'none';
  updateResults();
}
function getLabValues() {
  const v = id => parseFloat(document.getElementById(id).value);
  return {
    cal: v('lab-kcal'), fat: v('lab-fat'), satfat: v('lab-satfat'),
    carb: v('lab-carb'), sugar: v('lab-sugar'), fiber: v('lab-fiber'),
    prot: v('lab-prot'), salt: v('lab-salt')
  };
}
 
// ─── LABEL DESIGN ────────────────────────────────────────────────────────────
const LABEL_FONTS = {
  narrow: "'Arial Narrow', Arial, sans-serif",
  modern: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
  classic: "Georgia, 'Times New Roman', serif"
};
const TITLE_FONTS = {
  same: null,
  script: "'Caveat', cursive",
  elegant: "'Playfair Display', Georgia, serif",
  bold: "'Oswald', Arial, sans-serif",
  garamond: "'Cormorant Garamond', Georgia, serif"
};
function getLabelDesign() {
  const tf = document.getElementById('label-title-font').value;
  return {
    font: LABEL_FONTS[document.getElementById('label-font').value],
    titleFont: TITLE_FONTS[tf],
    titleScale: tf === 'script' ? 1.25 : 1,
    border: document.getElementById('label-border').value,
    color: document.getElementById('label-color').value
  };
}
function applyLabelDesign() {
  const d = getLabelDesign();
  const el = document.getElementById('eu-label');
  el.style.fontFamily = d.font;
  el.style.color = d.color;
  el.style.border = d.border === 'thick' ? `2px solid ${d.color}` : d.border === 'thin' ? `1px solid ${d.color}` : 'none';
  el.querySelectorAll('.el-title, [id=el-per100]').forEach(e => {
    e.style.borderBottomColor = d.color;
  });
  const title = el.querySelector('.el-title');
  title.style.fontFamily = d.titleFont || '';
  title.style.fontSize = d.titleFont ? `${26 * d.titleScale}px` : '';
}
 
// ─── PRINT SHEET ─────────────────────────────────────────────────────────────
const LABEL_SIZES = { S: {w:55, h:70, font:7.2}, M: {w:70, h:95, font:9}, L: {w:95, h:130, font:11.5} };
 
function printLabels() {
  const d = getLabelDesign();
  const size = LABEL_SIZES[document.getElementById('label-size').value];
  const copies = Math.min(parseInt(document.getElementById('label-copies').value) || 1, 30);
  const labelHTML = document.getElementById('eu-label').outerHTML;
  let labels = '';
  for (let i = 0; i < copies; i++) labels += `<div class="lbl-item">${labelHTML}</div>`;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>NutriForm Labels</title>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Playfair+Display:wght@800&family=Oswald:wght@600&family=Cormorant+Garamond:wght@700&display=swap" rel="stylesheet"><style>
    @page { size: A4; margin: 8mm; }
    body { font-family: ${d.font}; color: ${d.color}; margin: 0; display: flex; flex-wrap: wrap; gap: 4mm; align-content: flex-start; }
    .lbl-item { width: ${size.w}mm; height: ${size.h}mm; overflow: hidden; page-break-inside: avoid; }
    .eu-label { width: 100%; height: 100%; box-sizing: border-box; border: ${d.border==='thick'?'1.5px':d.border==='thin'?'0.5px':'0'} solid ${d.color}; border-radius: 2px; padding: 2.5mm; font-size: ${size.font}px; }
    .el-title { font-family: ${d.titleFont || d.font}; font-size: ${size.font*1.9*d.titleScale}px; font-weight: 900; border-bottom: ${size.font*0.5}px solid ${d.color}; padding-bottom: 1mm; margin-bottom: 1mm; line-height: 1.05; }
    .el-serv { font-size: ${size.font*0.85}px; margin-bottom: 1mm; }
    .el-rows-hdr, [id=el-per100] { font-size: ${size.font*0.9}px !important; font-weight: 700; border-bottom: 2px solid ${d.color} !important; padding-bottom: 0.5mm; margin-bottom: 0.5mm; }
    .el-row { display: flex; justify-content: space-between; font-size: ${size.font*0.92}px; padding: 0.3mm 0; border-bottom: 0.3px solid #999; }
    .el-row.bold { font-weight: 700; }
    .el-row.sub { padding-left: 3mm; }
    .el-allergens { font-size: ${size.font*0.85}px; margin-top: 1mm; padding-top: 0.5mm; border-top: 0.5px solid #999; }
    .el-allergens b { font-weight: 800; }
    .el-note { font-size: ${size.font*0.62}px; color: #555; margin-top: 1mm; border-top: 0.3px solid #999; padding-top: 0.5mm; }
  </style></head><body>${labels}<scr`+`ipt>window.print();</scr`+`ipt></body></html>`);
  w.document.close();
}
 
// ─── IMPROVE RECIPE ──────────────────────────────────────────────────────────
async function improveRecipe() {
  const t = T[currentLang];
  if (productType === 'feed') {
    document.getElementById('ai-output').innerHTML = `<div class="lab-note" style="margin-top:12px">${t.feedImproveBlocked}</div>`;
    return;
  }
  const r = calcNutrition();
  if (!r || !ingredients.length) return;
  const btn = document.getElementById('btn-improve');
  btn.disabled = true;
  const output = document.getElementById('ai-output');
  output.innerHTML = `<div class="loading-row"><div class="search-spinner"></div>${t.improving}</div>`;
  const goal = document.getElementById('improve-goal').value;
  const goalText = {
    protein: {bg:'повече белтък', en:'more protein', ru:'больше белка', uk:'більше білка'},
    salt: {bg:'по-малко сол/натрий', en:'less salt/sodium', ru:'меньше соли/натрия', uk:'менше солі/натрію'},
    fiber: {bg:'повече хранителни влакнини', en:'more dietary fibre', ru:'больше клетчатки', uk:'більше клітковини'},
    kcal: {bg:'по-малко калории', en:'fewer calories', ru:'меньше калорий', uk:'менше калорій'},
    overall: {bg:'цялостно по-добър хранителен профил', en:'overall better nutrition profile', ru:'улучшение общего профиля', uk:'покращення загального профілю'}
  }[goal][currentLang];
  const ingList = ingredients.map(i => `${i.name} (${i.amount}${t.g})`).join(', ');
  const name = document.getElementById('product-name').value || '—';
  const langName = {bg:'БЪЛГАРСКИ', en:'ENGLISH', ru:'РУССКИЙ', uk:'УКРАЇНСЬКА'}[currentLang];
  const dbKeys = Object.keys(LOCAL_DB).join(', ');
  const prompt = `You are a food technologist. Improve this recipe.
 
Product: ${name}
Current recipe: ${ingList}
Total batch: ${r.totalWeight.toFixed(0)}g
Current per 100g: ${Math.round(r.per.cal*100/r.serving)} kcal, protein ${(r.per.prot*100/r.serving).toFixed(1)}g, fat ${(r.per.fat*100/r.serving).toFixed(1)}g, fiber ${(r.per.fiber*100/r.serving).toFixed(1)}g, sodium ${Math.round(r.per.sodium*100/r.serving)}mg
 
GOAL: ${goalText}
 
Respond ONLY with valid JSON, no markdown fences, no extra text:
{
  "recipe": [{"name": "ingredient name", "amount": 123}],
  "explanation": "explanation of changes in ${langName}, max 120 words, use \\n for line breaks"
}
 
RULES:
- "recipe" is the COMPLETE new ingredient list with exact gram amounts
- Prefer ingredient names from this list when applicable (they have nutrition data): ${dbKeys}
- Recipe must stay technologically feasible (baking/food science)
- Keep total batch weight within ±15% of original`;
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({max_tokens:1200, messages:[{role:'user',content:prompt}]})
    });
    const data = await res.json();
    if (data.error) throw new Error(typeof data.error === 'string' ? data.error : data.error.message);
    const text = data.content.map(b=>b.text||'').join('');
    const clean = text.replace(/```json|```/g,'').trim();
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed.recipe) || !parsed.recipe.length) throw new Error('bad format');
    renderImproveProposal(parsed);
  } catch(e) {
    output.innerHTML = `<div class="err-box">${t.aiError}: ${e.message}</div>`;
  }
  btn.disabled = false;
}
 
let pendingRecipe = null;
function renderImproveProposal(parsed) {
  const t = T[currentLang];
  pendingRecipe = parsed.recipe.map(i => ({
    name: String(i.name).toLowerCase(),
    amount: Math.max(0, parseFloat(i.amount) || 0)
  })).filter(i => i.name && i.amount > 0);
  // Build old->new comparison
  const oldMap = {};
  ingredients.forEach(i => oldMap[i.name.toLowerCase()] = i.amount);
  const newMap = {};
  pendingRecipe.forEach(i => newMap[i.name] = i.amount);
  const allNames = [...new Set([...Object.keys(oldMap), ...Object.keys(newMap)])];
  let rows = '';
  allNames.forEach(n => {
    const o = oldMap[n], nw = newMap[n];
    let badge = '';
    if (o === undefined) badge = `<span class="badge badge-ai">+ ${t.diffNew}</span>`;
    else if (nw === undefined) badge = `<span class="badge" style="background:var(--red-bg);color:var(--red)">− ${t.diffRemoved}</span>`;
    else if (o !== nw) badge = `<span class="badge badge-usda">${o}${t.g} → ${nw}${t.g}</span>`;
    else badge = `<span class="badge" style="background:var(--surface2);color:var(--text3)">=</span>`;
    rows += `<div style="display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid var(--border); font-size:13px;"><span style="font-weight:500">${n}</span>${badge}</div>`;
  });
  const expl = (parsed.explanation || '').replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
  document.getElementById('ai-output').innerHTML = `
    <div class="ai-result" style="margin-top:12px">
      <div style="font-weight:600; margin-bottom:8px">${t.proposalTitle}</div>
      ${rows}
      <div style="margin:10px 0; font-size:13.5px; line-height:1.6; color:var(--text2)">${expl}</div>
      <div style="display:flex; gap:8px">
        <button class="btn btn-green" style="flex:1" onclick="applyProposal()">✅ ${t.btnApply}</button>
        <button class="btn" style="flex:1" onclick="rejectProposal()">✕ ${t.btnReject}</button>
      </div>
      <div class="lab-note" style="margin-top:10px">${t.unknownIngWarn}</div>
    </div>`;
}
 
function applyProposal() {
  if (!pendingRecipe) return;
  ingredients = pendingRecipe.map(i => ({
    name: i.name,
    amount: i.amount,
    source: (aiNutritionCache[i.name] || LOCAL_DB[i.name]) ? 'local' : 'unknown'
  }));
  pendingRecipe = null;
  renderIngredients();
  document.getElementById('ai-output').innerHTML = `<div class="lab-note" style="margin-top:12px">✅ ${T[currentLang].appliedMsg}</div>`;
}
 
function rejectProposal() {
  pendingRecipe = null;
  document.getElementById('ai-output').innerHTML = '';
}
 
// ─── SAVED RECIPES (запазени рецепти / история — localStorage) ────────────────
const SAVED_KEY = 'nutriform_recipes_v1';
const SAVED_T = {
  bg: { title:'Запазени рецепти', save:'💾 Запази рецептата', none:'Все още няма запазени рецепти.', load:'Зареди', del:'Изтрий', namePrompt:'Име на рецептата:', confirmDel:'Да изтрия ли тази рецепта?', savedMsg:'✓ Рецептата е запазена', loadedMsg:'✓ Рецептата е заредена', ingShort:'съст.' },
  en: { title:'Saved recipes', save:'💾 Save recipe', none:'No saved recipes yet.', load:'Load', del:'Delete', namePrompt:'Recipe name:', confirmDel:'Delete this recipe?', savedMsg:'✓ Recipe saved', loadedMsg:'✓ Recipe loaded', ingShort:'ing.' },
  ru: { title:'Сохранённые рецепты', save:'💾 Сохранить рецепт', none:'Пока нет сохранённых рецептов.', load:'Загрузить', del:'Удалить', namePrompt:'Название рецепта:', confirmDel:'Удалить этот рецепт?', savedMsg:'✓ Рецепт сохранён', loadedMsg:'✓ Рецепт загружен', ingShort:'ингр.' },
  uk: { title:'Збережені рецепти', save:'💾 Зберегти рецепт', none:'Поки немає збережених рецептів.', load:'Завантажити', del:'Видалити', namePrompt:'Назва рецепта:', confirmDel:'Видалити цей рецепт?', savedMsg:'✓ Рецепт збережено', loadedMsg:'✓ Рецепт завантажено', ingShort:'інгр.' },
};

function getSavedRecipes() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch(e) { return []; }
}
function setSavedRecipes(arr) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(arr)); } catch(e) {}
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function showSavedStatus(msg) {
  const el = document.getElementById('saved-status');
  if (!el) return;
  el.textContent = msg;
  clearTimeout(showSavedStatus._t);
  showSavedStatus._t = setTimeout(() => { el.textContent = ''; }, 2500);
}

function saveCurrentRecipe() {
  const st = SAVED_T[currentLang];
  if (!ingredients.length) return;
  let name = (document.getElementById('product-name').value || '').trim();
  if (!name) {
    name = (prompt(st.namePrompt) || '').trim();
    if (!name) return;
    document.getElementById('product-name').value = name;
  }
  const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const recipe = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name, ts: Date.now(), lang: currentLang,
    productType, labelMode,
    serving: val('serving-size'),
    // пазим и хранителните данни на всяка съставка → рецептата се смята дори офлайн / за USDA/AI продукти
    ingredients: ingredients.map(i => ({ name: i.name, amount: i.amount, source: i.source, data: getNutrition(i.name) || null })),
    allergens: selectedAllergens.slice(),
    additives: selectedAdditives.slice(),
    lab: { kcal: val('lab-kcal'), fat: val('lab-fat'), satfat: val('lab-satfat'), carb: val('lab-carb'), sugar: val('lab-sugar'), fiber: val('lab-fiber'), prot: val('lab-prot'), salt: val('lab-salt') },
    feed: { protein: val('feed-protein'), fat: val('feed-fat'), fibre: val('feed-fibre'), ash: val('feed-ash'), moisture: val('feed-moisture'), species: val('feed-species'), additives: val('feed-additives'), composition: val('feed-composition') }
  };
  const all = getSavedRecipes();
  all.unshift(recipe);
  setSavedRecipes(all);
  renderSavedRecipes();
  showSavedStatus(st.savedMsg);
}

function loadRecipe(id) {
  const st = SAVED_T[currentLang];
  const rec = getSavedRecipes().find(r => r.id === id);
  if (!rec) return;
  const setVal = (elId, v) => { const el = document.getElementById(elId); if (el) el.value = (v == null ? '' : v); };
  setVal('product-name', rec.name);
  setVal('serving-size', rec.serving || 100);
  // съставки + възстановяване на кеша с хранителни данни
  ingredients = (rec.ingredients || []).map(i => {
    if (i.data) aiNutritionCache[String(i.name).toLowerCase()] = i.data;
    return { name: i.name, amount: i.amount, source: i.source };
  });
  selectedAllergens = (rec.allergens || []).slice();
  selectedAdditives = (rec.additives || []).slice();
  if (rec.lab) ['kcal','fat','satfat','carb','sugar','fiber','prot','salt'].forEach(k => setVal('lab-' + k, rec.lab[k]));
  if (rec.feed) {
    ['protein','fat','fibre','ash','moisture','additives','composition'].forEach(k => setVal('feed-' + k, rec.feed[k]));
    if (rec.feed.species) setVal('feed-species', rec.feed.species);
  }
  // режими (тези функции пускат и преизчисляване)
  setProductType(rec.productType || 'human');
  setLabelMode(rec.labelMode || 'calc');
  renderAllergens();
  renderAdditives();
  renderIngredients();
  showSavedStatus(st.loadedMsg);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteRecipe(id) {
  const st = SAVED_T[currentLang];
  if (!confirm(st.confirmDel)) return;
  setSavedRecipes(getSavedRecipes().filter(r => r.id !== id));
  renderSavedRecipes();
}

function renderSavedRecipes() {
  const st = SAVED_T[currentLang];
  const list = document.getElementById('saved-list');
  if (!list) return;
  const all = getSavedRecipes();
  if (!all.length) { list.innerHTML = `<div class="no-results" style="padding:10px 0">${st.none}</div>`; return; }
  list.innerHTML = all.map(r => {
    const d = new Date(r.ts);
    const date = d.toLocaleDateString() + ' ' + d.toTimeString().slice(0, 5);
    const cnt = (r.ingredients || []).length;
    const icon = r.productType === 'feed' ? '🐕' : '🍞';
    return `<div class="saved-item">
      <div class="saved-meta">
        <div class="saved-name">${icon} ${escapeHtml(r.name)}</div>
        <div class="saved-sub">${date} · ${cnt} ${st.ingShort}</div>
      </div>
      <div class="saved-actions">
        <button class="btn" onclick="loadRecipe('${r.id}')">▶ ${st.load}</button>
        <button class="del-btn" title="${st.del}" onclick="deleteRecipe('${r.id}')">🗑</button>
      </div>
    </div>`;
  }).join('');
}

// ─── ДОБАВКИ (E-номера, задължителни на етикета по Регламент 1169/2011) ───────
const ADD_FN = {
  preservative: { bg:'консервант', en:'preservative', ru:'консервант', uk:'консервант' },
  antioxidant:  { bg:'антиоксидант', en:'antioxidant', ru:'антиоксидант', uk:'антиоксидант' },
  acidity:      { bg:'регулатор на киселинност', en:'acidity regulator', ru:'регулятор кислотности', uk:'регулятор кислотності' },
  emulsifier:   { bg:'емулгатор', en:'emulsifier', ru:'эмульгатор', uk:'емульгатор' },
  thickener:    { bg:'сгъстител', en:'thickener', ru:'загуститель', uk:'загусник' },
  raising:      { bg:'набухвател', en:'raising agent', ru:'разрыхлитель', uk:'розпушувач' },
  colour:       { bg:'оцветител', en:'colour', ru:'краситель', uk:'барвник' },
  flavour:      { bg:'овкусител', en:'flavour enhancer', ru:'усилитель вкуса', uk:'підсилювач смаку' },
  sweetener:    { bg:'подсладител', en:'sweetener', ru:'подсластитель', uk:'підсолоджувач' },
  anticaking:   { bg:'антислепващ агент', en:'anti-caking agent', ru:'антислёживатель', uk:'антизлежувач' },
  stabiliser:   { bg:'стабилизатор', en:'stabiliser', ru:'стабилизатор', uk:'стабілізатор' },
};
const ADD_CATALOG = [
  { e:'E 200', fn:'preservative', name:{bg:'сорбинова киселина', en:'sorbic acid'} },
  { e:'E 202', fn:'preservative', name:{bg:'калиев сорбат', en:'potassium sorbate'} },
  { e:'E 211', fn:'preservative', name:{bg:'натриев бензоат', en:'sodium benzoate'} },
  { e:'E 223', fn:'preservative', name:{bg:'натриев метабисулфит', en:'sodium metabisulphite'} },
  { e:'E 250', fn:'preservative', name:{bg:'натриев нитрит', en:'sodium nitrite'} },
  { e:'E 251', fn:'preservative', name:{bg:'натриев нитрат', en:'sodium nitrate'} },
  { e:'E 252', fn:'preservative', name:{bg:'калиев нитрат', en:'potassium nitrate'} },
  { e:'E 300', fn:'antioxidant', name:{bg:'аскорбинова киселина', en:'ascorbic acid'} },
  { e:'E 301', fn:'antioxidant', name:{bg:'натриев аскорбат', en:'sodium ascorbate'} },
  { e:'E 306', fn:'antioxidant', name:{bg:'токофероли (вит. E)', en:'tocopherols'} },
  { e:'E 322', fn:'emulsifier', name:{bg:'лецитини', en:'lecithins'} },
  { e:'E 471', fn:'emulsifier', name:{bg:'моно- и диглицериди на мастни киселини', en:'mono- and diglycerides of fatty acids'} },
  { e:'E 270', fn:'acidity', name:{bg:'млечна киселина', en:'lactic acid'} },
  { e:'E 296', fn:'acidity', name:{bg:'ябълчена киселина', en:'malic acid'} },
  { e:'E 330', fn:'acidity', name:{bg:'лимонена киселина', en:'citric acid'} },
  { e:'E 339', fn:'acidity', name:{bg:'натриеви фосфати', en:'sodium phosphates'} },
  { e:'E 575', fn:'acidity', name:{bg:'глюконо-делта-лактон', en:'glucono-delta-lactone'} },
  { e:'E 407', fn:'thickener', name:{bg:'карагенан', en:'carrageenan'} },
  { e:'E 410', fn:'thickener', name:{bg:'брашно от рожкови семена', en:'locust bean gum'} },
  { e:'E 412', fn:'thickener', name:{bg:'гума гуар', en:'guar gum'} },
  { e:'E 415', fn:'thickener', name:{bg:'ксантанова гума', en:'xanthan gum'} },
  { e:'E 440', fn:'thickener', name:{bg:'пектин', en:'pectin'} },
  { e:'E 1422', fn:'thickener', name:{bg:'модифицирано нишесте', en:'modified starch'} },
  { e:'E 500', fn:'raising', name:{bg:'натриеви карбонати (сода)', en:'sodium carbonates'} },
  { e:'E 503', fn:'raising', name:{bg:'амониеви карбонати', en:'ammonium carbonates'} },
  { e:'E 450', fn:'raising', name:{bg:'дифосфати', en:'diphosphates'} },
  { e:'E 100', fn:'colour', name:{bg:'куркумин', en:'curcumin'} },
  { e:'E 150a', fn:'colour', name:{bg:'карамел', en:'caramel'} },
  { e:'E 160a', fn:'colour', name:{bg:'бета-каротин', en:'beta-carotene'} },
  { e:'E 160c', fn:'colour', name:{bg:'екстракт от паприка', en:'paprika extract'} },
  { e:'E 621', fn:'flavour', name:{bg:'мононатриев глутамат', en:'monosodium glutamate'} },
  { e:'E 950', fn:'sweetener', name:{bg:'ацесулфам K', en:'acesulfame K'} },
  { e:'E 951', fn:'sweetener', name:{bg:'аспартам', en:'aspartame'} },
  { e:'E 960', fn:'sweetener', name:{bg:'стевиол гликозиди', en:'steviol glycosides'} },
  { e:'E 551', fn:'anticaking', name:{bg:'силициев диоксид', en:'silicon dioxide'} },
];
const ADD_T = {
  bg: { title:'Добавки (E-номера)', pick:'Добави добавка', add:'+ Добави', custom:'+ Друга добавка…', choose:'— избери —', customPrompt:'Въведи добавката (функция, име, E-номер):\nнапр. консервант (калиев сорбат, E 202)', composition:'Състав', auto:'авто' },
  en: { title:'Additives (E numbers)', pick:'Add additive', add:'+ Add', custom:'+ Other additive…', choose:'— choose —', customPrompt:'Enter the additive (function, name, E number):\ne.g. preservative (potassium sorbate, E 202)', composition:'Ingredients', auto:'auto' },
  ru: { title:'Добавки (E-номера)', pick:'Добавить добавку', add:'+ Добавить', custom:'+ Другая добавка…', choose:'— выбери —', customPrompt:'Введите добавку (функция, название, E-номер):\nнапр. консервант (сорбат калия, E 202)', composition:'Состав', auto:'авто' },
  uk: { title:'Добавки (E-номери)', pick:'Додати добавку', add:'+ Додати', custom:'+ Інша добавка…', choose:'— обери —', customPrompt:'Введіть добавку (функція, назва, E-номер):\nнапр. консервант (сорбат калію, E 202)', composition:'Склад', auto:'авто' },
};
let selectedAdditives = [];

function additiveName(a) {
  return a.name ? (a.name[currentLang] || a.name.bg || a.name.en) : '';
}
function additiveLabel(a) {
  if (a.raw) return a.raw;
  const fn = ADD_FN[a.fn] ? (ADD_FN[a.fn][currentLang] || ADD_FN[a.fn].bg) : '';
  const nm = additiveName(a);
  const e = a.e ? ', ' + a.e : '';
  return fn ? `${fn} (${nm}${e})` : `${nm}${e}`;
}
function populateAdditiveSelect() {
  const sel = document.getElementById('additive-select');
  if (!sel) return;
  const st = ADD_T[currentLang];
  let html = `<option value="">${st.choose}</option>`;
  ADD_CATALOG.forEach((a, i) => {
    const fn = ADD_FN[a.fn][currentLang] || ADD_FN[a.fn].bg;
    html += `<option value="${i}">${a.e} — ${additiveName(a)} (${fn})</option>`;
  });
  sel.innerHTML = html;
}
function addAdditiveFromSelect() {
  const sel = document.getElementById('additive-select');
  if (!sel || sel.value === '') return;
  const a = ADD_CATALOG[parseInt(sel.value)];
  if (a && !selectedAdditives.some(x => x.e === a.e && !x.raw)) {
    selectedAdditives.push({ e:a.e, fn:a.fn, name:a.name });
  }
  sel.value = '';
  renderAdditives();
  updateResults();
}
function addCustomAdditive() {
  const txt = (prompt(ADD_T[currentLang].customPrompt) || '').trim();
  if (!txt) return;
  selectedAdditives.push({ raw: txt });
  renderAdditives();
  updateResults();
}
function removeAdditive(idx) {
  selectedAdditives.splice(idx, 1);
  renderAdditives();
  updateResults();
}
function renderAdditives() {
  const list = document.getElementById('additive-list');
  if (!list) return;
  list.innerHTML = selectedAdditives.map((a, i) =>
    `<span class="additive-chip">${escapeHtml(additiveLabel(a))}<button onclick="removeAdditive(${i})" title="✕">✕</button></span>`
  ).join('');
}
function buildComposition() {
  const parts = ingredients.slice().sort((a, b) => b.amount - a.amount).map(i => i.name);
  const adds = selectedAdditives.map(a => additiveLabel(a));
  const all = parts.concat(adds);
  return all.length ? all.join(', ') : '';
}

// Close suggestions on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.ing-search-wrap') && !e.target.closest('#suggestions')) hideSuggestions();
});
document.getElementById('serving-size').addEventListener('input', onDataChange);
