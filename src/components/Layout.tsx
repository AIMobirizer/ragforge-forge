import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { RightPanel } from '@/components/RightPanel';
import { useAppStore } from '@/stores/useAppStore';
import { cn } from '@/lib/utils';

export function Layout() {
  const { isRightPanelOpen } = useAppStore();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <div className="flex-1 flex">
            <main className={cn(
              "flex-1 transition-all duration-300",
              isRightPanelOpen ? "mr-80" : ""
            )}>
              <Outlet />
            </main>
            
            <RightPanel />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}