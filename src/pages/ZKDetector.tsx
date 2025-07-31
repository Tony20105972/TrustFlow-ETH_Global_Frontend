import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Shield, AlertTriangle, XCircle, CheckCircle } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiService, ZKDetectRequest, ZKDetectResponse } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { useToast } from "@/hooks/use-toast";

const ZKDetector = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ZKDetectResponse | null>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [rawResponse, setRawResponse] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter Solidity code to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const requestData: ZKDetectRequest = {
        data: { code: code.trim() }
      };

      const response = await apiService.zkDetect(requestData);
      setResult(response.data);
      setRawResponse(JSON.stringify(response.data, null, 2));
      
      toast({
        title: "Analysis Complete",
        description: `Found ${response.data.analysis_result?.issues?.length || 0} issue(s)`,
      });
    } catch (err: any) {
      let errorMessage = "Unknown error occurred";
      
      // Handle validation errors gracefully
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map((e: any) => 
            typeof e === 'object' ? `${e.loc?.join('.')}: ${e.msg}` : String(e)
          ).join(', ');
        } else {
          errorMessage = String(err.response.data.detail);
        }
      } else if (err.message) {
        errorMessage = String(err.message);
      }
      
      setError(errorMessage);
      setRawResponse(JSON.stringify(err.response?.data || { error: errorMessage }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const exampleCode = `pragma solidity ^0.8.0;

contract Example {
    address public owner;
    mapping(address => uint256) public balances;
    
    constructor() {
        owner = msg.sender;
    }
    
    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");
        
        // Potential reentrancy vulnerability
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        balances[msg.sender] = 0;
    }
}`;

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-trustflow-gradient bg-clip-text text-transparent">
          ZK Security Detector
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analyze your Solidity smart contracts for security vulnerabilities and best practice violations.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Code Analysis
            </CardTitle>
            <CardDescription>
              Paste your Solidity contract code for security analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Solidity Code *</Label>
              <Textarea
                id="code"
                placeholder={exampleCode}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleAnalyze} 
                disabled={loading}
                className="flex-1 bg-trustflow-gradient hover:opacity-90"
              >
                {loading ? <LoadingSpinner text="Analyzing..." /> : "Analyze Code"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCode(exampleCode)}
                disabled={loading}
              >
                Load Example
              </Button>
            </div>

            {error && <ErrorAlert message={error} />}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Security Analysis Results</CardTitle>
            <CardDescription>
              Detected vulnerabilities and security recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>⚠️ No analysis data - Analyze code to see security results here</p>
              </div>
            )}

            {loading && <LoadingSpinner text="Scanning for vulnerabilities..." />}

            {result && (
              <div className="space-y-6">
                {/* ZK Security Results Panel */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="font-semibold mb-2">✅ ZK Security Analysis Results</div>
                  <div className="text-sm space-y-1">
                    <div><strong>Vulnerabilities:</strong> {result.analysis_result?.issues?.length || 0}</div>
                    <div><strong>Status:</strong> {result.status}</div>
                  </div>
                </div>

                {/* Summary */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-semibold">Analysis Summary</div>
                    <div className="text-sm text-muted-foreground">
                      {(result.analysis_result?.issues?.length || 0) === 0 ? "✅ No vulnerabilities found" : `${result.analysis_result?.issues?.length || 0} issue(s) detected`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(result.analysis_result?.issues?.length || 0) === 0 ? (
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Secure
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Issues Found
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Issues Table */}
                {(result.analysis_result?.issues?.length || 0) > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Detected Issues</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.analysis_result?.issues?.map((issue, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{issue.type}</TableCell>
                              <TableCell>
                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                  {issue.location}
                                </code>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getSeverityVariant(issue.severity)} className="capitalize">
                                  {getSeverityIcon(issue.severity)}
                                  <span className="ml-1">{issue.severity}</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {issue.description}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raw Response Viewer */}
      {(result || error) && (
        <Card className="mt-8">
          <Collapsible open={showRawResponse} onOpenChange={setShowRawResponse}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50">
                <CardTitle className="flex items-center justify-between">
                  <span>Raw API Response</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showRawResponse ? 'rotate-180' : ''}`} />
                </CardTitle>
                <CardDescription>
                  View the complete API response for debugging
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <SyntaxHighlighter
                  language="json"
                  style={tomorrow}
                  customStyle={{ margin: 0, fontSize: '14px' }}
                >
                  {rawResponse}
                </SyntaxHighlighter>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
};

export default ZKDetector;