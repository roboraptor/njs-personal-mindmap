import { redirect } from 'next/navigation';

export default function SettingsPage() {
  // Automaticky přesměrujeme na první sekci v nastavení
  redirect('/settings/maps');
}
