-- Colección de cartas por usuario: qué espíritu:variante tiene y en qué estado.
-- Sustituye (para usuarios con sesión) al localStorage que usaba useCollection.
create table public.collection_cards (
  user_id uuid not null references auth.users (id) on delete cascade,
  card text not null,
  state text not null check (state in ('owned', 'mastered')),
  updated_at timestamptz not null default now(),
  primary key (user_id, card)
);

alter table public.collection_cards enable row level security;

create policy "select own cards" on public.collection_cards
  for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "insert own cards" on public.collection_cards
  for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "update own cards" on public.collection_cards
  for update
  to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "delete own cards" on public.collection_cards
  for delete
  to authenticated
  using ( (select auth.uid()) = user_id );

-- Los proyectos nuevos ya no exponen las tablas a la Data API por defecto.
grant select, insert, update, delete on public.collection_cards to authenticated;
