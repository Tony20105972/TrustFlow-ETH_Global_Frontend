import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Shield, Upload, Vote, Coins, Zap } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-trustflow-gradient-subtle"></div>
        <div className="relative container py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 bg-trustflow-gradient bg-clip-text text-transparent">
              TrustFlow
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The complete Web3 platform for smart contract deployment, DAO governance, 
              security analysis, decentralized storage, and DeFi trading.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="bg-trustflow-gradient hover:opacity-90">
                <Link to="/deploy">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Building
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Web3 Tools</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build, secure, and manage your Web3 applications
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader>
                <div className={`mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full group-hover:bg-trustflow-gradient group-hover:text-white transition-all">
                  <Link to={feature.path}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-trustflow-gradient-subtle py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">5</div>
              <div className="text-muted-foreground">Integrated Tools</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-muted-foreground">Decentralized</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">AI</div>
              <div className="text-muted-foreground">Powered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">⚡</div>
              <div className="text-muted-foreground">Fast & Secure</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;