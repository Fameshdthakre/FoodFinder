
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"

export default function App() {
  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full p-4 bg-background border-r">
            <h2 className="text-lg font-bold mb-4">Search Filters</h2>
            {/* Filter content will go here */}
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full p-4 bg-background border-r">
            <h2 className="text-lg font-bold mb-4">Recommendations</h2>
            {/* Recommendation list will go here */}
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full p-4 bg-background">
            <h2 className="text-lg font-bold mb-4">Map</h2>
            {/* Map component will go here */}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
