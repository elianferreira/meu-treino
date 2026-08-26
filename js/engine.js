/* Motor de montagem da rotina: escolhe divisao, exercicios, series e descanso */

// --- gerador pseudo-aleatorio com semente (rotina estavel ate pedir outra variacao)
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }

// --- modelos de treino: cada slot e uma vaga a ser preenchida, em ordem de prioridade
const DIAS = {
  fbA:  { nome:'Corpo inteiro A', foco:'Corpo inteiro',
          slots:[{g:'pernas',t:'composto'},{g:'peito',t:'composto'},{g:'costas',t:'composto'},{g:'ombros'},{g:'triceps'},{g:'biceps'},{g:'core'}] },
  fbB:  { nome:'Corpo inteiro B', foco:'Corpo inteiro',
          slots:[{g:'pernas',t:'composto'},{g:'costas',t:'composto'},{g:'peito',t:'composto'},{g:'ombros'},{g:'biceps'},{g:'triceps'},{g:'core'}] },
  fbC:  { nome:'Corpo inteiro C', foco:'Corpo inteiro',
          slots:[{g:'pernas',t:'composto'},{g:'peito'},{g:'costas'},{g:'ombros'},{g:'core'},{g:'triceps'},{g:'biceps'}] },
  push: { nome:'Empurrar', foco:'Peito, ombro e tríceps',
          slots:[{g:'peito',t:'composto'},{g:'ombros',t:'composto'},{g:'peito',t:'composto'},{g:'ombros',t:'isolado'},{g:'triceps'},{g:'triceps'},{g:'core'}] },
  pull: { nome:'Puxar', foco:'Costas e bíceps',
          slots:[{g:'costas',t:'composto'},{g:'costas',t:'composto'},{g:'costas'},{g:'ombros',t:'isolado'},{g:'biceps'},{g:'biceps'},{g:'core'}] },
  legs: { nome:'Pernas', foco:'Quadríceps, posterior e glúteo',
          slots:[{g:'pernas',t:'composto'},{g:'pernas',t:'composto'},{g:'pernas',t:'isolado'},{g:'pernas',t:'isolado'},{g:'pernas'},{g:'core'},{g:'core'}] },
  up:   { nome:'Superior', foco:'Peito, costas, ombro e braço',
          slots:[{g:'peito',t:'composto'},{g:'costas',t:'composto'},{g:'ombros',t:'composto'},{g:'costas'},{g:'peito'},{g:'biceps'},{g:'triceps'}] },
  low:  { nome:'Inferior', foco:'Pernas, glúteo e core',
          slots:[{g:'pernas',t:'composto'},{g:'pernas',t:'composto'},{g:'pernas',t:'isolado'},{g:'pernas'},{g:'core'},{g:'core'},{g:'pernas'}] }
};

function escolherSplit(dias, nivel){
  if (dias <= 2) return { nome:'Corpo inteiro', dias:['fbA','fbB'] };
  if (dias === 3) return nivel === 1
    ? { nome:'Corpo inteiro A/B/C', dias:['fbA','fbB','fbC'] }
    : { nome:'Empurrar / Puxar / Pernas', dias:['push','pull','legs'] };
  if (dias === 4) return { nome:'Superior / Inferior', dias:['up','low','up','low'] };
  if (dias === 5) return { nome:'Empurrar / Puxar / Pernas + Superior / Inferior', dias:['push','pull','legs','up','low'] };
  return { nome:'Empurrar / Puxar / Pernas (2x na semana)', dias:['push','pull','legs','push','pull','legs'] };
}

// --- quantos exercicios cabem na sessao
function qtdExercicios(duracao, nivel){
  const base = { 30:4, 45:5, 60:6, 75:7 }[duracao] || 5;
  return Math.max(3, base + (nivel === 3 ? 1 : 0));
}

