/* Animações dos exercícios.
   Figura anatômica sombreada, com o músculo trabalhado em vermelho,
   desenhada em canvas e animada em loop. Nada vem de fora: funciona offline. */
'use strict';

const SEG = { torso:48, pescoco:7, cabeca:10, braco:27, antebraco:26, coxa:39, canela:36, pe:15 };
const CENA = { larg:230, alt:200, chao:174 };

const rad = g => g * Math.PI / 180;
const proj = (p, ang, len) => [ p[0] + Math.cos(rad(ang)) * len, p[1] + Math.sin(rad(ang)) * len ];
const mid = (a, b, k) => [ a[0] + (b[0]-a[0])*k, a[1] + (b[1]-a[1])*k ];

/* ---------------- poses ---------------- */
function pose(o){
  return Object.assign({
    torso:-90, braco:90, antebraco:90, coxa:90, canela:90, pe:0,
    braco2:null, antebraco2:null, coxa2:null, canela2:null, pe2:null,
    raizX:112, raizY:CENA.chao
  }, o);
}

function montar(p, raiz){
  const R = [p.raizX, p.raizY];
  let tornozelo, joelho, quadril, ombro;
  if (raiz === 'tornozelo') {
    tornozelo = R;
    joelho    = proj(tornozelo, p.canela + 180, SEG.canela);
    quadril   = proj(joelho,    p.coxa + 180,   SEG.coxa);
    ombro     = proj(quadril,   p.torso,        SEG.torso);
  } else if (raiz === 'ombro') {
    ombro     = R;
    quadril   = proj(ombro,     p.torso + 180,  SEG.torso);
    joelho    = proj(quadril,   p.coxa,         SEG.coxa);
    tornozelo = proj(joelho,    p.canela,       SEG.canela);
  } else if (raiz === 'mao') {
    const mao = R;
    const cotovelo0 = proj(mao,      p.antebraco + 180, SEG.antebraco);
    ombro     = proj(cotovelo0,      p.braco + 180,     SEG.braco);
    quadril   = proj(ombro,          p.torso + 180,     SEG.torso);
    joelho    = proj(quadril,        p.coxa,            SEG.coxa);
    tornozelo = proj(joelho,         p.canela,          SEG.canela);
  } else {
    quadril   = R;
    ombro     = proj(quadril, p.torso,  SEG.torso);
    joelho    = proj(quadril, p.coxa,   SEG.coxa);
    tornozelo = proj(joelho,  p.canela, SEG.canela);
  }
  const pe       = proj(tornozelo, p.pe, SEG.pe);
  const cotovelo = proj(ombro, p.braco, SEG.braco);
  const mao      = proj(cotovelo, p.antebraco, SEG.antebraco);
  const pescoco  = proj(ombro, p.torso, SEG.pescoco);
  const cabeca   = proj(pescoco, p.torso, SEG.cabeca);

  const a2 = p.braco2 ?? p.braco, f2 = p.antebraco2 ?? p.antebraco;
  const c2 = p.coxa2 ?? p.coxa,   n2 = p.canela2 ?? p.canela;
  const cotovelo2 = proj(ombro, a2, SEG.braco);
  const mao2      = proj(cotovelo2, f2, SEG.antebraco);
  const joelho2   = proj(quadril, c2, SEG.coxa);
  const tornozelo2= proj(joelho2, n2, SEG.canela);
  const pe2       = proj(tornozelo2, p.pe2 ?? p.pe, SEG.pe);

  return { quadril, ombro, joelho, tornozelo, pe, cotovelo, mao, pescoco, cabeca,
           cotovelo2, mao2, joelho2, tornozelo2, pe2 };
}

function entre(a, b, t){
  const r = {};
  for (const k in a) {
    const va = a[k], vb = b[k];
    if (typeof va === 'number' && typeof vb === 'number') r[k] = va + (vb - va) * t;
    else r[k] = (typeof va === 'number') ? va : vb;
  }
  return r;
}

