import {createClient} from '@/lib/supabase/server';
import {Link} from '@/i18n/routing';

export default async function AdminProducts(){
  const supabase = await createClient();
  const {data} = await supabase.from('products').select('id,title,slug,price_cents,stock_quantity,status').order('created_at', {ascending: false});
  const list: Array<{id: string; title: string; slug: string; price_cents: number; stock_quantity: number; status: string}> = data ?? [];
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <Link href="/admin/products/new" className="rounded-md border px-3 py-2">New product</Link>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Stock</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p)=> (
              <tr key={p.id} className="border-t">
                <td className="p-2">{p.title}</td>
                <td className="p-2">${(p.price_cents/100).toFixed(2)}</td>
                <td className="p-2">{p.stock_quantity}</td>
                <td className="p-2">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


