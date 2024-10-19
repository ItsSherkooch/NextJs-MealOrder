'use client';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import classes from './main-header.module.css'

export default function NavLink({href, children}) {
  const path = usePathname()
  return (
    <Link className={path.startsWith(`/${href}`) ? classes.active : undefined} href={href}>
      {children}
    </Link>
  )
}
