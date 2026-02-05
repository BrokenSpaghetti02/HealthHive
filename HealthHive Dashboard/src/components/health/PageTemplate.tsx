import React from 'react';

interface PageTemplateProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Page content sections */
  children: React.ReactNode;
}

/**
 * PageTemplate - Consistent page structure for all dashboard pages
 * 
 * Structure:
 * - PageFrame: Container with consistent spacing (py-4 space-y-4)
 * - Header: Title and description
 * - PageBody: Content sections (auto-layout vertical, gap 16px)
 * 
 * All pages inherit:
 * - 70% visual density (type sizes, spacing, padding)
 * - Max width 1008px (enforced by AppShell)
 * - Consistent vertical rhythm (gap-4 / 16px)
 * - No transform scaling
 */
export function PageTemplate({ title, description, children }: PageTemplateProps) {
  return (
    <div className="py-4 space-y-4">
      {/* Page Header */}
      <div>
        <h2 className="text-slate-900 mb-0.5">{title}</h2>
        {description && (
          <p className="text-slate-600 text-xs">{description}</p>
        )}
      </div>

      {/* Page Body - Content sections */}
      {children}
    </div>
  );
}
