"use client";
import {useForm, type Resolver} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {createProduct} from '@/lib/server-actions/admin';
import {useRouter} from '@/i18n/routing';
import {toast} from 'sonner';

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  price_cents: z.coerce.number().int().positive(),
  stock_quantity: z.coerce.number().int().nonnegative(),
  images: z.string().optional(),
  description: z.string().optional()
});

export default function NewProductPage(){
  type FormValues = z.infer<typeof schema>;
  const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<FormValues>({resolver: zodResolver(schema) as unknown as Resolver<FormValues>});
  const router = useRouter();
  const onSubmit = async (values: z.infer<typeof schema>)=>{
    const payload = {
      title: values.title,
      slug: values.slug,
      price_cents: Number(values.price_cents),
      stock_quantity: Number(values.stock_quantity),
      images: values.images ? values.images.split(/\s*,\s*/) : [],
      description: values.description ?? null
    } as {
      title: string; slug: string; price_cents: number; stock_quantity: number; images?: string[]; description?: string | null;
    };
    const {ok, error} = await createProduct(payload);
    if (!ok){
      toast.error(error ?? 'Failed');
      return;
    }
    toast.success('Created');
    router.replace('/admin/products' as never);
  };
  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">New product</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input className="w-full h-10 rounded-md border px-3" {...register('title')} />
          {errors.title && <p className="text-sm text-red-600 mt-1">{String(errors.title.message)}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Slug</label>
          <input className="w-full h-10 rounded-md border px-3" {...register('slug')} />
          {errors.slug && <p className="text-sm text-red-600 mt-1">{String(errors.slug.message)}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Price (cents)</label>
            <input type="number" className="w-full h-10 rounded-md border px-3" {...register('price_cents')} />
          </div>
          <div>
            <label className="block text-sm mb-1">Stock</label>
            <input type="number" className="w-full h-10 rounded-md border px-3" {...register('stock_quantity')} />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Images (comma-separated URLs)</label>
          <textarea className="w-full rounded-md border p-3" rows={3} {...register('images')} />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea className="w-full rounded-md border p-3" rows={5} {...register('description')} />
        </div>
        <button disabled={isSubmitting} className="inline-flex items-center rounded-md bg-gray-900 text-white px-4 py-2 font-medium disabled:opacity-50">
          {isSubmitting ? 'Creating…' : 'Create'}
        </button>
      </form>
    </div>
  );
}


