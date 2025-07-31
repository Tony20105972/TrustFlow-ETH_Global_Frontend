import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Code, AlertTriangle, XCircle, CheckCircle, Lightbulb } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiService, LOPAnalyzeRequest, LOPAnalyzeResponse } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { useToast } from "@/hooks/use-toast";

const LOP = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LOPAnalyzeResponse | null>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [rawResponse, setRawResponse] = useState("");
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter LOP code to analyze",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const requestData: LOPAnalyzeRequest = {
        code: code.trim()
      };

      const response = await apiService.lopAnalyze(requestData);
      setResult(response.data);
      setRawResponse(JSON.stringify(response.data, null, 2));
      
      const issueCount = response.data.analysis_result?.issues.length || 0;
      const suggestionCount = response.data.analysis_result?.suggestions.length || 0;
      
      toast({
        title: "Analysis Complete",
        description: `Found ${issueCount} issue(s) and ${suggestionCount} suggestion(s)`,
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
        return <Code className="h-4 w-4 text-muted-foreground" />;
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

  const exampleCode = `function transferTokens(address to, uint amount) {
    // Transfer tokens to recipient
    require(balances[msg.sender] >= amount, "Insufficient balance");
    balances[msg.sender] -= amount;
    balances[to] += amount;
    
    // Emit transfer event
    emit Transfer(msg.sender, to, amount);
}`;

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-trustflow-gradient bg-clip-text text-transparent">
          LOP Code Analyzer
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analyze your Language of Power (LOP) code for potential issues, optimizations, and best practices.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              Code Analysis
            </CardTitle>
            <CardDescription>
              Paste your LOP code for comprehensive analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">LOP Code *</Label>
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
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Code quality issues and optimization suggestions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analyze code to see results here</p>
              </div>
            )}

            {loading && <LoadingSpinner text="Analyzing code quality..." />}

            {result && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-semibold">Analysis Summary</div>
                    <div className="text-sm text-muted-foreground">
                      {(result.analysis_result?.issues.length || 0) === 0 
                        ? "No issues found" 
                        : `${result.analysis_result?.issues.length || 0} issue(s) detected`}
                      {(result.analysis_result?.suggestions.length || 0) > 0 && 
                        ` • ${result.analysis_result?.suggestions.length} suggestion(s)`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(result.analysis_result?.issues.length || 0) === 0 ? (
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Clean Code
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
                {(result.analysis_result?.issues.length || 0) > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Detected Issues</h3>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Line</TableHead>
                            <TableHead>Severity</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(result.analysis_result?.issues || []).map((issue, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{issue.type}</TableCell>
                              <TableCell>
                                <code className="text-sm bg-muted px-2 py-1 rounded">
                                  Line {issue.line}
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

                {/* Suggestions */}
                {(result.analysis_result?.suggestions.length || 0) > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      Optimization Suggestions
                    </h3>
                    <div className="space-y-3">
                      {(result.analysis_result?.suggestions || []).map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-primary/5">
                          <Lightbulb className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium text-sm">
                              Line {suggestion.line}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {suggestion.suggestion}
                            </div>
                          </div>
                        </div>
                      ))}
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

export default LOP;