// --- series, repeticoes e descanso conforme objetivo
const PRESC = {
  hipertrofia:    { composto:{s:4,r:'8 a 10',d:90},  isolado:{s:3,r:'10 a 12',d:60} },
  forca:          { composto:{s:5,r:'4 a 6',d:150},  isolado:{s:3,r:'8 a 10',d:90} },
  emagrecimento:  { composto:{s:3,r:'12 a 15',d:45}, isolado:{s:3,r:'15',d:30} },
  condicionamento:{ composto:{s:3,r:'10 a 12',d:60}, isolado:{s:3,r:'12 a 15',d:45} }
};

function prescrever(ex, cfg){
  const tabela = PRESC[cfg.objetivo] || PRESC.hipertrofia;
  const chave = ex.tipo === 'composto' ? 'composto' : 'isolado';
  const p = tabela[chave];
  let series = p.s;
  if (cfg.nivel === 1) series = Math.max(2, series - 1);
  let reps = p.r, descanso = p.d;
  if (ex.tempo) {
    reps = cfg.objetivo === 'forca' ? '30 seg' : cfg.objetivo === 'emagrecimento' ? '45 seg' : '40 seg';
    descanso = Math.min(descanso, 45);
  }
  const obs = [];
  if (ex.unilateral) obs.push('Cada lado');
  return { series, reps, descanso, obs:obs.join(' · ') };
}

// --- grupos que podem substituir uns aos outros quando falta opcao
const VIZINHOS = {
  peito:['triceps','ombros'], costas:['biceps','ombros'], ombros:['peito','costas'],
  biceps:['costas'], triceps:['peito'], pernas:['core'], core:['pernas'], cardio:['core']
};

function filtrarPool(cfg){
  return EX.filter(e => {
    if (cfg.local === 'casa'  && e.req === 'academia') return false;
    if (cfg.local === 'corpo' && e.req !== 'nenhum')   return false;
    if (e.nivel > cfg.nivel) return false;
    if (cfg.evitar && cfg.evitar.length) {
      const g = e.grupo, id = e.id;
      if (cfg.evitar.includes('joelho') && ['pernas'].includes(g) && ['agachamento-livre','leg-press','afundo','bulgaro','step-up','agachamento-corporal','agachamento-goblet','agachamento-sumo'].includes(id)) return false;
      if (cfg.evitar.includes('lombar') && ['levantamento-terra','remada-curvada','terra-romeno','stiff-halteres','agachamento-livre','superman'].includes(id)) return false;
      if (cfg.evitar.includes('ombro') && ['mergulho-paralelas','desenvolvimento-militar','pike-push-up','mergulho-banco','pullover-halter'].includes(id)) return false;
    }
    return true;
  });
}

// quanto o exercicio combina com o equipamento que a pessoa tem (maior = melhor)
function afinidade(e, local){
  if (e.improvisado && local !== 'corpo') return -1;
  if (local === 'academia') return e.req === 'academia' ? 2 : e.req === 'halteres' ? 1 : 0;
  if (local === 'casa')     return e.req === 'halteres' ? 2 : 1;
  return 1;
}

function escolher(cands, uso, rnd, local){
  if (!cands.length) return null;
  // repetir pouco pesa mais que a afinidade, mas a afinidade decide os empates
  const nota = e => (uso[e.id] || 0) * 4 - afinidade(e, local);
  const min = Math.min(...cands.map(nota));
  const empatados = cands.filter(e => nota(e) === min);
  return empatados[Math.floor(rnd() * empatados.length)];
}

