/* Torre de control TMS — front del tablero (TypeScript sobre el DOM, sin librerías de UI ni de gráficos).
   Orden: estado y filtros · KPIs · serie de costo · distribución del costo · treemap · operación y alertas (OPS_RULES)
   · contratos / proveedores · descargas Excel · CashportAI Insights · tema (Claro / Oscuro / Sistema = Halliburton).

   Es el código del prototipo aprobado (torre-control-tms-front/src/main.js) con estos cambios para el TMS:
   - montarTorre(datos, opciones) recibe las estructuras que arma adaptarDatos.ts desde GET /control-tower
     (antes mock.js) y devuelve {setTema, desmontar} (desmontar quita los listeners globales).
   - El corte (NOW_T), los contratos, el desempeño (PKX) y los comentarios vienen de la API.
   - Las descargas se guardan con Blob + <a download>; el tema llega del menú del avatar y se aplica a los contenedores .torre.
   - Medidas en px CSS del TMS (zoom global): coordenadas de tooltips y popovers divididas por el zoom.
   - Se quitó el menú de usuario del prototipo: lo da el header del TMS. */
export function montarTorre(__D: any, opciones?: TorreOpciones){
var __doc=window.document, __win=window, __ac=new AbortController();
function __opt(o: any){return Object.assign(typeof o==='object'&&o?o:{capture:!!o},{signal:__ac.signal});}
// document y addEventListener locales: los listeners globales se registran con la señal para poder desmontar
var document: TorreDoc={getElementById:function(i: any){return __doc.getElementById(i);},querySelectorAll:function(s: any){return __doc.querySelectorAll(s);},
  body:__doc.body,documentElement:__doc.documentElement,addEventListener:function(t: any,f: any,o: any){__doc.addEventListener(t,f,__opt(o));}};
function addEventListener(t: any,f: any,o?: any){__win.addEventListener(t,f,__opt(o));}
// zoom global del TMS (DESIGN.md §0): las coordenadas del mouse y de getBoundingClientRect se dividen por él
function appZoom(){return parseFloat(getComputedStyle(__doc.documentElement).getPropertyValue('zoom'))||1;}
var MONTHS=__D.MONTHS, CUR=__D.CUR, ELAPSED=__D.ELAPSED, DAYS_CUR=__D.DAYS_CUR, VPS=__D.VPS, PSLS=__D.PSLS, TYPES=__D.TYPES, CARRIERS=__D.CARRIERS, USERS=__D.USERS, TRIPS=__D.TRIPS, TRS=__D.TRS, OPEN=__D.OPEN, VEH=__D.VEH, LOCS=__D.LOCS, NOW_T=__D.NOW_T, OPS=__D.OPS, STBY_FREE=__D.STBY_FREE, STBY_RATE=__D.STBY_RATE;
var MES_PREV=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][MONTHS[CUR-1].m];
/* ================= estado ================= */
var STATES=[
 {id:'sinp',name:'Sin procesar',c:'var(--st-sinp)'},{id:'asig',name:'En asignación',c:'var(--st-asig)'},
 {id:'curso',name:'En curso',c:'var(--st-curso)'},{id:'leg',name:'Por legalizar',c:'var(--st-leg)'},
 {id:'porac',name:'Por aceptar',c:'var(--st-acep1)'},{id:'acep',name:'Aceptado',c:'var(--st-acep2)'},
 {id:'pre',name:'Preautorizado',c:'var(--st-pre)'},{id:'fact',name:'Facturado',c:'var(--st-fact)'}];
var FILTER_CATS=[
 {id:'vp',name:'Vicepresidencia',opts:VPS},{id:'psl',name:'PSL',opts:PSLS},
 {id:'type',name:'Tipo de servicio',opts:TYPES.map(function(t: any){return t.id;}),label:function(v: any){return TYPES.filter(function(t: any){return t.id===v;})[0].name;}},
 {id:'prov',name:'Proveedor',opts:CARRIERS.map(function(c: any){return c.n;})},
 {id:'user',name:'Usuario',opts:USERS.map(function(u: any){return String(u.id);}),label:function(v: any){return USERS[+v].name;}},
 {id:'veh',name:'Tipo de vehículo',opts:Object.keys(VEH).reduce(function(a,k){VEH[k].forEach(function(v: any){if(a.indexOf(v)<0)a.push(v);});return a;},[] as any[])},
 {id:'mod',name:'Modalidad',opts:['contrato','subasta','tercerizacion'],label:function(v: any){return ({contrato:'Tarifa de contrato',subasta:'Subasta',tercerizacion:'Tercerización'} as any)[v];}},
 {id:'orig',name:'Origen',opts:Object.keys(LOCS).reduce(function(a,k){return a.concat(LOCS[k]);},[])},
 {id:'dest',name:'Destino',opts:Object.keys(LOCS).reduce(function(a,k){return a.concat(LOCS[k]);},[])}];
var S: any={f:{vp:[],psl:[],type:[],prov:[],user:[],veh:[],mod:[],orig:[],dest:[]},q:'',proj:false,mode:'m',sort:{k:'cost',d:-1},alerted:{},hideStates:{}};

/* ================= formato ================= */
function money(v: any){return '$'+Math.round(v).toLocaleString('es-CO');}
function moneyS(v: any){var a=Math.abs(v);
  if(a>=1e9)return '$'+(v/1e9).toLocaleString('es-CO',{minimumFractionDigits:2,maximumFractionDigits:2})+' MM';
  if(a>=1e6)return '$'+(v/1e6).toLocaleString('es-CO',{maximumFractionDigits:a>=1e8?0:1})+' M';
  return '$'+Math.round(v/1000).toLocaleString('es-CO')+' mil';}
function moneyParts(v: any){var s=moneyS(v),i=s.lastIndexOf(' ');return s.slice(0,i)+'<small>'+s.slice(i+1)+'</small>';}
function int(v: any){return Math.round(v).toLocaleString('es-CO');}
function pct(v: any,d?: any){return (v*100).toLocaleString('es-CO',{maximumFractionDigits:d===undefined?0:d})+'%';}
function signPct(v: any){return (v>=0?'+':'−')+pct(Math.abs(v));}
function esc(s: any){return String(s).replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as any)[c];});}
function ddmmyyyy(d: any){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear();}
var NOW: any=new Date(NOW_T.getFullYear(),NOW_T.getMonth(),NOW_T.getDate());

/* ================= cálculo ================= */
function inF(rec: any,useProv: any){
  var f: any=S.f;
  if(f.vp.length&&f.vp.indexOf(rec.vp)<0)return false;
  if(f.psl.length&&f.psl.indexOf(rec.psl)<0)return false;
  if(f.type.length&&f.type.indexOf(rec.type)<0)return false;
  if(f.prov.length){ if(!useProv)return false; if(f.prov.indexOf(rec.prov)<0)return false; }
  var ex=['user','veh','mod','orig','dest'];
  for(var i=0;i<ex.length;i++){var k=ex[i];if(f[k].length){if(rec[k]===undefined)return false;if(f[k].indexOf(String(rec[k]))<0)return false;}}
  return true;
}
function sum(a: any,k: any){var s=0;for(var i=0;i<a.length;i++)s+=a[i][k];return s;}
function compute(){
  var T=TRIPS.filter(function(t: any){return inF(t,true);});
  var byM: any=[];for(var m=0;m<12;m++)byM.push({cost:0,base:0,ext:0,km:0,n:0,sobNo:0,sob:0,stb:0});
  T.forEach(function(t: any){var b=byM[t.m];b.cost+=t.cost;b.base+=t.base;b.ext+=t.sob+t.stb;b.km+=t.km;b.n++;b.sobNo+=t.sobNo;b.sob+=t.sob;b.stb+=t.stb;});
  var oct=T.filter(function(t: any){return t.m===CUR;});
  var byD: any=[];for(var d=1;d<=DAYS_CUR;d++)byD.push({cost:0,base:0,ext:0,km:0,n:0});
  oct.forEach(function(t: any){var b=byD[t.day-1];b.cost+=t.cost;b.base+=t.base;b.ext+=t.sob+t.stb;b.km+=t.km;b.n++;});
  var sepCut=T.filter(function(t: any){return t.m===CUR-1&&t.day<=ELAPSED;});
  // TRs por estado (las TR del mes + abiertas)
  var trMap: any={};T.forEach(function(t: any){trMap[t.tr]=true;});
  var trsF=TRS.filter(function(tr: any){return trMap[tr.id];});
  var trVal: any={};T.forEach(function(t: any){trVal[t.tr]=(trVal[t.tr]||0)+t.cost;});
  var openF=S.f.prov.length?[]:OPEN.filter(function(o: any){return inF(o,false);});
  var st: any={};STATES.forEach(function(s){st[s.id]=0;});
  var stOld=0;trsF.forEach(function(tr: any){ if(tr.status==='fact')return; st[tr.status]++; if(tr.m<CUR)stOld++; });
  openF.forEach(function(o: any){st[o.status]++;});
  var leg=0,legN=0,legOld=99,fac=0,stVal: any={leg:0,porac:0,acep:0,pre:0};
  trsF.forEach(function(tr: any){var v=trVal[tr.id]||0; if(stVal[tr.status]!==undefined)stVal[tr.status]+=v;
    if(tr.status==='leg'){leg+=v;legN++;legOld=Math.min(legOld,tr.day);}
    if(tr.status==='porac'||tr.status==='acep'||tr.status==='pre')fac+=v;});
  var sinp=openF.filter(function(o: any){return o.status==='sinp';});
  // usuarios
  var U: any={};
  T.forEach(function(t: any){ if(t.m<CUR-3)return; var u=U[t.user]||(U[t.user]={id:t.user,cost:0,n:0,ext:0,prev:0,km:0,trs:{}});
    if(t.m===CUR){u.cost+=t.cost;u.n++;u.ext+=t.sob+t.stb;u.km+=t.km;u.trs[t.tr]=1;} else u.prev+=t.cost; });
  var users=Object.keys(U).map(function(k){var u=U[k],usr=USERS[u.id];
    u.name=usr.name;u.psl=usr.psl;u.vp=usr.vp;u.cc=usr.cc;
    u.avg=u.prev/3;u.proj=u.cost*DAYS_CUR/ELAPSED;u.cps=u.n?u.cost/u.n:0;u.sobSh=u.cost?u.ext/u.cost:0;
    u.delta=u.avg?u.proj/u.avg-1:null;u.ntr=Object.keys(u.trs).length;
    if(u.avg===0&&u.proj>0){u.lvl=u.proj>20e6?'new':'ok';}
    else if(u.proj>=u.avg*1.35&&u.proj-u.avg>=15e6)u.lvl='crit';
    else if(u.proj>=u.avg*1.2||u.sobSh>=.25)u.lvl='warn';
    else u.lvl='ok';
    return u;}).filter(function(u){return u.cost>0;});
  // vicepresidencias
  var vps=VPS.map(function(v: any){var a=oct.filter(function(t: any){return t.vp===v;});var p=T.filter(function(t: any){return t.vp===v&&t.m>=CUR-3&&t.m<CUR;});
    var c=sum(a,'cost'),k=sum(a,'km'),pc=sum(p,'cost'),pk=sum(p,'km');
    return{v:v,cost:c,km:k,cpk:k?c/k:0,proj:c*DAYS_CUR/ELAPSED,avg:pc/3,cpkPrev:pk?pc/pk:0};}).filter(function(x: any){return x.cost>0;});
  // proveedores
  var prov: any={};oct.forEach(function(t: any){var p=prov[t.prov]||(prov[t.prov]={n:t.prov,cost:0,km:0,out:0,cnt:0,ext:0,app:0});p.cost+=t.cost;p.km+=t.km;p.cnt++;p.ext+=t.sob+t.stb;if(t.appEv>0)p.app++;if(t.mod!=='contrato')p.out+=t.cost;});
  var provs=Object.keys(prov).map(function(k){return prov[k];}).sort(function(a,b){return b.cost-a.cost;});
  var mods: any={contrato:0,subasta:0,tercerizacion:0};oct.forEach(function(t: any){mods[t.mod]+=t.cost;});
  var cg=oct.filter(function(t: any){return t.type===__D.CARGA;});
  var cIn=cg.filter(function(t: any){return t.mod==='contrato';}),cOut=cg.filter(function(t: any){return t.mod!=='contrato';});
  var cpkIn=sum(cIn,'cost')/Math.max(1,sum(cIn,'km')),cpkOut=sum(cOut,'cost')/Math.max(1,sum(cOut,'km'));
  // tipos
  var types=TYPES.map(function(ty: any){var a=oct.filter(function(t: any){return t.type===ty.id;});var c=sum(a,'cost'),k=sum(a,'km');return{t:ty,cost:c,km:k,n:a.length,cpk:k?c/k:0};});
  return{stVal:stVal,stOld:stOld,T:T,byM:byM,byD:byD,oct:oct,sepCut:sepCut,st:st,leg:leg,legN:legN,legOld:legOld,fac:fac,sinp:sinp,users:users,vps:vps,provs:provs,mods:mods,cpkIn:cpkIn,cpkOut:cpkOut,types:types};
}
/* contratos: siempre sobre el total (no dependen del filtro) */
// contratos activos del proyecto (vw de cupos): {c, oa, total, used, pu, start, end}
var CONTRACTS=__D.CONTRACTS;

/* ================= render ================= */
var D: any;
function render(){D=compute();renderKpis();renderChart();renderCompo();renderUsers();renderContracts();renderCarriers();renderVps();renderSankey();renderOps();renderChips();}
function chipPct(v: any,inverse: any){ if(v===null||!isFinite(v))return '<span class="pct">—</span>';
  var cls= inverse ? (v>0.1?'risk':v>0.02?'warn':v<-0.02?'pos':'') : (v>0?'pos':'');
  return '<span class="pct '+cls+'">'+signPct(v)+'</span>';}

function renderKpis(){
  var b=D.byM[CUR], cost=b.cost, proj=cost*DAYS_CUR/ELAPSED;
  var sepCut=sum(D.sepCut,'cost'), sepFull=D.byM[CUR-1].cost;
  var showCost=S.proj?proj:cost;
  var dvs=S.proj?(proj/sepFull-1):(cost/sepCut-1);
  var baseSh=b.cost?b.base/b.cost:0;
  var over=D.sinp.filter(function(o: any){return o.age>60;}).length;
  var srv=b.n, srvShow=S.proj?Math.round(srv*DAYS_CUR/ELAPSED):srv, sepN=D.sepCut.length;
  var tySeg=D.types.map(function(t: any){return '<i title="'+t.t.name+': '+int(t.n)+'" style="width:'+(srv?t.n/srv*100:0)+'%;background:'+t.t.color+'"></i>';}).join('');
  var legTot=D.leg+D.fac;
  var OS=STATES.filter(function(s){return s.id!=='fact';});
  var stTot=0;OS.forEach(function(s){if(!S.hideStates[s.id])stTot+=D.st[s.id];});
  var allTot=0;OS.forEach(function(s){allTot+=D.st[s.id];});
  var h='';
  h+='<div class="card kpi"><div class="k-top"><span class="k-label">Costo del mes</span><span class="k-cmp" title="Frente a '+MES_PREV+' al mismo corte (día '+ELAPSED+')"><span class="t">vs '+MES_PREV.slice(0,3)+'</span>'+chipPct(dvs,true)+'</span></div>'+
     '<div class="k-main"><div class="k-value full">'+money(showCost)+'</div></div>'+
     '<div class="k-hz" data-kb="cost"><div class="k-bar"><i style="width:'+(b.cost?b.base/b.cost*100:0)+'%;background:var(--navy)"></i><i style="width:'+(b.cost?b.sob/b.cost*100:0)+'%;background:var(--orange)"></i><i style="flex:1;background:var(--amber)"></i></div>'+
     '<div class="k-foot">Base '+pct(baseSh)+' · extras '+pct(1-baseSh)+'</div></div></div>';
  h+='<div class="card kpi"><div class="k-top"><span class="k-label">Servicios</span><span class="k-cmp" title="Frente a '+MES_PREV+' al mismo corte (día '+ELAPSED+')"><span class="t">vs '+MES_PREV.slice(0,3)+'</span>'+chipPct(srv/Math.max(1,sepN)-1,false)+'</span></div>'+
     '<div class="k-main"><div class="k-value full">'+int(srvShow)+'</div></div>'+
     '<div class="k-hz" data-kb="srv"><div class="k-bar">'+tySeg+'</div>'+
     '<div class="k-foot">'+D.types.filter(function(t: any){return t.n;}).map(function(t: any){return t.t.name.split(' ')[0].slice(0,5)+' '+int(t.n);}).join(' · ')+'</div></div></div>';
  h+='<div class="card kpi"><div class="k-top"><span class="k-label">TRs sin procesar</span><span class="k-cmp" title="TRs que llevan más de 1 hora sin respuesta"><span class="t">+1 h</span><span class="pct '+(over?'plo':'')+'">'+int(over)+'</span></span></div>'+
     '<div class="k-main"><div class="k-value full">'+int(D.sinp.length)+'</div></div>'+
     '<div class="k-hz" data-kb="sinp"><div class="k-bar"><i style="width:'+(D.sinp.length?over/D.sinp.length*100:0)+'%;background:var(--pl-orange)"></i></div>'+
     '<div class="k-foot">'+(D.sinp.length?'La más antigua espera '+fmtAge(Math.max.apply(null,D.sinp.map(function(o: any){return o.age;}))):'Nadie esperando respuesta')+'</div></div></div>';
  h+='<div class="card kpi"><div class="k-top"><span class="k-label">Pendiente legalizar</span><span class="k-cmp"><span class="t">'+int(D.legN)+' TRs</span></span></div>'+
     '<div class="k-main"><div class="k-value full">'+money(D.leg)+'</div></div>'+
     '<div class="k-hz" data-kb="prov"><div class="k-bar">'+['leg','porac','acep','pre'].map(function(k){var st=STATES.filter(function(x){return x.id===k;})[0];return '<i style="width:'+(legTot?D.stVal[k]/legTot*100:0)+'%;background:'+st.c+'"></i>';}).join('')+'</div>'+
     '<div class="k-foot" title="Valor pendiente de legalizar sobre el costo total del mes"><b style="color:var(--ink);font-weight:600">'+pct(b.cost?D.leg/b.cost:0)+'</b> del costo del mes</div></div></div>';
  h+='<div class="card kpi k-states"><div class="k-top"><span class="k-label">TRs abiertas por estado</span><span class="k-cmp"><span class="t">de meses anteriores</span><span class="pct">'+int(D.stOld)+'</span></span></div>'+
     '<div class="k-main"><div class="k-value full">'+int(allTot)+'<small>TRs</small></div></div>'+
     '<div class="stbar">'+OS.map(function(s){var v=S.hideStates[s.id]?0:D.st[s.id];return v?'<i data-st="'+s.id+'" style="width:'+(v/Math.max(1,stTot)*100)+'%;background:'+s.c+'"></i>':'';}).join('')+'</div>'+
     '<div class="st-legend">'+OS.map(function(s){return '<button data-tog="'+s.id+'" class="'+(S.hideStates[s.id]?'dim':'')+'" title="Mostrar u ocultar '+s.name+'"><i class="sw" style="background:'+s.c+'"></i><span>'+s.name+'</span><b>'+int(D.st[s.id])+'</b></button>';}).join('')+'</div></div>';
  document.getElementById('kpis').innerHTML=h;
}
function fmtAge(min: any){return min<60?min+' min':min<2880?Math.floor(min/60)+' h '+String(min%60).padStart(2,'0')+' min':int(min/1440)+' días';}

