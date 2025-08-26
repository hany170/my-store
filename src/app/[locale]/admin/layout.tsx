import {requireAdmin} from '@/lib/auth';
import {redirect} from 'next/navigation';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({children}:{children: React.ReactNode}){
  const {isAdmin} = await requireAdmin();
  if (!isAdmin) redirect('/auth/sign-in');
  
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}


