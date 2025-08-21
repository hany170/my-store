import {redirect} from 'next/navigation';

// This page only renders when the user visits the root path `/`
// Since we use `localePrefix: 'always'`, we redirect to the default locale
export default function RootPage() {
  redirect('/en');
}