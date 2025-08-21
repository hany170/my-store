-- Schema for Aurora Store (minimal subset to run the demo)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  sku text,
  description text,
  price_cents integer not null,
  compare_at_cents integer,
  images text[],
  stock_quantity integer not null default 0,
  category_id uuid references categories(id),
  status text not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone
);

-- Cart tables (guest carts)
create table if not exists carts (
  id uuid primary key,
  user_id uuid,
  created_at timestamp with time zone default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id) on delete cascade,
  product_id uuid references products(id),
  qty integer not null default 1,
  unit_price_cents integer not null default 0,
  total_cents integer not null default 0,
  unique(cart_id, product_id)
);

-- Maintain pricing on insert/update
create or replace function set_cart_item_price() returns trigger as $$
begin
  if NEW.unit_price_cents = 0 then
    select price_cents into NEW.unit_price_cents from products where id = NEW.product_id;
  end if;
  NEW.total_cents := NEW.unit_price_cents * NEW.qty;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists cart_item_price_trg on cart_items;
create trigger cart_item_price_trg before insert or update on cart_items
for each row execute procedure set_cart_item_price();

-- Helper RPCs
create or replace function add_to_cart(p_cart_id uuid, p_product_id uuid, p_qty integer)
returns void as $$
begin
  insert into cart_items(cart_id, product_id, qty)
  values (p_cart_id, p_product_id, greatest(1, p_qty))
  on conflict (cart_id, product_id)
  do update set qty = cart_items.qty + excluded.qty,
               total_cents = (cart_items.qty + excluded.qty) * cart_items.unit_price_cents;
end;
$$ language plpgsql;

-- Order tables
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  status text not null default 'paid',
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  tax_cents integer not null default 0,
  shipping_cents integer not null default 0,
  total_cents integer not null default 0,
  created_at timestamp with time zone default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  qty integer not null,
  unit_price_cents integer not null,
  total_cents integer not null
);

-- View for cart items with product info
create or replace view cart_items_view as
select ci.*, c.id as cart_id, p.title, (p.images)[1] as image
from cart_items ci
join carts c on c.id = ci.cart_id
join products p on p.id = ci.product_id;

-- View for order items with product info
create or replace view order_items_view as
select oi.*, p.title from order_items oi join products p on p.id = oi.product_id;

-- RPC to create an order from a cart
create or replace function is_admin() returns boolean as $$
  select coalesce(((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean), false);
$$ language sql stable;

create or replace function create_order_from_cart(p_cart_id uuid)
returns orders as $$
declare
  o orders;
  subtotal integer;
  discount integer;
begin
  select coalesce(sum(total_cents),0) into subtotal from cart_items where cart_id = p_cart_id;
  discount := 0;
  insert into orders(user_id, subtotal_cents, discount_cents, total_cents)
  values (auth.uid(), subtotal, discount, greatest(0, subtotal - discount))
  returning * into o;
  insert into order_items(order_id, product_id, qty, unit_price_cents, total_cents)
  select o.id, product_id, qty, unit_price_cents, total_cents from cart_items where cart_id = p_cart_id;
  delete from cart_items where cart_id = p_cart_id;
  return o;
end;
$$ language plpgsql;

-- Coupons
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('percent','fixed')),
  value integer not null, -- percent (e.g., 10) or cents (e.g., 1000)
  min_subtotal_cents integer default 0,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone
);

create or replace function compute_coupon_discount(p_cart_id uuid, p_code text)
returns integer as $$
declare
  subtotal integer;
  discount integer := 0;
  c coupons;
begin
  if p_code is null or length(p_code) = 0 then
    return 0;
  end if;
  select coalesce(sum(total_cents),0) into subtotal from cart_items where cart_id = p_cart_id;
  select * into c from coupons where upper(code) = upper(p_code) and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now());
  if not found then
    return 0;
  end if;
  if subtotal < coalesce(c.min_subtotal_cents,0) then
    return 0;
  end if;
  if c.type = 'percent' then
    discount := floor(subtotal * (c.value::numeric / 100.0));
  else
    discount := c.value;
  end if;
  if discount > subtotal then discount := subtotal; end if;
  return discount;