/* ---------------- pintura ---------------- */
const PELE  = ['#f2f5f9', '#aab4c2', '#6d7686'];   // claro, meio, sombra
const MUSC  = ['#ff8a7a', '#e8382c', '#8d1710'];   // músculo em foco
const EQUIP = '#20252c', EQUIP2 = '#39424e', METAL = '#7d8794';

function gradSeg(c, a, b, w, cores){
  const dx = b[0]-a[0], dy = b[1]-a[1], L = Math.hypot(dx, dy) || 1;
  const nx = -dy/L, ny = dx/L;
  const cx = (a[0]+b[0])/2, cy = (a[1]+b[1])/2;
  const g = c.createLinearGradient(cx - nx*w/2, cy - ny*w/2, cx + nx*w/2, cy + ny*w/2);
  g.addColorStop(0, cores[0]); g.addColorStop(.45, cores[1]); g.addColorStop(1, cores[2]);
  return g;
}

/* segmento com volume: cápsula que afina da origem para a ponta */
function membro(c, a, b, w1, w2, cores){
  const ang = Math.atan2(b[1]-a[1], b[0]-a[0]);
  c.fillStyle = gradSeg(c, a, b, Math.max(w1, w2), cores);
  c.beginPath();
  c.arc(a[0], a[1], w1/2, ang + Math.PI/2, ang + Math.PI*1.5);
  c.arc(b[0], b[1], w2/2, ang - Math.PI/2, ang + Math.PI/2);
  c.closePath(); c.fill();
}

function bola(c, p, r, cores){
  const g = c.createRadialGradient(p[0]-r*.35, p[1]-r*.4, r*.15, p[0], p[1], r);
  g.addColorStop(0, cores[0]); g.addColorStop(.5, cores[1]); g.addColorStop(1, cores[2]);
  c.fillStyle = g; c.beginPath(); c.arc(p[0], p[1], r, 0, 6.2832); c.fill();
}

function cor(foco, alvo){ return (foco || []).includes(alvo) ? MUSC : PELE; }

function desenharCorpo(c, P, foco){
  // sombra no chão
  c.save();
  c.globalAlpha = .3; c.fillStyle = '#000';
  c.beginPath(); c.ellipse(P.quadril[0], CENA.chao + 6, 46, 5, 0, 0, 6.2832); c.fill();
  c.restore();

  const escuro = k => k.map(x => x); // lado de trás usa a mesma paleta com alpha
  c.save(); c.globalAlpha = .55;
  membro(c, P.quadril, P.joelho2, 17, 13, cor(foco,'coxa'));
  membro(c, P.joelho2, P.tornozelo2, 12, 8, cor(foco,'panturrilha'));
  membro(c, P.tornozelo2, P.pe2, 8, 5, PELE);
  membro(c, P.ombro, P.cotovelo2, 13, 10, cor(foco,'braco'));
  membro(c, P.cotovelo2, P.mao2, 10, 7, PELE);
  c.restore();

  // tronco
  membro(c, P.quadril, P.ombro, 25, 33, cor(foco,'tronco'));
  if (foco && foco.includes('peito'))    membro(c, mid(P.quadril,P.ombro,.5), P.ombro, 24, 30, MUSC);
  if (foco && foco.includes('costas'))   membro(c, mid(P.quadril,P.ombro,.45), P.ombro, 25, 31, MUSC);
  if (foco && foco.includes('abdomen'))  membro(c, P.quadril, mid(P.quadril,P.ombro,.55), 22, 21, MUSC);
  if (foco && foco.includes('lombar'))   membro(c, P.quadril, mid(P.quadril,P.ombro,.6), 21, 20, MUSC);

  // perna da frente
  membro(c, P.quadril, P.joelho, 19, 14, cor(foco,'coxa'));
  membro(c, P.joelho, P.tornozelo, 13, 9, cor(foco,'panturrilha'));
  membro(c, P.tornozelo, P.pe, 9, 5, PELE);
  bola(c, P.quadril, 10, cor(foco,'gluteo'));

  // braço da frente
  membro(c, P.ombro, P.cotovelo, 14, 10, cor(foco,'braco'));
  membro(c, P.cotovelo, P.mao, 11, 7, PELE);
  bola(c, P.ombro, 11, cor(foco,'ombro'));

  // cabeça e pescoço
  membro(c, P.ombro, P.pescoco, 12, 11, PELE);
  const ang = Math.atan2(P.cabeca[1]-P.pescoco[1], P.cabeca[0]-P.pescoco[0]);
  c.save(); c.translate(P.cabeca[0], P.cabeca[1]); c.rotate(ang);
  const g = c.createRadialGradient(-3, -4, 2, 0, 0, 12);
  g.addColorStop(0, PELE[0]); g.addColorStop(.55, PELE[1]); g.addColorStop(1, PELE[2]);
  c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 12, 10, 0, 0, 6.2832); c.fill();
  c.restore();
}

