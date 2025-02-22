
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

interface LayoutProps {
  filters: React.ReactNode;
  recommendations: React.ReactNode;
  map: React.ReactNode;
}

export function Layout({ filters, recommendations, map }: LayoutProps) {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={25}>
        {filters}
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={25}>
        {recommendations}
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={50}>
        {map}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