end;
$$ language plpgsql;

create or replace function create_order_from_cart_with_coupon(p_cart_id uuid, p_code text)
returns orders as $$
declare
  o orders;
  subtotal integer;
  discount integer;
begin
  select coalesce(sum(total_cents),0) into subtotal from cart_items where cart_id = p_cart_id;
  discount := compute_coupon_discount(p_cart_id, p_code);
  insert into orders(user_id, subtotal_cents, discount_cents, total_cents)
  values (auth.uid(), subtotal, discount, greatest(0, subtotal - discount))
  returning * into o;
  insert into order_items(order_id, product_id, qty, unit_price_cents, total_cents)
  select o.id, product_id, qty, unit_price_cents, total_cents from cart_items where cart_id = p_cart_id;
  delete from cart_items where cart_id = p_cart_id;
  return o;
end;
$$ language plpgsql;

-- Addresses
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  full_name text not null,
  phone text,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null,
  is_default boolean default false
);

-- Wishlists
create table if not exists wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamp with time zone default now()
);

create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid references wishlists(id) on delete cascade,
  product_id uuid references products(id),
  created_at timestamp with time zone default now(),
  unique(wishlist_id, product_id)
);

-- Reviews with moderation
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  user_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  body text,
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

-- RLS policies for user-specific data
alter table orders enable row level security;
alter table addresses enable row level security;
alter table wishlists enable row level security;
alter table wishlist_items enable row level security;
alter table reviews enable row level security;

-- orders: owner can read, admin can read all
drop policy if exists orders_owner_select on orders;
create policy orders_owner_select on orders for select using (
  user_id = auth.uid() or is_admin()
);
drop policy if exists orders_owner_insert on orders;
create policy orders_owner_insert on orders for insert with check (
  user_id = auth.uid()
);

-- addresses
drop policy if exists addresses_owner_all on addresses;
create policy addresses_owner_all on addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- wishlists
drop policy if exists wishlists_owner_all on wishlists;
create policy wishlists_owner_all on wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists wishlist_items_via_owner on wishlist_items;
create policy wishlist_items_via_owner on wishlist_items for all using (exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid())) with check (exists (select 1 from wishlists w where w.id = wishlist_id and w.user_id = auth.uid()));

-- reviews: owner can manage own, admin can moderate
drop policy if exists reviews_owner_all on reviews;
create policy reviews_owner_all on reviews for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists reviews_admin_moderate on reviews;
create policy reviews_admin_moderate on reviews for update using (is_admin());

-- Seed data
insert into categories(name, slug, description) values
  ('Essentials', 'essentials', 'Daily essentials'),
  ('Tech', 'tech', 'Tech accessories')
on conflict do nothing;

insert into products(title, slug, sku, description, price_cents, compare_at_cents, images, stock_quantity, category_id, status)
select * from (
  values
  ('Aurora Bottle', 'aurora-bottle', 'AUR-001', 'Insulated steel bottle', 2900, 3900, array['https://images.unsplash.com/photo-1526406915894-6c7410a65949?w=800'], 50, (select id from categories where slug='essentials'), 'active'),
  ('Aurora Backpack', 'aurora-backpack', 'AUR-002', 'Minimal everyday backpack', 8900, null, array['https://images.unsplash.com/photo-1514477917009-389c76a86b68?w=800'], 25, (select id from categories where slug='essentials'), 'active'),
  ('Aurora Charger', 'aurora-charger', 'AUR-003', '65W USB-C GaN charger', 4900, 5900, array['https://images.unsplash.com/photo-1516642499105-492ff3ac5219?w=800'], 100, (select id from categories where slug='tech'), 'active')
) as v(title, slug, sku, description, price_cents, compare_at_cents, images, stock_quantity, category_id, status)
on conflict (slug) do nothing;

insert into coupons(code, type, value, min_subtotal_cents)
values ('SAVE10','percent',10,0), ('WELCOME15','percent',15,5000), ('FLAT5','fixed',500,3000)
on conflict (code) do nothing;


