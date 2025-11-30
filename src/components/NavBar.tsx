"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Workspace', href: '/' },
  { name: 'Compiler', href: '/compiler' },
  { name: 'Engine', href: '/engine' },
  { name: 'Storage', href: '/storage' },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tighter text-white group">
          BELLUM
        </Link>
        
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-white relative py-1",
                pathname === item.href ? "text-white" : "text-neutral-500"
              )}
            >
              {item.name}
              {pathname === item.href && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-white"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
