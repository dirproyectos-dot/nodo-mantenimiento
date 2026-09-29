const ITEMS=[
["1","Limpieza del equipo",1],["1.1","Aspirado de polvo en superficies interiores"],["1.2","Aspirado de polvo en superficies exteriores"],["1.3","Limpieza de equipos, barrajes y conductores"],["1.4","Limpieza de filtros / Ventilación"],["1.5","Retiro de elementos extraños y residuos"],
["2","Aspectos mecánicos del equipo",1],["2.1","Revisión de chapas, bisagras, pasadores y herrajes"],["2.2","Verificación de cierre y estado del gabinete"],["2.3","Verificación de fijación de equipos y componentes"],["2.4","Revisión de ajuste mecánico de conectores"],["2.5","Verificación de torque/Apriete en conexiones de potencia"],["2.6","Verificación de torque/Apriete en circuitos de control"],
["3","Aspectos eléctricos del equipo",1],["3.1","Revisión visual de barrajes y conductores"],["3.2","Revisión de instrumentos de medida"],["3.3","Verificación de continuidad de fusibles"],["3.4","Prueba de pilotos e indicadores"],["3.5","Accionamiento de interruptores / Breakers"],["3.6","Revisión de marcación y señalización"],["3.7","Revisión del estado de aisladores"],["3.8","Revisión de barraje y conductor de puesta a tierra"],["3.9","Inspección de protecciones y capacidad nominal"],["3.10","Verificación de puntos calientes / Condición térmica"],["3.11","Revisión de borneras y circuitos de control"],["3.12","Verificación de orden, separación y sujeción del cableado"],["3.13","Comprobación general de operación del tablero"]
];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const pad=n=>String(n).padStart(4,"0"); let current=null;
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function show(id){$$(".view").forEach(v=>v.classList.remove("active"));$("#"+id).classList.add("active");scrollTo(0,0)}
function settings(){return store.get("nodo_settings",{next:1,cliente:"",recibe:"",cargoRecibe:"",ejecuta:"",cargoEjecuta:""})}
function saveSettings(s){store.set("nodo_settings",s)}
function reports(){return store.get("nodo_reports",[])} function saveReports(r){store.set("nodo_reports",r)}
function buildChecklist(){const c=$("#checklist");c.innerHTML=ITEMS.map((x,i)=>x[2]?`<div class="check-row group"><span class="item">${x[0]}</span><span>${x[1]}</span></div>`:`<div class="check-row"><span class="item">${x[0]}</span><span>${x[1]}</span><select data-check="${i}"><option value=""></option><option>Sí</option><option>No</option><option>N/A</option></select><input class="obs" data-obs="${i}" placeholder="Observación"></div>`).join("")}
function initHome(){const s=settings();$("#hCliente").value=s.cliente;$("#hRecibe").value=s.recibe;$("#hCargoRecibe").value=s.cargoRecibe;$("#hEjecuta").value=s.ejecuta;$("#hCargoEjecuta").value=s.cargoEjecuta;$("#hConsecutivo").value=s.next;$("#hProximo").value=pad(s.next);$("#hFecha").value=new Date().toISOString().slice(0,10)}
$("#hConsecutivo").oninput=e=>$("#hProximo").value=pad(Math.max(1,+e.target.value||1));
function persistHome(){let s=settings();Object.assign(s,{cliente:$("#hCliente").value,recibe:$("#hRecibe").value,cargoRecibe:$("#hCargoRecibe").value,ejecuta:$("#hEjecuta").value,cargoEjecuta:$("#hCargoEjecuta").value,next:Math.max(1,+$("#hConsecutivo").value||1)});saveSettings(s);return s}
function clearCanvas(c){const x=c.getContext("2d");x.clearRect(0,0,c.width,c.height);x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height)}
function setupSig(c){clearCanvas(c);let on=false,last;const p=e=>{const r=c.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return[(t.clientX-r.left)*c.width/r.width,(t.clientY-r.top)*c.height/r.height]};const down=e=>{on=true;last=p(e);e.preventDefault()},move=e=>{if(!on)return;const q=p(e),x=c.getContext("2d");x.strokeStyle="#000";x.lineWidth=4;x.lineCap="round";x.beginPath();x.moveTo(...last);x.lineTo(...q);x.stroke();last=q;e.preventDefault()},up=()=>on=false;c.addEventListener("pointerdown",down);c.addEventListener("pointermove",move);window.addEventListener("pointerup",up)}
function canvasData(id){return $("#"+id).toDataURL("image/png")} function putCanvas(id,data){const c=$("#"+id);clearCanvas(c);if(!data)return;let im=new Image();im.onload=()=>c.getContext("2d").drawImage(im,0,0,c.width,c.height);im.src=data}
function setPhotoPreview(n,data){
  const img=$("#photo"+n+"Preview"), frame=img.parentElement, placeholder=frame.querySelector("span");
  if(data){img.src=data;img.style.display="block";placeholder.style.display="none"}
  else{img.removeAttribute("src");img.style.display="none";placeholder.style.display="block"}
}
function compressPhoto(file,maxW=1280,maxH=960,quality=.72){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=()=>{
      const im=new Image();
      im.onerror=reject;
      im.onload=()=>{
        let w=im.width,h=im.height,scale=Math.min(1,maxW/w,maxH/h);
        w=Math.round(w*scale);h=Math.round(h*scale);
        const c=document.createElement("canvas");c.width=w;c.height=h;
        c.getContext("2d").drawImage(im,0,0,w,h);
        resolve(c.toDataURL("image/jpeg",quality));
      };
      im.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
async function handlePhoto(n,file){
  if(!file)return;
  try{
    const data=await compressPhoto(file);
    current["photo"+n]=data;setPhotoPreview(n,data);toast("Fotografía "+n+" cargada");
  }catch(e){alert("No fue posible procesar la fotografía.")}
}
function newReport(){const s=persistHome();current={id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(),number:s.next,status:"Borrador",created:new Date().toISOString()};$("#formNo").textContent=pad(s.next);$("#cliente").value=s.cliente;$("#fecha").value=$("#hFecha").value;$("#ejecuta").value=s.ejecuta;$("#cargoEjecuta").value=s.cargoEjecuta;$("#recibe").value=s.recibe;$("#cargoRecibe").value=s.cargoRecibe;$("#ubicacion").value=$("#descripcion").value=$("#horaInicio").value=$("#horaFinal").value=$("#hallazgos").value=$("#recomendaciones").value="";$$("[data-check]").forEach(x=>x.value="");$$("[data-obs]").forEach(x=>x.value="");$$("[data-measure]").forEach(x=>x.value="");clearCanvas($("#sigEjecuta"));clearCanvas($("#sigRecibe"));current.photo1="";current.photo2="";setPhotoPreview(1,"");setPhotoPreview(2,"");show("editor")}
function collect(){if(!current)return null;current.number=+current.number;["cliente","ubicacion","descripcion","fecha","horaInicio","horaFinal","hallazgos","recomendaciones","ejecuta","cargoEjecuta","recibe","cargoRecibe"].forEach(k=>current[k]=$("#"+k).value);current.checks=ITEMS.map((x,i)=>x[2]?null:{item:x[0],text:x[1],done:document.querySelector(`[data-check="${i}"]`).value,obs:document.querySelector(`[data-obs="${i}"]`).value});current.measures={};$$("[data-measure]").forEach(x=>current.measures[x.dataset.measure]=x.value);current.sigEjecuta=canvasData("sigEjecuta");current.sigRecibe=canvasData("sigRecibe");current.updated=new Date().toISOString();return current}
function saveCurrent(){const r=collect(),all=reports(),i=all.findIndex(x=>x.id===r.id);if(i>=0)all[i]=r;else all.push(r);saveReports(all);let s=settings();if(r.number>=s.next)s.next=r.number+1;saveSettings(s);initHome();toast("Informe guardado")}
function loadReport(id){current=reports().find(x=>x.id===id);if(!current)return;$("#formNo").textContent=pad(current.number);["cliente","ubicacion","descripcion","fecha","horaInicio","horaFinal","hallazgos","recomendaciones","ejecuta","cargoEjecuta","recibe","cargoRecibe"].forEach(k=>$("#"+k).value=current[k]||"");(current.checks||[]).forEach((v,j)=>{if(!v)return;const idx=ITEMS.findIndex(x=>x[0]===v.item);if(idx>=0){const c=document.querySelector(`[data-check="${idx}"]`);const o=document.querySelector(`[data-obs="${idx}"]`);if(c)c.value=v.done||"";if(o)o.value=v.obs||""}});$$("[data-measure]").forEach(x=>x.value=(current.measures||{})[x.dataset.measure]||"");putCanvas("sigEjecuta",current.sigEjecuta);putCanvas("sigRecibe",current.sigRecibe);setPhotoPreview(1,current.photo1||"");setPhotoPreview(2,current.photo2||"");show("editor")}
function renderHistory(){
  const a=reports().sort((x,y)=>y.number-x.number);
  $("#historyList").innerHTML=a.length?a.map(r=>`<div class="card history-item">
    <div class="num">${pad(r.number)}</div>
    <div><b>${esc(r.cliente||"Sin cliente")}</b><br><small>${esc(r.fecha||"")} · ${esc(r.status||"Borrador")}</small></div>
    <div class="hactions">
      <button type="button" class="open-report" data-id="${esc(r.id)}">Abrir</button>
      <button type="button" class="delete-report" data-id="${esc(r.id)}">Eliminar</button>
    </div>
  </div>`).join(""):`<div class="card">Aún no hay informes guardados.</div>`;
}
function deleteReport(id){if(confirm("¿Eliminar este informe del dispositivo?")){saveReports(reports().filter(x=>x.id!==id));renderHistory()}}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function safeSignature(data){
  return (typeof data==="string" && data.startsWith("data:image/")) ? data : "";
}
function waitPreviewImages(){
  const imgs=[...document.querySelectorAll("#printContent img")];
  return Promise.all(imgs.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{
    img.addEventListener("load",resolve,{once:true});
    img.addEventListener("error",resolve,{once:true});
  })));
}
function buildPreview(reportOverride=null){
 const r=reportOverride||collect(); if(!r){alert("No hay un informe activo.");return} if(!reportOverride) saveCurrent();
 const checks=(r.checks||[]).filter(Boolean); let last="",rows="";
 const group=x=>{const n=parseInt(String(x).split(".")[0],10);return n===1?"LIMPIEZA":n===2?"ASPECTOS MECÁNICOS":"ASPECTOS ELÉCTRICOS"};
 checks.forEach(x=>{const g=group(x.item);if(g!==last){rows+=`<tr class="check-group"><td colspan="4">${g}</td></tr>`;last=g}rows+=`<tr><td class="c-item">${esc(x.item)}</td><td class="c-act">${esc(x.text)}</td><td class="c-state">${esc(x.done)}</td><td class="c-obs">${esc(x.obs)}</td></tr>`});
 const m=r.measures||{}, p1=r.photo1?`<img src="${r.photo1}">`:`<div class="photo-empty">📷<br><span>Sin fotografía</span></div>`,p2=r.photo2?`<img src="${r.photo2}">`:`<div class="photo-empty">📷<br><span>Sin fotografía</span></div>`;
 $("#printContent").innerHTML=`<div class="print-sheet portrait-report">
 <div class="modern-head portrait-head"><div class="mh-logo"><img src="logo.jpeg"></div><div class="mh-title"><b>FORMATO TÉCNICO DE INSPECCIÓN<br>Y MANTENIMIENTO DE EQUIPOS</b><span>NODO INGENIERÍA ELÉCTRICA S.A.S.</span></div><div class="mh-meta"><div><span>Código:</span><b>FT-MP-TE-001</b></div><div><span>Versión:</span><b>01</b></div><div><span>Fecha:</span><b>${esc(r.fecha)}</b></div><div><span>Formulario:</span><b class="form-number">${pad(r.number)}</b></div></div></div>
 <section class="rbox general-full"><h2><i>1</i> INFORMACIÓN GENERAL DEL SERVICIO</h2><div class="general-grid"><div><b>Cliente:</b><span>${esc(r.cliente)}</span></div><div><b>Ubicación del equipo:</b><span>${esc(r.ubicacion)}</span></div><div><b>Descripción del equipo:</b><span>${esc(r.descripcion)}</span></div><div><b>Fecha:</b><span>${esc(r.fecha)}</span></div><div><b>Hora inicio:</b><span>${esc(r.horaInicio)}</span></div><div><b>Hora final:</b><span>${esc(r.horaFinal)}</span></div></div></section>
 <div class="portrait-columns"><div class="portrait-left"><section class="rbox"><h2><i>2</i> INSPECCIÓN Y MANTENIMIENTO</h2><table class="modern-table portrait-check"><colgroup><col class="col-item"><col class="col-act"><col class="col-state"><col class="col-obs"></colgroup><thead><tr><th>ÍTEM</th><th>ACTIVIDAD / VERIFICACIÓN</th><th>ESTADO</th><th>OBSERVACIÓN</th></tr></thead><tbody>${rows}</tbody></table></section></div>
 <div class="portrait-right"><section class="rbox measurements-box"><h2><i>3</i> MEDICIONES ELÉCTRICAS Y TÉRMICAS</h2>
 <div class="measure-stack">
  <table class="measure-card"><thead><tr><th colspan="2">TENSIÓN DE LÍNEA</th></tr></thead><tbody>
   <tr><td>L1-L2 (V)</td><td>${esc(m.l12)}</td></tr><tr><td>L1-L3 (V)</td><td>${esc(m.l13)}</td></tr><tr><td>L2-L3 (V)</td><td>${esc(m.l23)}</td></tr>
  </tbody></table>
  <table class="measure-card"><thead><tr><th colspan="2">TENSIÓN DE FASE</th></tr></thead><tbody>
   <tr><td>L1-N (V)</td><td>${esc(m.l1n)}</td></tr><tr><td>L2-N (V)</td><td>${esc(m.l2n)}</td></tr><tr><td>L3-N (V)</td><td>${esc(m.l3n)}</td></tr>
  </tbody></table>
  <table class="measure-card"><thead><tr><th colspan="2">CORRIENTE</th></tr></thead><tbody>
   <tr><td>L1 (A)</td><td>${esc(m.a1)}</td></tr><tr><td>L2 (A)</td><td>${esc(m.a2)}</td></tr><tr><td>L3 (A)</td><td>${esc(m.a3)}</td></tr>
  </tbody></table>
  <table class="measure-card"><thead><tr><th colspan="2">TEMPERATURA</th></tr></thead><tbody>
   <tr><td>L1 (°C)</td><td>${esc(m.t1)}</td></tr><tr><td>L2 (°C)</td><td>${esc(m.t2)}</td></tr><tr><td>L3 (°C)</td><td>${esc(m.t3)}</td></tr>
  </tbody></table>
 </div></section>
 <section class="rbox portrait-photos"><h2><i>4</i> REGISTRO FOTOGRÁFICO</h2><div class="modern-photo-grid"><div class="modern-photo">${p1}<b>Fotografía 1</b></div><div class="modern-photo">${p2}<b>Fotografía 2</b></div></div></section></div></div>
 <section class="rbox findings-wide"><h2><i>5</i> HALLAZGOS / ANOMALÍAS Y RECOMENDACIONES</h2><div class="findings-grid"><div class="text-block"><b>Hallazgos / anomalías identificadas</b><p>${esc(r.hallazgos)}</p></div><div class="text-block"><b>Recomendaciones técnicas</b><p>${esc(r.recomendaciones)}</p></div></div></section>
 <section class="rbox portrait-signatures"><h2><i>6</i> CIERRE Y FIRMAS</h2><div class="modern-signatures two-signatures"><div><b>Técnico NODO / Ejecutado por</b><span>Nombre: ${esc(r.ejecuta)}</span><span>Cargo: ${esc(r.cargoEjecuta)}</span><img src="${safeSignature(r.sigEjecuta)}"></div><div><b>Representante del cliente / Recibido por</b><span>Nombre: ${esc(r.recibe)}</span><span>Cargo: ${esc(r.cargoRecibe)}</span><img src="${safeSignature(r.sigRecibe)}"></div></div></section>
 <div class="report-footer">Documento propiedad de NODO Ingeniería Eléctrica S.A.S. · FT-MP-TE-001 · Versión 01 · Formulario ${pad(r.number)}</div></div>`; show("printView");
}
async function exportHistoryPDF(){
  const all=reports().sort((a,b)=>a.number-b.number);
  if(!all.length){alert("No hay informes guardados para exportar.");return}

  const originalCurrent=current;
  const originalHTML=$("#printContent").innerHTML;
  const pages=[];

  for(const r of all){
    buildPreview(r);
    pages.push($("#printContent").innerHTML);
  }

  $("#printContent").innerHTML=`<div class="history-pdf-batch">${pages.join("")}</div>`;
  show("printView");
  await waitPreviewImages();

  const oldTitle=document.title;
  const d=new Date();
  const dateName=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  document.title=`Historial_NODO_${dateName}`;

  setTimeout(()=>{
    window.print();
    setTimeout(()=>{
      document.title=oldTitle;
      current=originalCurrent;
    },1500);
  },300);
}