/* ---------------- equipamentos ---------------- */
function disco(c, p, r){
  const g = c.createRadialGradient(p[0]-r*.3, p[1]-r*.3, r*.1, p[0], p[1], r);
  g.addColorStop(0, '#4a545f'); g.addColorStop(1, '#161a1f');
  c.fillStyle = g; c.beginPath(); c.arc(p[0], p[1], r, 0, 6.2832); c.fill();
  c.fillStyle = '#0c0f13'; c.beginPath(); c.arc(p[0], p[1], r*.28, 0, 6.2832); c.fill();
}
function tubo(c, a, b, w, cor1){
  c.strokeStyle = cor1 || EQUIP2; c.lineWidth = w; c.lineCap = 'round';
  c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();
}

const APARELHO = {
  nenhum(){},
  barra(c, P){ const m = mid(P.mao, P.mao2, .5); disco(c, m, 15); },
  barraCostas(c, P){ const o = proj(P.ombro, -148, 9); disco(c, [o[0], o[1]], 13); },
  halteres(c, P){
    [P.mao2, P.mao].forEach((m, i) => {
      c.save(); c.translate(m[0], m[1]); c.rotate(rad(72));
      c.globalAlpha = i ? 1 : .6;
      tubo(c, [0,-13], [0,13], 7, METAL);
      c.fillStyle = '#1b2027';
      c.beginPath(); c.roundRect(-6,-16,12,10,3); c.fill();
      c.beginPath(); c.roundRect(-6,6,12,10,3); c.fill();
      c.restore();
    });
  },
  halter(c, P){
    const m = P.mao;
    c.save(); c.translate(m[0], m[1]); c.rotate(rad(72));
    tubo(c, [0,-14], [0,14], 8, METAL);
    c.fillStyle = '#1b2027';
    c.beginPath(); c.roundRect(-7,-18,14,11,3); c.fill();
    c.beginPath(); c.roundRect(-7,7,14,11,3); c.fill();
    c.restore();
  },
  kettle(c, P){
    const m = P.mao;
    c.strokeStyle = METAL; c.lineWidth = 4;
    c.beginPath(); c.arc(m[0], m[1]+3, 8, rad(195), rad(345)); c.stroke();
    const g = c.createRadialGradient(m[0]-4, m[1]+10, 2, m[0], m[1]+14, 13);
    g.addColorStop(0,'#4a545f'); g.addColorStop(1,'#161a1f');
    c.fillStyle = g; c.beginPath(); c.arc(m[0], m[1]+14, 12, 0, 6.2832); c.fill();
  },
  barraFixa(c, P){
    const y = P.mao[1] - 4;
    tubo(c, [24, y], [206, y], 7, METAL);
    tubo(c, [30, y], [30, 16], 6, EQUIP2);
    tubo(c, [200, y], [200, 16], 6, EQUIP2);
  },
  paralelas(c, P){
    const y = P.mao[1] + 2;
    tubo(c, [P.mao[0]-34, y], [P.mao[0]+34, y], 7, METAL);
    tubo(c, [P.mao[0]+30, y], [P.mao[0]+30, CENA.chao+4], 6, EQUIP2);
    tubo(c, [P.mao[0]-30, y], [P.mao[0]-30, CENA.chao+4], 6, EQUIP2);
  },
  poliaAlta(c, P){
    const x = P.mao[0] + 4;
    tubo(c, [x, 12], [x, CENA.chao+4], 9, EQUIP);
    c.fillStyle = METAL; c.beginPath(); c.arc(x, 20, 7, 0, 6.2832); c.fill();
    tubo(c, [x, 20], [P.mao[0], P.mao[1]], 3, METAL);
  },
  poliaBaixa(c, P){
    const x = P.mao[0] + 58;
    tubo(c, [x, CENA.chao-6], [x, CENA.chao+4], 9, EQUIP);
    tubo(c, [x, CENA.chao-6], [P.mao[0], P.mao[1]], 3, METAL);
  },
  elastico(c, P){
    c.strokeStyle = '#e8382c'; c.lineWidth = 3.5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(P.mao[0], P.mao[1]);
    c.quadraticCurveTo(P.mao[0]+34, P.mao[1]-4, 214, P.mao[1]-14); c.stroke();
    tubo(c, [214, P.mao[1]-30], [214, P.mao[1]+4], 7, EQUIP2);
  },
  cordaPular(c, P){
    c.strokeStyle = METAL; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(P.mao[0], P.mao[1]);
    c.bezierCurveTo(P.mao[0]+46, P.mao[1]+40, P.mao[0]-46, P.mao[1]+40, P.mao[0]-2, P.mao[1]);
    c.stroke();
  },
  maquinaPeso(c, P){
    tubo(c, [196, 30], [196, CENA.chao+4], 11, EQUIP);
    for (let i = 0; i < 5; i++) { c.fillStyle = i < 2 ? '#4a545f' : '#232a33';
      c.beginPath(); c.roundRect(184, 96 + i*15, 24, 12, 3); c.fill(); }
  },
  cabosAltos(c, P){
    [[16, P.mao2], [214, P.mao]].forEach(([x, m]) => {
      tubo(c, [x, 12], [x, CENA.chao+4], 9, EQUIP);
      c.fillStyle = METAL; c.beginPath(); c.arc(x, 22, 6, 0, 6.2832); c.fill();
      tubo(c, [x, 22], [m[0], m[1]], 2.5, METAL);
    });
  },
  poliaAltaMao(c, P){
    const x = P.mao[0] + 52;
    tubo(c, [x, 12], [x, CENA.chao+4], 10, EQUIP);
    c.fillStyle = METAL; c.beginPath(); c.arc(x, 22, 6, 0, 6.2832); c.fill();
    tubo(c, [x, 22], [P.mao[0], P.mao[1]], 2.5, METAL);
    tubo(c, [P.mao[0]-6, P.mao[1]+2], [P.mao[0]+6, P.mao[1]+2], 5, '#c8ccd2');
  },
  caboBaixo(c, P){
    const x = P.mao[0] + 76;
    tubo(c, [x, CENA.chao-10], [x, CENA.chao+4], 10, EQUIP);
    tubo(c, [x, CENA.chao-10], [P.mao[0], P.mao[1]], 2.5, METAL);
  },
  toalha(c, P){
    tubo(c, [P.mao[0], P.mao[1]], [206, P.mao[1]-6], 4, '#c8ccd2');
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(206, 30, 10, CENA.chao-26, 3); c.fill();
  },
  barraFixaBaixa(c, P){
    const y = P.mao[1] - 3;
    tubo(c, [30, y], [200, y], 7, METAL);
    tubo(c, [40, y], [40, CENA.chao+3], 6, EQUIP);
    tubo(c, [190, y], [190, CENA.chao+3], 6, EQUIP);
  },
  plataforma(c, P){
    const t = P.tornozelo, ang = Math.atan2(P.tornozelo[1]-P.joelho[1], P.tornozelo[0]-P.joelho[0]);
    c.save(); c.translate(t[0], t[1]); c.rotate(ang);
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(-6, -40, 13, 80, 4); c.fill();
    c.restore();
    disco(c, [t[0]+26, t[1]-30], 17); disco(c, [t[0]+34, t[1]-24], 14);
    tubo(c, [t[0]+6, t[1]-46], [178, 26], 7, EQUIP2);
  },
  roloPerna(c, P){
    c.fillStyle = '#2b323b'; c.beginPath(); c.arc(P.tornozelo[0], P.tornozelo[1], 11, 0, 6.2832); c.fill();
    c.fillStyle = METAL; c.beginPath(); c.arc(P.tornozelo[0], P.tornozelo[1], 4, 0, 6.2832); c.fill();
  },
  garrafas(c, P){
    [P.mao2, P.mao].forEach((m, i) => {
      c.save(); c.globalAlpha = i ? 1 : .6; c.fillStyle = '#7fb3d5';
      c.beginPath(); c.roundRect(m[0]-5, m[1]-4, 10, 20, 4); c.fill();
      c.restore();
    });
  },
  mochila(c, P){
    const m = mid(P.mao, P.mao2, .5);
    c.fillStyle = '#2f3742'; c.beginPath(); c.roundRect(m[0]-13, m[1]+2, 26, 26, 7); c.fill();
    c.strokeStyle = METAL; c.lineWidth = 3;
    c.beginPath(); c.arc(m[0], m[1]+2, 9, rad(200), rad(340)); c.stroke();
  }
};

