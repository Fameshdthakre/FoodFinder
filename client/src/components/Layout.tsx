
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

interface LayoutProps {
  filters: React.ReactNode;
  recommendations: React.ReactNode;
  map: React.ReactNode;
}

export function Layout({ filters, recommendations, map }: LayoutProps) {
  return (
    <ResizablePanelGroup 
      direction="horizontal" 
      className="h-screen w-full"
    >
      <ResizablePanel defaultSize={25} minSize={15}>
        <div className="h-full p-4 bg-background">
          {filters}
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={25} minSize={15}>
        <div className="h-full p-4 bg-background">
          {recommendations}
        </div>
      </ResizablePanel>
      
      <ResizableHandle withHandle />
      
      <ResizablePanel defaultSize={50} minSize={30}>
        <div className="h-full bg-background">
          {map}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
