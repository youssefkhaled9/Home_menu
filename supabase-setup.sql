-- شغّل الملف ده في Supabase: SQL Editor > New query > Run

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cat text not null check (cat in ('فطار','غدا','عشا','سناك')),
  last_eaten timestamptz,
  created_at timestamptz not null default now()
);

alter table public.meals enable row level security;

-- أي حد معاه الرابط والمفتاح يقدر يقرأ ويعدل (مناسب للبيت/العيلة)
create policy "public read"   on public.meals for select using (true);
create policy "public insert" on public.meals for insert with check (true);
create policy "public update" on public.meals for update using (true);
create policy "public delete" on public.meals for delete using (true);

-- تفعيل التحديث اللحظي
alter publication supabase_realtime add table public.meals;
