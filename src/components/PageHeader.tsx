'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: Breadcrumb[];
}

export function PageHeader({ title, subtitle, badge, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="page-header-banner">
      <div className="container">
        {/* Breadcrumb links */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/" className="breadcrumb-link">Home</Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={14} className="breadcrumb-separator" />
                {crumb.href ? (
                  <Link href={crumb.href} className="breadcrumb-link">{crumb.label}</Link>
                ) : (
                  <span className="breadcrumb-current">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {badge && (
          <div className="page-header-badge">
            {badge}
          </div>
        )}

        <h1 className="page-header-title">{title}</h1>
        
        {subtitle && (
          <p className="page-header-subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
