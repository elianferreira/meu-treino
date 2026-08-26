/* Conta e sincronização (Supabase, direto pela API REST — sem biblioteca externa).
   Sem as chaves abaixo preenchidas, o app funciona normalmente, só que apenas neste aparelho. */
'use strict';

const NUVEM = {
  url:  '',   // ex.: https://abcdefgh.supabase.co
  chave:''    // chave "anon public" do projeto
};

const CHAVE_AUTH = 'meutreino.auth';
let AUTH = null;          // { access_token, refresh_token, user_id, email, expira }
let sincronizando = false, pendente = null;

function nuvemLigada(){ return !!(NUVEM.url && NUVEM.chave); }
function logado(){ return !!(AUTH && AUTH.access_token); }

function carregarAuth(){
  try { AUTH = JSON.parse(localStorage.getItem(CHAVE_AUTH) || 'null'); } catch(e){ AUTH = null; }
}
function guardarAuth(a){
  AUTH = a;
  if (a) localStorage.setItem(CHAVE_AUTH, JSON.stringify(a));
  else localStorage.removeItem(CHAVE_AUTH);
}

async function apiAuth(caminho, corpo){
  const r = await fetch(NUVEM.url + '/auth/v1/' + caminho, {
    method:'POST',
    headers:{ 'apikey':NUVEM.chave, 'Content-Type':'application/json' },
    body:JSON.stringify(corpo)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.msg || j.error_description || j.message || 'Não deu para conectar.');
  return j;
}

function guardarSessao(j){
  if (!j.access_token) return false;
  guardarAuth({
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    user_id: j.user ? j.user.id : (AUTH && AUTH.user_id),
    email: j.user ? j.user.email : (AUTH && AUTH.email),
    expira: Date.now() + ((j.expires_in || 3600) - 60) * 1000
  });
  return true;
}

async function criarConta(email, senha){
  const j = await apiAuth('signup', { email, password:senha });
  if (!guardarSessao(j)) return { confirmar:true };   // projeto exige confirmar e-mail
  return { confirmar:false };
}

async function entrar(email, senha){
  const j = await apiAuth('token?grant_type=password', { email, password:senha });
  if (!guardarSessao(j)) throw new Error('Login não retornou sessão.');
}

function sair(){ guardarAuth(null); }

async function renovar(){
  if (!AUTH || !AUTH.refresh_token) return false;
  try {
    const j = await apiAuth('token?grant_type=refresh_token', { refresh_token:AUTH.refresh_token });
    return guardarSessao(j);
  } catch(e){ guardarAuth(null); return false; }
}

async function apiDados(metodo, extra, corpo){
  if (AUTH && AUTH.expira && Date.now() > AUTH.expira) await renovar();
  const chamar = () => fetch(NUVEM.url + '/rest/v1/treinos' + (extra || ''), {
    method: metodo,
    headers: Object.assign({
      'apikey': NUVEM.chave,
      'Authorization': 'Bearer ' + AUTH.access_token,
      'Content-Type': 'application/json'
    }, metodo === 'POST' ? { 'Prefer':'resolution=merge-duplicates,return=minimal' } : {}),
    body: corpo ? JSON.stringify(corpo) : undefined
  });
  let r = await chamar();
  if (r.status === 401 && await renovar()) r = await chamar();
  return r;
}

/* baixa o que está na nuvem; devolve null se não houver nada */
async function baixar(){
  const r = await apiDados('GET', '?select=dados,atualizado_em&limit=1');
  if (!r.ok) throw new Error('Falha ao baixar (' + r.status + ')');
  const linhas = await r.json();
  return linhas.length ? linhas[0] : null;
}

async function subir(dados, quando){
  const r = await apiDados('POST', '', [{
    user_id: AUTH.user_id,
    dados: dados,
    atualizado_em: new Date(quando).toISOString()
  }]);
  if (!r.ok) throw new Error('Falha ao enviar (' + r.status + ')');
}

/* junta local e remoto: vence quem foi alterado por último */
async function sincronizar(forcado){
  if (!nuvemLigada() || !logado() || sincronizando) return { estado:'pulado' };
  if (!navigator.onLine) return { estado:'offline' };
  sincronizando = true;
  try {
    const local = dadosLocais();
    const remoto = await baixar();
    const tLocal = local.atualizado || 0;
    const tRemoto = remoto ? Date.parse(remoto.atualizado_em) : 0;

    if (remoto && tRemoto > tLocal + 1500) {
      aplicarDados(remoto.dados, tRemoto);
      return { estado:'baixou' };
    }
    if (!remoto || tLocal > tRemoto + 1500 || forcado) {
      await subir(local, tLocal || Date.now());
      return { estado:'subiu' };
    }
    return { estado:'igual' };
  } finally { sincronizando = false; }
}

/* agenda um envio depois das alterações pararem */
function agendarSync(){
  if (!nuvemLigada() || !logado()) return;
  clearTimeout(pendente);
  pendente = setTimeout(() => { sincronizar().catch(() => {}); }, 4000);
}

carregarAuth();
