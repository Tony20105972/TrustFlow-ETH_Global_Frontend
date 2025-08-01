import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Shield, Upload, Vote, Coins, Zap, ArrowRight, Star } from "lucide-react";
import trustflowLogo from "@/assets/trustflow-logo.png";

const Home = () => {
  const features = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "AI Smart Contract Deploy",
      description: "Generate and deploy Solidity contracts using AI prompts",
      path: "/deploy",
      color: "text-blue-500"
    },
    {
      icon: <Vote className="h-8 w-8" />,
      title: "DAO Governance",
      description: "Create proposals and vote on governance decisions",
      path: "/dao",
      color: "text-green-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "ZK Security Detector",
      description: "Analyze smart contracts for security vulnerabilities",
      path: "/zk",
      color: "text-red-500"
    },
    {
      icon: <Upload className="h-8 w-8" />,
      title: "IPFS Storage",
      description: "Upload and store files on the decentralized web",
      path: "/ipfs",
      color: "text-purple-500"
    },
    {
      icon: <Coins className="h-8 w-8" />,
      title: "DeFi Trading",
      description: "Get quotes and swap tokens using 1inch protocol",
      path: "/defi",
      color: "text-yellow-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-violet-500/10"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container py-24">
          <div className="text-center max-w-5xl mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src={trustflowLogo} 
                alt="TrustFlow Logo" 
                className="h-32 w-auto drop-shadow-2xl animate-pulse"
              />
            </div>
            
            {/* Main Heading */}
            <h1 className="text-7xl md:text-8xl font-bold mb-4 text-white tracking-tight">
              TRUST<span className="text-emerald-400">FLOW</span>
            </h1>
            
            {/* Tagline */}
            <p className="text-2xl text-emerald-400 font-medium mb-8 tracking-wide">
              WHERE CODE MEETS TRUST.
            </p>
            
            {/* Description */}
            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              The complete Web3 platform for smart contract deployment, DAO governance, 
              security analysis, decentralized storage, and DeFi trading. Built for developers, 
              trusted by the community.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-emerald-500/25 transition-all duration-300"
              >
                <Link to="/deploy">
                  <Code className="mr-3 h-6 w-6" />
                  Start Building
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-emerald-400/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 px-8 py-6 text-lg font-semibold backdrop-blur-sm"
              >
                <Link to="#features">
                  <Star className="mr-2 h-5 w-5" />
                  Explore Features
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative py-24 bg-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-800/50"></div>
        <div className="relative container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Powerful Web3 <span className="text-emerald-400">Tools</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Everything you need to build, secure, and manage your Web3 applications.
              Trusted by developers, powered by innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group bg-slate-800/80 border-slate-700/50 hover:border-emerald-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className={`mb-6 p-3 rounded-xl bg-slate-700/50 w-fit ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-emerald-400 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/25"
                  >
                    <Link to={feature.path} className="flex items-center justify-center">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative py-20 bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-violet-500/5 to-emerald-500/5"></div>
        <div className="relative container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="group">
              <div className="text-5xl font-bold text-emerald-400 mb-3 group-hover:scale-110 transition-transform duration-300">5</div>
              <div className="text-slate-300 text-lg font-medium">Integrated Tools</div>
              <div className="text-sm text-slate-500 mt-1">All-in-one platform</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold text-emerald-400 mb-3 group-hover:scale-110 transition-transform duration-300">100%</div>
              <div className="text-slate-300 text-lg font-medium">Decentralized</div>
              <div className="text-sm text-slate-500 mt-1">True Web3 experience</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold text-emerald-400 mb-3 group-hover:scale-110 transition-transform duration-300">AI</div>
              <div className="text-slate-300 text-lg font-medium">Powered</div>
              <div className="text-sm text-slate-500 mt-1">Smart automation</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold text-emerald-400 mb-3 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <div className="text-slate-300 text-lg font-medium">Fast & Secure</div>
              <div className="text-sm text-slate-500 mt-1">Enterprise grade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Footer */}
      <div className="relative py-16 bg-gradient-to-r from-slate-900 via-emerald-900/20 to-slate-900">
        <div className="container text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Build the Future?</h3>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who trust TrustFlow for their Web3 development needs.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 px-12 py-6 text-lg font-semibold shadow-xl hover:shadow-emerald-500/25"
          >
            <Link to="/deploy">
              <Code className="mr-3 h-6 w-6" />
              Deploy Your First Contract
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;