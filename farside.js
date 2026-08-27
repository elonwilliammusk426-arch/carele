/* ==========================================================================
   TESLA PLATFORM DATA LAYER (Powered by localStorage persistence)
   Real persistence via localStorage — data survives reloads and flows
   between the Request form, Track Order, Customer dashboard, and Admin
   dashboard, as long as they're opened in the same browser.
   ========================================================================== */

var FARSIDE_KEY = 'tesla_platform_requests_v1';

function farsideLoad(){
  try {
    var raw = localStorage.getItem(FARSIDE_KEY);
    if (!raw) {
      // Seed initial mock data if empty
      var initial = [
        {
          id: 'TSLA-REQ-94821',
          itemName: 'Tesla Model S Plaid (Ultra Red)',
          itemLink: 'https://tesla.com/models',
          budget: '$85,000',
          destination: 'Austin, TX',
          notes: 'Cream interior, yoke steering, FSD included.',
          name: 'Elon Musk',
          email: 'elon@tesla.com',
          status: 'Battery PPI Active',
          quote: null,
          tracking: 'TRK-849201',
          createdAt: new Date().toISOString(),
          history: [
            { label: 'Request received', date: farsideToday(), done: true },
            { label: 'Battery PPI Active', date: farsideToday(), done: true }
          ]
        }
      ];
      localStorage.setItem(FARSIDE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch(e){
    console.error('Farside: could not read storage', e);
    return [];
  }
}

function farsideSave(list){
  try {
    localStorage.setItem(FARSIDE_KEY, JSON.stringify(list));
    return true;
  } catch(e){
    console.error('Farside: could not write storage', e);
    return false;
  }
}

function farsideToday(){
  return new Date().toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
}

function farsideAddRequest(data){
  var list = farsideLoad();
  var id = 'TSLA-REQ-' + Math.floor(100000 + Math.random() * 900000);
  var record = {
    id: id,
    itemName: data.itemName || data.model || 'Tesla Model Y',
    itemLink: data.itemLink || '',
    budget: data.budget || '$50,000',
    destination: data.destination || 'Global Vault',
    notes: data.notes || data.notes || '',
    name: data.name || 'Valued Client',
    email: data.email || 'client@tesla.com',
    status: 'New Request',
    quote: null,
    tracking: 'TRK-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString(),
    history: [
      { label: 'Request received', date: farsideToday(), done: true }
    ]
  };
  list.unshift(record);
  farsideSave(list);
  return record;
}

function farsideFindRequest(query){
  if(!query) return null;
  query = query.trim().toLowerCase();
  var list = farsideLoad();
  for(var i=0;i<list.length;i++){
    var r = list[i];
    if(r.id.toLowerCase() === query) return r;
  }
  var matches = list.filter(function(r){ return r.email && r.email.toLowerCase() === query; });
  return matches.length ? matches[0] : null;
}

function farsideAllForEmail(email){
  if(!email) return farsideLoad();
  email = email.trim().toLowerCase();
  return farsideLoad().filter(function(r){ return r.email && r.email.toLowerCase() === email; });
}

function farsideUpdateStatus(id, status, historyLabel, extra){
  var list = farsideLoad();
  var rec = null;
  for(var i=0;i<list.length;i++){
    if(list[i].id === id){ rec = list[i]; break; }
  }
  if(!rec) return null;
  rec.status = status;
  rec.history.push({ label: historyLabel || status, date: farsideToday(), done: true });
  if(extra){
    Object.keys(extra).forEach(function(k){ rec[k] = extra[k]; });
  }
  farsideSave(list);
  return rec;
}

function farsideSetQuote(id, quote){
  return farsideUpdateStatus(id, 'Quoted', 'Quote sent', { quote: quote });
}

function farsideDeleteAll(){
  localStorage.removeItem(FARSIDE_KEY);
}