/* ---- insight IA: qué empuja el costo hacia arriba y qué no lo deja bajar ----
   En producción lo redacta el modelo sobre estas mismas cifras; aquí se arma con reglas para el prototipo. */
function aiInsight(){
  var T=D.T, cur=T.filter(function(t: any){return t.m===CUR;}), prev=T.filter(function(t: any){return t.m>=CUR-3&&t.m<CUR;});
  var k=DAYS_CUR/ELAPSED;
  var cC=sum(cur,'cost')*k, cP=sum(prev,'cost')/3, cK=sum(cur,'km')*k, pK=sum(prev,'km')/3;
  var cpk=cK?cC/cK:0, cpkP=pK?cP/pK:0, dT=cP?cC/cP-1:0, dK=cpkP?cpk/cpkP-1:0;
  // aportes al aumento por dimensión
  function contrib(key: any,lab?: any){var g: any={};cur.forEach(function(t: any){var o=g[t[key]]||(g[t[key]]={k:t[key],c:0,p:0});o.c+=t.cost*k;});
    prev.forEach(function(t: any){var o=g[t[key]]||(g[t[key]]={k:t[key],c:0,p:0});o.p+=t.cost/3;});
    return Object.keys(g).map(function(x){var o=g[x];o.d=o.c-o.p;o.l=lab?lab(o.k):o.k;return o;}).sort(function(a,b){return b.d-a.d;});}
  var us=contrib('user',function(id: any){return USERS[id].name;}), vp=contrib('vp');
  var up=us.filter(function(o){return o.d>0;}).slice(0,2);
  var upSum=up.reduce(function(a,o){return a+o.d;},0), tot=cC-cP;
  // lo que no deja bajar
  var exC=(sum(cur,'sob')+sum(cur,'stb'))/Math.max(1,sum(cur,'cost')), exP=(sum(prev,'sob')+sum(prev,'stb'))/Math.max(1,sum(prev,'cost'));
  var cg=cur.filter(function(t: any){return t.type===__D.CARGA;}), out=cg.filter(function(t: any){return t.mod!=='contrato';}), inn=cg.filter(function(t: any){return t.mod==='contrato';});
  var outSh=sum(out,'cost')/Math.max(1,sum(cg,'cost')), prem=(sum(out,'cost')/Math.max(1,sum(out,'km')))/(sum(inn,'cost')/Math.max(1,sum(inn,'km')))-1;
  var outExtra=sum(out,'cost')*k*(prem/(1+prem));
  var b=[];
  b.push('El mes cerraría en <b>'+moneyS(cC)+'</b>, '+(dT>=0?'<b class="up">'+signPct(dT)+'</b>':'<b class="down">'+signPct(dT)+'</b>')+' frente al promedio de los últimos 3 meses; el costo por km va '+(dK>=0?'<b class="up">'+signPct(dK)+'</b>':'<b class="down">'+signPct(dK)+'</b>')+' ('+money(cpk)+').');
  if(up.length&&tot>0) b.push('<span class="tag up">Sube</span> '+up.map(function(o){return '<b>'+esc(o.l)+'</b> (+'+moneyS(o.d)+')';}).join(' y ')+' explican '+pct(Math.min(1,upSum/tot))+' del aumento proyectado. Vale la pena revisar sus solicitudes con su líder de PSL.');
  else if(up.length) b.push('<span class="tag up">Sube</span> Aunque el total baja, <b>'+esc(up[0].l)+'</b> proyecta +'+moneyS(up[0].d)+' sobre su promedio.');
  var nb=[];
  if(outSh>0.15&&prem>0.05) nb.push('el '+pct(outSh)+' de la carga se adjudicó fuera de contrato a '+signPct(prem)+' por km: unos <b>'+moneyS(outExtra)+'</b> que con tarifa de contrato no se pagarían');
  if(exC>exP+0.003) nb.push('sobrecostos y standby pasan de '+pct(exP,1)+' a <b>'+pct(exC,1)+'</b> del costo');
  else if(exC>0.06) nb.push('sobrecostos y standby se mantienen en '+pct(exC,1)+' del costo');
  if(nb.length) b.push('<span class="tag hold">No deja bajar</span> '+nb.join('; ').replace(/^./,function(c){return c.toUpperCase();})+'.');
  return '<div class="ai-head"><span class="ai-chip"><svg viewBox="0 0 24 24"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/></svg>Insight IA</span><span class="ai-note">Proyección al cierre vs promedio de los 3 meses anteriores'+(fCount()?' · con filtros':'')+'</span></div><ul>'+b.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
}

