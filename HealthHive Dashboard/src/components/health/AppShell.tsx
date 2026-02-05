import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

/**
 * AppShell - Master layout component for 70% density dashboard
 * Structure:
 * - Sidebar_Static: 168px fixed width, pinned during scroll
 * - ContentViewport: Scrollable area with centered content (max-width 1008px)
 * - No transform scaling - only sizing
 */
export function AppShell({ children, sidebar }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F9FAFB]">
      {/* Sidebar_Static - 168px fixed, stays pinned */}
      {sidebar && (
        <aside className="w-[168px] h-full flex-shrink-0 overflow-y-auto border-r border-[#D4DBDE] bg-white">
          {sidebar}
        </aside>
      )}
      
      {/* ContentViewport - Scrollable content area */}
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        {/* MainContent - Centered container with 70% max-width (1008px) */}
        <div className="w-full min-h-full flex justify-center">
          <div className="w-full max-w-[1008px] min-w-[320px] px-6 py-4">
            {/* Container - Page content goes here */}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
