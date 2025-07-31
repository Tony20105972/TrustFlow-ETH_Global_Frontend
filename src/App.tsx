import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Deploy from "./pages/Deploy";
import DAO from "./pages/DAO";
import ZKDetector from "./pages/ZKDetector";
import IPFS from "./pages/IPFS";
import DeFi from "./pages/DeFi";
import LOP from "./pages/LOP";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/deploy" element={<Deploy />} />
              <Route path="/dao" element={<DAO />} />
              <Route path="/zk" element={<ZKDetector />} />
              <Route path="/ipfs" element={<IPFS />} />
              <Route path="/defi" element={<DeFi />} />
              <Route path="/lop" element={<LOP />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