/* ---- serie combinada: periodos ---- */
var MSL=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function tDate(t: any){var M=MONTHS[t.m];return new Date(M.y,M.m,t.day);}
var TODAY: any=NOW;
function dd(d: any){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0');}
function agg(f: any){var r: any={base:0,ext:0,cost:0,km:0,n:0,nt:{}};D.T.forEach(function(t: any){if(f(t)){r.base+=t.base;r.ext+=t.sob+t.stb;r.cost+=t.cost;r.km+=t.km;r.n++;r.nt[t.type]=(r.nt[t.type]||0)+1;}});return r;}
function buildRows(mode: any){
  var out: any=[];
  function push(l: any,tt: any,f: any,cur: any,totDays: any,elDays: any,future?: any){var a=agg(f);a.l=l;a.tt=tt;a.f=f;a.cur=!!cur;
    a.proj= cur&&elDays? a.cost*totDays/elDays : (future?D.byM[CUR].cost/ELAPSED:null); out.push(a);}
  if(mode==='d'){for(var d=1;d<=DAYS_CUR;d++)(function(d){push(String(d),String(d).padStart(2,'0')+'/'+String(MONTHS[CUR].m+1).padStart(2,'0')+'/'+MONTHS[CUR].y,function(t: any){return t.m===CUR&&t.day===d;},false,0,0,d>ELAPSED);})(d);}
  if(mode==='m'||mode==='m6'){for(var m=(mode==='m'?0:6);m<12;m++)(function(m){var M=MONTHS[m];
    push(M.label,MSL[M.m].replace(/^\w/,function(c){return c.toUpperCase();})+' '+M.y+(m===CUR?' · al '+dd(TODAY):''),function(t: any){return t.m===m;},m===CUR,DAYS_CUR,ELAPSED);})(m);}
  if(mode==='w'){var mon=new Date(TODAY);mon.setDate(mon.getDate()-((mon.getDay()+6)%7));
    for(var k=11;k>=0;k--)(function(k){var a: any=new Date(mon);a.setDate(a.getDate()-7*k);var b=new Date(a);b.setDate(b.getDate()+7);var e=new Date(b);e.setDate(e.getDate()-1);
      var cur=k===0, el=Math.round((TODAY-a)/864e5)+1;
      push(dd(a),'Semana del '+dd(a)+' al '+dd(e)+(cur?' · en curso':''),function(t: any){var x=tDate(t);return x>=a&&x<b;},cur,7,el);})(k);}
  if(mode==='q'){var qs: any={};MONTHS.forEach(function(M: any,i: any){var q=Math.floor(M.m/3)+1,key=M.y+'-'+q;(qs[key]||(qs[key]={y:M.y,q:q,ms:[]})).ms.push(i);});
    Object.keys(qs).forEach(function(key){var Q=qs[key], cur=Q.ms.indexOf(CUR)>=0, full=Q.ms.length===3||cur;
      var qStart: any=new Date(Q.y,(Q.q-1)*3,1), qEnd: any=new Date(Q.y,Q.q*3,0), tot=Math.round((qEnd-qStart)/864e5)+1, el=Math.round((TODAY-qStart)/864e5)+1;
      push('T'+Q.q+' '+String(Q.y).slice(2),'Trimestre '+Q.q+' de '+Q.y+(cur?' · al '+dd(TODAY):(!full?' · desde '+MSL[MONTHS[0].m]:'')),function(t: any){return Q.ms.indexOf(t.m)>=0;},cur,tot,el);});}
  return out;
}

/* ---- serie combinada ---- */
function nice(max: any){if(max<=0)return 1;var p=Math.pow(10,Math.floor(Math.log10(max))),f=max/p,st=[1,1.2,1.5,2,2.5,3,4,5,6,8,10];for(var i=0;i<st.length;i++)if(f<=st[i])return st[i]*p;return 10*p;}
var LINE_TY=['var(--lt1)','var(--lt2)','var(--lt3)','var(--lt4)'];
function renderChart(){
  var el=document.getElementById('chart'), W=Math.max(280,el.clientWidth), H=493;
  var rows=buildRows(S.mode), isM=rows.length<=13;
  var ml=64,mr=72,mt=27,mb=32,pw=W-ml-mr,ph=H-mt-mb;
  var maxC=nice(Math.max.apply(null,rows.map(function(r: any){return Math.max(r.cost,r.proj||0);}))*1.06);
  // línea comparada: costo por km (default), servicios por tipología o km recorridos
  var LM=S.line||'cpk', SER;
  if(LM==='n')SER=TYPES.map(function(ty: any,k: any){return{name:ty.name,c:LINE_TY[k%LINE_TY.length],v:rows.map(function(r: any){return r.cost>0||r.n?(r.nt[ty.id]||0):null;})};});
  else if(LM==='km')SER=[{name:'Km recorridos',c:'var(--kmline)',v:rows.map(function(r: any){return r.km>0?r.km:null;})}];
  else SER=[{name:'Costo por km',c:'var(--kmline)',v:rows.map(function(r: any){return r.km>0?r.cost/r.km:null;})}];
  // servicios: series apiladas (cada tipología se suma sobre la anterior); las demás, área hasta la base del eje
  var acc=rows.map(function(){return 0;});
  SER.forEach(function(se: any){se.base=acc.slice();se.cv=se.v.map(function(v: any,i: any){if(v==null)return null;return LM==='n'?(acc[i]+=v):v;});});
  var allV: any=[];SER.forEach(function(se: any){se.cv.forEach(function(v: any){if(v!=null)allV.push(v);});});
  var cMin=allV.length?Math.min.apply(null,allV):0, cMax=allV.length?Math.max.apply(null,allV):1, yMin: any, yMax: any, span;
  if(LM==='cpk'){span=nice((cMax-cMin)*1.6||1000)/4;yMin=Math.max(0,Math.floor((cMin-span*.6)/span)*span);yMax=yMin+span*4;if(cMax>yMax){yMax=Math.ceil(cMax/span)*span+span;}}
  else{yMin=0;span=nice((cMax*1.12||4)/4);if(LM==='n')span=Math.max(1,Math.ceil(span));yMax=span*4;}
  var fmtK=function(v: any){return LM==='km'?(v>=1e4?Math.round(v/1e3).toLocaleString('es-CO')+' mil':Math.round(v).toLocaleString('es-CO')):Math.round(v).toLocaleString('es-CO');};
  var _ct=document.getElementById('chartTitle');_ct.title=_ct.textContent='Costo de transporte vs '+(LM==='n'?'servicios':LM==='km'?'km recorridos':'costo por km');
  document.getElementById('chartLg').innerHTML='<span><i class="sw" style="background:var(--costbar)"></i>Tarifa base</span><span><i class="sw" style="background:var(--orange)"></i>Sobrecostos y standby</span>'+
    SER.map(function(se: any){return '<span><i class="ln" style="background:'+se.c+'"></i>'+se.name+'</span>';}).join('')+'<span><i class="ghost-sw"></i>Proyección</span>';
  document.getElementById('lineSeg').innerHTML=[['cpk','$/km'],['n','Servicios'],['km','Km']].map(function(m){return '<button data-line="'+m[0]+'" data-t="'+m[1]+'" aria-pressed="'+(LM===m[0])+'">'+m[1]+'</button>';}).join('');
  var n=rows.length, bw=pw/n, barW=Math.min(isM?40:19,bw*.62);
  function yC(v: any){return mt+ph-(v/maxC)*ph;} function yK(v: any){return mt+ph-((v-yMin)/(yMax-yMin))*ph;}
  var s='<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Costo de transporte por periodo y costo por kilómetro">';
  for(var g=0;g<=4;g++){var v=maxC*g/4,y=yC(v);s+='<line class="gridl" x1="'+ml+'" x2="'+(W-mr)+'" y1="'+y+'" y2="'+y+'"/>';
    s+='<text class="axis" x="'+(ml-6)+'" y="'+(y+3)+'" text-anchor="end">'+(v===0?'0':(v/1e6).toLocaleString('es-CO',{maximumFractionDigits:0})+' M')+'</text>';
    var kv=yMin+(yMax-yMin)*g/4;s+='<text class="axis" x="'+(W-mr+6)+'" y="'+(yK(kv)+3)+'">'+fmtK(kv)+'</text>';}
  s+='<text class="axis" x="'+(W-mr+6)+'" y="13" style="font-size:13px">'+(LM==='n'?'Servicios':LM==='km'?'Km':'$/km')+'</text>';
  s+='<text class="axis" x="'+(ml-6)+'" y="9" text-anchor="end" style="font-size:13px">$</text>';
  var pts: any=[];
  SER.forEach(function(se: any){var top: any=[],bot: any=[];se.cv.forEach(function(v: any,i: any){if(v==null)return;var cx=ml+bw*i+bw/2;top.push(cx.toFixed(1)+','+yK(v).toFixed(1));bot.unshift(cx.toFixed(1)+','+(LM==='n'?yK(se.base[i]):mt+ph).toFixed(1));});
    if(top.length>1)s+='<polygon points="'+top.concat(bot).join(' ')+'" fill="'+se.c+'" opacity="'+(LM==='n'?.14:.12)+'"/>';});
  rows.forEach(function(r: any,i: any){
    var cx=ml+bw*i+bw/2, x=cx-barW/2;
    if(r.proj&&r.proj>r.cost){var yp=yC(r.proj),yt=yC(r.cost);s+='<rect x="'+x+'" y="'+yp+'" width="'+barW+'" height="'+Math.max(0,yt-yp)+'" fill="none" stroke="var(--ink-4)" stroke-dasharray="3 2" stroke-width="1.2" rx="2"/>';}
    if(r.cost>0){var yb=yC(r.base);s+='<rect x="'+x+'" y="'+yb+'" width="'+barW+'" height="'+(mt+ph-yb)+'" fill="var(--costbar)"/>';
      var ye=yC(r.base+r.ext);s+='<rect x="'+x+'" y="'+ye+'" width="'+barW+'" height="'+Math.max(0,yb-ye)+'" fill="var(--orange)"/>';}
    var showL= isM || (i%3===0) || i===n-1;
    if(showL)s+='<text class="axis" x="'+cx+'" y="'+(H-7)+'" text-anchor="middle"'+(r.cur?' style="font-weight:600;fill:var(--ink)"':'')+'>'+r.l+'</text>';
    r._cx=cx; r._top=yC(r.cost);
  });
  SER.forEach(function(se: any,si: any){var P: any=[];se.cv.forEach(function(v: any,i: any){if(v!=null)P.push([rows[i]._cx,yK(v),i,se.v[i]]);});if(SER.length===1)pts=P;else if(si===SER.length-1)pts=P.map(function(p: any){return [p[0],p[1],p[2],se.cv[p[2]]];});
    if(!P.length)return;
    s+='<polyline points="'+P.map(function(p: any){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ')+'" fill="none" stroke="'+se.c+'" stroke-width="2" stroke-linejoin="round"/>';
    P.forEach(function(p: any,i: any){var last=i===P.length-1;s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(last?4:(SER.length>1?2:2.4))+'" fill="'+(last?se.c:'var(--surface)')+'" stroke="'+se.c+'" stroke-width="1.6"/>';});});
  // etiquetas de datos
  var lblY: any={};pts.forEach(function(p: any){lblY[p[2]]=p[1];});
  rows.forEach(function(r: any,i: any){ if(!(r.cost>0))return;
    var txt=isM?(r.cost/1e6).toLocaleString('es-CO',{maximumFractionDigits:0})+' M':Math.round(r.cost/1e6)+'';
    s+='<text class="dlbl" x="'+r._cx+'" y="'+(r._top-5)+'" text-anchor="middle">'+txt+'</text>';});
  if(isM)pts.forEach(function(p: any){var r=rows[p[2]], barL=r._top-9, ly=p[1]-8;
    if(Math.abs(ly-barL)<13||(ly<barL+4&&ly>barL-13))ly=p[1]+16;
    s+='<text class="dlbl k" x="'+p[0]+'" y="'+ly+'" text-anchor="middle">'+fmtK(p[3])+'</text>';});
  rows.forEach(function(r: any,i: any){s+='<rect data-i="'+i+'" x="'+(ml+bw*i)+'" y="'+mt+'" width="'+bw+'" height="'+ph+'" fill="transparent"/>';});
  s+='</svg>';
  el.innerHTML=s;
  el.querySelectorAll('rect[data-i]').forEach(function(rc: any){
    rc.addEventListener('mousemove',function(ev: any){var r=rows[+rc.dataset.i];
      var title=r.tt;
      var h='<div class="tt">'+title+'</div>';
      if(r.cost>0){h+=trow('var(--navy)','Tarifa base',money(r.base))+trow('var(--orange)','Sobrecostos y standby',money(r.ext))+trow('','Total',money(r.cost),true)+(LM==='n'?TYPES.map(function(ty: any,k: any){return trow(LINE_TY[k%LINE_TY.length],ty.name,int(r.nt[ty.id]||0)+' serv.');}).join('')+trow('','Servicios',int(r.n),true):LM==='km'?trow('var(--kmline)','Km recorridos',Math.round(r.km).toLocaleString('es-CO')+' km')+trow('','Costo por km',r.km?money(r.cost/r.km):'—'):trow('var(--kmline)','Costo por km',r.km?money(r.cost/r.km):'—'));}
      if(r.proj)h+=trow('','Proyección',money(r.proj));
      if(!r.cost&&!r.proj)h+='<div class="tr">Sin servicios</div>';
      if(r.cost>0)h+='<div class="tr" style="opacity:.7;margin-top:4px">Clic para ver el detalle</div>';
      showTip(h,ev);});
    rc.addEventListener('mouseleave',hideTip);
    rc.addEventListener('click',function(){var i=+rc.dataset.i;if(!(rows[i].cost>0))return;hideTip();openSeg(rows,i);});
    rc.style.cursor='pointer';
  });
}
function trow(c: any,l: any,v: any,b?: any){return '<div class="tr"'+(b?' style="font-weight:600;border-top:1px solid rgba(127,127,127,.35);margin-top:3px;padding-top:3px"':'')+'><span>'+(c?'<i class="sw" style="background:'+c+'"></i>':'')+l+'</span><span class="num">'+v+'</span></div>';}
var tipEl=document.getElementById('tip');
function showTip(h: any,ev: any){tipEl.innerHTML=h;tipEl.classList.add('on');var z=appZoom(),cx=ev.clientX/z,cy=ev.clientY/z,vw=innerWidth/z,w=tipEl.offsetWidth,hh=tipEl.offsetHeight,x=cx+14,y=cy-hh-10;if(x+w>vw-8)x=cx-w-14;if(y<8)y=cy+16;tipEl.style.left=x+'px';tipEl.style.top=y+'px';}
function hideTip(){tipEl.classList.remove('on');}

/* ---- composición ---- */
/* ---- tabla de costo por dimensión (reemplaza "De qué está hecho el costo") ---- */
var CD: any={dim:'psl',sort:{k:'cost',d:-1}};
var CD_DIMS=[{id:'psl',l:'PSL'},{id:'user',l:'Usuario'},{id:'veh',l:'Tipo de vehículo'},{id:'type',l:'Tipo de servicio'},{id:'prov',l:'Proveedor'},{id:'vp',l:'Vicepresidencia'},{id:'orig',l:'Origen'},{id:'dest',l:'Destino'},{id:'mod',l:'Modalidad'}];
var CD_COLS=[{k:'name',l:'',cls:''},{k:'n',l:'Serv.',t:'Servicios del mes',cls:'r'},{k:'cost',l:'Costo',t:'Costo a hoy',cls:'r'},{k:'cps',l:'C/serv.',t:'Costo por servicio',cls:'r'},{k:'ext',l:'Sobrec.',t:'Sobrecostos y standby sobre el costo',cls:'r'},{k:'proj',l:'Proyección',t:'Proyección al cierre del mes',cls:'r'},{k:'delta',l:'vs 3m',t:'Proyección vs promedio de los 3 meses anteriores',cls:'r'}];
function renderCompo(){
  var el=document.getElementById('compo'), id=CD.dim, dimL=CD_DIMS.filter(function(d){return d.id===id;})[0].l, g: any={};
  // la tabla ignora su propio filtro para que se sigan viendo las demás filas (como en la Torre de recaudo)
  var saved=S.f[id];S.f[id]=[];var TT=TRIPS.filter(function(t: any){return inF(t,true);});S.f[id]=saved;
  var act=saved.length>0;
  TT.forEach(function(t: any){ if(t.m<CUR-3)return; var k=String(t[id]), o=g[k]||(g[k]={key:k,n:0,cost:0,ext:0,prev:0});
    if(t.m===CUR){o.n++;o.cost+=t.cost;o.ext+=t.sob+t.stb;} else o.prev+=t.cost;});
  var rows=Object.keys(g).map(function(k){var o=g[k];o.name=skLabel(id,k);o.cps=o.n?o.cost/o.n:0;o.extSh=o.cost?o.ext/o.cost:0;o.avg=o.prev/3;o.proj=o.cost*DAYS_CUR/ELAPSED;o.delta=o.avg?o.proj/o.avg-1:null;return o;}).filter(function(o){return o.n>0;});
  var k=CD.sort.k,dd=CD.sort.d;
  rows.sort(function(x,y){if(k==='name')return dd*x.name.localeCompare(y.name);var a=k==='ext'?x.extSh:x[k],b=k==='ext'?y.extSh:y[k];if(a===null)a=-Infinity;if(b===null)b=-Infinity;return dd*(a-b);});
  var tn=0,tc=0,te=0,ta=0;rows.forEach(function(o){tn+=o.n;tc+=o.cost;te+=o.ext;ta+=o.avg;});
  var tp=tc*DAYS_CUR/ELAPSED, mx=Math.max.apply(null,rows.map(function(o){return o.cost;}).concat([1]));
  var cg='<colgroup><col style="width:25%"><col style="width:9%"><col style="width:13%"><col style="width:13%"><col style="width:11%"><col style="width:15%"><col style="width:14%"></colgroup>';
  var h='<div class="c-head"><h2>Distribución del costo</h2>'+
    '<button class="ai-btn" id="aiBtn" title="Generar insights del costo con CashportAI"><svg viewBox="0 0 24 24"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/></svg>CashportAI Insights</button>'+
    '<label class="psel" style="margin-left:4px"><span class="sr">Dimensión</span><select id="cdDim">'+CD_DIMS.map(function(d){return '<option value="'+d.id+'"'+(d.id===id?' selected':'')+'>'+d.l+'</option>';}).join('')+'</select><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></label><button type="button" class="dl" data-x="compo" aria-label="Descargar en Excel" title="Descargar en Excel"'+(DLNS?'':' hidden')+'><svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button></div>'+
    '<div class="cd-wrap"><table class="cd">'+cg+'<thead><tr>'+
    CD_COLS.map(function(c){var on=CD.sort.k===c.k;return '<th class="'+c.cls+(on?' sorted':'')+'" data-k="'+c.k+'"'+(c.t?' title="'+c.t+'"':'')+'>'+(c.k==='name'?dimL:c.l)+sortIco(on?dd:0)+'</th>';}).join('')+'</tr></thead><tbody>'+
    rows.map(function(o){var dl=o.delta===null?'<span class="pct new">Nuevo</span>':chipPct(o.delta,true);
      var sel=S.f[id]&&S.f[id].length===1&&S.f[id][0]===o.key;
      return '<tr class="click'+(sel||(act&&saved.indexOf(o.key)>=0)?' selected':act?' dim':'')+'" data-key="'+esc(o.key)+'"><td><span class="cd-n" title="'+esc(o.name)+'">'+esc(o.name)+'</span><span class="cd-b"><i style="width:'+(o.cost/mx*100)+'%"></i></span></td>'+
        '<td class="r">'+int(o.n)+'</td><td class="r">'+moneyS(o.cost)+'<span class="cd-p" title="Participación en el costo">'+pct(tc?o.cost/tc:0)+'</span></td><td class="r">'+moneyS(o.cps)+'</td>'+
        '<td class="r">'+(o.extSh>=.25?'<span class="pct plo">'+pct(o.extSh)+'</span>':pct(o.extSh))+'</td>'+
        '<td class="r">'+moneyS(o.proj)+'</td><td class="r">'+dl+'</td></tr>';}).join('')+
    '</tbody></table></div><table class="cd cd-tot">'+cg+'<tbody><tr><td>Total</td><td class="r">'+int(tn)+'</td><td class="r">'+moneyS(tc)+'</td><td class="r">'+(tn?moneyS(tc/tn):'—')+'</td><td class="r">'+pct(tc?te/tc:0)+'</td><td class="r">'+moneyS(tp)+'</td><td class="r">'+chipPct(ta?tp/ta-1:null,true)+'</td></tr></tbody></table>';
  el.innerHTML=h;
  document.getElementById('cdDim').addEventListener('change',function(this: any){CD.dim=this.value;renderCompo();});
  el.querySelector('.cd tbody').addEventListener('click',function(e: any){var tr=e.target.closest('tr[data-key]');if(!tr)return;var k2=tr.dataset.key;
    S.f[id]=(S.f[id].length===1&&S.f[id][0]===k2)?[]:[k2];render();
    toast(S.f[id].length?'Filtrado por '+esc(dimL)+': <b>'+esc(skLabel(id,k2))+'</b>. Clic de nuevo en la fila o en el chip para quitarlo.':'Filtro de '+esc(dimL)+' quitado.');});
  el.querySelector('thead').addEventListener('click',function(e: any){var th=e.target.closest('th');if(!th)return;var kk=th.dataset.k;if(CD.sort.k===kk)CD.sort.d*=-1;else{CD.sort.k=kk;CD.sort.d=kk==='name'?1:-1;}renderCompo();});
}

/* ---- usuarios ---- */
var COLS=[
 {k:'name',l:'Usuario',w:'25%',cls:''},
 {k:'n',l:'Servicios',w:'9%',cls:'r col-srv'},
 {k:'cost',l:'Costo a hoy',w:'13%',cls:'r'},
 {k:'cps',l:'Costo/servicio',w:'12%',cls:'r col-cps'},
 {k:'sobSh',l:'Sobrecostos',w:'10%',cls:'r col-sob'},
 {k:'proj',l:'Proyección 31/10',w:'15%',cls:'r'},
 {k:'delta',l:'vs prom. 3 meses',w:'13%',cls:'r col-vs'},
 {k:'act',l:'',w:'10%',cls:'r col-act'}];
var LVL: any={crit:'Se dispara',warn:'Vigilar',ok:'En su rango',new:'Sin histórico'};
function renderUsers(){
  var q=S.q.trim().toLowerCase();
  var us=D.users.filter(function(u: any){return !q||(u.name+' '+u.psl+' '+u.vp+' '+u.cc).toLowerCase().indexOf(q)>=0;});
  var k=S.sort.k,d=S.sort.d;
  us.sort(function(a: any,b: any){var x=a[k],y=b[k]; if(k==='name')return d*x.localeCompare(y); if(x===null)x=-Infinity; if(y===null)y=-Infinity; return d*(x-y);});
  var totAll=D.byM[CUR].cost, top10=D.users.slice().sort(function(a: any,b: any){return b.cost-a.cost;}).slice(0,10).reduce(function(s: any,u: any){return s+u.cost;},0);
  document.getElementById('uCount').textContent=int(us.length)+' usuarios · el top 10 suma '+pct(totAll?top10/totAll:0)+' del costo';
  document.getElementById('uHead').innerHTML=COLS.map(function(c){var on=S.sort.k===c.k;return '<th class="'+c.cls+(on?' sorted':'')+'" style="width:'+c.w+'" data-k="'+c.k+'">'+c.l+(c.k!=='act'?sortIco(on?S.sort.d:0)+'':'')+'</th>';}).join('');
  var mx=Math.max.apply(null,us.map(function(u: any){return Math.max(u.proj,u.avg);}).concat([1]));
  document.getElementById('uBody').innerHTML=us.map(function(u: any){
    var col=u.lvl==='crit'?'var(--magenta)':u.lvl==='warn'?'var(--amber)':u.lvl==='new'?'var(--blue)':'var(--navy)';
    var chip='<span class="chip '+u.lvl+'" title="'+LVL[u.lvl]+'">'+(u.delta===null?LVL.new:signPct(u.delta))+'</span>';
    var alerted=S.alerted[u.id], canAlert=u.lvl!=='ok';
    return '<tr><td><span class="u-name link" title="'+esc(u.name)+'">'+esc(u.name)+'</span><span class="u-sub">'+esc(u.psl)+' · '+u.vp+' · '+u.cc+'</span></td>'+
      '<td class="r col-srv">'+int(u.n)+'</td>'+
      '<td class="r">'+money(u.cost)+'</td>'+
      '<td class="r col-cps">'+money(u.cps)+'</td>'+
      '<td class="r col-sob">'+(u.sobSh>=.25?'<span class="chip warn">'+pct(u.sobSh)+'</span>':pct(u.sobSh))+'</td>'+
      '<td class="r"><div class="proj"><span class="num">'+moneyS(u.proj)+'</span><span class="pt"><i style="width:'+(u.proj/mx*100)+'%;background:'+col+'"></i>'+(u.avg?'<b style="left:'+(u.avg/mx*100)+'%" title="Promedio 3 meses: '+money(u.avg)+'"></b>':'')+'</span></div></td>'+
      '<td class="r col-vs">'+chip+'</td>'+
      '<td class="r col-act">'+(canAlert?(alerted?'<button class="act done" disabled>Avisado</button>':'<button class="act" data-alert="'+u.id+'">Avisar</button>'):'')+'</td></tr>';
  }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--ink-3);height:107px">Ningún usuario coincide con la búsqueda</td></tr>';
  var tc=sum(us,'cost'),tn=sum(us,'n'),tp=sum(us,'proj'),te=sum(us,'ext'),ta=sum(us,'avg');
  document.getElementById('uFoot').innerHTML='<td>Total</td><td class="r col-srv">'+int(tn)+'</td><td class="r">'+money(tc)+'</td><td class="r col-cps">'+(tn?money(tc/tn):'—')+'</td><td class="r col-sob">'+pct(tc?te/tc:0)+'</td><td class="r">'+moneyS(tp)+'</td><td class="r col-vs">'+chipPct(ta?tp/ta-1:null,true)+'</td><td class="col-act"></td>';
  var risk=D.users.filter(function(u: any){return (u.lvl==='crit'||u.lvl==='warn'||u.lvl==='new')&&!S.alerted[u.id];});
  var btn=document.getElementById('alertAll');btn.textContent=risk.length?'Avisar a los '+risk.length+' en riesgo':'Todos avisados';btn.disabled=!risk.length;
  document.getElementById('ruleNote').innerHTML='Proyección = ritmo diario del mes × días del mes. La marca negra es su promedio de jul–sep. <b>Se dispara</b>: proyección ≥ 135% del promedio y al menos $15 M arriba. <b>Vigilar</b>: ≥ 120% o sobrecostos ≥ 25% de su costo. El aviso va al usuario y al líder de su PSL.';
}

/* ---- contratos ---- */
function renderContracts(){
  // Utilización del cupo (valor ejecutado / valor del contrato) vs. tiempo transcurrido del contrato (supuesto: vigencia de 12 meses)
  var L=CONTRACTS.map(function(c: any){var st=c.start;
    var tp=Math.max(0,Math.min(1,(NOW-st)/(c.end-st))), dEnd=Math.round((c.end-NOW)/864e5);
    var vl=dEnd<=60?'crit':dEnd<=120?'warn':'ok', ul=c.pu>=.85?'crit':c.pu>=.7?'warn':'ok';
    return Object.assign({},c,{tp:tp,dEnd:dEnd,vl:vl,ul:ul});});
  var R: any={crit:0,warn:1,ok:2};
  L.sort(function(a: any,b: any){return (Math.min(R[a.ul],R[a.vl])-Math.min(R[b.ul],R[b.vl]))||(b.pu-a.pu);});
  CT_LAST=L;
  var h='<div class="c-head"><h2>Utilización de cupos de contrato</h2><button type="button" class="dl" data-x="ct" aria-label="Descargar en Excel" title="Descargar en Excel"'+(DLNS?'':' hidden')+' style="margin-left:auto"><svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button></div>'+
    '<div class="legend ct-lg"><span><i class="sw" style="background:var(--lime-dark)"></i>Cupo usado</span><span><i class="ct-tk"></i>Tiempo transcurrido</span></div>';
  h+='<div class="c-scroll">';
  L.forEach(function(c: any){
    var col=c.ul==='crit'?'var(--magenta)':c.ul==='warn'?'var(--amber)':'var(--lime-dark)';
    var exp=c.vl==='ok'?'<span class="ct-ven">Vence '+ddmmyyyy(c.end)+'</span>':'<span class="chip '+c.vl+'" title="Vence '+ddmmyyyy(c.end)+'">Vence en '+c.dEnd+' días</span>';
    var gap=c.pu-c.tp;
    h+='<div class="mini-row ct"><div class="lbl"><span title="'+esc(c.c)+'">'+esc(c.c)+'</span><span class="ct-oa">'+c.oa+'</span></div><div class="val">'+pct(c.pu)+'</div>'+
      '<div class="track ct-track" title="Cupo usado '+pct(c.pu)+' · tiempo transcurrido '+pct(c.tp)+'"><i style="width:'+Math.min(100,c.pu*100)+'%;background:'+col+'"></i><b style="left:'+(c.tp*100)+'%"></b></div>'+
      '<div class="meta"><span>'+moneyS(c.used)+' de '+moneyS(c.total)+' · saldo '+moneyS(Math.max(0,c.total-c.used))+(gap>.1?' · <span class="ct-out" title="Uso del cupo '+pct(c.pu)+' vs vigencia transcurrida '+pct(c.tp)+'">adelantado</span>':'')+'</span>'+exp+'</div></div>';});
  h+='</div>';
  document.getElementById('contracts').innerHTML=h;
}
/* ---- proveedores ---- */
function renderCarriers(){
  var m=D.mods,t=m.contrato+m.subasta+m.tercerizacion||1, prem=D.cpkIn?D.cpkOut/D.cpkIn-1:0;
  var h='<div class="c-head"><h2>Proveedores y adjudicación</h2><span class="count">Mes actual</span><button type="button" class="dl" data-x="car" aria-label="Descargar en Excel" title="Descargar en Excel"'+(DLNS?'':' hidden')+' style="margin-left:2px"><svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button></div>';
  h+='<div class="stbar" style="margin-top:0;height:8px"><i style="width:'+(m.contrato/t*100)+'%;background:var(--lime-dark)"></i><i style="width:'+(m.subasta/t*100)+'%;background:var(--orange)"></i><i style="width:'+(m.tercerizacion/t*100)+'%;background:var(--magenta)"></i></div>';
  h+='<div class="c-head" style="margin:6px 0 2px;min-height:0"><div class="legend"><span><i class="sw" style="background:var(--lime-dark)"></i>Contrato '+pct(m.contrato/t)+'</span><span><i class="sw" style="background:var(--orange)"></i>Subasta '+pct(m.subasta/t)+'</span><span><i class="sw" style="background:var(--magenta)"></i>Tercerización '+pct(m.tercerizacion/t)+'</span></div></div>';
  // sin carga fuera de contrato (o sin carga en contrato) no hay sobreprecio que comparar
  h+='<div class="insight" style="margin:2px 0 6px"><span class="mark"></span><span>'+(D.cpkOut>0&&D.cpkIn>0
    ?'En carga, lo adjudicado fuera de contrato cuesta <b>'+signPct(prem).replace('+','')+' '+(prem>=0?'más':'menos')+' por km</b> ('+money(D.cpkOut)+' vs '+money(D.cpkIn)+').'
    :'En carga no hay adjudicaciones '+(D.cpkOut>0?'con tarifa de contrato':'fuera de contrato')+' este mes para comparar el costo por km.')+'</span></div>';
  var tot=D.byM[CUR].cost||1;
  h+='<div class="c-scroll">';
  D.provs.forEach(function(p: any){var out=p.cost?p.out/p.cost:0;
    h+='<div class="mini-row"><div class="lbl"><span title="'+esc(p.n)+'">'+esc(p.n)+'</span></div><div class="val">'+moneyS(p.cost)+'</div>'+
      '<div class="track"><i style="width:'+(p.cost/tot*100*2.2)+'%;max-width:100%;background:var(--navy)"></i></div>'+
      '<div class="meta"><span>'+pct(p.cost/tot)+' del costo · '+int(p.cnt)+' servicios</span><span>'+(out>=.3?'<span class="chip warn">'+pct(out)+' fuera de contrato</span>':pct(out)+' fuera de contrato')+'</span></div></div>';});
  h+='</div>';
  document.getElementById('carriers').innerHTML=h;
}
/* ---- vicepresidencias ---- */
/* ---- desempeño de proveedores ----
   Resp.: horas promedio entre el envío del carrier_request y la oferta del proveedor.
   Sobrec.: (sobrecostos + stand by) / costo.  App: % de servicios con eventos reportados desde la app del conductor.
   A tiempo: % de servicios que iniciaron dentro de la hora programada. (Resp. y A tiempo simulados en el prototipo.) */
// T. Resp y % a tiempo por proveedor (mes actual), desde la API; null cuando no hay datos
var PKX=__D.PKX;
var PK={k:'cost',d:-1};
var PK_CG='<colgroup><col><col style="width:17%"><col style="width:18%"><col style="width:15%"><col style="width:19%"></colgroup>';
var PK_COLS=[{k:'n',l:'Proveedor',cls:''},{k:'resp',l:'T. Resp',cls:'r',t:'Tiempo promedio de respuesta a la invitación'},{k:'ext',l:'% Sobrec',cls:'r',t:'% del costo en sobrecostos y stand by'},{k:'app',l:'% App',cls:'r',t:'% de servicios con seguimiento desde la app móvil'},{k:'ontime',l:'<span class="th2">% Serv<br>a tiempo</span>',cls:'r',t:'% de servicios que iniciaron a la hora programada'}];
function renderVps(){
  var L=D.provs.map(function(p: any){var x=PKX[p.n]||{resp:null,ontime:null};return{n:p.n,cost:p.cost,cnt:p.cnt,resp:x.resp,ext:p.cost?p.ext/p.cost:0,app:p.cnt?p.app/p.cnt:0,ontime:x.ontime};});
  var k=PK.k,d=PK.d;L.sort(function(a: any,b: any){var x=a[k],y=b[k];return (typeof x==='string'?x.localeCompare(y):x-y)*d;});
  var bad=function(c: any,v: any){if(v==null)return false;return c==='resp'?v>4:c==='ext'?v>=.15:c==='app'?v<.6:c==='ontime'?v<.85:false;};
  PK_LAST=L;
  var h='<div class="c-head"><h2>Desempeño de proveedores</h2><span class="count">Mes actual</span><button type="button" class="dl" data-x="pk" aria-label="Descargar en Excel" title="Descargar en Excel"'+(DLNS?'':' hidden')+' style="margin-left:2px"><svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button></div>'+
    '<div class="c-scroll"><table class="pkt">'+PK_CG+'<thead><tr>'+
    PK_COLS.map(function(c){var on=PK.k===c.k;return '<th class="'+c.cls+(on?' sorted':'')+'" data-pk="'+c.k+'"'+(c.t?' title="'+c.t+'"':'')+'>'+c.l+sortIco(on?d:0)+'</th>';}).join('')+'</tr></thead><tbody>'+
    L.map(function(r: any){return '<tr><td><span class="l1" title="'+esc(r.n)+'">'+esc(r.n)+'</span><span class="l2">'+int(r.cnt)+' serv. · '+moneyS(r.cost)+'</span></td>'+
      '<td class="r'+(bad('resp',r.resp)?' bad':'')+'">'+(r.resp==null?'—':r.resp.toLocaleString('es-CO')+' h')+'</td>'+
      '<td class="r'+(bad('ext',r.ext)?' bad':'')+'">'+pct(r.ext)+'</td>'+
      '<td class="r'+(bad('app',r.app)?' bad':'')+'">'+pct(r.app)+'</td>'+
      '<td class="r'+(bad('ontime',r.ontime)?' bad':'')+'">'+(r.ontime==null?'—':pct(r.ontime))+'</td></tr>';}).join('')+
    '</tbody></table></div>';
  // total: promedios ponderados (Resp., App y A tiempo por # de servicios; Sobrec. por costo)
  // T. Resp y A tiempo se ponderan solo con los proveedores que tienen el dato
  var tn=0,tc=0,te=0,tr=0,ta=0,to=0,trn=0,ton=0;D.provs.forEach(function(p: any){var x=PKX[p.n]||{resp:null,ontime:null};tn+=p.cnt;tc+=p.cost;te+=p.ext;ta+=p.app;
    if(x.resp!=null){tr+=x.resp*p.cnt;trn+=p.cnt;} if(x.ontime!=null){to+=x.ontime*p.cnt;ton+=p.cnt;}});
  h+='<table class="pkt pk-tot">'+PK_CG+'<tbody><tr><td><span class="l1">Total</span><span class="l2">'+int(tn)+' serv. · '+moneyS(tc)+'</span></td>'+
    '<td class="r">'+(trn?(Math.round(tr/trn*10)/10).toLocaleString('es-CO')+' h':'—')+'</td><td class="r">'+pct(tc?te/tc:0)+'</td><td class="r">'+pct(tn?ta/tn:0)+'</td><td class="r">'+(ton?pct(to/ton):'—')+'</td></tr></tbody></table>';
  document.getElementById('vps').innerHTML=h;
}
document.getElementById('vps').addEventListener('click',function(e: any){var th=e.target.closest('th[data-pk]');if(!th)return;var k=th.dataset.pk;
  if(PK.k===k)PK.d*=-1;else{PK.k=k;PK.d=(k==='n'||k==='resp'||k==='ext')?1:-1;}renderVps();});

/* ---- chips de filtros ---- */
function labelOf(cat: any,v: any){var c=FILTER_CATS.filter(function(x){return x.id===cat;})[0];return c.label?c.label(v):v;}
function renderChips(){
  var h='',n=0;
  FILTER_CATS.forEach(function(c){var vals=S.f[c.id];if(!vals.length)return;n+=vals.length;
    var txt=vals.slice(0,2).map(function(v: any){return labelOf(c.id,v);}).join(', ')+(vals.length>2?' +'+(vals.length-2):'');
    h+='<span class="fchip">'+c.name+': '+esc(txt)+'<button data-clear="'+c.id+'" aria-label="Quitar filtro '+c.name+'">×</button></span>';});
  document.getElementById('fchips').innerHTML=h;
  var b=document.getElementById('fbadge');b.hidden=!n;b.textContent=n;
}

/* ================= interacción ================= */
function toast(msg: any){var t=document.getElementById('toast');t.innerHTML=msg;t.classList.add('on');clearTimeout((toast as any)._t);(toast as any)._t=setTimeout(function(){t.classList.remove('on');},3200);}
// corte: viene del backend (fecha y hora del servidor al armar los datos)
var _hm=String(NOW_T.getHours()).padStart(2,'0')+':'+String(NOW_T.getMinutes()).padStart(2,'0');
document.getElementById('cutNum').textContent='Hoy '+_hm;
document.getElementById('cutTitle').textContent='Corte del '+ddmmyyyy(NOW_T)+' a las '+_hm;
// recargar: el componente pide los datos de nuevo y vuelve a montar el tablero
document.getElementById('refresh').addEventListener('click',function(this: any){var b=this;b.classList.add('spin');setTimeout(function(){b.classList.remove('spin');},520);if(opciones&&opciones.recargar)opciones.recargar();});
document.getElementById('period').addEventListener('change',function(this: any){S.mode=this.value;renderChart();});
document.getElementById('lineSeg').addEventListener('click',function(e: any){var b=e.target.closest('[data-line]');if(!b)return;S.line=b.dataset.line;renderChart();});
var qEl=document.getElementById('q'),qx=document.getElementById('qx');
qEl.addEventListener('input',function(){S.q=qEl.value;qx.hidden=!qEl.value;renderUsers();});
qx.addEventListener('click',function(){qEl.value='';S.q='';qx.hidden=true;renderUsers();qEl.focus();});
document.getElementById('uHead').addEventListener('click',function(e: any){var th=e.target.closest('th');if(!th||th.dataset.k==='act')return;var k=th.dataset.k;
  if(S.sort.k===k)S.sort.d*=-1;else{S.sort.k=k;S.sort.d=k==='name'?1:-1;}renderUsers();});
document.getElementById('uBody').addEventListener('click',function(e: any){var b=e.target.closest('[data-alert]');if(!b)return;var u=D.users.filter(function(x: any){return x.id===+b.dataset.alert;})[0];
  S.alerted[u.id]=1;renderUsers();toast('Aviso preparado para <b>'+esc(u.name)+'</b> y el líder de '+esc(u.psl)+': proyecta '+moneyS(u.proj)+' al cierre.');});
document.getElementById('alertAll').addEventListener('click',function(){var r=D.users.filter(function(u: any){return (u.lvl!=='ok')&&!S.alerted[u.id];});r.forEach(function(u: any){S.alerted[u.id]=1;});renderUsers();toast('Avisos preparados para '+r.length+' usuarios y sus líderes de PSL.');});
document.getElementById('kpis').addEventListener('click',function(e: any){var b=e.target.closest('[data-tog]');if(!b)return;var id=b.dataset.tog;S.hideStates[id]=!S.hideStates[id];renderKpis();});
document.getElementById('kpis').addEventListener('mousemove',function(e: any){var kb=e.target.closest('[data-kb]');if(kb){showTip(kbTip(kb.dataset.kb),e);return;}var i=e.target.closest('[data-st]');if(!i){hideTip();return;}var s=STATES.filter(function(x){return x.id===i.dataset.st;})[0];
  var tot=0;STATES.forEach(function(x){if(x.id!=='fact')tot+=D.st[x.id];});showTip('<div class="tt">'+s.name+'</div>'+trow(s.c,'TRs',int(D.st[s.id]))+trow('','Participación',pct(D.st[s.id]/Math.max(1,tot))),e);});
document.getElementById('kpis').addEventListener('mouseleave',hideTip);
document.getElementById('fchips').addEventListener('click',function(e: any){var b=e.target.closest('[data-clear]');if(!b)return;S.f[b.dataset.clear]=[];render();});

/* ---- modal Filtros Avanzados ---- */
var draft: any=null, cat='vp', mq='';
var ov=document.getElementById('overlay');
function lockScroll(on: any){document.documentElement.style.overflow=on?'hidden':'';document.body.style.overflow=on?'hidden':'';}
function openModal(){draft={};FILTER_CATS.forEach(function(c){draft[c.id]=S.f[c.id].slice();});mq='';drawModal();ov.hidden=false;lockScroll(true);}
function closeModal(){ov.hidden=true;ov.innerHTML='';lockScroll(false);}
function drawModal(){
  var c=FILTER_CATS.filter(function(x){return x.id===cat;})[0];
  var opts=c.opts.filter(function(o: any){return !mq||labelOf(c.id,o).toLowerCase().indexOf(mq.toLowerCase())>=0;});
  ov.innerHTML='<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">'+
   '<div class="m-head"><div class="m-ico"><svg viewBox="0 0 24 24"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg></div><div><h3 id="mt">Filtros Avanzados</h3><p>Encuentra y selecciona múltiples opciones</p></div><button class="m-x" data-m="close" aria-label="Cerrar">×</button></div>'+
   '<div class="m-body"><div class="m-cats">'+FILTER_CATS.map(function(x){return '<button class="'+(x.id===cat?'on':'')+'" data-cat="'+x.id+'">'+x.name+(draft[x.id].length?'<span class="badge n">'+draft[x.id].length+'</span>':'')+'</button>';}).join('')+'</div>'+
   '<div class="m-opts"><label class="search in-card" style="width:100%"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="mq" type="search" placeholder="Buscar en '+c.name.toLowerCase()+'…" value="'+esc(mq)+'" autocomplete="off"></label>'+
   '<div class="m-res"><span>'+opts.length+' resultados</span><button data-m="all">'+(opts.every(function(o: any){return draft[c.id].indexOf(o)>=0;})&&opts.length?'Quitar todos':'Seleccionar todos')+'</button></div>'+
   '<div class="opts">'+opts.map(function(o: any){var on=draft[c.id].indexOf(o)>=0;return '<button class="opt'+(on?' on':'')+'" data-o="'+esc(o)+'" role="checkbox" aria-checked="'+on+'"><span class="c"></span><span>'+esc(labelOf(c.id,o))+'</span></button>';}).join('')+'</div></div></div>'+
   '<div class="m-foot"><button class="txt" data-m="clear">Limpiar todo</button><span class="spacer"></span><button class="txt k" data-m="close">Cancelar</button><button class="btn-primary" data-m="apply">Aplicar Filtros</button></div></div>';
  var mi=document.getElementById('mq');mi.addEventListener('input',function(){mq=mi.value;var pos=mi.selectionStart;drawModal();var n=document.getElementById('mq');n.focus();n.setSelectionRange(pos,pos);});
}
ov.addEventListener('click',function(e: any){
  if(e.target===ov){closeModal();return;}
  var t=e.target.closest('button');if(!t)return;
  if(t.dataset.cat){cat=t.dataset.cat;mq='';drawModal();return;}
  if(t.dataset.o!==undefined){var a=draft[cat],i=a.indexOf(t.dataset.o);if(i>=0)a.splice(i,1);else a.push(t.dataset.o);drawModal();return;}
  var m=t.dataset.m;
  if(m==='close')closeModal();
  if(m==='clear'){FILTER_CATS.forEach(function(c){draft[c.id]=[];});drawModal();}
  if(m==='all'){var c=FILTER_CATS.filter(function(x){return x.id===cat;})[0];var opts=c.opts.filter(function(o: any){return !mq||labelOf(c.id,o).toLowerCase().indexOf(mq.toLowerCase())>=0;});
    var all=opts.every(function(o: any){return draft[cat].indexOf(o)>=0;});draft[cat]= all?draft[cat].filter(function(o: any){return opts.indexOf(o)<0;}):Array.from(new Set(draft[cat].concat(opts)));drawModal();}
  if(m==='apply'){FILTER_CATS.forEach(function(c){S.f[c.id]=draft[c.id];});closeModal();render();}
});
document.addEventListener('keydown',function(e: any){if(e.key==='Escape'){if(!ov.hidden)closeModal();}});
document.getElementById('filterBtn').addEventListener('click',openModal);
/* ================= Sankey: a dónde se va el costo ================= */
var SK_DIMS=[
 {id:'psl',l:'PSL'},
 {id:'user',l:'Usuario',lab:function(k: any){return USERS[k].name;}},
 {id:'veh',l:'Tipo de vehículo'},
 {id:'type',l:'Tipo de servicio',lab:function(k: any){return TYPES.filter(function(t: any){return t.id===k;})[0].name;}},
 {id:'prov',l:'Proveedor'},
 {id:'orig',l:'Origen'},
 {id:'dest',l:'Destino'},
 {id:'vp',l:'Vicepresidencia'},
 {id:'mod',l:'Modalidad',lab:function(k: any){return ({contrato:'Tarifa de contrato',subasta:'Subasta',tercerizacion:'Tercerización'} as any)[k];}},
 {id:'comp',l:'Componente del costo',lab:function(k: any){return ({base:'Tarifa base',sob:'Sobrecostos',stb:'Standby'} as any)[k];}}];
var SK: any={stages:['psl','user'],period:'cur',path:[],drag:null};
var SK_PER: any={
 cur:{l:'mes actual',f:function(t: any){return t.m===CUR;}},
 prev:{l:'mes anterior',f:function(t: any){return t.m===CUR-1;}},
 q:{l:'últimos 3 meses',f:function(t: any){return t.m>=CUR-2;}},
 ytd:{l:'año corrido',f:function(t: any){return MONTHS[t.m].y===MONTHS[CUR].y;}},
 y:{l:'últimos 12 meses',f:function(){return true;}}};
function skDim(id: any){return SK_DIMS.filter(function(d){return d.id===id;})[0];}
function skLabel(id: any,k: any){if(k==='__otros')return 'Otros';if(k==='__total')return 'Costo total';var d=skDim(id);return d.lab?d.lab(k):k;}
function skKey(r: any,id: any){return String(id==='comp'?r.comp:r.t[id]);}
function skShort(x: any,n: any){return x.length>n?x.slice(0,n-1)+'…':x;}

function renderSkStages(){
  var el=document.getElementById('skStages'), st=SK.stages;
  var h='';
  st.forEach(function(id: any,i: any){
    h+=''+(i?'<span class="sk-arrow" aria-hidden="true">›</span>':'')+'<div class="sk-stage" draggable="true" title="Arrastra para reordenar" data-i="'+i+'"><span class="sk-grip" aria-hidden="true">⋮⋮</span><span class="sk-n">'+(i+1)+'</span>'+
      '<label class="psel mini"><span class="sr">Dimensión '+(i+1)+'</span><select data-i="'+i+'">'+SK_DIMS.map(function(d){var used=st.indexOf(d.id)>=0&&d.id!==id;return '<option value="'+d.id+'"'+(d.id===id?' selected':'')+(used?' disabled':'')+'>'+d.l+'</option>';}).join('')+'</select><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></label>'+
      (st.length>1?'<button class="sk-b" data-rm="'+i+'" aria-label="Quitar dimensión" title="Quitar dimensión">×</button>':'')+'</div>';});
  if(st.length<3)h+='<button class="sk-add" id="skAdd">+ Dimensión</button>';
  el.innerHTML=h;
}

function squarify(items: any,x: any,y: any,w: any,h: any){
  var out: any=[], total=0;items.forEach(function(it: any){total+=it.v;});if(!total||w<=0||h<=0)return out;
  var sc=w*h/total, rest=items.map(function(it: any){return{it:it,a:it.v*sc};});
  function worst(row: any,side: any){var s=0,mx=0,mn=Infinity;row.forEach(function(r: any){s+=r.a;mx=Math.max(mx,r.a);mn=Math.min(mn,r.a);});var s2=s*s,sd=side*side;return Math.max(sd*mx/s2,s2/(sd*mn));}
  while(rest.length){var side=Math.min(w,h),row=[rest[0]],i=1;
    while(i<rest.length){var nr=row.concat([rest[i]]);if(worst(nr,side)<=worst(row,side)){row=nr;i++;}else break;}
    var s=0;row.forEach(function(r){s+=r.a;});
    if(w>=h){var cw=s/h,cy=y;row.forEach(function(r){var rh=r.a/cw;out.push({it:r.it,x:x,y:cy,w:cw,h:rh});cy+=rh;});x+=cw;w-=cw;}
    else{var rh=s/w,cx=x;row.forEach(function(r){var rw=r.a/rh;out.push({it:r.it,x:cx,y:y,w:rw,h:rh});cx+=rw;});y+=rh;h-=rh;}
    rest=rest.slice(row.length);}
  return out;}
var TM_COLS=[['var(--c1)','var(--c1i)'],['var(--c2)','var(--c2i)'],['var(--c3)','var(--c3i)'],['var(--c4)','var(--c4i)'],
  ['var(--c5)','var(--c5i)'],['var(--c6)','var(--c6i)'],['var(--c7)','var(--c7i)'],['var(--c8)','var(--c8i)'],['var(--c9)','var(--c9i)'],['var(--c10)','var(--c10i)']];
function tmFit(text: any,w: any,small: any){var cw=small?5.2:6.1,pad=small?6:14,fit=Math.floor((w-pad)/cw);if(fit<1)return '';if(text.length<=fit)return text;return fit>=4?text.slice(0,fit-1).replace(/\s+$/,'')+'…':text.slice(0,fit);}
function tmTile(name: any,val: any,pc: any,w: any,h: any){var small=w<46||h<34, lh=small?10.5:13, lines=Math.floor((h-4)/lh);if(lines<1||w<14)return{small:small,html:''};
  var cw=small?5.2:6.1, html='<b>'+esc(tmFit(name.toUpperCase(),w,small))+'</b>';
  if(lines>=2){var share=lines<3, pw=pc.length*cw+4;html+='<span>'+esc(tmFit(val,share?w-pw:w,small))+'</span>';if(!share||w-pw>14)html+='<em>'+pc+'</em>';}
  return{small:small,html:html};}
var SKD: any=null;
function skGroups(rs: any,id: any,N: any){var m: any={};rs.forEach(function(r: any){var k=skKey(r,id);var o=m[k]||(m[k]={key:k,keys:[k],v:0,recs:[]});o.v+=r.v;o.recs.push(r);});
  var arr=Object.keys(m).map(function(k){return m[k];}).sort(function(a,b){return b.v-a.v;});
  if(arr.length>N+1){var ot: any={key:'__otros',keys:[],v:0,recs:[]};arr.slice(N).forEach(function(o){ot.keys.push(o.key);ot.v+=o.v;ot.recs=ot.recs.concat(o.recs);});arr=arr.slice(0,N).concat([ot]);}
  return arr;}
function renderSankey(){
  var wrap=document.getElementById('skChart'); if(!wrap||!D)return;
  var st=SK.stages; if(SK.path.length>=st.length)SK.path=SK.path.slice(0,st.length-1);
  renderSkStages();
  var per=SK_PER[SK.period].f, useComp=st.indexOf('comp')>=0, recs: any=[];
  D.T.forEach(function(t: any){ if(!per(t))return;
    if(useComp){ if(t.base)recs.push({t:t,v:t.base,comp:'base'}); if(t.sob)recs.push({t:t,v:t.sob,comp:'sob'}); if(t.stb)recs.push({t:t,v:t.stb,comp:'stb'}); }
    else recs.push({t:t,v:t.cost}); });
  var grand=0;recs.forEach(function(r: any){grand+=r.v;});
  SK.path.forEach(function(P: any,j: any){recs=recs.filter(function(r: any){return P.keys.indexOf(skKey(r,st[j]))>=0;});});
  var total=0;recs.forEach(function(r: any){total+=r.v;});
  var d=SK.path.length, g1=st[d], g2=st[d+1];
  // ruta
  var cr='<button data-crumb="0">Costo total</button>';
  SK.path.forEach(function(P: any,j: any){cr+='<span class="sep">›</span>'+(j===SK.path.length-1?'<span class="cur"><span class="dim">'+esc(skDim(st[j]).l)+':</span> '+esc(skLabel(st[j],P.key))+'</span>':'<button data-crumb="'+(j+1)+'"><span class="dim">'+esc(skDim(st[j]).l)+':</span> '+esc(skLabel(st[j],P.key))+'</button>');});
  var crEl=document.getElementById('skCrumbs');crEl.hidden=!SK.path.length;crEl.innerHTML=SK.path.length?cr:'';
  document.getElementById('skCount').textContent=money(total)+(d?' · '+pct(grand?total/grand:0)+' del total':'')+' · '+SK_PER[SK.period].l+(fCount()?' · con filtros':'');
  if(!recs.length){wrap.innerHTML='<div style="padding:40px;text-align:center;color:var(--ink-3)">Sin costos para este periodo y filtros</div>';SKD=null;return;}
  var W=wrap.clientWidth||1200, H=W<1010?587:693, gp=1;
  var g3=st[d+2];
  var groups=skGroups(recs,g1,g2?9:14);
  groups.forEach(function(g,i){g.col=TM_COLS[i%TM_COLS.length];g.kids=g2?skGroups(g.recs,g2,g3?8:12):null;
    if(g.kids&&g3)g.kids.forEach(function(k: any){k.kids=skGroups(k.recs,g3,6);});});
  var html='<div class="tm" style="height:'+H+'px">';
  function tile(cls: any,attrs: any,x: any,y: any,w: any,h: any,name: any,val: any,pc: any){var T=tmTile(name,val,pc,w-2,h-2);
    return '<div class="tm-t'+(T.small?' sm':'')+cls+'" '+attrs+' style="left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px">'+T.html+'</div>';}
  squarify(groups,0,0,W,H).forEach(function(R: any){var g=R.it, x=R.x+gp, y=R.y+gp, w=Math.max(0,R.w-2*gp), h=Math.max(0,R.h-2*gp);
    var gi=groups.indexOf(g), lab=skLabel(g1,g.key), head=h>64&&w>80, hh=head?29:0;
    html+='<div class="tm-g" style="left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px;background:'+g.col[0]+';--tm-ink:'+g.col[1]+'">';
    if(g.kids){
      if(head)html+='<div class="tm-gh" data-g="'+gi+'" title="'+esc(lab)+'">'+esc(lab)+'<span>'+moneyS(g.v)+' · '+pct(g.v/total,1)+'</span></div>';
      squarify(g.kids,0,hh,w,h-hh).forEach(function(K: any){var kx=K.x,ky=K.y,kw=Math.max(0,K.w),kh=Math.max(0,K.h),ki=g.kids.indexOf(K.it),kl=skLabel(g2,K.it.key);
        if(K.it.kids&&kh>53&&kw>61){
          var sh=kh>75&&kw>93?23:0;
          html+='<div class="tm-sg" style="left:'+kx+'px;top:'+ky+'px;width:'+kw+'px;height:'+kh+'px">';
          if(sh)html+='<div class="tm-sh" data-g="'+gi+'" data-k="'+ki+'" title="'+esc(kl)+'">'+esc(kl)+'<span>'+moneyS(K.it.v)+' · '+pct(K.it.v/g.v)+'</span></div>';
          squarify(K.it.kids,0,sh,kw,kh-sh).forEach(function(Q: any){var qi=K.it.kids.indexOf(Q.it);
            html+=tile('','data-g="'+gi+'" data-k="'+ki+'" data-q="'+qi+'"',Q.x,Q.y,Math.max(0,Q.w),Math.max(0,Q.h),skLabel(g3,Q.it.key),moneyS(Q.it.v),pct(Q.it.v/K.it.v));});
          html+='</div>';
        } else html+=tile('','data-g="'+gi+'" data-k="'+ki+'"',kx,ky,kw,kh,kl,moneyS(K.it.v),pct(K.it.v/g.v));});
    } else {
      html+=tile(st[d+1]?'':' leaf','data-g="'+gi+'"',0,0,w,h,lab,moneyS(g.v),pct(g.v/total)).replace(/left:0px;top:0px;width:[\d.]+px;height:[\d.]+px/,'left:0;top:0;width:100%;height:100%');
    }
    html+='</div>';});
  html+='</div>';
  wrap.innerHTML=html;
  SKD={groups:groups,g1:g1,g2:g2,g3:g3,total:total,d:d};
}
(function(){
  var w=document.getElementById('skChart'), stg=document.getElementById('skStages');
  w.addEventListener('mousemove',function(e: any){if(!SKD)return;var el=e.target.closest('[data-g]');if(!el){hideTip();return;}
    var g=SKD.groups[+el.dataset.g], gl=skLabel(SKD.g1,g.key), h;
    if(el.dataset.q!==undefined){var k=g.kids[+el.dataset.k], q=k.kids[+el.dataset.q], kl=skLabel(SKD.g2,k.key);
      h='<div class="tt">'+esc(gl)+' › '+esc(kl)+' › '+esc(skLabel(SKD.g3,q.key))+'</div>'+trow('','Costo',money(q.v))+trow('','Del total',pct(q.v/SKD.total,1))+trow('','De '+esc(skShort(kl,22)),pct(q.v/k.v,1));
      h+='<div class="tr" style="opacity:.7;margin-top:4px">Clic para ver su detalle</div>';}
    else if(el.dataset.k!==undefined){var k=g.kids[+el.dataset.k];
      h='<div class="tt">'+esc(gl)+' › '+esc(skLabel(SKD.g2,k.key))+'</div>'+trow('','Costo',money(k.v))+trow('','Del total',pct(k.v/SKD.total,1))+trow('','De '+esc(skShort(gl,22)),pct(k.v/g.v,1));
      h+='<div class="tr" style="opacity:.7;margin-top:4px">Clic para ver su detalle</div>';}
    else{h='<div class="tt">'+esc(skDim(SKD.g1).l)+': '+esc(gl)+'</div>'+trow('','Costo',money(g.v))+trow('','Del total',pct(g.v/SKD.total,1));
      if(SK.stages[SKD.d+1])h+='<div class="tr" style="opacity:.7;margin-top:4px">Clic para ver su detalle</div>';}
    showTip(h,e);});
  w.addEventListener('mouseleave',hideTip);
  w.addEventListener('click',function(e: any){if(!SKD)return;var el=e.target.closest('[data-g]');if(!el)return;var st=SK.stages,g=SKD.groups[+el.dataset.g];
    if(!st[SKD.d+1])return;
    SK.path.push({key:g.key,keys:g.keys});
    if(el.dataset.k!==undefined&&st[SKD.d+2]){var k=g.kids[+el.dataset.k];SK.path.push({key:k.key,keys:k.keys});}
    hideTip();renderSankey();});
  document.getElementById('skCrumbs').addEventListener('click',function(e: any){var b=e.target.closest('[data-crumb]');if(!b)return;SK.path=SK.path.slice(0,+b.dataset.crumb);renderSankey();});
  document.getElementById('skPeriod').addEventListener('change',function(this: any){SK.period=this.value;SK.path=[];renderSankey();});
  stg.addEventListener('change',function(e: any){var s=e.target.closest('select[data-i]');if(!s)return;SK.stages[+s.dataset.i]=s.value;SK.path=[];renderSankey();});
  stg.addEventListener('click',function(e: any){var b=e.target.closest('button');if(!b)return;
    if(b.id==='skAdd'){var free=SK_DIMS.filter(function(d){return SK.stages.indexOf(d.id)<0;})[0];if(free)SK.stages.push(free.id);}
    else if(b.dataset.mv){var i=+b.dataset.i,j=i+(+b.dataset.mv),t=SK.stages[i];SK.stages[i]=SK.stages[j];SK.stages[j]=t;}
    else if(b.dataset.rm!==undefined){SK.stages.splice(+b.dataset.rm,1);}
    else return;
    SK.path=[];renderSankey();});
  stg.addEventListener('dragstart',function(e: any){var c=e.target.closest('.sk-stage');if(!c)return;SK.drag=+c.dataset.i;c.classList.add('drag');try{e.dataTransfer.setData('text/plain',String(SK.drag));e.dataTransfer.effectAllowed='move';}catch(x){}});
  stg.addEventListener('dragend',function(){SK.drag=null;stg.querySelectorAll('.sk-stage').forEach(function(c: any){c.classList.remove('drag','over');});});
  stg.addEventListener('dragover',function(e: any){var c=e.target.closest('.sk-stage');if(!c||SK.drag===null)return;e.preventDefault();stg.querySelectorAll('.sk-stage').forEach(function(x: any){x.classList.toggle('over',x===c&&+c.dataset.i!==SK.drag);});});
  stg.addEventListener('drop',function(e: any){var c=e.target.closest('.sk-stage');if(!c||SK.drag===null)return;e.preventDefault();var to=+c.dataset.i,from=SK.drag;
    if(to!==from){var it=SK.stages.splice(from,1)[0];SK.stages.splice(to,0,it);SK.path=[];}SK.drag=null;renderSankey();});
})();

/* ---- detalle al pasar sobre las barras de los KPIs ---- */
function kbTip(k: any){
  var b=D.byM[CUR], h='';
  function p(v: any,t: any){return t?' <span style="opacity:.65">'+pct(v/t)+'</span>':'';}
  if(k==='cost'){h='<div class="tt">Costo del mes por componente</div>'+
    trow('var(--navy)','Tarifa base',money(b.base)+p(b.base,b.cost))+trow('var(--orange)','Sobrecostos aprobados',money(b.sob)+p(b.sob,b.cost))+trow('var(--amber)','Standby',money(b.stb)+p(b.stb,b.cost))+
    trow('','Total',money(b.cost),true)+'<div class="tr" style="opacity:.7;margin-top:4px">No aprobados (fuera del costo): '+money(b.sobNo)+'</div>';}
  if(k==='srv'){var tn=0,tc=0;D.types.forEach(function(t: any){tn+=t.n;tc+=t.cost;});
    h='<div class="tt">Servicios del mes por tipología</div><table class="tip-tbl"><thead><tr><th></th><th>Servicios</th><th>Costo</th></tr></thead><tbody>'+
      D.types.map(function(t: any){return '<tr><td><i class="sw" style="background:'+t.t.color+'"></i>'+t.t.name+'</td><td>'+int(t.n)+' <span style="opacity:.6">'+pct(tn?t.n/tn:0)+'</span></td><td>'+money(t.cost)+'</td></tr>';}).join('')+
      '</tbody><tfoot><tr><td>Total</td><td>'+int(tn)+'</td><td>'+money(tc)+'</td></tr></tfoot></table>';}
  if(k==='sinp'){var ov=D.sinp.filter(function(o: any){return o.age>60;}),un=D.sinp.filter(function(o: any){return o.age<=60;});
    h='<div class="tt">TRs sin procesar</div>'+trow('var(--pl-orange)','Más de 1 h',int(ov.length)+' · '+moneyS(sum(ov,'est')))+trow('var(--muted)','Menos de 1 h',int(un.length)+' · '+moneyS(sum(un,'est')))+
    trow('','Costo estimado',money(sum(D.sinp,'est')),true);
    var vp: any={};D.sinp.forEach(function(o: any){vp[o.vp]=(vp[o.vp]||0)+1;});
    h+='<div class="tr" style="opacity:.7;margin-top:4px">Por VP: '+Object.keys(vp).sort(function(a,c){return vp[c]-vp[a];}).map(function(v){return v+' '+vp[v];}).join(' · ')+'</div>';}
  if(k==='prov'){h='<div class="tt">Provisión y facturación</div>';var t=0;
    ['leg','porac','acep','pre'].forEach(function(id){var st=STATES.filter(function(x){return x.id===id;})[0];t+=D.stVal[id];h+=trow(st.c,st.name,money(D.stVal[id]));});
    h+=trow('','Total sin facturar',money(t),true);}
  return h;
}

/* ---- detalle de un segmento de la gráfica ---- */
var segOv=document.getElementById('segOv');
var SEG_DIMS=[{id:'psl',l:'PSL'},{id:'user',l:'Usuario',lab:function(k: any){return USERS[k].name;}},{id:'prov',l:'Proveedor'},
  {id:'type',l:'Tipo de servicio',lab:function(k: any){return TYPES.filter(function(t: any){return t.id===k;})[0].name;}},{id:'vp',l:'Vicepresidencia'}];
var segState: any={dim:'psl',rows:null,i:0,metric:'cost'};
function openSeg(rows: any,i: any){segState.rows=rows;segState.i=i;segOv.hidden=false;lockScroll(true);drawSeg();}
function closeSeg(){segOv.hidden=true;segOv.innerHTML='';lockScroll(false);}
function spark(vals: any,hi: any){var w=56,h=18,mx=Math.max.apply(null,vals.concat([1])),mn=Math.min.apply(null,vals),rg=(mx-mn)||1;
  var pts=vals.map(function(v: any,j: any){return [(vals.length<2?w/2:j*(w-10)/(vals.length-1)+4),(h-3)-((v-mn)/rg)*(h-6)];});
  return '<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><polyline points="'+pts.map(function(p: any){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ')+'" fill="none" stroke="var(--ink-4)" stroke-width="1.5" stroke-linejoin="round"/>'+
    '<circle cx="'+pts[hi][0]+'" cy="'+pts[hi][1]+'" r="2.6" fill="var(--pl-orange)"/></svg>';}
function drawSeg(){
  var rows=segState.rows, i=segState.i, sel=rows[i], all=rows.filter(function(r: any){return !r.future;}), off=0, per=all, hi=i;
  var dim=SEG_DIMS.filter(function(d){return d.id===segState.dim;})[0], met=segState.metric;
  var a=D.T.filter(sel.f), cost=sum(a,'cost'),km=sum(a,'km'),ext=sum(a,'sob')+sum(a,'stb'),trs: any={};a.forEach(function(t: any){trs[t.tr]=1;});
  // matriz dimensión × periodo (incluye el periodo previo a la primera columna para su variación)
  var g: any={};
  all.forEach(function(P: any,j: any){D.T.forEach(function(t: any){if(!P.f(t))return;var k=t[dim.id];var o=g[k]||(g[k]={k:k,v:all.map(function(){return{c:0,km:0,n:0};})});var c=o.v[j];c.c+=t.cost;c.km+=t.km;c.n++;});});
  function val(c: any){return met==='cost'?c.c:met==='cpk'?(c.km?c.c/c.km:0):c.n;}
  function fmt(v: any){return met==='cost'?moneyS(v):met==='cpk'?(v?money(v):'—'):int(v);}
  var list=Object.keys(g).map(function(k){var o=g[k];o.l=dim.lab?dim.lab(k):k;o.all=o.v.map(val);o.vals=o.all.slice(off);return o;})
    .sort(function(x,y){return y.vals[hi]-x.vals[hi];});
  var totAll=all.map(function(P: any,j: any){var c={c:0,km:0,n:0};list.forEach(function(o){c.c+=o.v[j].c;c.km+=o.v[j].km;c.n+=o.v[j].n;});return val(c);}), tot=totAll.slice(off);
  var pf=(sel.cur&&sel.proj&&sel.cost&&met!=='cpk')?sel.proj/sel.cost:1;
  function vr(allv: any,j: any){var J=j+off, c=allv[J], p=allv[J-1]; if(J<1||!p)return '<span class="vr"></span>';
    if(j===hi)c*=pf; var d=c/p-1, up=d>0.005, dn=d<-0.005, bad=up, good=dn;
    return '<span class="vr'+(bad?' bad':good?' good':'')+'">'+(up?'▲':dn?'▼':'·')+pct(Math.abs(d))+'</span>';}
  var old: (j: any) => string=function(){return '';};
  var cols='<colgroup><col style="width:170px">'+per.map(function(){return '<col style="width:112px">';}).join('')+'<col style="width:76px"></colgroup>';
  var head='<tr><th>'+dim.l+'</th>'+per.map(function(P: any,j: any){return '<th class="pc'+(j===hi?' sel':'')+old(j)+'">'+esc(P.l)+(j===hi&&sel.cur?'*':'')+'</th>';}).join('')+'<th class="r">Tendencia</th></tr>';
  function cells(allv: any,vals: any){return vals.map(function(v: any,j: any){return '<td class="pc'+(j===hi?' sel':'')+old(j)+'"><span class="pcw"><span class="cv">'+fmt(v)+'</span>'+vr(allv,j)+'</span></td>';}).join('');}
  var body=list.map(function(o){return '<tr><td class="nm" title="'+esc(o.l)+'">'+esc(o.l)+'</td>'+cells(o.all,o.vals)+'<td class="r">'+spark(o.vals,hi)+'</td></tr>';}).join('');
  var foot='<tr><td>Total</td>'+cells(totAll,tot)+'<td class="r">'+spark(tot,hi)+'</td></tr>';
  segOv.innerHTML='<div class="modal seg-modal" role="dialog" aria-modal="true" aria-labelledby="smt">'+
   '<div class="m-head"><div><h3 id="smt">'+esc(sel.tt)+'</h3><p>Detalle del costo de transporte'+(fCount()?' · con los filtros aplicados':'')+'</p></div><button class="m-x" data-close aria-label="Cerrar">×</button></div>'+
   '<div class="m-body2">'+
    '<div class="sm-ctrl"><h4>Tendencia por '+(dim.id==='psl'?'PSL':dim.l.toLowerCase())+'</h4>'+
      '<div class="seg" role="group" aria-label="Métrica" style="margin-left:0">'+[['cost','Costo'],['cpk','Costo por km'],['n','Servicios']].map(function(m){return '<button data-met="'+m[0]+'" aria-pressed="'+(met===m[0])+'">'+m[1]+'</button>';}).join('')+'</div>'+
      '<label class="psel"><span class="sr">Dimensión</span><select id="segDim">'+SEG_DIMS.map(function(d){return '<option value="'+d.id+'"'+(d.id===dim.id?' selected':'')+'>'+d.l+'</option>';}).join('')+'</select><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></label>'+
    '</div>'+
    '<div class="sm-wrap"><table class="sm-tbl trend" style="min-width:'+(170+per.length*112+76)+'px">'+cols+'<thead>'+head+'</thead><tbody>'+body+'</tbody><tfoot>'+foot+'</tfoot></table></div>'+
    '<div class="rule-note">Mismos periodos de la gráfica; el que elegiste va resaltado. Al lado de cada valor, la variación contra el periodo anterior. Orden por el periodo elegido.'+(sel.cur?' * Periodo en curso: su variación usa la proyección al cierre.':'')+(list.length>10?' '+list.length+' filas: desplázate dentro de la tabla para ver el resto.':'')+'</div>'+
   '</div>'+
   '</div>';
  document.getElementById('segDim').addEventListener('change',function(this: any){segState.dim=this.value;drawSeg();});
  var w=segOv.querySelector('.sm-wrap'), th=w.querySelector('th.sel'), trs=w.querySelectorAll('tbody tr');
  if(trs.length>10){var hh=w.querySelector('thead').offsetHeight, fh=w.querySelector('tfoot').offsetHeight, rh=trs[0].offsetHeight;w.style.maxHeight=(hh+rh*10+fh+1)+'px';}else{w.style.maxHeight='none';} if(th&&w.scrollWidth>w.clientWidth){w.scrollLeft=Math.max(0,th.offsetLeft-w.clientWidth+th.offsetWidth+90);}
}
function fCount(){var n=0;FILTER_CATS.forEach(function(c){n+=S.f[c.id].length;});return n;}
segOv.addEventListener('click',function(e: any){if(e.target===segOv||e.target.closest('[data-close]')){closeSeg();return;}var m=e.target.closest('[data-met]');if(m){segState.metric=m.dataset.met;drawSeg();}});
document.addEventListener('keydown',function(e: any){if(e.key==='Escape'&&!segOv.hidden){closeSeg();}});

/* ================= Seguimiento de la operación ================= */
var OPS_STAGES=[
 {id:'sol',l:'Solicitudes',sts:[['esp','Esperando proveedor','risk'],['asig','Asignando vehículo','ok'],['apl','Aplazada','neu']]},
 {id:'cur',l:'En curso',c2:true,sts:[['sin','Sin iniciar','neu'],['carg','Cargando','ok'],['ruta','En ruta','ok'],['desc','Descargando','ok'],['stb','Stand by','risk'],['det','Detenido','risk']]},
 {id:'fin',l:'Finalizados sin facturar',sts:[['leg','Por legalizar','risk'],['porac','Por aceptar','neu'],['acep','Aceptadas','neu'],['pre','Preautorizado','neu']]}];
// colores por estado de TR: misma paleta del treemap (TM_COLS, estilo Sales Intelligence) [fondo, texto]
var ST_COL: any={esp:['var(--s-esp)','var(--s-esp-i)'],asig:['var(--s-asig)','var(--s-asig-i)'],apl:['var(--s-apl)','var(--s-apl-i)'],sin:['var(--s-sin)','var(--s-sin-i)'],carg:['var(--s-carg)','var(--s-carg-i)'],ruta:['var(--s-ruta)','var(--s-ruta-i)'],desc:['var(--s-desc)','var(--s-desc-i)'],stb:['var(--s-stb)','var(--s-stb-i)'],det:['var(--s-det)','var(--s-det-i)'],leg:['var(--s-leg)','var(--s-leg-i)'],porac:['var(--s-porac)','var(--s-porac-i)'],acep:['var(--s-acep)','var(--s-acep-i)'],pre:['var(--s-pre)','var(--s-pre-i)']};
var OPS_ST_L: any={};OPS_STAGES.forEach(function(g){g.sts.forEach(function(x){OPS_ST_L[x[0]]=x[1];});});
var OPSF: any={al:null,st:null,sort:null};
function hrs(h: any){h=Math.max(0,h);return h<1?Math.round(h*60)+' min':h<48?(Math.round(h*10)/10).toLocaleString('es-CO')+' h':Math.round(h/24)+' días';}
function fdt(d: any){return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function opsData(){
  var ops=OPS.filter(function(r: any){return inF(r,!!r.prov);});
  // TRs finalizadas: salen del mismo modelo de TR del tablero (filtros aplicados)
  var trVal: any={};D.T.forEach(function(t: any){trVal[t.tr]=(trVal[t.tr]||0)+t.cost;});
  // fecha de finalización: evento Viaje finalizado / Enviado a por legalizar; si no hay, la fecha de servicio
  var fin=TRS.filter(function(tr: any){return trVal[tr.id]&&['leg','porac','acep','pre'].indexOf(tr.status)>=0;}).map(function(tr: any){var t0=tr.trips[0];
    var ended=__D.FIN_AT[tr.id]||new Date(MONTHS[tr.m].y,MONTHS[tr.m].m,tr.day,18,0);
    return{id:tr.id,st:tr.status,value:trVal[tr.id],user:tr.user,psl:tr.psl,vp:tr.vp,prov:t0.prov,drv:t0.drv,plate:t0.plate,orig:t0.orig,dest:t0.dest,veh:t0.veh,type:t0.type,
      an:tr.an,ended:ended,days:(NOW_T-ended)/864e5};});
  var all=ops.concat(fin);
  var A: any=[];
  ops.forEach(function(r: any){OPS_RULES.forEach(function(R){if(R.src!=='fin'){var x=R.test(r);if(x)A.push(Object.assign({r:r,al:R.id,lv:R.lv},x));}});});
  fin.forEach(function(r: any){OPS_RULES.forEach(function(R){if(R.src==='fin'){var x=R.test(r);if(x)A.push(Object.assign({r:r,al:R.id,lv:R.lv},x));}});});
  return{ops:ops,fin:fin,all:all,A:A};
}
/* ================= REGLAS DE ALERTA (especificación para desarrollo) =================
   Se evalúan sobre las TRs abiertas en cada corte (cron cada 15 min). Una TR puede disparar
   varias alertas; en la tabla se muestra la de mayor criticidad y el resto como "+N".
   Criticidad: 1 Crítica (está costando dinero hoy) · 2 Alta (riesgo inminente de costo o
   incumplimiento) · 3 Media (riesgo administrativo o de servicio).
   Estados TMS: esp=Esperando proveedor · asig=Asignando vehículo · sin=Sin iniciar ·
   carg/ruta/desc=Cargando/En ruta/Descargando · stb=Stand by · det=Detenido · leg=Por legalizar */
var AL_P={
  STBY_RISK_LATE_H:4,   // h desde la salida programada sin iniciar  → Riesgo de stand by
  TRACK_SHORT_H:4,      // h máx. sin seguimiento, viajes de hasta 1 día
  TRACK_LONG_H:6,       // h máx. sin seguimiento, viajes de más de 1 día
  LONG_TRIP_H:24,       // umbral para considerar un viaje "de más de un día"
  NORESP_H:2,           // h desde la invitación al proveedor sin respuesta   (supuesto, validar)
  ETD_WINDOW_H:24,      // ventana antes de la salida pedida por el cliente   (supuesto, validar)
  PROV_DAYS:2           // días desde la finalización sigue Por legalizar
};
var LV: any={1:{t:'Crítica',c:'var(--red)'},2:{t:'Alta',c:'var(--pl-orange)'},3:{t:'Media',c:'var(--amber)'}};
var OPS_RULES=[
 {id:'stb',t:'Stand by',lv:1,
  rule:'TR en estado Stand by. Desde la hora '+AL_P.STBY_RISK_LATE_H+' se cobra según contrato (contracts.standby_hours × tarifa).',
  test:function(r: any){if(r.st!=='stb')return null;var ch=Math.max(0,r.stbH-STBY_FREE);
    return{why:'Stand by '+hrs(r.stbH)+(ch?' · '+hrs(ch)+' cobrables':' · dentro de las '+STBY_FREE+' h libres'),h:r.stbH,exp:ch*(STBY_RATE[r.type]||0)};},
  d:function(L: any){return '<b>'+moneyS(sum(L,'exp'))+'</b> de sobrecosto';}},
 {id:'rstb',t:'Riesgo de stand by',lv:2,
  rule:'TR Detenida, o TR Sin iniciar con más de '+AL_P.STBY_RISK_LATE_H+' h desde la salida programada (el vehículo está en sitio y no se mueve).',
  test:function(r: any){
    if(r.st==='det')return{why:'Detenido '+hrs(r.detH)+' · '+r.detWhy.toLowerCase(),h:r.detH,exp:Math.max(0,r.detH-STBY_FREE)*(STBY_RATE[r.type]||0)};
    if(r.st==='sin'&&r.plan<NOW_T){var h=(NOW_T-r.plan)/36e5;if(h>AL_P.STBY_RISK_LATE_H)return{why:'Debía iniciar '+fdt(r.plan)+' · '+hrs(h)+' sin moverse',h:h,exp:Math.max(0,h-STBY_FREE)*(STBY_RATE[r.type]||0)};}
    return null;},
  d:function(L: any){var n=L.filter(function(a: any){return a.r.st==='det';}).length;return '<b>'+n+'</b> detenidos · <b>'+(L.length-n)+'</b> sin iniciar';}},
 {id:'etd',t:'Riesgo de retraso en la salida',ts:'Riesgo de retraso',lv:2,
  rule:'TR sin vehículo asignado (Esperando proveedor o Asignando vehículo) a menos de '+AL_P.ETD_WINDOW_H+' h de la salida pedida por el cliente, o con la salida ya vencida.',
  test:function(r: any){if(r.st!=='esp'&&r.st!=='asig')return null;var hh=(r.plan-NOW_T)/36e5;if(hh>=AL_P.ETD_WINDOW_H)return null;
    return{why:hh<0?'Salida vencida hace '+hrs(-hh)+' sin vehículo':'Sale en '+hrs(hh)+' sin '+(r.st==='esp'?'proveedor':'vehículo'),h:-hh,exp:0};},
  d:function(L: any){var v=L.filter(function(a: any){return a.h>0;}).length;return v?'<b>'+v+'</b> ya debían haber salido':'ninguna vencida';}},
 {id:'track',t:'Servicio sin seguimiento',lv:2,
  rule:'TR en curso (Cargando, En ruta, Descargando, Stand by o Detenido) sin seguimiento por más de '+AL_P.TRACK_SHORT_H+' h en viajes de hasta 1 día, o '+AL_P.TRACK_LONG_H+' h en viajes de más de 1 día. Cuenta como seguimiento: evento de la app (trip_tracking), novedad o comentario. Se notifica al analista responsable.',
  test:function(r: any){if(['carg','ruta','desc','stb','det'].indexOf(r.st)<0||r.lastMin==null)return null;
    var lim=(r.durH>AL_P.LONG_TRIP_H?AL_P.TRACK_LONG_H:AL_P.TRACK_SHORT_H)*60;if(r.lastMin<=lim)return null;
    return{why:'Sin seguimiento hace '+hrs(r.lastMin/60)+' · límite '+(lim/60)+' h (viaje de '+(r.durH>AL_P.LONG_TRIP_H?'más de 1 día':'1 día')+')'+(r.app?'':' · no usa la app'),h:r.lastMin/60,exp:0};},
  d:function(L: any){var n=L.filter(function(a: any){return !a.r.app;}).length;return '<b>'+n+'</b> no usan la app';}},
 {id:'noresp',t:'Solicitud sin respuesta',lv:3,
  rule:'TR en Esperando proveedor con carrier_request enviado hace más de '+AL_P.NORESP_H+' h sin oferta ni rechazo de ningún proveedor invitado.',
  test:function(r: any){if(r.st!=='esp'||!r.invAt)return null;var h=(NOW_T-r.invAt)/36e5;if(h<=AL_P.NORESP_H)return null;
    return{why:'Invitación enviada hace '+hrs(h)+' sin respuesta',h:h,exp:0};},
  d:function(L: any){var v=L.filter(function(a: any){return a.h>8;}).length;return '<b>'+v+'</b> llevan más de 8 h';}},
 {id:'prov',t:'Servicios en provisión',lv:3,src:'fin',
  rule:'TR finalizada hace más de '+AL_P.PROV_DAYS+' días que sigue en Por legalizar (no ha pasado a Por aceptar/Aceptada). Su valor queda como provisión sin soporte.',
  test:function(r: any){if(r.st!=='leg'||r.days<=AL_P.PROV_DAYS)return null;return{why:'Finalizó hace '+r.days.toFixed(1).replace('.',',')+' días y sigue por legalizar',h:r.days*24,exp:r.value};},
  d:function(L: any){return '<b>'+moneyS(sum(L,'exp'))+'</b> en provisión';}}];
var OPS_AL=OPS_RULES, RULE_ORD: any={};OPS_RULES.forEach(function(R,i){RULE_ORD[R.id]=i;});
// ícono de ordenador estándar de las tablas (chevrones arriba/abajo); d: 1 asc, -1 desc, 0 sin orden
function sortIco(d: any){return '<svg class="ar" viewBox="0 0 7 10" aria-hidden="true"><path class="'+(d>0?'on':'')+'" d="M3.5 0.5 6.5 4H0.5z"/><path class="'+(d<0?'on':'')+'" d="M3.5 9.5 0.5 6h6z"/></svg>';}
function renderOps(){
  var O=opsData(), byAl: any={};OPS_AL.forEach(function(a){byAl[a.id]=O.A.filter(function(x: any){return x.al===a.id;});});
  var open=O.ops.length+O.fin.length;
  document.getElementById('opsCount').textContent=int(open)+' TRs abiertas · corte '+fdt(NOW_T);
  // flujo de estados
  var h='';OPS_STAGES.forEach(function(g){var tot=0,html='';
    g.sts.forEach(function(x){var L=O.all.filter(function(r: any){return r.st===x[0];}), v=sum(L,'value');tot+=L.length;
      html+='<button class="ops-st '+x[2]+(OPSF.st&&OPSF.st.indexOf(x[0])>=0?' on':'')+'" data-st="'+x[0]+'" style="--sc:'+ST_COL[x[0]][0]+'" title="'+x[1]+': '+money(v)+' · Shift + clic para seleccionar varios"><i></i><span class="nm">'+x[1]+'</span><span class="n">'+int(L.length)+'</span><span class="v">'+moneyS(v)+'</span></button>';});
    h+='<div class="ops-stage"><h4>'+g.l+'<b>'+int(tot)+' TRs</b></h4><div class="ops-sts'+(g.c2?' c2':'')+'">'+html+'</div></div>';});
  document.getElementById('opsPipe').innerHTML=h;
  // alertas
  document.getElementById('opsAlerts').innerHTML=OPS_AL.map(function(a){var L=byAl[a.id];
    return '<button class="ops-al'+(OPSF.al===a.id?' on':'')+'" data-al="'+a.id+'" title="Criticidad '+LV[a.lv].t.toLowerCase()+' · '+esc(a.rule)+'" style="--lv:'+LV[a.lv].c+'"><span class="t"><span class="tt">'+a.t+'</span></span><span class="n">'+int(L.length)+'<small>TRs</small></span><span class="d">'+a.d(L)+'</span></button>';}).join('');
  // lista
  var rows;
  if(OPSF.st){rows=O.all.filter(function(r: any){return OPSF.st.indexOf(r.st)>=0;}).map(function(r: any){var a=O.A.filter(function(x: any){return x.r===r;}).sort(function(x: any,y: any){return (x.lv-y.lv)||(RULE_ORD[x.al]-RULE_ORD[y.al]);})[0];return a||{r:r,al:null,why:'',h:0,exp:0,hot:false};});}
  else if(OPSF.al)rows=byAl[OPSF.al].slice();
  else{var seen: any={};rows=O.A.slice().sort(function(a: any,b: any){return (a.lv-b.lv)||(RULE_ORD[a.al]-RULE_ORD[b.al]);}).filter(function(a: any){if(seen[a.r.id])return false;seen[a.r.id]=1;return true;});}
  var nAl: any={};O.A.forEach(function(a: any){nAl[a.r.id]=(nAl[a.r.id]||[]).concat(a);});
  var RANK: any={};OPS_RULES.forEach(function(R,i){RANK[R.id]=R.lv*10+i;});
  rows.forEach(function(a: any){trComments(a.r);});
  var crit=function(a: any,b: any){return ((RANK[a.al]||99)-(RANK[b.al]||99))||(b.exp-a.exp)||(b.h-a.h);};
  var STO: any={};var _i=0;OPS_STAGES.forEach(function(g){g.sts.forEach(function(x){STO[x[0]]=_i++;});});
  var OK: any={id:function(a: any){return a.r.id;},ruta:function(a: any){return (a.r.orig+' '+a.r.dest).toLowerCase();},prov:function(a: any){return (a.r.prov||'~').toLowerCase();},an:function(a: any){return (a.r.an||'~').toLowerCase();},st:function(a: any){return STO[a.r.st];},val:function(a: any){return a.r.value;},qp:function(a: any){return RANK[a.al]||99;}};
  if(OPSF.sort){var fk=OK[OPSF.sort.k],dd=OPSF.sort.d;rows.sort(function(a: any,b: any){var x=fk(a),y=fk(b);return (x<y?-1:x>y?1:0)*dd||crit(a,b);});}
  else rows.sort(crit);
  var oth=function(k: any,l: any,cls?: any){var on=OPSF.sort&&OPSF.sort.k===k;return '<th class="'+(cls||'')+(on?' sorted':'')+'" data-ok="'+k+'">'+l+sortIco(on?OPSF.sort.d:0)+'</th>';};
  var alName: any={};OPS_AL.forEach(function(a){alName[a.id]=a.t;});
  var stN=OPSF.st?OPSF.st.map(function(k: any){return OPS_ST_L[k];}):[];
  document.getElementById('opsListT').textContent=OPSF.st?'TRs · '+(stN.length>3?stN.length+' estados':stN.length>1?stN.slice(0,-1).join(', ')+' y '+stN[stN.length-1]:stN[0]):OPSF.al?alName[OPSF.al]:'TRs que requieren atención';
  document.getElementById('opsListN').innerHTML=int(rows.length)+' TRs'+(OPSF.st||OPSF.al?' · <a class="link" data-clr="1">ver todas las alertas</a>':' · más críticas primero')+(OPSF.st?' · <span style="color:var(--ink-4)">Shift + clic para sumar estados</span>':'');
  var t='<table class="ot"><colgroup><col style="width:9%"><col style="width:19%"><col class="h-sm" style="width:17%"><col class="h-sm" style="width:12%"><col class="c-st"><col style="width:10%"><col style="width:23%"></colgroup><thead><tr>'+oth('id','TR')+oth('ruta','Ruta')+oth('prov','Proveedor · conductor','h-sm')+oth('an','Analista','h-sm')+oth('st','Estado')+oth('val','Costo TR','r')+oth('qp','Qué pasa')+'</tr></thead><tbody>'+
    (rows.length?rows.map(function(a: any){var r=a.r, nc=trComments(r).length;OPS_IDX[r.id]=r;
      return '<tr><td><span class="tr-idw"><span class="tr-id">'+r.id+'</span><button class="cm-btn" data-cm="'+r.id+'" title="Ver comentarios de seguimiento" aria-label="Ver '+nc+' comentarios de la TR '+r.id+'"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/></svg><span>'+nc+'</span></button></span><span class="l2">'+esc(skLabel('type',r.type))+'</span></td>'+
        '<td><span class="l1" title="'+esc(r.orig+' → '+r.dest)+'">'+esc(r.orig)+' → '+esc(r.dest)+'</span><span class="l2">'+esc(USERS[r.user].name)+' · '+esc(r.psl)+'</span></td>'+
        '<td class="h-sm"><span class="l1">'+esc(r.prov||'Sin proveedor')+'</span><span class="l2">'+esc(r.drv?r.drv+(r.plate?' · '+r.plate:''):(r.st==='esp'?'Esperando ofertas':'—'))+'</span></td>'+
        (function(){var L=trComments(r),la=L[L.length-1];return '<td class="h-sm"><span class="l1">'+esc(r.an||'—')+'</span><span class="l2">Último seg. '+(la?fdt(la.at):'—')+'</span></td>';})()+
        '<td><span class="tag" style="background:'+ST_COL[r.st][0]+';color:'+ST_COL[r.st][1]+'">'+OPS_ST_L[r.st]+'</span></td>'+
        '<td class="r"><span class="l1" style="font-weight:600" title="'+money(r.value)+'">'+money(r.value)+'</span>'+'</td>'+
        (function(){if(!a.al)return '<td><span class="l1" style="color:var(--ink-3)">Sin alertas</span></td>';
          var R=OPS_RULES[RULE_ORD[a.al]], others=(nAl[r.id]||[]).filter(function(x: any){return x.al!==a.al;}),
          ex=(a.exp?(a.al==='prov'?'Provisión ':a.al==='stb'?'Sobrecosto ':'Exposición ')+moneyS(a.exp):''), d=(a.why||'—')+(ex?' · '+ex:'');
          return '<td><span class="l1"><span class="mc" title="Criticidad '+LV[R.lv].t.toLowerCase()+'"><i style="background:'+LV[R.lv].c+'"></i>'+R.t+'</span>'+(others.length?'<span class="mc-more" title="'+esc(others.map(function(x: any){return OPS_RULES[RULE_ORD[x.al]].t;}).join(' · '))+'">+'+others.length+'</span>':'')+'</span><span class="l2" title="'+esc(d)+'">'+d+'</span></td>';})()+
        '</tr>';}).join('')
    :'<tr><td colspan="7" style="text-align:center;color:var(--ink-3);height:107px">Nada que atender aquí</td></tr>')+'</tbody></table>';
  document.getElementById('opsWrap').innerHTML=t;
  OPS_LAST={rows:rows,nAl:nAl||{}};
  // uso de la app móvil (viajes del mes)
  var oct=D.T.filter(function(t: any){return t.m===CUR&&t.day<=ELAPSED-1;});
  var withApp=oct.filter(function(t: any){return t.appEv>0;}), evAvg=withApp.length?sum(withApp,'appEv')/withApp.length:0;
  var drvAll: any={},drvOn: any={};oct.forEach(function(t: any){drvAll[t.prov+'|'+t.drv]=1;if(t.appEv>0)drvOn[t.prov+'|'+t.drv]=1;});
  var pv: any={};oct.forEach(function(t: any){var o=pv[t.prov]||(pv[t.prov]={n:t.prov,c:0,a:0});o.c++;if(t.appEv>0)o.a++;});
  var pl=Object.keys(pv).map(function(k){return pv[k];}).sort(function(a,b){return a.a/a.c-b.a/b.c;});
  var ah='<h3>Uso de la app móvil</h3><div class="app-k">'+
    '<div><span>Viajes con reporte</span><b>'+pct(oct.length?withApp.length/oct.length:0)+'</b></div>'+
    '<div><span>Conductores activos</span><b>'+int(Object.keys(drvOn).length)+'<small style="font-size:14.5px;color:var(--ink-3);font-weight:500"> / '+int(Object.keys(drvAll).length)+'</small></b></div>'+
    '<div><span>Eventos por viaje</span><b>'+evAvg.toLocaleString('es-CO',{maximumFractionDigits:1})+'<small style="font-size:14.5px;color:var(--ink-3);font-weight:500"> / 6</small></b></div></div>'+
    '<div class="sub-h" style="margin:0 0 2px">Por proveedor · meta 80%</div>'+
    pl.map(function(o){var r=o.a/o.c;return '<div class="app-row"><span class="nm" title="'+esc(o.n)+'">'+esc(o.n)+'</span><span class="pc">'+pct(r)+'</span><span class="tk"><i class="'+(r<.8?'low':'')+'" style="width:'+(r*100)+'%"></i><b></b></span></div>';}).join('');
  document.getElementById('opsApp').innerHTML=ah;
}
/* ---- comentarios de seguimiento por TR (trip_tracking.comment / provider_comment, trip_timeline) ---- */
var OPS_IDX: any={}, CM_CACHE: any={};
// Bitácora de seguimiento de la TR (trip_tracking: eventos de la app, comentarios del analista y del proveedor).
// Fuente propuesta a futuro: tr_follow_up_comment (ver HU). Del más antiguo al más reciente.
function trComments(r: any){
  if(CM_CACHE[r.id])return CM_CACHE[r.id];
  return (CM_CACHE[r.id]=__D.COMMENTS[r.id]||[]);
}
var cmPop=document.getElementById('cmPop'), cmT: any=null, cmFor: any=null;
function cmHtml(r: any){var L=trComments(r);
  var col: any={'Analista':'var(--navy)','App conductor':'var(--pl-orange)','Llamada':'var(--sk4)','Proveedor':'var(--teal)','Facturación':'var(--violet)','Solicitante':'var(--sk3)'};
  return '<div class="cp-h"><b>TR '+r.id+' · Seguimiento</b><span>'+esc(r.orig)+' → '+esc(r.dest)+' · '+OPS_ST_L[r.st]+' · '+L.length+' comentarios</span></div>'+
    '<div class="cm-list" id="cmList">'+L.slice().reverse().map(function(c: any){var ini=c.who.split(' ').map(function(w: any){return w[0];}).slice(0,2).join('');
      return '<div class="cm-it"><span class="cm-av" style="background:'+(col[c.role]||'var(--sk5)')+'">'+esc(ini)+'</span><div class="cm-b"><div class="cm-h"><b>'+esc(c.who)+'</b><span class="cm-r">'+esc(c.role)+'</span><span class="cm-t">'+fdt(c.at)+'</span></div><div class="cm-x">'+esc(c.txt)+'</div>'+(c.att?'<div class="cm-att">'+c.att.map(function(a: any){return '<a class="cm-file" href="'+esc(a.u||'#')+'" target="_blank" rel="noopener" title="Abrir '+esc(a.n)+'"><span class="cm-fi k-'+a.k+'">'+(({pdf:'PDF',img:'JPG',xls:'XLS',mail:'MSG'} as any)[a.k])+'</span><span class="cm-fn">'+esc(a.n)+'</span><span class="cm-fs">'+(a.s||'')+'</span></a>';}).join('')+'</div>':'')+'</div></div>';}).join('')+'</div>';}
function showCm(btn: any){var r=OPS_IDX[+btn.dataset.cm];if(!r)return;clearTimeout(cmT);
  if(cmFor!==btn){cmFor=btn;cmPop.innerHTML=cmHtml(r);cmPop.hidden=false;
    var z=appZoom(), b=btn.getBoundingClientRect(), vw=innerWidth/z, vh=innerHeight/z, pw=cmPop.offsetWidth, ph=cmPop.offsetHeight, x=b.left/z, y=b.bottom/z+6;
    if(x+pw>vw-12)x=vw-12-pw; if(x<12)x=12;
    if(y+ph>vh-12){y=b.top/z-6-ph; if(y<12)y=12;}
    cmPop.style.left=x+'px';cmPop.style.top=y+'px';
    var l=document.getElementById('cmList');l.scrollTop=0;}}
function hideCmSoon(){clearTimeout(cmT);cmT=setTimeout(function(){cmPop.hidden=true;cmFor=null;},220);}
document.getElementById('ops').addEventListener('mouseover',function(e: any){var b=e.target.closest('[data-cm]');if(b)showCm(b);});
document.getElementById('ops').addEventListener('mouseout',function(e: any){var b=e.target.closest('[data-cm]');if(b&&!b.contains(e.relatedTarget))hideCmSoon();});
cmPop.addEventListener('mouseenter',function(){clearTimeout(cmT);});
cmPop.addEventListener('mouseleave',hideCmSoon);
document.getElementById('opsWrap').addEventListener('scroll',function(){cmPop.hidden=true;cmFor=null;});
// en el TMS la página hace scroll dentro del contenedor, no en window: se escucha en captura
document.addEventListener('scroll',function(){if(!cmPop.hidden){cmPop.hidden=true;cmFor=null;}},{passive:true,capture:true});
document.addEventListener('keydown',function(e: any){if(e.key==='Escape'&&!cmPop.hidden){cmPop.hidden=true;cmFor=null;}});

document.getElementById('ops').addEventListener('mousedown',function(e: any){if(e.shiftKey&&e.target.closest('.ops-st'))e.preventDefault();});
document.getElementById('ops').addEventListener('click',function(e: any){
  var cm=e.target.closest('[data-cm]');if(cm){showCm(cm);return;}
  var oh=e.target.closest('th[data-ok]');if(oh){var k=oh.dataset.ok;if(OPSF.sort&&OPSF.sort.k===k)OPSF.sort.d*=-1;else OPSF.sort={k:k,d:(k==='val'?-1:1)};renderOps();return;}
  var a=e.target.closest('[data-al]'), st=e.target.closest('[data-st]'), c=e.target.closest('[data-clr]');
  if(a){OPSF.al=OPSF.al===a.dataset.al?null:a.dataset.al;OPSF.st=null;}
  else if(st&&st.classList.contains('ops-st')){var k=st.dataset.st,cur=OPSF.st||[];
    if(e.shiftKey){var i=cur.indexOf(k);cur=cur.slice();if(i>=0)cur.splice(i,1);else cur.push(k);OPSF.st=cur.length?cur:null;}
    else OPSF.st=(cur.length===1&&cur[0]===k)?null:[k];
    OPSF.al=null;}
  else if(c){OPSF.al=null;OPSF.st=null;}
  else return;
  renderOps();});


/* ================= Descargas en Excel (mismo formato y lógica que la Torre de control de recaudo) ================= */
const xEsc: (v: any) => any=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'} as any)[c]).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'');
const xSerial: (d: any) => any=d=>(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours(),d.getMinutes())-Date.UTC(1899,11,30))/864e5;
const xCol: (i: any) => any=i=>{let t=''; i++; while(i){const m=(i-1)%26; t=String.fromCharCode(65+m)+t; i=(i-m-1)/26;} return t;};
const CRC=(()=>{const t=new Uint32Array(256); for(let n=0;n<256;n++){let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; t[n]=c>>>0;} return t;})();
const crc32: (b: any) => any=b=>{let c=0xFFFFFFFF; for(let i=0;i<b.length;i++) c=CRC[(c^b[i])&255]^(c>>>8); return (c^0xFFFFFFFF)>>>0;};
function zipStore(files: any){const enc=new TextEncoder(), parts: any=[], cen: any=[]; let off=0;
  const u16: (v: any) => any=v=>[v&255,(v>>>8)&255], u32: (v: any) => any=v=>[v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255];
  files.forEach(([name,txt]: any)=>{const nb=enc.encode(name), db=enc.encode(txt), c=crc32(db);
    const h=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(c),...u32(db.length),...u32(db.length),...u16(nb.length),...u16(0)]);
    parts.push(h,nb,db);
    cen.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(c),...u32(db.length),...u32(db.length),...u16(nb.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]),nb);
    off+=h.length+nb.length+db.length;});
  const cs=cen.reduce((a: any,b: any)=>a+b.length,0);
  const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(cs),...u32(off),...u16(0)]);
  return new Blob([...parts,...cen,end]);}
