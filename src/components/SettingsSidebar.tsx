'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SettingsSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/settings/maps', label: 'Správa map' },
    { href: '/settings/scripts', label: 'Skripty' },
    // Zde můžeme v budoucnu přidat další položky
  ];

  return (
    <nav className="nav flex-column bg-dark vh-100 p-3">
      {navItems.map(item => (
        <Link 
          key={item.href}
          href={item.href} 
          className={`nav-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
