-- Meu Treino — estrutura da nuvem.
-- Rode isto uma vez no SQL Editor do seu projeto Supabase.
-- Cria uma linha por usuário, e ninguém consegue ler ou escrever a linha de outro.

create table if not exists public.treinos (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  dados         jsonb       not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

alter table public.treinos enable row level security;

drop policy if exists "dono le"       on public.treinos;
drop policy if exists "dono insere"   on public.treinos;
drop policy if exists "dono atualiza" on public.treinos;

create policy "dono le" on public.treinos
  for select using (auth.uid() = user_id);

create policy "dono insere" on public.treinos
  for insert with check (auth.uid() = user_id);

create policy "dono atualiza" on public.treinos
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
