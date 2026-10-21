import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getFirestore,collection,query,orderBy,limit,startAfter,where,getDocs,getDoc,doc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";
const db=getFirestore(initializeApp(firebaseConfig));
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const TAGS=['ทั้งหมด','ซื้อซ้ำ','นัดรับ','ส่งของ','ลูกค้าใหม่'],PAGE=24;
let filter='ทั้งหมด',last=null,items=[];
const fmt=d=>{try{return new Date(d+'T00:00:00').toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'})}catch(e){return d}};
const card=it=>`<article class="slip"><div class="pic" tabindex="0" role="button" data-id="${esc(it.id)}"><img loading="lazy" src="${esc(it.thumb)}" alt="หลักฐานเครดิตของคุณ${esc(it.name)}"><span class="plus">+${it.credit}</span></div><div class="meta"><div class="who">คุณ${esc(it.name)}</div><div class="when">${fmt(it.date)}</div><span class="tag">${esc(it.tag)}</span></div></article>`;
function render(){
  $('#grid').innerHTML=items.length?items.map(card).join(''):'<div class="empty">ยังไม่มีรายการ</div>';
  $('#chips').innerHTML=TAGS.map(t=>`<button class="chip" aria-pressed="${t===filter}" data-t="${t}">${t}</button>`).join(' ');
}
async function load(reset){
  if(reset){items=[];last=null}
  const c=collection(db,'credits');
  const q=filter==='ทั้งหมด'
    ?query(c,orderBy('date','desc'),...(last?[startAfter(last)]:[]),limit(PAGE))
    :query(c,where('tag','==',filter),limit(60));
  try{
    const s=await getDocs(q);
    s.forEach(d=>items.push({id:d.id,...d.data()}));
    last=s.docs[s.docs.length-1]||last;
    if(filter!=='ทั้งหมด')items.sort((a,b)=>b.date.localeCompare(a.date));
    $('#more').hidden=!(filter==='ทั้งหมด'&&s.size===PAGE);
  }catch(e){console.error(e);$('#grid').innerHTML='<div class="empty">โหลดข้อมูลไม่สำเร็จ ลองรีเฟรชหน้านี้</div>';return}
  render();
}
async function total(){
  try{const s=await getDoc(doc(db,'meta','stats'));$('#total').textContent=s.exists()?s.data().total||0:0;
    const b=$('.big');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}catch(e){console.error(e)}
}
$('#chips').addEventListener('click',e=>{const t=e.target.getAttribute('data-t');if(t){filter=t;load(true)}});
$('#more').onclick=()=>load(false);
async function openPic(p){
  const it=items.find(x=>x.id===p.dataset.id);if(!it)return;
  $('#big').src=it.thumb;
  $('#cap').innerHTML=`<b>เครดิตของแม่ค้า Nuttanicha Settakarnsuk</b><br>ลูกค้า: คุณ${esc(it.name)}<br>วันที่ ${fmt(it.date)}, เครดิต +${it.credit}<br><a href="https://www.facebook.com/nutta.sett" target="_blank" rel="noopener">ดูโปรไฟล์ผู้ขาย</a>`;
  $('#dlg').showModal();
  try{const s=await getDoc(doc(db,'images',it.id));if(s.exists())$('#big').src=s.data().full}catch(e){}
}
$('#grid').addEventListener('click',e=>{const p=e.target.closest('.pic');if(p)openPic(p)});
$('#grid').addEventListener('keydown',e=>{if(e.key==='Enter'){const p=e.target.closest('.pic');if(p)openPic(p)}});
$('#dlg').addEventListener('click',function(){this.close()});
$('#theme').onclick=function(){const r=document.documentElement,d=getComputedStyle(r).getPropertyValue('--bg').trim()==='#190f20';r.setAttribute('data-theme',d?'light':'dark');this.setAttribute('aria-pressed',!d)};
document.addEventListener('pointerdown',e=>{
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  if(!e.target.closest('.pic,.chip,.btn'))return;
  for(let i=0;i<5;i++){const h=document.createElement('span');h.className='heart';h.textContent='\u2665';h.style.left=e.clientX+'px';h.style.top=e.clientY+'px';h.style.setProperty('--dx',(Math.random()*80-40)+'px');document.body.appendChild(h);setTimeout(()=>h.remove(),850)}
  const s=e.target.closest('.slip');if(s){s.classList.remove('pop');void s.offsetWidth;s.classList.add('pop')}
});
load(true);total();
