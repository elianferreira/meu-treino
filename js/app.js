/* Meu Treino — app */
'use strict';

const KEY = 'meutreino.v1';
const S = { cfg:null, plano:null, hist:[], sessao:null, cargas:{}, tela:'hoje', ctx:{}, onb:{ passo:0, resp:{ evitar:[] } } };

/* ---------------- armazenamento ---------------- */
function salvar(){
  try { localStorage.setItem(KEY, JSON.stringify({ cfg:S.cfg, plano:S.plano, hist:S.hist, sessao:S.sessao, cargas:S.cargas })); }
  catch(e){ console.warn('não deu para salvar', e); }
}
function carregar(){
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '{}');
    S.cfg = d.cfg || null; S.plano = d.plano || null; S.hist = d.hist || [];
    S.sessao = d.sessao || null; S.cargas = d.cargas || {};
  } catch(e){ console.warn('dados corrompidos, começando do zero', e); }
}

/* ---------------- utilidades ---------------- */
const $ = s => document.querySelector(s);
const exPorId = id => EX.find(e => e.id === id);
function h(s){ return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function hoje(){ const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function dataBR(iso){ const [a,m,d] = iso.split('-'); return d+'/'+m; }
function plural(n, um, muitos){ return n + ' ' + (n === 1 ? um : muitos); }

/* ---------------- qual treino vem agora ---------------- */
function proximoDia(){
  if (!S.plano) return 0;
  if (S.sessao) return S.sessao.diaIdx;
  const ultimo = S.hist[0];
  if (!ultimo) return 0;
  return (ultimo.diaIdx + 1) % S.plano.dias.length;
}
function treinosDaSemana(){
  const limite = Date.now() - 7*864e5;
  return S.hist.filter(s => s.ts >= limite);
}

/* ---------------- animação do movimento ---------------- */
function palcoHTML(ex){
  if (!MOV[ex.id]) return '';
  return '<div class="palco"><span class="tag">Execução</span>'
    + '<canvas data-anim="' + ex.id + '"></canvas>'
    + '<button class="pausa" data-act="pausar">❚❚</button></div>'
    + '<div class="legenda"><span class="ponto"></span> Em vermelho, o músculo que trabalha no movimento.</div>';
}
function thumbHTML(id){
  return MOV[id] ? '<canvas class="thumb" data-thumb="' + id + '"></canvas>'
                 : '<span class="badge">–</span>';
}

/* desenha as miniaturas e liga a animação grande depois de cada render */
let animAtual = null;
function montarCanvas(){
  if (animAtual) { animAtual.parar(); animAtual = null; }
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  document.querySelectorAll('canvas[data-thumb]').forEach(cv => {
    const m = MOV[cv.dataset.thumb]; if (!m) return;
    cv.width = CENA.larg * dpr; cv.height = CENA.alt * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr);
    quadro(c, m, .62);
  });
  const grande = document.querySelector('canvas[data-anim]');
  if (grande && MOV[grande.dataset.anim]) animAtual = tocar(grande, MOV[grande.dataset.anim]);
}

/* ---------------- onboarding ---------------- */
const PASSOS = [
  { k:'objetivo', titulo:'Qual é o seu objetivo?', sub:'Isso define séries, repetições e descanso.', ops:[
    { v:'hipertrofia', t:'Ganhar massa muscular', d:'Séries de 8 a 12 repetições, descanso médio' },
    { v:'emagrecimento', t:'Emagrecer', d:'Mais repetições, descanso curto e cardio no fim' },
    { v:'forca', t:'Ganhar força', d:'Poucas repetições com carga alta e descanso longo' },
    { v:'condicionamento', t:'Condicionamento e saúde', d:'Treino equilibrado, ritmo moderado' } ] },
  { k:'nivel', titulo:'Qual é a sua experiência?', sub:'Define a dificuldade dos exercícios e o volume.', num:true, ops:[
    { v:1, t:'Iniciante', d:'Nunca treinei ou parei há mais de 6 meses' },
    { v:2, t:'Intermediário', d:'Treino com alguma constância há mais de 6 meses' },
    { v:3, t:'Avançado', d:'Treino há anos e conheço bem os movimentos' } ] },
  { k:'dias', titulo:'Quantos dias por semana?', sub:'Seja realista: constância vale mais que volume.', num:true, ops:[
    { v:2, t:'2 dias', d:'Corpo inteiro A / B' },
    { v:3, t:'3 dias', d:'Corpo inteiro ou empurrar/puxar/pernas' },
    { v:4, t:'4 dias', d:'Superior / inferior' },
    { v:5, t:'5 dias', d:'Divisão completa' },
    { v:6, t:'6 dias', d:'Empurrar/puxar/pernas duas vezes' } ] },
  { k:'local', titulo:'Onde você vai treinar?', sub:'Só entram exercícios que você consegue fazer.', ops:[
    { v:'academia', t:'Academia completa', d:'Barras, máquinas e polias' },
    { v:'casa', t:'Em casa com equipamento', d:'Halteres, elástico ou banco' },
    { v:'corpo', t:'Só o peso do corpo', d:'Sem nenhum equipamento' } ] },
  { k:'duracao', titulo:'Quanto tempo por treino?', sub:'Sem contar o deslocamento.', num:true, ops:[
    { v:30, t:'30 minutos', d:'Treino enxuto, direto ao ponto' },
    { v:45, t:'45 minutos', d:'Equilíbrio entre tempo e volume' },
    { v:60, t:'60 minutos', d:'Treino completo' },
    { v:75, t:'75 minutos ou mais', d:'Volume alto' } ] },
  { k:'evitar', titulo:'Alguma dor ou limitação?', sub:'Opcional. Vou tirar os exercícios de maior risco.', multi:true, ops:[
    { v:'joelho', t:'Joelho', d:'Sem agachamentos profundos e afundos' },
    { v:'lombar', t:'Coluna lombar', d:'Sem terra, remada curvada e stiff' },
    { v:'ombro', t:'Ombro', d:'Sem mergulho, desenvolvimento militar e pullover' } ] }
];

function telaOnboarding(){
  const p = PASSOS[S.onb.passo];
  const r = S.onb.resp;
  const sel = r[p.k];
  const opcoes = p.ops.map(o => {
    const on = p.multi ? (sel || []).includes(o.v) : sel === o.v;
    return '<button class="opt' + (on ? ' on' : '') + '" data-act="onb-set" data-v="' + o.v + '">'
      + '<span class="mark">' + (on ? '✓' : '') + '</span>'
      + '<span class="grow"><span class="t">' + o.t + '</span><span class="d">' + o.d + '</span></span></button>';
  }).join('');
  const podeSeguir = p.multi || sel !== undefined;
  const ultimo = S.onb.passo === PASSOS.length - 1;
  return '<div class="wrap fade" style="padding-top:18px">'
    + '<div class="prog" style="margin-bottom:18px"><i style="width:' + Math.round((S.onb.passo)/PASSOS.length*100) + '%"></i></div>'
    + '<h1>' + p.titulo + '</h1><p class="dim sm" style="margin:6px 0 18px">' + p.sub + '</p>'
    + '<div class="opts">' + opcoes + '</div>'
    + '<div style="height:18px"></div>'
    + '<button class="btn" data-act="onb-next"' + (podeSeguir ? '' : ' disabled style="opacity:.4"') + '>'
    + (ultimo ? 'Montar minha rotina' : 'Continuar') + '</button>'
    + (S.onb.passo ? '<button class="btn ghost" data-act="onb-back" style="margin-top:9px">Voltar</button>' : '')
    + '<div style="height:30px"></div></div>';
}

/* ---------------- tela: hoje ---------------- */
function telaHoje(){
  const idx = proximoDia();
  const dia = S.plano.dias[idx];
  const semana = treinosDaSemana();
  const emAndamento = !!S.sessao;
  const feitosIdx = new Set(semana.map(s => s.diaIdx));

  const lista = S.plano.dias.map((d, i) => {
    const feito = feitosIdx.has(i);
    return '<button class="exi" data-act="dia" data-i="' + i + '">'
      + '<span class="badge' + (i === idx ? ' acc' : '') + '">' + (feito ? '✓' : (i+1)) + '</span>'
      + '<span class="grow"><span class="n">' + h(d.nome) + '</span>'
      + '<span class="s">' + h(d.foco) + ' · ' + plural(d.exercicios.length,'exercício','exercícios') + '</span></span>'
      + '<span class="go">›</span></button>';
  }).join('');

  return '<div class="wrap fade" style="padding-top:16px">'
    + '<div class="card hero">'
    + (MOV[dia.exercicios[0].id] ? '<canvas class="fig" data-thumb="' + dia.exercicios[0].id + '"></canvas>' : '')
    + '<div class="xs dim">' + (emAndamento ? 'Treino em andamento' : 'Próximo treino') + '</div>'
    + '<h2 style="margin:6px 0 2px">' + h(dia.nome) + '</h2>'
    + '<div class="sm dim">' + h(dia.foco) + '</div>'
    + '<div class="row" style="gap:8px;margin:14px 0 16px">'
    + '<span class="chip">' + plural(dia.exercicios.length,'exercício','exercícios') + '</span>'
    + '<span class="chip">~' + dia.duracao + ' min</span>'
    + '<span class="chip">' + h(LABEL.objetivo[S.cfg.objetivo]) + '</span></div>'
    + '<button class="btn" data-act="iniciar" data-i="' + idx + '">' + (emAndamento ? 'Continuar treino' : 'Começar treino') + '</button>'
    + '<button class="btn ghost" data-act="dia" data-i="' + idx + '" style="margin-top:9px">Ver os exercícios</button>'
    + '</div>'
    + '<div class="grid2" style="margin-bottom:12px">'
    + '<div class="stat"><b>' + semana.length + '</b><span class="sm dim">treinos nos últimos 7 dias</span></div>'
    + '<div class="stat"><b>' + S.hist.length + '</b><span class="sm dim">treinos no total</span></div>'
    + '</div>'
    + '<div class="card"><div class="xs dim" style="margin-bottom:6px">Sua semana · ' + h(S.plano.split) + '</div>' + lista + '</div>'
    + (naoInstalado() ? cardInstalar() : '')
    + '</div>';
}

function naoInstalado(){
  return !(window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
}
function cardInstalar(){
  return '<div class="card tight"><div class="row"><span class="badge">📱</span><span class="grow">'
    + '<span class="sm" style="font-weight:650">Instale na tela de início</span><br>'
    + '<span class="sm dim">No Safari: botão Compartilhar → Adicionar à Tela de Início.</span></span></div></div>';
}

/* ---------------- tela: dia ---------------- */
function telaDia(){
  const i = S.ctx.dia, dia = S.plano.dias[i];
  const lista = dia.exercicios.map(e => {
    const ex = exPorId(e.id);
    return '<button class="exi" data-act="ex" data-id="' + e.id + '" data-volta="dia">'
      + thumbHTML(e.id)
      + '<span class="grow"><span class="n">' + h(e.nome) + '</span>'
      + '<span class="s">' + e.series + ' x ' + e.reps + ' · descanso ' + e.descanso + 's'
      + (e.obs ? ' · ' + h(e.obs) : '') + '</span></span><span class="go">›</span></button>';
  }).join('');
  return '<div class="wrap fade" style="padding-top:16px">'
    + '<div class="card"><div class="xs dim">' + h(dia.foco) + '</div>'
    + '<h2 style="margin:6px 0 10px">' + h(dia.nome) + '</h2>'
    + '<div class="row" style="gap:8px"><span class="chip">~' + dia.duracao + ' min</span>'
    + '<span class="chip">' + plural(dia.exercicios.length,'exercício','exercícios') + '</span></div></div>'
    + '<div class="card tight"><div class="xs dim" style="margin-bottom:4px">Aquecimento</div>'
    + '<div class="sm">' + h(dia.aquecimento) + '</div></div>'
    + '<div class="card">' + lista + '</div>'
    + '<button class="btn" data-act="iniciar" data-i="' + i + '">Começar este treino</button>'
    + '<div style="height:20px"></div></div>';
}

/* ---------------- tela: exercício ---------------- */
function telaEx(){
  const ex = exPorId(S.ctx.ex);
  if (!ex) return '<div class="empty">Exercício não encontrado.</div>';
  const carga = S.cargas[ex.id];
  return '<div class="wrap fade" style="padding-top:16px">'
    + palcoHTML(ex)
    + '<h2 style="margin:16px 0 4px">' + h(ex.nome) + '</h2>'
    + '<div class="sm dim" style="margin-bottom:14px">' + h(ex.musculos) + '</div>'
    + (carga ? '<div class="card tight"><span class="xs dim">Última carga registrada</span><br><b>' + h(carga.peso) + ' kg × ' + h(carga.reps) + ' repetições</b></div>' : '')
    + '<div class="card"><div class="xs dim" style="margin-bottom:10px">Como executar</div>'
    + '<ol class="steps">' + ex.exec.map(p => '<li>' + h(p) + '</li>').join('') + '</ol></div>'
    + '<div class="card"><div class="xs dim" style="margin-bottom:10px">Erros comuns</div>'
    + '<ul class="errs">' + ex.erros.map(p => '<li>' + h(p) + '</li>').join('') + '</ul></div>'
    + '<a class="sm dim" style="display:block;text-align:center;padding:6px 0" target="_blank" rel="noopener" href="'
    + 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.q || ex.nome) + '">Quer ver alguém fazendo? Buscar no YouTube ↗</a>'
    + '<div style="height:20px"></div></div>';
}

/* ---------------- tela: treino em execução ---------------- */
function telaTreino(){
  const s = S.sessao, dia = S.plano.dias[s.diaIdx];
  let feitas = 0, total = 0;
  dia.exercicios.forEach(e => { const arr = s.series[e.id] || []; total += arr.length; feitas += arr.filter(x => x.ok).length; });
  const pct = total ? Math.round(feitas/total*100) : 0;

  const cards = dia.exercicios.map((e, ei) => {
    const arr = s.series[e.id] || [];
    const ex = exPorId(e.id);
    const ultima = S.cargas[e.id];
    const porTempo = ex && ex.tempo;
    const linhas = arr.map((set, i) =>
      '<div class="serie"><span class="num">' + (i+1) + 'ª</span>'
      + (porTempo
        ? '<input class="inp" inputmode="numeric" placeholder="seg" data-f="reps" data-ex="' + e.id + '" data-i="' + i + '" value="' + h(set.reps) + '"><span class="unit">seg</span>'
        : '<input class="inp" inputmode="decimal" placeholder="' + (ultima ? h(ultima.peso) : 'peso') + '" data-f="peso" data-ex="' + e.id + '" data-i="' + i + '" value="' + h(set.peso) + '"><span class="unit">kg</span>'
          + '<input class="inp" inputmode="numeric" placeholder="' + (ultima ? h(ultima.reps) : 'reps') + '" data-f="reps" data-ex="' + e.id + '" data-i="' + i + '" value="' + h(set.reps) + '"><span class="unit">reps</span>')
      + '<button class="tick' + (set.ok ? ' on' : '') + '" data-act="tick" data-ex="' + e.id + '" data-i="' + i + '" data-desc="' + e.descanso + '">✓</button></div>').join('');
    return '<div class="card"><div class="row" style="margin-bottom:8px">'
      + '<button data-act="ex" data-id="' + e.id + '" data-volta="treino" style="display:flex">' + thumbHTML(e.id) + '</button>'
      + '<div class="grow"><h3>' + (ei+1) + '. ' + h(e.nome) + '</h3>'
      + '<span class="sm dim">' + e.series + ' x ' + e.reps + (e.obs ? ' · ' + h(e.obs) : '') + '</span></div>'
      + '<span class="go" data-act="ex" data-id="' + e.id + '" data-volta="treino">›</span></div>'
      + linhas + '</div>';
  }).join('');

  return '<div class="wrap fade" style="padding-top:16px">'
    + '<div class="card tight"><div class="row between" style="margin-bottom:8px">'
    + '<span class="sm" style="font-weight:650">' + h(dia.nome) + '</span>'
    + '<span class="sm dim">' + feitas + ' de ' + total + ' séries</span></div>'
    + '<div class="prog"><i style="width:' + pct + '%"></i></div></div>'
    + cards
    + '<button class="btn" data-act="concluir">Concluir treino</button>'
    + '<button class="btn danger" data-act="abandonar" style="margin-top:9px">Cancelar treino</button>'
    + '<div style="height:24px"></div></div>';
}

/* ---------------- tela: plano ---------------- */
function telaPlano(){
  const c = S.cfg;
  const dias = S.plano.dias.map((d, i) =>
    '<button class="exi" data-act="dia" data-i="' + i + '"><span class="badge">' + (i+1) + '</span>'
    + '<span class="grow"><span class="n">' + h(d.nome) + '</span><span class="s">'
    + d.exercicios.map(e => h(e.nome)).join(' · ') + '</span></span><span class="go">›</span></button>').join('');
  return '<div class="wrap fade" style="padding-top:16px">'
    + '<div class="card"><div class="xs dim">Divisão</div><h2 style="margin:6px 0 12px">' + h(S.plano.split) + '</h2>'
    + '<div class="row" style="gap:8px;flex-wrap:wrap">'
    + '<span class="chip">' + h(LABEL.objetivo[c.objetivo]) + '</span>'
    + '<span class="chip">' + h(LABEL.nivel[c.nivel]) + '</span>'
    + '<span class="chip">' + c.dias + 'x por semana</span>'
    + '<span class="chip">' + h(LABEL.local[c.local]) + '</span>'
    + '<span class="chip">' + c.duracao + ' min</span>'
    + (c.evitar && c.evitar.length ? '<span class="chip">evitando: ' + h(c.evitar.join(', ')) + '</span>' : '')
    + '</div></div>'
    + '<div class="card">' + dias + '</div>'
    + '<button class="btn ghost" data-act="variar">Gerar outra variação dos exercícios</button>'
    + '<button class="btn ghost" data-act="refazer" style="margin-top:9px">Refazer o questionário</button>'
    + '<div style="height:20px"></div></div>';
}

/* ---------------- tela: histórico ---------------- */
function telaHistorico(){
  if (!S.hist.length) return '<div class="wrap"><div class="empty"><div class="ico">📓</div>'
    + '<b>Nenhum treino registrado ainda</b><br><span class="sm">Quando terminar um treino, ele aparece aqui.</span></div></div>';
  const volTotal = S.hist.reduce((a,s) => a + (s.volume || 0), 0);
  const itens = S.hist.map(s =>
    '<div class="exi"><span class="badge">' + dataBR(s.data) + '</span>'
    + '<span class="grow"><span class="n">' + h(s.diaNome) + '</span><span class="s">'
    + plural(s.series,'série','séries') + ' · ' + s.duracaoMin + ' min'
    + (s.volume ? ' · ' + Math.round(s.volume).toLocaleString('pt-BR') + ' kg de volume' : '') + '</span></span></div>').join('');
  return '<div class="wrap fade" style="padding-top:16px">'
    + '<div class="grid2" style="margin-bottom:12px">'
    + '<div class="stat"><b>' + S.hist.length + '</b><span class="sm dim">treinos concluídos</span></div>'
    + '<div class="stat"><b>' + Math.round(volTotal/1000) + ' t</b><span class="sm dim">peso total levantado</span></div></div>'
    + '<div class="card">' + itens + '</div><div style="height:20px"></div></div>';
}

/* ---------------- tela: ajustes ---------------- */
function telaAjustes(){
  return '<div class="wrap fade" style="padding-top:16px">'
    + cardInstalar()
    + '<div class="card"><div class="xs dim" style="margin-bottom:10px">Rotina</div>'
    + '<button class="btn ghost" data-act="refazer">Refazer o questionário</button>'
    + '<button class="btn ghost" data-act="variar" style="margin-top:9px">Gerar outra variação</button></div>'
    + '<div class="card"><div class="xs dim" style="margin-bottom:10px">Meus dados</div>'
    + '<button class="btn ghost" data-act="backup">Copiar backup dos meus dados</button>'
    + '<button class="btn ghost" data-act="restaurar" style="margin-top:9px">Restaurar a partir de um backup</button>'
    + '<button class="btn danger" data-act="apagar" style="margin-top:9px">Apagar tudo e recomeçar</button></div>'
    + '<div class="card tight"><span class="sm dim">Este app guarda tudo no seu próprio iPhone. '
    + 'Nada é enviado para servidor nenhum. Os vídeos abrem direto do YouTube.</span></div>'
    + '<div class="card tight"><span class="sm dim">Este app não substitui a orientação de um profissional de educação física. '
    + 'Se sentir dor durante um exercício, pare.</span></div>'
    + '<div style="height:20px"></div></div>';
}

/* ---------------- descanso ---------------- */
let restFim = 0, restId = null;
function iniciarDescanso(seg){
  restFim = Date.now() + seg*1000;
  if (restId) clearInterval(restId);
  restId = setInterval(tickDescanso, 250);
  tickDescanso();
}
function pararDescanso(){ if (restId) clearInterval(restId); restId = null; restFim = 0; $('#rest').innerHTML = ''; }
function tickDescanso(){
  const falta = Math.max(0, Math.round((restFim - Date.now())/1000));
  if (falta <= 0) { pararDescanso(); alarme(); return; }
  const m = Math.floor(falta/60), s = falta % 60;
  $('#rest').innerHTML = '<div class="rest"><div class="box">'
    + '<span class="t">' + (m ? m + ':' + String(s).padStart(2,'0') : s + 's') + '</span>'
    + '<span class="grow sm" style="font-weight:650">Descanso</span>'
    + '<button data-act="rest-mais">+15s</button><button data-act="rest-fim">Pular</button></div></div>';
}
function alarme(){
  try { if (navigator.vibrate) navigator.vibrate([120,80,120]); } catch(e){}
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return;
    const ctx = new Ctx(), o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; o.type = 'sine';
    g.gain.setValueAtTime(.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.25, ctx.currentTime + .02);
    g.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .5);
    o.start(); o.stop(ctx.currentTime + .55);
  } catch(e){}
}

