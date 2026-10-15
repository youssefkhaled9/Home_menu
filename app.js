// ====== إعدادات Supabase: غيّر القيمتين دول ======
const SUPABASE_URL = 'https://lfjwdjzmowqlapwbmgsw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Yz9DECkQz2LbAkL9ttCcPg_M3CxbjZq';
// ==================================================

var meals = [], db = null;

function status(t){ var st = document.getElementById('sync'); if (st) st.textContent = t; }

async function load(){
  var r = await db.from('meals').select('*').order('created_at');
  if (r.error){ status('مشكلة في الاتصال بالسيرفر'); return; }
  meals = r.data.map(function(x){ return { id:x.id, name:x.name, cat:x.cat, last:x.last_eaten }; });
  render();
  status('منيو مشترك ومتزامن ✓');
}
async function markEaten(m){
  var now = new Date().toISOString();
  m.last = now; render();
  var r = await db.from('meals').update({ last_eaten: now }).eq('id', m.id);
  if (r.error){ status('معرفتش أحفظ التعديل'); load(); }
}
async function removeMeal(m){
  meals = meals.filter(function(z){ return z !== m; }); render();
  var r = await db.from('meals').delete().eq('id', m.id);
  if (r.error){ status('معرفتش أحذف'); load(); }
}
async function addMeal(name, cat){
  var r = await db.from('meals').insert({ name: name, cat: cat });
  if (r.error){ status('معرفتش أضيف الأكلة'); return; }
  load();
}

var ICONS={'فطار':'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>','غدا':'<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3Zm0 0v7"/>','عشا':'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>','سناك':'<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01M16 15.5v.01M12 12v.01M11 17v.01M7 14v.01"/>'},n=0;
var CATS=['فطار','غدا','عشا','سناك'],DAY=864e5,picked=null;
function sod(t){var d=new Date(t);d.setHours(0,0,0,0);return d.getTime()}
function ago(m){return m.last?Math.round((sod(Date.now())-sod(m.last))/DAY):null}
function cmp(a,b){var x=ago(a),y=ago(b);if(x===null&&y===null)return 0;if(x===null)return -1;if(y===null)return 1;return y-x}
function label(d){if(d===null)return 'جديدة';if(d===0)return 'النهاردة';if(d===1)return 'امبارح';if(d===2)return 'من يومين';if(d<=10)return 'من '+d+' أيام';return 'من '+d+' يوم'}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e}
function render(){
 var root=document.getElementById('menu');root.innerHTML='';n=0;
 CATS.forEach(function(c){
  var arr=meals.filter(function(m){return m.cat===c}).sort(cmp);
  var editing=document.getElementById('sheet').classList.contains('edit');
  if(!arr.length&&!editing)return;
  var h=el('h2');h.style.animationDelay=(n++*0.08)+'s';h.innerHTML='<svg viewBox="0 0 24 24">'+ICONS[c]+'</svg>';h.appendChild(document.createTextNode(c));root.appendChild(h);
  if(!arr.length)root.appendChild(el('div','empty','— فاضي —'));
  arr.forEach(function(m){
   var d=ago(m),r=el('div','item');r.style.animationDelay=(n++*0.06)+'s';
   r.appendChild(el('span','n',m.name));
   r.appendChild(el('span','dots'));
   var t=el('span','t',label(d));var dot=el('i',d!==null&&d<4?'soon':'');t.appendChild(dot);r.appendChild(t);
   var ctl=el('span','ctl');
   var a=el('button','','أكلتها');a.onclick=function(){markEaten(m)};
   var x=el('button','','حذف');x.onclick=function(){removeMeal(m)};
   ctl.appendChild(a);ctl.appendChild(x);r.appendChild(ctl);root.appendChild(r)});
 });
 if(!meals.length&&!document.getElementById('sheet').classList.contains('edit'))root.appendChild(el('div','empty','المنيو فاضي — دوس "تعديل" وضيف أول أكلة'));
}
function pick(){
 var arr=meals.slice().sort(cmp);if(!arr.length)return;
 var pool=arr.slice(0,Math.max(3,Math.ceil(arr.length/2))),m=pool[Math.floor(Math.random()*pool.length)];
 if(pool.length>1)while(m===picked)m=pool[Math.floor(Math.random()*pool.length)];
 picked=m;document.getElementById('rn').textContent=m.name;var rs=document.getElementById('res');rs.style.display='block';rs.classList.remove('show');void rs.offsetWidth;rs.classList.add('show');
}
document.getElementById('pick').onclick=pick;
document.getElementById('rmore').onclick=pick;
document.getElementById('rate').onclick=function(){if(picked){markEaten(picked);document.getElementById('res').style.display='none'}};
document.getElementById('tog').onclick=function(){var s=document.getElementById('sheet');s.classList.toggle('edit');this.textContent=s.classList.contains('edit')?'تم':'تعديل';render()};
function add(){var i=document.getElementById('inp'),v=i.value.trim();if(!v)return;addMeal(v,document.getElementById('cat').value);i.value='';i.focus()}
document.getElementById('add').onclick=add;
document.getElementById('inp').onkeydown=function(e){if(e.key==='Enter')add()};
render();

// ====== تشغيل Supabase ======
if (SUPABASE_URL.indexOf('YOUR-PROJECT') !== -1){
  status('لازم تحط بيانات Supabase في أول ملف app.js');
} else {
  db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  load();
  db.channel('meals-changes')
    .on('postgres_changes', { event:'*', schema:'public', table:'meals' }, load)
    .subscribe();
}