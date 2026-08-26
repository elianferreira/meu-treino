/* Poses de cada exercício: duas posições que o app interpola em loop.
   Ângulos em graus, eixo y para baixo: 0 = direita, -90 = cima, 90 = baixo. */
'use strict';

const P = (a, b, extra) => Object.assign({ poses:[pose(a), pose(b)] }, extra);

const MOV = {

  /* ---------------- PEITO ---------------- */
  'supino-reto-barra': P(
    { raizX:126, raizY:122, torso:185, coxa:30, canela:84, braco:32, antebraco:-74, braco2:38, antebraco2:-70 },
    { raizX:126, raizY:122, torso:185, coxa:30, canela:84, braco:-52, antebraco:-76, braco2:-48, antebraco2:-74 },
    { cenario:'banco', equip:'barra', foco:['peito'], raiz:'quadril' }),

  'supino-inclinado-halteres': P(
    { raizX:126, raizY:126, torso:208, coxa:34, canela:80, braco:22, antebraco:-70, braco2:28, antebraco2:-66 },
    { raizX:126, raizY:126, torso:208, coxa:34, canela:80, braco:-58, antebraco:-72, braco2:-54, antebraco2:-70 },
    { cenario:'banco', bancoAng:24, equip:'halteres', foco:['peito','ombro'], raiz:'quadril' }),

  'supino-reto-halteres': P(
    { raizX:126, raizY:122, torso:185, coxa:30, canela:84, braco:28, antebraco:-72, braco2:34, antebraco2:-68 },
    { raizX:126, raizY:122, torso:185, coxa:30, canela:84, braco:-54, antebraco:-76, braco2:-50, antebraco2:-72 },
    { cenario:'banco', equip:'halteres', foco:['peito'], raiz:'quadril' }),

  'crucifixo-halteres': P(
    { raizX:126, raizY:122, torso:185, coxa:30, canela:84, braco:8, antebraco:-16, braco2:14, antebraco2:-10 },
    { raizX:126, raizY:122, torso:185, coxa:30, canela:84, braco:-62, antebraco:-78, braco2:-58, antebraco2:-74 },
    { cenario:'banco', equip:'halteres', foco:['peito'], raiz:'quadril' }),

  'crossover-polia': P(
    { raizX:112, torso:-84, braco:-38, antebraco:-16, braco2:-142, antebraco2:-164, coxa2:96, canela2:86 },
    { raizX:112, torso:-80, braco:38, antebraco:20, braco2:142, antebraco2:160, coxa2:96, canela2:86 },
    { cenario:'chao', equip:'cabosAltos', foco:['peito'], raiz:'tornozelo' }),

  'flexao-de-braco': P(
    { raizX:74, raizY:CENA.chao, antebraco:90, braco:90, torso:-168, coxa:12, canela:10, pe:55, braco2:96, antebraco2:88 },
    { raizX:74, raizY:CENA.chao, antebraco:70, braco:150, torso:-168, coxa:12, canela:10, pe:55, braco2:154, antebraco2:68 },
    { cenario:'chao', equip:'nenhum', foco:['peito'], raiz:'mao' }),

  'flexao-inclinada': P(
    { raizX:150, raizY:128, antebraco:90, braco:90, torso:-160, coxa:16, canela:14, pe:55 },
    { raizX:150, raizY:128, antebraco:70, braco:150, torso:-160, coxa:16, canela:14, pe:55 },
    { cenario:'bancoBaixoMao', equip:'nenhum', foco:['peito'], raiz:'mao' }),

  'flexao-diamante': P(
    { raizX:74, raizY:CENA.chao, antebraco:90, braco:90, torso:-168, coxa:12, canela:10, pe:55 },
    { raizX:74, raizY:CENA.chao, antebraco:82, braco:132, torso:-168, coxa:12, canela:10, pe:55 },
    { cenario:'chao', equip:'nenhum', foco:['braco','peito'], raiz:'mao' }),

  'mergulho-paralelas': P(
    { raizX:116, raizY:104, antebraco:90, braco:90, torso:-84, coxa:104, canela:38, pe:-20 },
    { raizX:116, raizY:104, antebraco:64, braco:134, torso:-78, coxa:104, canela:38, pe:-20 },
    { cenario:'nenhum', equip:'paralelas', foco:['peito','braco'], raiz:'mao' }),

  'peck-deck': P(
    { raizX:104, raizY:128, torso:-84, coxa:8, canela:80, braco:-6, antebraco:-30, braco2:-174, antebraco2:-150 },
    { raizX:104, raizY:128, torso:-84, coxa:8, canela:80, braco:-46, antebraco:-52, braco2:-134, antebraco2:-128 },
    { cenario:'encosto', equip:'maquinaPeso', foco:['peito'], raiz:'quadril' }),

  /* ---------------- COSTAS ---------------- */
  'barra-fixa': P(
    { raizX:112, raizY:44, antebraco:-88, braco:-86, torso:-88, coxa:96, canela:88, pe:20, braco2:-84, antebraco2:-90, coxa2:100, canela2:84 },
    { raizX:112, raizY:44, antebraco:-118, braco:-40, torso:-86, coxa:100, canela:70, pe:20, braco2:-38, antebraco2:-120, coxa2:104, canela2:66 },
    { cenario:'nenhum', equip:'barraFixa', foco:['costas'], raiz:'mao' }),

  'puxada-frente': P(
    { raizX:104, raizY:128, torso:-78, coxa:8, canela:80, braco:-74, antebraco:-82, braco2:-70, antebraco2:-80 },
    { raizX:104, raizY:128, torso:-72, coxa:8, canela:80, braco:-18, antebraco:-104, braco2:-14, antebraco2:-102 },
    { cenario:'encosto', equip:'poliaAlta', foco:['costas'], raiz:'quadril' }),

  'remada-curvada': P(
    { raizX:110, torso:-38, coxa:76, canela:96, braco:88, antebraco:86, braco2:92, antebraco2:84 },
    { raizX:110, torso:-38, coxa:76, canela:96, braco:126, antebraco:44, braco2:130, antebraco2:40 },
    { cenario:'chao', equip:'barra', foco:['costas'], raiz:'tornozelo' }),

  'remada-serrote': P(
    { raizX:118, raizY:118, torso:-20, coxa:14, canela:84, braco:84, antebraco:88, braco2:-6, antebraco2:60, coxa2:70, canela2:96 },
    { raizX:118, raizY:118, torso:-20, coxa:14, canela:84, braco:128, antebraco:38, braco2:-6, antebraco2:60, coxa2:70, canela2:96 },
    { cenario:'bancoBaixo', equip:'halter', foco:['costas'], raiz:'quadril' }),

  'remada-baixa': P(
    { raizX:92, raizY:146, torso:-72, coxa:-6, canela:6, pe:-40, braco:-4, antebraco:2, braco2:0, antebraco2:6 },
    { raizX:92, raizY:146, torso:-84, coxa:-6, canela:6, pe:-40, braco:56, antebraco:-8, braco2:60, antebraco2:-4 },
    { cenario:'chao', equip:'caboBaixo', foco:['costas'], raiz:'quadril' }),

  'remada-elastico': P(
    { raizX:104, torso:-86, braco:-4, antebraco:0, braco2:2, antebraco2:6 },
    { raizX:104, torso:-88, braco:64, antebraco:-14, braco2:68, antebraco2:-10 },
    { cenario:'chao', equip:'elastico', foco:['costas'], raiz:'tornozelo' }),

  'remada-invertida': P(
    { raizX:104, raizY:98, antebraco:-90, braco:-90, torso:-172, coxa:8, canela:6, pe:-58 },
    { raizX:104, raizY:98, antebraco:-116, braco:-46, torso:-172, coxa:8, canela:6, pe:-58 },
    { cenario:'barraBaixa', equip:'barraFixaBaixa', foco:['costas'], raiz:'mao' }),

  'levantamento-terra': P(
    { raizX:110, canela:96, coxa:34, torso:-52, braco:88, antebraco:88, coxa2:38, canela2:92 },
    { raizX:110, canela:90, coxa:90, torso:-88, braco:90, antebraco:90, coxa2:94, canela2:86 },
    { cenario:'chao', equip:'barra', foco:['lombar','gluteo','coxa'], raiz:'tornozelo' }),

  'pullover-halter': P(
    { raizX:126, raizY:122, torso:185, coxa:30, canela:84, braco:-108, antebraco:-118, braco2:-104, antebraco2:-114 },
    { raizX:126, raizY:122, torso:185, coxa:30, canela:84, braco:-58, antebraco:-74, braco2:-54, antebraco2:-70 },
    { cenario:'banco', equip:'halter', foco:['costas','peito'], raiz:'quadril' }),

  'superman': P(
    { raizX:118, raizY:CENA.chao-10, torso:176, coxa:2, canela:0, pe:-30, braco:178, antebraco:176 },
    { raizX:118, raizY:CENA.chao-12, torso:168, coxa:-10, canela:-8, pe:-30, braco:190, antebraco:188 },
    { cenario:'chao', equip:'nenhum', foco:['lombar','gluteo'], raiz:'quadril', dur:3200 }),

  'remada-toalha-porta': P(
    { raizX:106, torso:-78, braco:-6, antebraco:0, braco2:0, antebraco2:4 },
    { raizX:106, torso:-84, braco:60, antebraco:-12, braco2:64, antebraco2:-8 },
    { cenario:'chao', equip:'toalha', foco:['costas'], raiz:'tornozelo' }),

  /* ---------------- PERNAS ---------------- */
  'agachamento-livre': P(
    { raizX:108, canela:90, coxa:90, torso:-85, braco:118, antebraco:-55, coxa2:94, canela2:86 },
    { raizX:108, canela:104, coxa:16, torso:-66, braco:118, antebraco:-52, coxa2:20, canela2:100 },
    { cenario:'chao', equip:'barraCostas', foco:['coxa','gluteo'], raiz:'tornozelo' }),

  'agachamento-goblet': P(
    { raizX:108, canela:90, coxa:90, torso:-86, braco:104, antebraco:-24, braco2:104, antebraco2:-20 },
    { raizX:108, canela:104, coxa:14, torso:-62, braco:104, antebraco:-24, braco2:104, antebraco2:-20, coxa2:18, canela2:100 },
    { cenario:'chao', equip:'kettle', foco:['coxa','gluteo'], raiz:'tornozelo' }),

  'agachamento-corporal': P(
    { raizX:108, canela:90, coxa:90, torso:-86, braco:80, antebraco:8, braco2:84, antebraco2:12 },
    { raizX:108, canela:104, coxa:14, torso:-58, braco:60, antebraco:-4, braco2:64, antebraco2:0, coxa2:18, canela2:100 },
    { cenario:'chao', equip:'nenhum', foco:['coxa','gluteo'], raiz:'tornozelo' }),

  'agachamento-sumo': P(
    { raizX:96, canela:78, coxa:66, torso:-90, braco:92, antebraco:90, coxa2:114, canela2:102 },
    { raizX:96, canela:56, coxa:34, torso:-88, braco:92, antebraco:90, coxa2:146, canela2:124 },
    { cenario:'chao', equip:'halter', foco:['coxa','gluteo'], raiz:'tornozelo' }),

  'leg-press': P(
    { raizX:96, raizY:132, torso:198, coxa:-32, canela:-24, pe:-116, braco:150, antebraco:118, coxa2:-28, canela2:-20 },
    { raizX:96, raizY:132, torso:198, coxa:-74, canela:14, pe:-74, braco:150, antebraco:118, coxa2:-70, canela2:18 },
    { cenario:'legPress', equip:'plataforma', foco:['coxa','gluteo'], raiz:'quadril' }),

  'cadeira-extensora': P(
    { raizX:104, raizY:126, torso:-82, coxa:6, canela:78, pe:10, coxa2:10, canela2:74 },
    { raizX:104, raizY:126, torso:-82, coxa:6, canela:2, pe:-16, coxa2:10, canela2:6 },
    { cenario:'encosto', equip:'roloPerna', foco:['coxa'], raiz:'quadril' }),

  'mesa-flexora': P(
    { raizX:126, raizY:132, torso:176, coxa:-4, canela:-2, pe:-46, braco:172, antebraco:168 },
    { raizX:126, raizY:132, torso:176, coxa:-4, canela:-88, pe:-140, braco:172, antebraco:168 },
    { cenario:'bancoBaixo', equip:'roloPerna', foco:['coxa'], raiz:'quadril' }),

  'stiff-halteres': P(
    { raizX:110, canela:90, coxa:90, torso:-88, braco:90, antebraco:88, braco2:94, antebraco2:92 },
    { raizX:110, canela:92, coxa:52, torso:-34, braco:88, antebraco:86, braco2:92, antebraco2:90 },
    { cenario:'chao', equip:'halteres', foco:['coxa','gluteo'], raiz:'tornozelo' }),

  'terra-romeno': P(
    { raizX:110, canela:90, coxa:90, torso:-88, braco:90, antebraco:88 },
    { raizX:110, canela:92, coxa:50, torso:-32, braco:88, antebraco:86 },
    { cenario:'chao', equip:'barra', foco:['coxa','gluteo','lombar'], raiz:'tornozelo' }),

  'afundo': P(
    { raizX:104, canela:90, coxa:90, torso:-88, braco:92, antebraco:90, coxa2:94, canela2:86 },
    { raizX:104, canela:64, coxa:34, torso:-84, braco:92, antebraco:90, coxa2:142, canela2:74 },
    { cenario:'chao', equip:'nenhum', foco:['coxa','gluteo'], raiz:'tornozelo' }),

  'bulgaro': P(
    { raizX:98, canela:88, coxa:92, torso:-84, braco:92, antebraco:90, coxa2:140, canela2:44 },
    { raizX:98, canela:66, coxa:30, torso:-76, braco:92, antebraco:90, coxa2:150, canela2:30 },
    { cenario:'bancoAtras', equip:'nenhum', foco:['coxa','gluteo'], raiz:'tornozelo' }),

  'step-up': P(
    { raizX:96, canela:90, coxa:90, torso:-86, braco:92, antebraco:90, coxa2:56, canela2:118 },
    { raizX:96, canela:90, coxa:90, torso:-86, braco:92, antebraco:90, coxa2:24, canela2:96 },
    { cenario:'degrau', equip:'nenhum', foco:['coxa','gluteo'], raiz:'tornozelo' }),

  'elevacao-pelvica': P(
    { raizX:112, raizY:150, torso:200, coxa:16, canela:-84, pe:-20, braco:150, antebraco:140 },
    { raizX:112, raizY:128, torso:186, coxa:24, canela:-80, pe:-20, braco:150, antebraco:140 },
    { cenario:'bancoCostas', equip:'nenhum', foco:['gluteo'], raiz:'quadril' }),

  'panturrilha-em-pe': P(
    { raizX:110, canela:90, coxa:90, torso:-90, braco:90, antebraco:88, pe:6 },
    { raizX:110, raizY:CENA.chao-13, canela:90, coxa:90, torso:-90, braco:90, antebraco:88, pe:38 },
    { cenario:'chao', equip:'nenhum', foco:['panturrilha'], raiz:'tornozelo', dur:2200 }),

  /* ---------------- OMBROS ---------------- */
  'desenvolvimento-halteres': P(
    { raizX:104, raizY:128, torso:-86, coxa:10, canela:80, braco:36, antebraco:-76, braco2:40, antebraco2:-72 },
    { raizX:104, raizY:128, torso:-88, coxa:10, canela:80, braco:-74, antebraco:-84, braco2:-70, antebraco2:-82 },
    { cenario:'encosto', equip:'halteres', foco:['ombro'], raiz:'quadril' }),

  'desenvolvimento-militar': P(
    { raizX:110, torso:-88, braco:38, antebraco:-78, braco2:42, antebraco2:-74 },
    { raizX:110, torso:-90, braco:-76, antebraco:-86, braco2:-72, antebraco2:-84 },
    { cenario:'chao', equip:'barra', foco:['ombro'], raiz:'tornozelo' }),

  'elevacao-lateral': P(
    { raizX:110, torso:-90, braco:84, antebraco:88, braco2:96, antebraco2:92, coxa:84, coxa2:96 },
    { raizX:110, torso:-90, braco:4, antebraco:8, braco2:176, antebraco2:172, coxa:84, coxa2:96 },
    { cenario:'chao', equip:'halteres', foco:['ombro'], raiz:'tornozelo' }),

  'elevacao-lateral-garrafa': P(
    { raizX:110, torso:-90, braco:84, antebraco:88, braco2:96, antebraco2:92, coxa:84, coxa2:96 },
    { raizX:110, torso:-90, braco:4, antebraco:8, braco2:176, antebraco2:172, coxa:84, coxa2:96 },
    { cenario:'chao', equip:'garrafas', foco:['ombro'], raiz:'tornozelo' }),

  'elevacao-frontal': P(
    { raizX:110, torso:-88, braco:88, antebraco:86, braco2:94, antebraco2:92 },
    { raizX:110, torso:-88, braco:-6, antebraco:-4, braco2:96, antebraco2:94 },
    { cenario:'chao', equip:'halteres', foco:['ombro'], raiz:'tornozelo' }),

  'crucifixo-inverso': P(
    { raizX:110, torso:-36, coxa:78, canela:96, braco:86, antebraco:84, braco2:92, antebraco2:90 },
    { raizX:110, torso:-36, coxa:78, canela:96, braco:6, antebraco:4, braco2:172, antebraco2:170 },
    { cenario:'chao', equip:'halteres', foco:['ombro','costas'], raiz:'tornozelo' }),

  'face-pull': P(
    { raizX:104, torso:-88, braco:-14, antebraco:-10, braco2:-8, antebraco2:-4 },
    { raizX:104, torso:-88, braco:-34, antebraco:-152, braco2:-28, antebraco2:-158 },
    { cenario:'chao', equip:'cabosAltos', foco:['ombro','costas'], raiz:'tornozelo' }),

  'pike-push-up': P(
    { raizX:74, raizY:CENA.chao, antebraco:90, braco:90, torso:-130, coxa:52, canela:76, pe:40 },
    { raizX:74, raizY:CENA.chao, antebraco:66, braco:146, torso:-130, coxa:52, canela:76, pe:40 },
    { cenario:'chao', equip:'nenhum', foco:['ombro'], raiz:'mao' }),

  /* ---------------- BÍCEPS ---------------- */
  'rosca-direta': P(
    { raizX:110, torso:-88, braco:95, antebraco:88, braco2:99, antebraco2:92 },
    { raizX:110, torso:-88, braco:100, antebraco:-44, braco2:104, antebraco2:-40 },
    { cenario:'chao', equip:'barra', foco:['braco'], raiz:'tornozelo' }),

  'rosca-alternada': P(
    { raizX:110, torso:-88, braco:95, antebraco:88, braco2:99, antebraco2:92 },
    { raizX:110, torso:-88, braco:100, antebraco:-46, braco2:99, antebraco2:92 },
    { cenario:'chao', equip:'halteres', foco:['braco'], raiz:'tornozelo' }),

  'rosca-martelo': P(
    { raizX:110, torso:-88, braco:95, antebraco:88, braco2:99, antebraco2:92 },
    { raizX:110, torso:-88, braco:100, antebraco:-40, braco2:104, antebraco2:-36 },
    { cenario:'chao', equip:'halteres', foco:['braco'], raiz:'tornozelo' }),

  'rosca-mochila': P(
    { raizX:110, torso:-88, braco:95, antebraco:86, braco2:99, antebraco2:90 },
    { raizX:110, torso:-88, braco:98, antebraco:-30, braco2:102, antebraco2:-26 },
    { cenario:'chao', equip:'mochila', foco:['braco'], raiz:'tornozelo' }),

  'rosca-scott': P(
    { raizX:114, raizY:130, torso:-72, coxa:16, canela:78, braco:44, antebraco:36, braco2:48, antebraco2:40 },
    { raizX:114, raizY:130, torso:-72, coxa:16, canela:78, braco:44, antebraco:-58, braco2:48, antebraco2:-54 },
    { cenario:'bancoScott', equip:'barra', foco:['braco'], raiz:'quadril' }),

  /* ---------------- TRÍCEPS ---------------- */
  'triceps-corda': P(
    { raizX:106, torso:-86, braco:98, antebraco:-24, braco2:102, antebraco2:-20 },
    { raizX:106, torso:-86, braco:96, antebraco:78, braco2:100, antebraco2:82 },
    { cenario:'chao', equip:'poliaAltaMao', foco:['braco'], raiz:'tornozelo' }),

  'triceps-testa': P(
    { raizX:126, raizY:122, torso:185, coxa:30, canela:84, braco:-62, antebraco:-166, braco2:-58, antebraco2:-162 },
    { raizX:126, raizY:122, torso:185, coxa:30, canela:84, braco:-62, antebraco:-70, braco2:-58, antebraco2:-66 },
    { cenario:'banco', equip:'barra', foco:['braco'], raiz:'quadril' }),

  'triceps-frances': P(
    { raizX:104, raizY:128, torso:-86, coxa:10, canela:80, braco:-72, antebraco:172, braco2:-68, antebraco2:176 },
    { raizX:104, raizY:128, torso:-86, coxa:10, canela:80, braco:-74, antebraco:-84, braco2:-70, antebraco2:-80 },
    { cenario:'encosto', equip:'halter', foco:['braco'], raiz:'quadril' }),

  'triceps-coice': P(
    { raizX:118, raizY:118, torso:-22, coxa:14, canela:84, braco:150, antebraco:88, braco2:-6, antebraco2:60, coxa2:70, canela2:96 },
    { raizX:118, raizY:118, torso:-22, coxa:14, canela:84, braco:150, antebraco:158, braco2:-6, antebraco2:60, coxa2:70, canela2:96 },
    { cenario:'bancoBaixo', equip:'halter', foco:['braco'], raiz:'quadril' }),

  'mergulho-banco': P(
    { raizX:120, raizY:120, antebraco:90, braco:90, torso:-100, coxa:4, canela:12, pe:-52 },
    { raizX:120, raizY:120, antebraco:66, braco:132, torso:-100, coxa:4, canela:12, pe:-52 },
    { cenario:'bancoMao', equip:'nenhum', foco:['braco'], raiz:'mao' }),

  /* ---------------- CORE ---------------- */
  'prancha': P(
    { raizX:76, raizY:CENA.chao, antebraco:0, braco:118, torso:-170, coxa:10, canela:8, pe:55 },
    { raizX:76, raizY:CENA.chao, antebraco:0, braco:121, torso:-173, coxa:13, canela:10, pe:55 },
    { cenario:'chao', equip:'nenhum', foco:['abdomen'], raiz:'mao', dur:3600 }),

  'prancha-lateral': P(
    { raizX:78, raizY:CENA.chao, antebraco:0, braco:112, torso:-168, coxa:8, canela:6, pe:40, braco2:-70, antebraco2:-74 },
    { raizX:78, raizY:CENA.chao, antebraco:0, braco:115, torso:-171, coxa:10, canela:8, pe:40, braco2:-70, antebraco2:-74 },
    { cenario:'chao', equip:'nenhum', foco:['abdomen'], raiz:'mao', dur:3600 }),

  'abdominal-supra': P(
    { raizX:126, raizY:CENA.chao-12, torso:182, coxa:34, canela:126, pe:-6, braco:150, antebraco:-140, braco2:154, antebraco2:-136 },
    { raizX:126, raizY:CENA.chao-12, torso:212, coxa:34, canela:126, pe:-6, braco:170, antebraco:-120, braco2:174, antebraco2:-116 },
    { cenario:'chao', equip:'nenhum', foco:['abdomen'], raiz:'quadril' }),

  'elevacao-pernas': P(
    { raizX:126, raizY:CENA.chao-12, torso:180, coxa:-2, canela:0, pe:-40, braco:158, antebraco:150 },
    { raizX:126, raizY:CENA.chao-12, torso:180, coxa:-84, canela:-86, pe:-130, braco:158, antebraco:150 },
    { cenario:'chao', equip:'nenhum', foco:['abdomen'], raiz:'quadril' }),

  'dead-bug': P(
    { raizX:126, raizY:CENA.chao-12, torso:180, coxa:-88, canela:-4, pe:-60, braco:-88, antebraco:-86, coxa2:-84, canela2:0, braco2:-92, antebraco2:-90 },
    { raizX:126, raizY:CENA.chao-12, torso:180, coxa:-16, canela:-8, pe:-60, braco:-140, antebraco:-146, coxa2:-84, canela2:0, braco2:-92, antebraco2:-90 },
    { cenario:'chao', equip:'nenhum', foco:['abdomen'], raiz:'quadril' }),

  'abdominal-bicicleta': P(
    { raizX:126, raizY:CENA.chao-12, torso:196, coxa:-90, canela:-10, pe:-60, coxa2:-20, canela2:-16, braco:168, antebraco:-118, braco2:172, antebraco2:-114 },
    { raizX:126, raizY:CENA.chao-12, torso:196, coxa:-20, canela:-16, pe:-60, coxa2:-90, canela2:-10, braco:168, antebraco:-118, braco2:172, antebraco2:-114 },
    { cenario:'chao', equip:'nenhum', foco:['abdomen'], raiz:'quadril', dur:2000 }),

  'mountain-climber': P(
    { raizX:74, raizY:CENA.chao, antebraco:90, braco:90, torso:-168, coxa:14, canela:12, pe:55, coxa2:64, canela2:8 },
    { raizX:74, raizY:CENA.chao, antebraco:90, braco:90, torso:-168, coxa:64, canela:8, pe:55, coxa2:14, canela2:12 },
    { cenario:'chao', equip:'nenhum', foco:['abdomen'], raiz:'mao', dur:1500 }),

  /* ---------------- CARDIO ---------------- */
  'burpee': P(
    { raizX:80, raizY:CENA.chao, antebraco:90, braco:90, torso:-168, coxa:12, canela:10, pe:55 },
    { raizX:80, raizY:CENA.chao, antebraco:90, braco:90, torso:-146, coxa:56, canela:128, pe:20 },
    { cenario:'chao', equip:'nenhum', foco:['abdomen','coxa'], raiz:'mao', dur:1900 }),

  'polichinelo': P(
    { raizX:110, torso:-90, braco:86, antebraco:88, braco2:94, antebraco2:92, coxa:88, coxa2:92, canela:88, canela2:92 },
    { raizX:110, torso:-90, braco:-46, antebraco:-50, braco2:226, antebraco2:230, coxa:66, coxa2:114, canela:66, canela2:114 },
    { cenario:'chao', equip:'nenhum', foco:['coxa'], raiz:'tornozelo', dur:1400 }),

  'pular-corda': P(
    { raizX:110, torso:-90, braco:104, antebraco:36, braco2:108, antebraco2:40, coxa:88, canela:88, pe:14 },
    { raizX:110, raizY:CENA.chao-9, torso:-90, braco:104, antebraco:36, braco2:108, antebraco2:40, coxa:88, canela:88, pe:34 },
    { cenario:'chao', equip:'cordaPular', foco:['panturrilha'], raiz:'tornozelo', dur:1200 }),

  'corrida-esteira': P(
    { raizX:106, canela:90, coxa:88, torso:-82, braco:118, antebraco:32, braco2:64, antebraco2:150, coxa2:52, canela2:118, pe:6 },
    { raizX:106, canela:90, coxa:88, torso:-82, braco:64, antebraco:150, braco2:118, antebraco2:32, coxa2:126, canela2:64, pe:6 },
    { cenario:'esteira', equip:'nenhum', foco:['coxa','panturrilha'], raiz:'tornozelo', dur:1300 })
};