function clearHistory(){
  const all=reports();
  if(!all.length){alert("El historial ya está vacío.");return}
  if(confirm(`¿Está seguro de eliminar todo el historial (${all.length} informe${all.length===1?"":"s"})?\n\nEsta acción no se puede deshacer.`)){
    saveReports([]);
    current=null;
    renderHistory();
    toast("Historial eliminado.");
  }
}

async function printPDF(){
  if(!$("#printContent").innerHTML.trim()){alert("Primero genere la vista previa.");return}
  await waitPreviewImages();
  if(current){
    current.status="Finalizado";
    const all=reports(),i=all.findIndex(x=>x.id===current.id);
    if(i>=0)all[i]=current; else all.push(current);
    saveReports(all);
  }
  const oldTitle=document.title;
  const reportNumber=current && current.number!=null ? pad(current.number) : "NODO_Informe";
  document.title=reportNumber;
  setTimeout(()=>{
    window.print();
    setTimeout(()=>{document.title=oldTitle;},1500);
  },250);
}
function backup(){const data={version:1,exported:new Date().toISOString(),settings:settings(),reports:reports()};const b=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`NODO_respaldo_${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
$("#fileBackup").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const d=JSON.parse(await f.text());if(!Array.isArray(d.reports))throw 0;if(confirm("¿Importar el respaldo? Esto reemplazará los informes locales actuales.")){saveReports(d.reports);if(d.settings)saveSettings(d.settings);initHome();toast("Respaldo importado")}}catch{alert("El archivo de respaldo no es válido.")}e.target.value=""};
$("#historyList").addEventListener("click",e=>{
  const open=e.target.closest(".open-report");
  if(open){loadReport(open.dataset.id);return}
  const del=e.target.closest(".delete-report");
  if(del){deleteReport(del.dataset.id);return}
});
$("#btnNuevo").onclick=newReport;$("#btnGuardar").onclick=saveCurrent;$("#btnPDF").onclick=buildPreview;$("#btnCerrar").onclick=()=>{saveCurrent();show("home")};$("#btnHistorial").onclick=()=>{renderHistory();show("history")};$("#btnHistoryBack").onclick=()=>show("home");$("#btnExportHistoryPDF").onclick=exportHistoryPDF;$("#btnClearHistory").onclick=clearHistory;$("#btnHome").onclick=()=>show("home");$("#btnBackup").onclick=backup;
$("#photo1Input").onchange=e=>{handlePhoto(1,e.target.files[0]);e.target.value=""};
$("#photo2Input").onchange=e=>{handlePhoto(2,e.target.files[0]);e.target.value=""};
$$("[data-remove-photo]").forEach(b=>b.onclick=()=>{
  const n=b.dataset.removePhoto;if(current)current["photo"+n]="";setPhotoPreview(n,"");
});
$("#btnPrintPDF").onclick=printPDF;
$("#btnBackEditor").onclick=()=>show("editor");
$$("[data-clear]").forEach(b=>b.onclick=()=>clearCanvas($("#"+b.dataset.clear)));
buildChecklist();setupSig($("#sigEjecuta"));setupSig($("#sigRecibe"));initHome();
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{}));