/* ============ Excel con formato Cashport ============
   libro({ sheets:[{ name, title, subtitle, cols:[{t, f, w?}], rows:[[...]], total?:[...] }], active? })
   f: s texto · n dinero (COP sin decimales) · p porcentaje · i entero · d fecha · dt fecha y hora
   Estilo: título en azul oscuro Cashport (#011822), línea naranja (#FF5500), encabezado azul oscuro con texto blanco,
   fila de total gris claro con borde naranja, encabezado fijo y autofiltro. */
const XS=(()=>{
  const list: any=[], idx: any={};
  const add=(k: any,o: any)=>{idx[k]=list.length; list.push(o);};
  add('def',{nf:0,font:0,fill:0,border:0});
  add('title',{nf:0,font:1,fill:0,border:0,v:'center'});
  add('sub',{nf:0,font:2,fill:0,border:0,v:'center'});
  add('line',{nf:0,font:0,fill:3,border:0});
  add('head',{nf:0,font:3,fill:2,border:0,v:'center',h:'center',wrap:1});
  add('headC',{nf:0,font:3,fill:2,border:0,v:'center',h:'center',wrap:1});
  add('headR',{nf:0,font:3,fill:2,border:0,v:'center',h:'center',wrap:1});
  add('kLbl',{nf:0,font:0,fill:0,border:1,v:'center',ind:1});
  const NF: any={s:0,n:164,p:9,i:3,d:165,dt:166,k:1,dd:167};
  Object.keys(NF).forEach(f=>{
    add('b'+f,{nf:NF[f],font:0,fill:0,border:1,v:'center',h:f==='s'?undefined:f==='k'?'center':'right',ind:f==='s'?1:0});
    add('t'+f,{nf:NF[f],font:4,fill:4,border:2,v:'center',h:f==='s'?undefined:'right',ind:f==='s'?1:0});
  });
  /* estados de acuerdo como "chips": mismo color que en el tablero */
  add('cCumplido',{nf:0,font:5,fill:5,border:1,v:'center',h:'center'});
  add('cIncumplido',{nf:0,font:6,fill:6,border:1,v:'center',h:'center'});
  add('cPendiente',{nf:0,font:7,fill:7,border:1,v:'center',h:'center'});
  add('bAlerta',{nf:3,font:6,fill:0,border:1,v:'center',h:'right'});
  return {list,idx};
})();
function libro(spec: {sheets: any[]; [k: string]: any}){
  // hojas de datos planas para filtrar y armar tablas dinámicas: sin fila de total (los totales van en el Resumen)
  const sheets: any[]=[resumenDe(spec)].concat(spec.sheets.map(sh=>Object.assign({},sh,{total:null})));
  const st: (k: any) => any=k=>XS.idx[k];
  const cellStr=(ref: any,v: any,s: any)=>'<c r="'+ref+'" s="'+s+'" t="inlineStr"><is><t xml:space="preserve">'+xEsc(v)+'</t></is></c>';
  const sheetXml=(sh: any,i: any)=>{
    if(sh.resumen) return resumenXml(sh,i);
    const nc=sh.cols.length, last=xCol(nc-1), H=1, first=H+1, lastRow=H+sh.rows.length+(sh.total?1:0);
    const cell=(v: any,f: any,ref: any,tot: any,col?: any)=>{let s=st((tot?'t':'b')+f);
      if(!tot&&col&&col.chip&&XS.idx['c'+v]!=null) s=st('c'+v);
      if(!tot&&col&&col.alerta&&typeof v==='number'&&v>=col.alerta) s=st('bAlerta');
      if(v==null||v===''||(typeof v==='number'&&!isFinite(v))) return '<c r="'+ref+'" s="'+s+'"/>';
      if(f==='d'||f==='dt') return '<c r="'+ref+'" s="'+s+'"><v>'+xSerial(v)+'</v></c>';
      if(typeof v==='number') return '<c r="'+ref+'" s="'+s+'"><v>'+(f==='n'?Math.round(v):v)+'</v></c>';
      return cellStr(ref,v,s);};
    let rows='';
    rows+='<row r="'+H+'" ht="32" customHeight="1">'+sh.cols.map((c: any,ci: any)=>cellStr(xCol(ci)+H,c.t,st(c.chip?'headC':c.f==='s'?'head':'headR'))).join('')+'</row>';
    sh.rows.forEach((r: any,ri: any)=>{const n=first+ri; rows+='<row r="'+n+'" ht="18" customHeight="1">'+r.map((v: any,ci: any)=>cell(v,sh.cols[ci].f,xCol(ci)+n,false,sh.cols[ci])).join('')+'</row>';});
    if(sh.total){const n=lastRow; rows+='<row r="'+n+'" ht="20" customHeight="1">'+sh.total.map((v: any,ci: any)=>cell(v,sh.cols[ci].f,xCol(ci)+n,true)).join('')+'</row>';}
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
      '<sheetPr><tabColor rgb="FF011822"/><pageSetUpPr fitToPage="1"/></sheetPr>'+
      '<sheetViews><sheetView workbookViewId="0" showGridLines="0"'+(i===0?' tabSelected="1"':'')+'><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews>'+
      '<sheetFormatPr defaultRowHeight="18"/><cols>'+sh.cols.map((c: any,ci: any)=>'<col min="'+(ci+1)+'" max="'+(ci+1)+'" width="'+(c.w||(c.f==='s'?24:15))+'" customWidth="1"/>').join('')+'</cols>'+
      '<sheetData>'+rows+'</sheetData>'+
      (sh.rows.length?'<autoFilter ref="A'+H+':'+last+(H+sh.rows.length)+'"/>':'')+
      '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>';
  };
  /* Hoja "Resumen": título, corte y filtros, indicadores totales y hojas incluidas. */
  const resumenXml=(sh: any,i: any)=>{
    let r=0, rows='';
    const row=(ht: any,cells: (n: any) => string)=>{r++; rows+='<row r="'+r+'"'+(ht?' ht="'+ht+'" customHeight="1"':'')+'>'+cells(r)+'</row>';};
    row(26,n=>cellStr('A'+n,sh.title,st('title')));
    row(18,n=>cellStr('A'+n,sh.subtitle||'',st('sub')));
    row(4,n=>'<c r="A'+n+'" s="'+st('line')+'"/><c r="B'+n+'" s="'+st('line')+'"/>');
    row(10,()=> '');
    row(24,n=>cellStr('A'+n,'Indicador',st('head'))+cellStr('B'+n,'Valor',st('head')));
    sh.items.forEach(([l,v,f]: any)=>row(18,n=>cellStr('A'+n,l,st('kLbl'))+(typeof v==='number'&&isFinite(v)?'<c r="B'+n+'" s="'+st('b'+f)+'"><v>'+(f==='n'?Math.round(v):v)+'</v></c>':cellStr('B'+n,v==null?'—':String(v),st('bs')))));
    if(sh.hojas&&sh.hojas.length){
      row(10,()=> '');
      row(24,n=>cellStr('A'+n,'Hoja',st('head'))+cellStr('B'+n,'Filas',st('head')));
      sh.hojas.forEach(([h,c]: any)=>row(18,n=>cellStr('A'+n,h,st('kLbl'))+'<c r="B'+n+'" s="'+st('bi')+'"><v>'+c+'</v></c>'));
    }
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
      '<sheetPr><tabColor rgb="FFFF5500"/><pageSetUpPr fitToPage="1"/></sheetPr>'+
      '<sheetViews><sheetView workbookViewId="0" showGridLines="0"'+(i===0?' tabSelected="1"':'')+'><selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>'+
      '<sheetFormatPr defaultRowHeight="18"/><cols><col min="1" max="1" width="36" customWidth="1"/><col min="2" max="2" width="22" customWidth="1"/></cols>'+
      '<sheetData>'+rows+'</sheetData><pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup orientation="portrait" fitToWidth="1" fitToHeight="0"/></worksheet>';
  };
  const safe: (n: any) => any=n=>n.replace(/[\\\/?*\[\]:]/g,' ').slice(0,31);
  const fonts=['<font><sz val="10"/><color rgb="FF011822"/><name val="Calibri"/><family val="2"/></font>',
    '<font><b/><sz val="14"/><color rgb="FF011822"/><name val="Calibri"/><family val="2"/></font>',
    '<font><sz val="10"/><color rgb="FF334455"/><name val="Calibri"/><family val="2"/></font>',
    '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font>',
    '<font><b/><sz val="10"/><color rgb="FF011822"/><name val="Calibri"/><family val="2"/></font>',
    '<font><b/><sz val="10"/><color rgb="FF5B6B00"/><name val="Calibri"/><family val="2"/></font>',
    '<font><b/><sz val="10"/><color rgb="FFD9434A"/><name val="Calibri"/><family val="2"/></font>',
    '<font><b/><sz val="10"/><color rgb="FF6B747A"/><name val="Calibri"/><family val="2"/></font>'];
  const fill: (c: any) => any=c=>'<fill><patternFill patternType="solid"><fgColor rgb="FF'+c+'"/><bgColor indexed="64"/></patternFill></fill>';
  const fills=['<fill><patternFill patternType="none"/></fill>','<fill><patternFill patternType="gray125"/></fill>',fill('011822'),fill('FF5500'),fill('E6ECEF'),fill('F2F9C6'),fill('FBE3E4'),fill('EDEEEF')];
  const borders=['<border><left/><right/><top/><bottom/><diagonal/></border>',
    '<border><left/><right/><top/><bottom style="thin"><color rgb="FFE4E4E7"/></bottom><diagonal/></border>',
    '<border><left/><right/><top style="medium"><color rgb="FFFF5500"/></top><bottom/><diagonal/></border>'];
  const xf: (o: any) => any=o=>'<xf numFmtId="'+o.nf+'" fontId="'+o.font+'" fillId="'+o.fill+'" borderId="'+o.border+'" xfId="0"'+(o.nf?' applyNumberFormat="1"':'')+' applyFont="1"'+(o.fill?' applyFill="1"':'')+(o.border?' applyBorder="1"':'')+
    ((o.h||o.v||o.wrap||o.ind)?' applyAlignment="1"><alignment'+(o.h?' horizontal="'+o.h+'"':(o.ind?' horizontal="left"':''))+(o.ind?' indent="'+o.ind+'"':'')+(o.v?' vertical="'+o.v+'"':'')+(o.wrap?' wrapText="1"':'')+'/></xf>':'/>');
  const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
    '<numFmts count="4"><numFmt numFmtId="164" formatCode="&quot;$&quot;\\ #,##0;[Red]\\-&quot;$&quot;\\ #,##0"/><numFmt numFmtId="165" formatCode="dd/mm/yyyy"/><numFmt numFmtId="166" formatCode="dd/mm/yyyy\\ hh:mm"/><numFmt numFmtId="167" formatCode="0.0"/></numFmts>'+
    '<fonts count="'+fonts.length+'">'+fonts.join('')+'</fonts><fills count="'+fills.length+'">'+fills.join('')+'</fills><borders count="'+borders.length+'">'+borders.join('')+'</borders>'+
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'+
    '<cellXfs count="'+XS.list.length+'">'+XS.list.map(xf).join('')+'</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  const ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+
    sheets.map((_,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')+
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>';
  const wb='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>'+
    sheets.map((s,i)=>'<sheet name="'+xEsc(safe(s.name))+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join('')+'</sheets><definedNames>'+
    sheets.map((s,i)=>!s.resumen&&s.rows.length?'<definedName name="_xlnm._FilterDatabase" localSheetId="'+i+'" hidden="1">\''+xEsc(safe(s.name)).replace(/'/g,"''")+'\'!$A$1:$'+xCol(s.cols.length-1)+'$'+(1+s.rows.length)+'</definedName>':'').join('')+
    sheets.map((s,i)=>s.resumen?'':'<definedName name="_xlnm.Print_Titles" localSheetId="'+i+'">\''+xEsc(safe(s.name)).replace(/'/g,"''")+'\'!$1:$1</definedName>').join('')+
    '</definedNames></workbook>';
  const rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
    sheets.map((_,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join('')+
    '<Relationship Id="rId'+(sheets.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
  return zipStore([['[Content_Types].xml',ct],
    ['_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml',wb],['xl/_rels/workbook.xml.rels',rels],['xl/styles.xml',styles]].concat(sheets.map((s,i)=>['xl/worksheets/sheet'+(i+1)+'.xml',sheetXml(s,i)])));
}
var MES_L=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function mesTxt(){var M=MONTHS[CUR];return MES_L[M.m].replace(/^./,function(c){return c.toUpperCase();})+' '+M.y;}
function subtituloExcel(){var f: any=[];FILTER_CATS.forEach(function(c){var v=S.f[c.id];if(v.length)f.push(c.name+': '+v.map(function(x: any){return labelOf(c.id,x);}).join(', '));});
  return 'Corte '+ddmmyyyy(TODAY)+' · '+(f.length?'Filtros: '+f.join(' · '):'Sin filtros');}
function resumenDe(spec: any){var main=spec.sheets[0], items=[[spec.reg||'Registros',main.rows.length,'i']];
  if(main.total)main.cols.forEach(function(c: any,ci: any){var v=main.total[ci];if(typeof v==='number'&&isFinite(v)&&c.f!=='s'&&c.f!=='k'&&!c.noRes)items.push([c.rt||c.t,v,c.f]);});
  return {resumen:true,name:'Resumen',title:spec.name+' · '+mesTxt(),subtitle:subtituloExcel(),items:items,hojas:spec.sheets.length>1?spec.sheets.map(function(x: any){return [x.name,x.rows.length];}):null};}
/* filas de "Distribución del costo" para una dimensión (aplica los filtros del tablero) */
function cdRowsFor(id: any){var g: any={};TRIPS.filter(function(t: any){return inF(t,true);}).forEach(function(t: any){if(t.m<CUR-3)return;var k=String(t[id]),o=g[k]||(g[k]={key:k,n:0,cost:0,ext:0,prev:0});
    if(t.m===CUR){o.n++;o.cost+=t.cost;o.ext+=t.sob+t.stb;}else o.prev+=t.cost;});
  return Object.keys(g).map(function(k){var o=g[k];o.name=skLabel(id,k);o.avg=o.prev/3;o.proj=o.cost*DAYS_CUR/ELAPSED;return o;}).filter(function(o){return o.n>0;}).sort(function(a,b){return b.cost-a.cost;});}
/* Libro de "Distribución del costo": una hoja por dimensión del selector, empezando por la que se está viendo */
function libroCompo(){
  var dims=[CD_DIMS.filter(function(d){return d.id===CD.dim;})[0]].concat(CD_DIMS.filter(function(d){return d.id!==CD.dim;}));
  var met=[{t:'Servicios',f:'i',w:11},{t:'Costo a hoy',f:'n',w:17},{t:'Participación',f:'p',w:12,noRes:1},{t:'Costo por servicio',f:'n',w:16},{t:'Sobrecostos y stand by',f:'n',w:17},{t:'% sobrecostos',f:'p',w:12},
    {t:'Proyección al cierre',f:'n',w:17},{t:'Promedio 3 meses',f:'n',w:17},{t:'Proyección vs 3 meses',f:'p',w:13}];
  var sub=subtituloExcel();
  var sheets=dims.map(function(d){var R=cdRowsFor(d.id),tn=0,tc=0,te=0,ta=0;R.forEach(function(o){tn+=o.n;tc+=o.cost;te+=o.ext;ta+=o.avg;});var tp=tc*DAYS_CUR/ELAPSED;
    var vals=function(n: any,c: any,e: any,p: any,a: any){return [n,c,tc?c/tc:null,n?c/n:null,e,c?e/c:null,p,a,a?p/a-1:null];};
    return {name:d.l,title:'Distribución del costo por '+d.l.toLowerCase()+' · '+mesTxt(),subtitle:sub,cols:[{t:d.l,f:'s',w:30}].concat(met),
      rows:R.map(function(o){return [o.name].concat(vals(o.n,o.cost,o.ext,o.proj,o.avg));}),total:R.length?['Total'].concat(vals(tn,tc,te,tp,ta)):null};});
  return {name:'Distribución del costo',reg:'Filas ('+dims[0].l+')',sheets:sheets};
}
/* Libro de "TRs que requieren atención": las filas que se ven en la tabla (filtros, estados o alerta elegidos y orden) */
var OPS_LAST: any={rows:[],nAl:{}};
function libroOps(){var L=OPS_LAST.rows, title=document.getElementById('opsListT').textContent;
  var cols=[{t:'TR',f:'k',w:10},{t:'Tipo de servicio',f:'s',w:16},{t:'Origen',f:'s',w:22},{t:'Destino',f:'s',w:22},{t:'Solicitante',f:'s',w:20},{t:'PSL',f:'s',w:16},
    {t:'Proveedor',f:'s',w:22},{t:'Conductor',f:'s',w:20},{t:'Placa',f:'s',w:10},{t:'Analista',f:'s',w:18},{t:'Último seguimiento',f:'dt',w:17},{t:'Estado',f:'s',w:18},
    {t:'Costo TR',f:'n',w:15},{t:'Alerta',f:'s',w:26},{t:'Criticidad',f:'s',w:11},{t:'Qué pasa',f:'s',w:46},{t:'Otras alertas',f:'s',w:30},{t:'Exposición',f:'n',w:15,rt:'Exposición total'}];
  var tc=0,te=0;
  var rows=L.map(function(a: any){var r=a.r,C=trComments(r),la=C[C.length-1],R=a.al?OPS_RULES[RULE_ORD[a.al]]:null,oth=(OPS_LAST.nAl[r.id]||[]).filter(function(x: any){return x.al!==a.al;});
    tc+=r.value||0;te+=a.exp||0;
    return [r.id,skLabel('type',r.type),r.orig,r.dest,USERS[r.user]?USERS[r.user].name:'',r.psl,r.prov||'Sin proveedor',r.drv||'',r.plate||'',r.an||'',la?la.at:null,OPS_ST_L[r.st],
      r.value,R?R.t:'Sin alertas',R?LV[R.lv].t:'',a.why||'',oth.map(function(x: any){return OPS_RULES[RULE_ORD[x.al]].t;}).join(' · '),a.exp||null];});
  return {name:'TRs que requieren atención',reg:'TRs',sheets:[{name:'TRs',title:title+' · corte '+fdt(NOW_T),subtitle:subtituloExcel(),cols:cols,rows:rows,
    total:rows.length?['Total',rows.length+' TRs','','','','','','','','',null,'',tc,'','','','',te]:null}]};
}
/* Libro de "Utilización de cupos de contrato" (vigencia de 12 meses en el prototipo) */
var CT_LAST: any=[];
function libroCt(){var L=CT_LAST,tt=0,tu=0;
  var cols=[{t:'Proveedor',f:'s',w:26},{t:'Contrato',f:'s',w:15},{t:'Valor del contrato',f:'n',w:18},{t:'Ejecutado',f:'n',w:18},{t:'Saldo',f:'n',w:18},{t:'% cupo usado',f:'p',w:12},
    {t:'% vigencia transcurrida',f:'p',w:13},{t:'Inicio',f:'d',w:12},{t:'Vencimiento',f:'d',w:12},{t:'Días para vencer',f:'i',w:11},{t:'Alerta',f:'s',w:30}];
  var rows=L.map(function(c: any){var st=c.start;tt+=c.total;tu+=c.used;
    var al=[];if(c.pu-c.tp>.1)al.push('Consumo adelantado');if(c.pu>=.85)al.push('Cupo ≥ 85%');if(c.dEnd<=60)al.push('Vence en ≤ 60 días');else if(c.dEnd<=120)al.push('Vence en ≤ 120 días');
    return [c.c,c.desc,c.total,c.used,Math.max(0,c.total-c.used),c.pu,c.tp,st,c.end,c.dEnd,al.join(' · ')];});
  return {name:'Utilización de cupos de contrato',reg:'Contratos',sheets:[{name:'Contratos',cols:cols,rows:rows,total:rows.length?['Total',rows.length+' contratos',tt,tu,Math.max(0,tt-tu),tt?tu/tt:null,null,null,null,null,'']:null}]};
}
/* Libro de "Proveedores y adjudicación" (mes actual, con filtros) */
function libroCar(){var P=D.provs,tc=0,tk=0,to=0,tn=0;P.forEach(function(p: any){tc+=p.cost;tk+=p.km;to+=p.out;tn+=p.cnt;});
  var cols=[{t:'Proveedor',f:'s',w:26},{t:'Servicios',f:'i',w:11},{t:'Costo',f:'n',w:17},{t:'% del costo',f:'p',w:11,noRes:1},{t:'Km recorridos',f:'i',w:13},{t:'Costo por km',f:'n',w:13},
    {t:'Costo fuera de contrato',f:'n',w:18},{t:'% fuera de contrato',f:'p',w:13}];
  var rows=P.map(function(p: any){return [p.n,p.cnt,p.cost,tc?p.cost/tc:null,Math.round(p.km),p.km?p.cost/p.km:null,p.out,p.cost?p.out/p.cost:null];});
  var m=D.mods,mt=m.contrato+m.subasta+m.tercerizacion;
  var mod={name:'Modalidad',cols:[{t:'Modalidad',f:'s',w:22},{t:'Costo',f:'n',w:17},{t:'% del costo',f:'p',w:11,noRes:1}],
    rows:[['Tarifa de contrato',m.contrato,mt?m.contrato/mt:null],['Subasta',m.subasta,mt?m.subasta/mt:null],['Tercerización',m.tercerizacion,mt?m.tercerizacion/mt:null]],total:mt?['Total',mt,1]:null};
  return {name:'Proveedores y adjudicación',reg:'Proveedores',sheets:[{name:'Proveedores',cols:cols,rows:rows,
    total:rows.length?['Total',tn,tc,1,Math.round(tk),tk?tc/tk:null,to,tc?to/tc:null]:null},mod]};
}
/* Libro de "Desempeño de proveedores": mismo orden que la tabla; total con promedios ponderados */
var PK_LAST: any=[];
function libroPk(){var L=PK_LAST,tn=0,tc=0,te=0,tr=0,ta=0,to=0,trn=0,ton=0;
  L.forEach(function(r: any){tn+=r.cnt;tc+=r.cost;te+=r.ext*r.cost;ta+=r.app*r.cnt;
    if(r.resp!=null){tr+=r.resp*r.cnt;trn+=r.cnt;} if(r.ontime!=null){to+=r.ontime*r.cnt;ton+=r.cnt;}});
  var cols=[{t:'Proveedor',f:'s',w:26},{t:'Servicios',f:'i',w:11},{t:'Costo',f:'n',w:17},{t:'Tiempo de respuesta (h)',f:'dd',w:14,rt:'Tiempo de respuesta promedio (h)'},{t:'% sobrecostos',f:'p',w:12},{t:'% uso app móvil',f:'p',w:12},{t:'% servicios a tiempo',f:'p',w:13}];
  var rows=L.map(function(r: any){return [r.n,r.cnt,r.cost,r.resp,r.ext,r.app,r.ontime];});
  return {name:'Desempeño de proveedores',reg:'Proveedores',sheets:[{name:'Proveedores',cols:cols,rows:rows,
    total:rows.length?['Total',tn,tc,trn?tr/trn:null,tc?te/tc:null,tn?ta/tn:null,ton?to/ton:null]:null}]};
}
var EXP: any={compo:libroCompo,ops:libroOps,ct:libroCt,car:libroCar,pk:libroPk};
// descarga normal del navegador: libro() arma el .xlsx como Blob
var DLNS={save:function(o: any){var url=URL.createObjectURL(o.data),a=__doc.createElement('a');a.href=url;a.download=o.filename;
  __doc.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);}};
document.querySelectorAll('.dl').forEach(function(b){b.hidden=false;});
document.addEventListener('click',function(e: any){var b=e.target.closest('.dl');if(!b)return;var fx=EXP[b.dataset.x];if(!fx)return;
  var x=fx(), name=(x.name+' '+mesTxt()).replace(/[\\\/:*?"<>|]/g,'-')+'.xlsx';
  b.classList.add('busy');
  try{DLNS.save({filename:name,data:libro(x)});}
  finally{b.classList.remove('busy');}
});

/* ---- CashportAI Insights: se generan solo cuando se piden ---- */
var aiOv=document.getElementById('aiOv');
function openAI(){
  aiOv.innerHTML='<div class="modal ai-modal" role="dialog" aria-modal="true" aria-labelledby="aiT"><div class="m-head"><div><h3 id="aiT" style="display:flex;align-items:center;gap:7px"><svg viewBox="0 0 24 24"><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/></svg>CashportAI Insights</h3><p>Qué está subiendo el costo y qué no lo deja bajar'+(fCount()?' · con los filtros aplicados':'')+'</p></div><button class="m-x" data-close aria-label="Cerrar">×</button></div>'+
    '<div id="insight"><div class="ai-load"><span class="ai-dots"><i></i><i></i><i></i></span>Analizando costos, usuarios y adjudicación…</div></div></div>';
  aiOv.hidden=false;lockScroll(true);
  setTimeout(function(){var el=document.getElementById('insight');if(el)el.innerHTML=aiInsight();},900);
}
function closeAI(){aiOv.hidden=true;aiOv.innerHTML='';lockScroll(false);}
document.addEventListener('click',function(e: any){if(e.target.closest('#aiBtn'))openAI();});
aiOv.addEventListener('click',function(e: any){if(e.target===aiOv||e.target.closest('[data-close]'))closeAI();});
document.addEventListener('keydown',function(e: any){if(e.key==='Escape'&&!aiOv.hidden)closeAI();});

/* ---- tema (Claro / Oscuro / Sistema = colores del cliente, Halliburton) ----
   Se elige en el menú del avatar del TMS (DESIGN.md §4.9); el componente lo pasa en opciones.tema y lo cambia con setTema. */
function setTheme(t: any){ __doc.querySelectorAll('.torre').forEach(function(el){el.setAttribute('data-theme',t==='system'?'hal':t);});
  renderChart(); renderSankey(); }
var rt: any;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){renderChart();renderSankey();},120);});

render();
setTheme((opciones&&opciones.tema)||'system');

return {setTema:setTheme, desmontar:function(){__ac.abort();clearTimeout(rt);clearTimeout(cmT);lockScroll(false);}};
}
interface TorreOpciones { tema?: 'light' | 'dark' | 'system'; recargar?: () => void }
interface TorreDoc {
  getElementById(i: string): any;
  querySelectorAll(s: string): NodeListOf<any>;
  body: HTMLElement;
  documentElement: HTMLElement;
  addEventListener(t: string, f: (this: any, e: any) => void, o?: any): void;
}
