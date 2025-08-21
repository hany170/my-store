import {requireAdmin} from '@/lib/auth';
import {redirect} from 'next/navigation';

export default async function AdminLayout({children}:{children: React.ReactNode}){
  const {isAdmin} = await requireAdmin();
  if (!isAdmin) redirect('/auth/sign-in');
  return (
    <div className="px-6 sm:px-8 md:px-12">
      <h1 className="text-2xl font-semibold mb-6">Admin</h1>
      {children}
    </div>
  );
}


