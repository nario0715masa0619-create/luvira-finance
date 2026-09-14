const KEY='luvira-finance-v1';
const yen=n=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY',maximumFractionDigits:0}).format(n||0);
const today=new Date().toISOString().slice(0,10);
let data=JSON.parse(localStorage.getItem(KEY)||'null')||{transactions:[],fixed:[{name:'（例）オフィス賃料',amount:0},{name:'（例）SaaS・通信',amount:0}]};
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function month(){return document.querySelector('#monthFilter').value||today.slice(0,7)}
function render(){
 const m=month(), ts=data.transactions.filter(t=>t.date.startsWith(m)), spent=ts.reduce((s,t)=>s+Number(t.amount),0), unpaid=ts.filter(t=>t.source.startsWith('個人')&&t.status==='未精算').reduce((s,t)=>s+Number(t.amount),0), fixed=data.fixed.reduce((s,t)=>s+Number(t.amount),0);
 document.querySelector('#summary').innerHTML=[['今月の支出',yen(spent),''],['来月の固定費',yen(fixed),'accent'],['個人立替（未精算）',yen(unpaid),''],['登録取引',`${data.transactions.length}件`,'']].map(x=>`<div class="card"><small>${x[0]}</small><div class="value ${x[2]}">${x[1]}</div></div>`).join('');
 document.querySelector('#transactions').innerHTML=ts.sort((a,b)=>b.date.localeCompare(a.date)).map(t=>`<tr><td>${t.date}</td><td>${esc(t.description)}</td><td><span class="pill">${esc(t.category)}</span></td><td>${esc(t.source)}</td><td class="right">${yen(t.amount)}</td><td><button class="secondary" onclick="removeTx('${t.id}')">削除</button></td></tr>`).join('')||'<tr><td colspan="6">この月の取引はありません</td></tr>';
 document.querySelector('#fixedCosts').innerHTML=data.fixed.map((f,i)=>`<div class="fixed-row"><div>${esc(f.name)}<small>毎月</small></div><strong>${yen(f.amount)}</strong><button class="secondary" onclick="removeFixed(${i})">×</button></div>`).join('')||'<p>固定費は未登録です。</p>';
}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
document.querySelector('#transactionForm').addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);data.transactions.push({id:crypto.randomUUID(),date:f.get('date'),amount:Number(f.get('amount')),description:f.get('description'),category:f.get('category'),source:f.get('source'),status:f.get('status')});e.target.reset();e.target.date.value=today;save()});
document.querySelector('#fixedDialog').addEventListener('close',e=>{if(e.target.returnValue==='default'){const f=new FormData(document.querySelector('#fixedForm'));data.fixed.push({name:f.get('name'),amount:Number(f.get('amount'))});document.querySelector('#fixedForm').reset();save()}});
document.querySelector('#addFixedBtn').onclick=()=>document.querySelector('#fixedDialog').showModal();
document.querySelector('#monthFilter').onchange=render;
document.querySelector('#csvInput').onchange=async e=>{const text=await e.target.files[0].text();text.split(/\r?\n/).slice(1).filter(Boolean).forEach(row=>{const [date,description,amount,category='その他',source='会社口座']=row.split(',');if(date&&amount)data.transactions.push({id:crypto.randomUUID(),date,description,amount:Number(amount),category,source,status:source.startsWith('個人')?'未精算':'対象外'})});save()};
document.querySelector('#exportBtn').onclick=()=>{const csv=['date,description,amount,category,source,status',...data.transactions.map(t=>[t.date,t.description,t.amount,t.category,t.source,t.status].join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download='luvira-finance-transactions.csv';a.click()};
window.removeTx=id=>{data.transactions=data.transactions.filter(t=>t.id!==id);save()};window.removeFixed=i=>{data.fixed.splice(i,1);save()};
const filter=document.querySelector('#monthFilter');[...new Set([today.slice(0,7),...data.transactions.map(t=>t.date.slice(0,7))])].sort().reverse().forEach(m=>filter.add(new Option(m,m)));document.querySelector('#transactionForm').date.value=today;render();