/* ---------------- tela travada acesa durante o treino ---------------- */
let wakeLock = null;
async function manterAcesa(ligar){
  try {
    if (ligar && 'wakeLock' in navigator && !wakeLock) wakeLock = await navigator.wakeLock.request('screen');
    if (!ligar && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch(e){ wakeLock = null; }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && S.tela === 'treino') manterAcesa(true);
});

/* ---------------- render ---------------- */
const TABS = [
  { k:'hoje', t:'Hoje', d:'M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z' },
  { k:'plano', t:'Plano', d:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
  { k:'historico', t:'Histórico', d:'M12 8v4l3 2M3 12a9 9 0 1 0 3-6.7L3 8' },
  { k:'ajustes', t:'Ajustes', d:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 2.6 7a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V1a2 2 0 1 1 4 0v.1A1.7 1.7 0 0 0 17 2.6a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H23a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' }
];
const TITULOS = { hoje:'Meu Treino', plano:'Meu plano', historico:'Histórico', ajustes:'Ajustes', dia:'Treino', ex:'Exercício', treino:'Treinando' };

function render(){
  const t = S.tela;
  if (!S.cfg || !S.plano) {
    $('#top').innerHTML = ''; $('#tabs').innerHTML = ''; $('#rest').innerHTML = '';
    $('#app').innerHTML = telaOnboarding();
    document.body.style.paddingBottom = '0';
    return;
  }
  document.body.style.paddingBottom = '';
  const temVoltar = ['dia','ex','treino'].includes(t);
  $('#top').innerHTML = '<div class="wrap">'
    + (temVoltar ? '<button class="back" data-act="voltar">‹</button>' : '')
    + '<h1>' + h(TITULOS[t] || 'Meu Treino') + '</h1></div>';
  $('#app').innerHTML = ({ hoje:telaHoje, plano:telaPlano, historico:telaHistorico, ajustes:telaAjustes,
                           dia:telaDia, ex:telaEx, treino:telaTreino }[t] || telaHoje)();
  $('#tabs').innerHTML = '<div class="wrap">' + TABS.map(x =>
    '<button class="tab' + (x.k === t ? ' on' : '') + '" data-act="tab" data-k="' + x.k + '">'
    + '<svg viewBox="0 0 24 24"><path d="' + x.d + '"/></svg><span>' + x.t + '</span></button>').join('') + '</div>';
  if (t !== 'treino' && t !== 'ex') pararDescanso();
  montarCanvas();
  window.scrollTo(0, 0);
}
function ir(tela, ctx){ S.tela = tela; if (ctx) Object.assign(S.ctx, ctx); render(); }

/* ---------------- ações ---------------- */
document.addEventListener('click', ev => {
  const alvo = ev.target.closest('[data-act]');
  if (!alvo) return;
  const a = alvo.dataset.act;

  if (a === 'onb-set') {
    const p = PASSOS[S.onb.passo];
    let v = alvo.dataset.v; if (p.num) v = Number(v);
    if (p.multi) {
      const arr = S.onb.resp[p.k] || [];
      S.onb.resp[p.k] = arr.includes(v) ? arr.filter(x => x !== v) : arr.concat([v]);
    } else { S.onb.resp[p.k] = v; }
    render();
  }
  else if (a === 'onb-next') {
    if (S.onb.passo < PASSOS.length - 1) { S.onb.passo++; render(); }
    else {
      S.cfg = Object.assign({ evitar:[] }, S.onb.resp);
      S.plano = gerarPlano(S.cfg, 0);
      S.tela = 'hoje'; salvar(); render();
    }
  }
  else if (a === 'onb-back') { S.onb.passo--; render(); }
  else if (a === 'pausar') { if (animAtual) alvo.textContent = animAtual.alternar() ? '❚❚' : '▶'; }
  else if (a === 'tab') ir(alvo.dataset.k);
  else if (a === 'dia') ir('dia', { dia:Number(alvo.dataset.i) });
  else if (a === 'ex') ir('ex', { ex:alvo.dataset.id, volta:alvo.dataset.volta });
  else if (a === 'voltar') {
    if (S.tela === 'ex') ir(S.ctx.volta === 'treino' ? 'treino' : 'dia');
    else if (S.tela === 'treino') ir('hoje');
    else ir('hoje');
  }
  else if (a === 'iniciar') iniciarTreino(Number(alvo.dataset.i));
  else if (a === 'tick') marcarSerie(alvo.dataset.ex, Number(alvo.dataset.i), Number(alvo.dataset.desc));
  else if (a === 'rest-mais') { restFim += 15000; tickDescanso(); }
  else if (a === 'rest-fim') pararDescanso();
  else if (a === 'concluir') concluirTreino();
  else if (a === 'abandonar') {
    if (confirm('Cancelar este treino? O que você marcou será perdido.')) { S.sessao = null; salvar(); manterAcesa(false); ir('hoje'); }
  }
  else if (a === 'variar') {
    S.plano = gerarPlano(S.cfg, (S.plano.variacao || 0) + 1);
    salvar(); render();
    alert('Pronto: novos exercícios para os mesmos objetivos.');
  }
  else if (a === 'refazer') {
    S.onb = { passo:0, resp:Object.assign({ evitar:[] }, S.cfg) };
    S.cfg = null; S.plano = null; render();
  }
  else if (a === 'backup') {
    const txt = localStorage.getItem(KEY) || '{}';
    navigator.clipboard.writeText(txt).then(
      () => alert('Backup copiado. Cole em algum lugar seguro (Notas, e-mail).'),
      () => prompt('Copie este texto e guarde:', txt));
  }
  else if (a === 'restaurar') {
    const txt = prompt('Cole aqui o backup:');
    if (!txt) return;
    try { JSON.parse(txt); localStorage.setItem(KEY, txt); carregar(); render(); alert('Dados restaurados.'); }
    catch(e){ alert('Esse texto não parece um backup válido.'); }
  }
  else if (a === 'apagar') {
    if (confirm('Apagar rotina, histórico e cargas? Não dá para desfazer.')) {
      localStorage.removeItem(KEY);
      S.cfg = null; S.plano = null; S.hist = []; S.sessao = null; S.cargas = {};
      S.onb = { passo:0, resp:{ evitar:[] } }; render();
    }
  }
});

document.addEventListener('input', ev => {
  const el = ev.target;
  if (!el.dataset || !el.dataset.f || !S.sessao) return;
  const arr = S.sessao.series[el.dataset.ex];
  if (!arr) return;
  arr[Number(el.dataset.i)][el.dataset.f] = el.value;
  salvar();
});

/* ---------------- fluxo do treino ---------------- */
function iniciarTreino(idx){
  if (!S.sessao || S.sessao.diaIdx !== idx) {
    if (S.sessao && !confirm('Você tem um treino em andamento. Começar outro apaga o atual.')) return;
    const dia = S.plano.dias[idx];
    const series = {};
    dia.exercicios.forEach(e => {
      series[e.id] = Array.from({ length:e.series }, () => ({ peso:'', reps:'', ok:false }));
    });
    S.sessao = { diaIdx:idx, inicio:Date.now(), series };
    salvar();
  }
  manterAcesa(true);
  ir('treino');
}

function marcarSerie(exId, i, descanso){
  const arr = S.sessao.series[exId]; if (!arr) return;
  const set = arr[i];
  set.ok = !set.ok;
  if (set.ok) {
    // repete a carga da série anterior quando o campo ficou vazio
    if (!set.peso && i > 0 && arr[i-1].peso) set.peso = arr[i-1].peso;
    if (!set.peso && S.cargas[exId]) set.peso = S.cargas[exId].peso;
    if (!set.reps) {
      const dia = S.plano.dias[S.sessao.diaIdx];
      const item = dia.exercicios.find(e => e.id === exId);
      set.reps = i > 0 && arr[i-1].reps ? arr[i-1].reps : String(item.reps).split(' ')[0];
    }
    if (set.peso || set.reps) S.cargas[exId] = { peso:set.peso, reps:set.reps };
    iniciarDescanso(descanso);
  }
  salvar();
  render();
}

function concluirTreino(){
  const s = S.sessao, dia = S.plano.dias[s.diaIdx];
  let series = 0, volume = 0;
  dia.exercicios.forEach(e => (s.series[e.id] || []).forEach(x => {
    if (!x.ok) return;
    series++;
    const p = parseFloat(String(x.peso).replace(',','.')) || 0;
    const r = parseInt(x.reps, 10) || 0;
    volume += p * r;
  }));
  if (!series) { alert('Marque pelo menos uma série antes de concluir.'); return; }
  S.hist.unshift({
    ts:Date.now(), data:hoje(), diaIdx:s.diaIdx, diaNome:dia.nome, series, volume,
    duracaoMin:Math.max(1, Math.round((Date.now() - s.inicio)/60000))
  });
  S.hist = S.hist.slice(0, 200);
  S.sessao = null; salvar(); pararDescanso(); manterAcesa(false);
  ir('hoje');
  setTimeout(() => alert('Treino concluído: ' + plural(series,'série','séries') + '. Bom trabalho.'), 60);
}

/* ---------------- início ---------------- */
carregar();
if (S.plano && S.sessao) S.tela = 'hoje';
render();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
