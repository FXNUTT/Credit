import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,doc,writeBatch,increment,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const $=s=>document.querySelector(s);
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');setTimeout(()=>el.classList.remove('on'),2400)}
$('#fdate').value=new Date().toISOString().slice(0,10);
$('#login').onclick=async()=>{try{await signInWithEmailAndPassword(auth,$('#em').value,$('#pw').value)}catch(e){toast('เข้าสู่ระบบไม่สำเร็จ ตรวจอีเมลและรหัสผ่าน')}};
$('#logout').onclick=()=>signOut(auth);
let saved=0;
onAuthStateChanged(auth,u=>{$('#loginBox').hidden=!!u;$('#app').hidden=!u});
/* แก้รูป: ลากกรอบแล้วแปลงเป็นพิกเซล (กู้คืนไม่ได้) */
const cv=$('#cv'),ctx=cv.getContext('2d',{willReadFrequently:true});
let stack=[],drag=null,has=false;
$('#file').onchange=async function(){
  const f=this.files[0];if(!f)return;
  const bmp=await createImageBitmap(f),w=Math.min(900,bmp.width);
  cv.width=w;cv.height=Math.round(bmp.height*w/bmp.width);ctx.drawImage(bmp,0,0,cv.width,cv.height);
  cv.style.display='block';stack=[];has=true;
};
const pt=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height}};
cv.addEventListener('pointerdown',e=>{if(!has)return;stack.push(ctx.getImageData(0,0,cv.width,cv.height));drag=pt(e);cv.setPointerCapture(e.pointerId)});
cv.addEventListener('pointermove',e=>{if(!drag)return;const p=pt(e);ctx.putImageData(stack[stack.length-1],0,0);ctx.strokeStyle='#e8478b';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.strokeRect(drag.x,drag.y,p.x-drag.x,p.y-drag.y)});
cv.addEventListener('pointerup',e=>{
  if(!drag)return;const p=pt(e);ctx.putImageData(stack[stack.length-1],0,0);
  const x=Math.round(Math.min(p.x,drag.x)),y=Math.round(Math.min(p.y,drag.y)),w=Math.round(Math.abs(p.x-drag.x)),h=Math.round(Math.abs(p.y-drag.y));drag=null;
  if(w<8||h<8){stack.pop();return}
  const b=Math.max(10,Math.round(cv.width/55)),tw=Math.max(1,Math.round(w/b)),th=Math.max(1,Math.round(h/b)),t=document.createElement('canvas');
  t.width=tw;t.height=th;t.getContext('2d').drawImage(cv,x,y,w,h,0,0,tw,th);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(t,0,0,tw,th,x,y,w,h);ctx.imageSmoothingEnabled=true;
});
$('#undo').onclick=()=>{const s=stack.pop();if(s)ctx.putImageData(s,0,0)};
$('#save').onclick=async()=>{
  if(!has)return toast('เลือกรูปสกรีนช็อตก่อน');
  const name=$('#fname').value.trim().split(/\s+/)[0];if(!name)return toast('ใส่ชื่อต้นของลูกค้าก่อน');
  const credit=Math.max(1,parseInt($('#fcred').value)||1),id=crypto.randomUUID();
  const full=cv.toDataURL('image/jpeg',.72);
  const t=document.createElement('canvas');t.width=320;t.height=Math.round(cv.height*320/cv.width);t.getContext('2d').drawImage(cv,0,0,t.width,t.height);
  const thumb=t.toDataURL('image/jpeg',.6);
  $('#save').disabled=true;
  try{
    const b=writeBatch(db);
    b.set(doc(db,'credits',id),{name,date:$('#fdate').value,credit,tag:$('#ftag').value,thumb,createdAt:serverTimestamp()});
    b.set(doc(db,'images',id),{full});
    b.set(doc(db,'meta','stats'),{total:increment(credit)},{merge:true});
    await b.commit();
    saved++;$('#count').textContent='บันทึกในรอบนี้แล้ว '+saved+' รายการ';toast('บันทึกเครดิตแล้ว');
    $('#fname').value='';$('#file').value='';cv.style.display='none';has=false;stack=[];
  }catch(e){console.error(e);toast('บันทึกไม่สำเร็จ ตรวจกฎ Firestore และอีเมลแอดมิน')}
  $('#save').disabled=false;
};