/* ---------------- cenário ---------------- */
function chao(c){
  const g = c.createLinearGradient(0, CENA.chao, 0, CENA.chao+14);
  g.addColorStop(0, '#2a313a'); g.addColorStop(1, 'rgba(42,49,58,0)');
  c.fillStyle = g; c.fillRect(0, CENA.chao+2, CENA.larg, 14);
  c.strokeStyle = '#3a444f'; c.lineWidth = 2.5;
  c.beginPath(); c.moveTo(10, CENA.chao+3); c.lineTo(220, CENA.chao+3); c.stroke();
}
const CENARIO = {
  nenhum(c){ chao(c); },
  chao(c){ chao(c); },
  banco(c, P, ang){
    const a = ang || 0, q = P.quadril;
    c.save(); c.translate(q[0], q[1]+15); c.rotate(rad(-a));
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(-58, 0, 116, 13, 6); c.fill();
    c.restore();
    tubo(c, [q[0]-36, q[1]+24], [q[0]-36, CENA.chao+3], 7, EQUIP);
    tubo(c, [q[0]+36, q[1]+24], [q[0]+36, CENA.chao+3], 7, EQUIP);
    chao(c);
  },
  bancoBaixo(c, P){
    const x = P.quadril[0]+6, y = P.quadril[1]+18;
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(x-50, y, 100, 12, 5); c.fill();
    tubo(c, [x-32, y+10], [x-32, CENA.chao+3], 7, EQUIP);
    tubo(c, [x+32, y+10], [x+32, CENA.chao+3], 7, EQUIP);
    chao(c);
  },
  degrau(c, P){
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(126, CENA.chao-36, 84, 40, 5); c.fill();
    c.fillStyle = EQUIP2; c.beginPath(); c.roundRect(126, CENA.chao-36, 84, 7, 4); c.fill();
    chao(c);
  },
  encosto(c, P){
    const o = P.ombro;
    c.save(); c.translate(o[0]+16, o[1]); c.rotate(rad(12));
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(0, -30, 13, 74, 5); c.fill();
    c.restore();
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(P.quadril[0]-26, P.quadril[1]+14, 74, 12, 5); c.fill();
    tubo(c, [P.quadril[0]+10, P.quadril[1]+24], [P.quadril[0]+10, CENA.chao+3], 8, EQUIP);
    chao(c);
  },
  bancoBaixoMao(c, P){
    const m = P.mao;
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(m[0]-34, m[1]+2, 76, 12, 5); c.fill();
    tubo(c, [m[0]-20, m[1]+12], [m[0]-20, CENA.chao+3], 7, EQUIP);
    tubo(c, [m[0]+30, m[1]+12], [m[0]+30, CENA.chao+3], 7, EQUIP);
    chao(c);
  },
  bancoMao(c, P){
    const m = P.mao;
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(m[0]-30, m[1]+3, 74, 12, 5); c.fill();
    tubo(c, [m[0]-16, m[1]+13], [m[0]-16, CENA.chao+3], 7, EQUIP);
    tubo(c, [m[0]+34, m[1]+13], [m[0]+34, CENA.chao+3], 7, EQUIP);
    chao(c);
  },
  barraBaixa(c){ chao(c); },
  legPress(c, P){
    // trilho inclinado e assento reclinado
    tubo(c, [96, CENA.chao-2], [190, 24], 10, EQUIP);
    tubo(c, [60, CENA.chao+2], [200, CENA.chao+2], 9, EQUIP);
    const o = P.ombro;
    c.save(); c.translate(o[0]-6, o[1]+4); c.rotate(rad(-64));
    c.fillStyle = EQUIP2; c.beginPath(); c.roundRect(-8, -12, 66, 14, 5); c.fill();
    c.restore();
    c.fillStyle = EQUIP2; c.beginPath(); c.roundRect(P.quadril[0]-18, P.quadril[1]+11, 56, 13, 5); c.fill();
    chao(c);
  },
  bancoAtras(c, P){
    const t = P.tornozelo2 || P.tornozelo;
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(t[0]-24, t[1]+6, 62, 12, 5); c.fill();
    tubo(c, [t[0]-12, t[1]+16], [t[0]-12, CENA.chao+3], 7, EQUIP);
    tubo(c, [t[0]+28, t[1]+16], [t[0]+28, CENA.chao+3], 7, EQUIP);
    chao(c);
  },
  bancoCostas(c, P){
    const o = P.ombro;
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(o[0]-40, o[1]+10, 74, 13, 5); c.fill();
    tubo(c, [o[0]-30, o[1]+22], [o[0]-30, CENA.chao+3], 7, EQUIP);
    tubo(c, [o[0]+24, o[1]+22], [o[0]+24, CENA.chao+3], 7, EQUIP);
    chao(c);
  },
  bancoScott(c, P){
    const co = P.cotovelo;
    c.save(); c.translate(co[0], co[1]+6); c.rotate(rad(28));
    c.fillStyle = EQUIP2; c.beginPath(); c.roundRect(-22, 0, 56, 14, 6); c.fill();
    c.restore();
    tubo(c, [co[0]+6, co[1]+22], [co[0]+6, CENA.chao+3], 8, EQUIP);
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(P.quadril[0]-26, P.quadril[1]+13, 60, 12, 5); c.fill();
    chao(c);
  },
  esteira(c, P){
    c.fillStyle = EQUIP; c.beginPath(); c.roundRect(40, CENA.chao-6, 168, 14, 5); c.fill();
    tubo(c, [186, CENA.chao-6], [196, 78], 7, EQUIP2);
    tubo(c, [196, 78], [162, 74], 6, EQUIP2);
    chao(c);
  }
};

