-- Orders and their items. Dates/times are shop-local (Europe/Skopje) on purpose.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (length(trim(customer_name)) > 0),
  phone text,
  order_date date not null,
  order_time time not null check (extract(minute from order_time)::int % 15 = 0 and extract(second from order_time) = 0),
  notes text,
  status text not null default 'pending' check (status in ('pending', 'done')),
  total integer not null default 0 check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_key text not null,
  label text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  note text,
  position integer not null default 0
);

create index if not exists orders_date_time_idx on public.orders (order_date, order_time);
create index if not exists order_items_order_id_idx on public.order_items (order_id, position);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Atomic create/update of an order with its items (items are replaced).
-- p_order: {customer_name, phone, order_date, order_time, notes, total}
-- p_items: [{product_key, label, quantity, unit_price, note}]
create or replace function public.save_order(p_id uuid, p_order jsonb, p_items jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_id is null then
    insert into public.orders (customer_name, phone, order_date, order_time, notes, total)
    values (
      p_order->>'customer_name',
      nullif(p_order->>'phone', ''),
      (p_order->>'order_date')::date,
      (p_order->>'order_time')::time,
      nullif(p_order->>'notes', ''),
      (p_order->>'total')::int
    )
    returning id into v_id;
  else
    update public.orders set
      customer_name = p_order->>'customer_name',
      phone = nullif(p_order->>'phone', ''),
      order_date = (p_order->>'order_date')::date,
      order_time = (p_order->>'order_time')::time,
      notes = nullif(p_order->>'notes', ''),
      total = (p_order->>'total')::int
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception 'order % not found', p_id using errcode = 'P0002';
    end if;

    delete from public.order_items where order_id = v_id;
  end if;

  insert into public.order_items (order_id, product_key, label, quantity, unit_price, note, position)
  select
    v_id,
    item->>'product_key',
    item->>'label',
    (item->>'quantity')::int,
    (item->>'unit_price')::int,
    nullif(item->>'note', ''),
    (ord - 1)::int
  from jsonb_array_elements(p_items) with ordinality as t(item, ord);

  return v_id;
end;
$$;

-- Orders per day for a date range (week strip, month calendar).
create or replace function public.order_counts(p_from date, p_to date)
returns table (order_date date, order_count integer)
language sql
stable
security invoker
set search_path = public
as $$
  select o.order_date, count(*)::int
  from public.orders o
  where o.order_date between p_from and p_to
  group by o.order_date;
$$;

-- RLS: v1 has no login, so the anon role gets full access.
-- TODO: tighten these policies (e.g. to `authenticated`) once auth is added.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "anon full access" on public.orders;
create policy "anon full access" on public.orders
  for all to anon using (true) with check (true);

drop policy if exists "anon full access" on public.order_items;
create policy "anon full access" on public.order_items
  for all to anon using (true) with check (true);

grant usage on schema public to anon;
grant select, insert, update, delete on public.orders, public.order_items to anon;
grant execute on function public.save_order(uuid, jsonb, jsonb) to anon;
grant execute on function public.order_counts(date, date) to anon;

-- Make PostgREST pick up the new tables/functions immediately.
notify pgrst, 'reload schema';
