import {createClient} from '@/lib/supabase/server';
import {notFound} from 'next/navigation';

export default async function OrderDetailPage({params}:{params: Promise<{ id: string }>}){
  const {id} = await params;
  const supabase = await createClient();
  const {data: order} = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (!order) return notFound();
  const {data: items} = await supabase.from('order_items_view').select('*').eq('order_id', id);
  return (
    <div className="px-6 sm:px-8 md:px-12">
      <h1 className="text-2xl font-semibold mb-6">Order #{order.id.slice(0,8)}</h1>
      <div className="rounded-md border p-4">
        <p className="text-sm text-muted-foreground">Status: {order.status}</p>
        <ul className="divide-y mt-4">
          {(items ?? []).map((i)=> (
            <li key={i.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{i.title}</p>
                <p className="text-sm text-muted-foreground">Qty {i.qty}</p>
              </div>
              <div className="font-semibold">${((i.total_cents ?? 0)/100).toFixed(2)}</div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-end gap-8">
          <span className="text-muted-foreground">Total</span>
          <span className="font-semibold">${((order.total_cents ?? 0)/100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}