function gerarPlano(cfg, variacao){
  variacao = variacao || 0;
  const rnd = mulberry32(hashStr(JSON.stringify(cfg)) + variacao * 7919);
  const pool = filtrarPool(cfg);
  const split = escolherSplit(cfg.dias, cfg.nivel);
  const alvo = qtdExercicios(cfg.duracao, cfg.nivel);
  const cardioNoFim = cfg.objetivo === 'emagrecimento' || cfg.objetivo === 'condicionamento';
  const uso = {};
  const dias = [];

  split.dias.forEach((chave, idx) => {
    const modelo = DIAS[chave];
    const usadosHoje = new Set();
    const exercicios = [];
    const nExercicios = cardioNoFim ? alvo - 1 : alvo;

    for (const slot of modelo.slots) {
      if (exercicios.length >= nExercicios) break;
      const livre = e => !usadosHoje.has(e.id) && e.grupo !== 'cardio';
      let cands = pool.filter(e => livre(e) && e.grupo === slot.g && (!slot.t || e.tipo === slot.t));
      if (!cands.length) cands = pool.filter(e => livre(e) && e.grupo === slot.g);
      if (!cands.length) cands = pool.filter(e => livre(e) && (VIZINHOS[slot.g] || []).includes(e.grupo));
      if (!cands.length) cands = pool.filter(livre);
      const ex = escolher(cands, uso, rnd, cfg.local);
      if (!ex) continue;
      usadosHoje.add(ex.id);
      uso[ex.id] = (uso[ex.id] || 0) + 1;
      exercicios.push(Object.assign({ id:ex.id, nome:ex.nome, grupo:ex.grupo }, prescrever(ex, cfg)));
    }

    if (cardioNoFim) {
      const cards = pool.filter(e => e.grupo === 'cardio' && !usadosHoje.has(e.id));
      const ex = escolher(cards, uso, rnd, cfg.local);
      if (ex) {
        uso[ex.id] = (uso[ex.id] || 0) + 1;
        const p = prescrever(ex, cfg);
        exercicios.push(Object.assign({ id:ex.id, nome:ex.nome, grupo:ex.grupo, finisher:true }, p, { series:3, reps:'45 seg', descanso:30 }));
      }
    }

    const repetido = split.dias.slice(0, idx).filter(d => d === chave).length;
    dias.push({
      id: chave + '-' + idx,
      indice: idx,
      nome: modelo.nome + (repetido ? ' ' + String.fromCharCode(65 + repetido) : (split.dias.filter(d => d === chave).length > 1 ? ' A' : '')),
      foco: modelo.foco,
      aquecimento: aquecimentoDe(modelo.foco),
      exercicios,
      duracao: estimarDuracao(exercicios)
    });
  });

  return { criadoEm: Date.now(), cfg, variacao, split: split.nome, dias };
}

function aquecimentoDe(foco){
  if (foco.indexOf('Pernas') === 0 || foco.indexOf('Quadríceps') === 0)
    return '5 min de bicicleta ou caminhada + 15 agachamentos livres sem carga.';
  if (foco.indexOf('Costas') === 0)
    return '5 min de cardio leve + 15 rotações de ombro e 10 repetições leves do primeiro exercício.';
  if (foco.indexOf('Peito') === 0)
    return '5 min de cardio leve + 15 rotações de ombro e 1 série leve do primeiro exercício.';
  return '5 min de cardio leve + mobilidade de ombro e quadril antes da primeira série.';
}

function estimarDuracao(exercicios){
  let seg = 6 * 60; // aquecimento
  exercicios.forEach(e => { seg += e.series * (40 + e.descanso); });
  return Math.round(seg / 60);
}

// --- rotulos amigaveis
const LABEL = {
  objetivo: { hipertrofia:'Ganhar massa', emagrecimento:'Emagrecer', forca:'Ganhar força', condicionamento:'Condicionamento' },
  nivel:    { 1:'Iniciante', 2:'Intermediário', 3:'Avançado' },
  local:    { academia:'Academia completa', casa:'Casa com halteres/elástico', corpo:'Só peso do corpo' },
  grupo:    { peito:'Peito', costas:'Costas', pernas:'Pernas', ombros:'Ombros', biceps:'Bíceps', triceps:'Tríceps', core:'Core', cardio:'Cardio' }
};

if (typeof module !== 'undefined') module.exports = { gerarPlano, LABEL, DIAS, escolherSplit };