/* ---------------- quadro e player ---------------- */
function quadro(c, anim, t){
  c.clearRect(0, 0, CENA.larg, CENA.alt);
  const p = entre(anim.poses[0], anim.poses[1], t);
  const P = montar(p, anim.raiz || 'tornozelo');
  (CENARIO[anim.cenario] || CENARIO.chao)(c, P, anim.bancoAng);
  if (anim.atras) (APARELHO[anim.equip] || APARELHO.nenhum)(c, P, t);
  desenharCorpo(c, P, anim.foco);
  if (!anim.atras) (APARELHO[anim.equip] || APARELHO.nenhum)(c, P, t);
}

function tocar(canvas, anim){
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  canvas.width = CENA.larg * dpr; canvas.height = CENA.alt * dpr;
  canvas.style.aspectRatio = CENA.larg + '/' + CENA.alt;
  const c = canvas.getContext('2d');
  c.scale(dpr, dpr);
  const dur = anim.dur || 2800;
  let inicio = performance.now(), raf = null, parado = false;
  function passo(agora){
    if (parado) return;
    const ciclo = ((agora - inicio) % dur) / dur;
    const t = ciclo < .5 ? ciclo*2 : (1-ciclo)*2;
    quadro(c, anim, t*t*(3-2*t));
    raf = requestAnimationFrame(passo);
  }
  raf = requestAnimationFrame(passo);
  return {
    parar(){ parado = true; if (raf) cancelAnimationFrame(raf); },
    alternar(){
      parado = !parado;
      if (!parado) { inicio = performance.now(); raf = requestAnimationFrame(passo); }
      return !parado;
    }
  };
}
