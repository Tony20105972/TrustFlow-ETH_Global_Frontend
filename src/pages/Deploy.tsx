import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ExternalLink, CheckCircle, XCircle, Rocket } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiService, DeployCodeRequest, DeployCodeResponse } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import CopyButton from "@/components/CopyButton";
import { useToast } from "@/hooks/use-toast";

const Deploy = () => {
  const [prompt, setPrompt] = useState("");
  const [solidityCode, setSolidityCode] = useState("");
  const [constructorArgs, setConstructorArgs] = useState("");
  const [solcVersion, setSolcVersion] = useState("0.8.20");
  const [gasPriceMultiplier, setGasPriceMultiplier] = useState(2.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DeployCodeResponse | null>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [rawResponse, setRawResponse] = useState("");
  const { toast } = useToast();

  const handleDeploy = async () => {
    if (!solidityCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter Solidity code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Parse constructor arguments properly
      let parsedConstructorArgs: any[] = [];
      if (constructorArgs.trim()) {
        try {
          // Try to parse as JSON array first
          parsedConstructorArgs = JSON.parse(constructorArgs.trim());
          // If it's not an array, wrap it in an array
          if (!Array.isArray(parsedConstructorArgs)) {
            parsedConstructorArgs = [parsedConstructorArgs];
          }
        } catch {
          // If JSON parsing fails, split by comma and clean up
          parsedConstructorArgs = constructorArgs
            .split(',')
            .map(arg => {
              const trimmed = arg.trim();
              // Try to parse as number if it looks like a number
              if (/^\d+$/.test(trimmed)) {
                return parseInt(trimmed);
              }
              // Remove quotes if present
              return trimmed.replace(/^["']|["']$/g, '');
            })
            .filter(arg => arg !== '');
        }
      }

      const requestData: DeployCodeRequest = {
        solidity_code: solidityCode.trim(),
        constructor_args: parsedConstructorArgs,
        solc_version: solcVersion,
        gas_price_multiplier: gasPriceMultiplier
      };

      const response = await apiService.deployCode(requestData);
      setResult(response.data);
      setRawResponse(JSON.stringify(response.data, null, 2));

      // ✅ FastAPI response의 status 값을 기준으로 성공/실패 판정
      if (response.data.status === "success") {
        // ✅ contractAddress와 txHash가 없을 경우를 대비한 fallback 처리
        const contractAddress = response.data.deployment?.deploy_result?.contract_address || "Unknown Address";
        const txHash = response.data.deployment?.deploy_result?.tx_hash || "Unknown Tx";

        toast({
          title: "🎉 Deployment Successful",
          description: `Contract deployed at ${contractAddress}`,
        });

      } else {
        // ❌ status가 'success'가 아닐 때만 실패로 처리
        toast({
          title: "❌ Deployment Failed",
          description: "Smart contract deployment failed. Please check logs or backend.",
          variant: "destructive",
        });
      }

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
      toast({
        title: "❌ API Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-trustflow-gradient bg-clip-text text-transparent">
          Smart Contract Deploy
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Deploy Solidity smart contracts with advanced configuration options.
          Get security analysis and deployment results.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Deploy Contract
            </CardTitle>
            <CardDescription>
              Describe your smart contract requirements in natural language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="solidity-code">Solidity Code *</Label>
              <Textarea
                id="solidity-code"
                placeholder="pragma solidity ^0.8.20;&#10;&#10;contract MyContract {&#10;    // Your contract code here&#10;}"
                value={solidityCode}
                onChange={(e) => setSolidityCode(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="solc-version">Solc Version</Label>
                <Input
                  id="solc-version"
                  placeholder="0.8.20"
                  value={solcVersion}
                  onChange={(e) => setSolcVersion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gas-multiplier">Gas Price Multiplier</Label>
                <Input
                  id="gas-multiplier"
                  type="number"
                  step="0.1"
                  placeholder="2.0"
                  value={gasPriceMultiplier}
                  onChange={(e) => setGasPriceMultiplier(parseFloat(e.target.value) || 2.0)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="constructor-args">Constructor Arguments (JSON array, optional)</Label>
              <Input
                id="constructor-args"
                placeholder='["arg1", "arg2"]'
                value={constructorArgs}
                onChange={(e) => setConstructorArgs(e.target.value)}
              />
            </div>

            <Button
              onClick={handleDeploy}
              disabled={loading}
              className="w-full bg-trustflow-gradient hover:opacity-90"
            >
              {loading ? <LoadingSpinner text="🚀 Deploying..." /> : "🚀 Deploy Contract"}
            </Button>

            {error && <ErrorAlert message={error} />}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Deployment Results</CardTitle>
            <CardDescription>
              Generated code, security analysis, and deployment status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !loading && (
              <div className="text-center py-12 text-muted-foreground">
                <Rocket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>⚠️ No deployment data - Deploy a contract to see results here</p>
              </div>
            )}

            {loading && <LoadingSpinner text="🚀 Deploying contract..." />}

            {result && (
              <div className="space-y-6">
                {/* Deployment Results Panel */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Deployment Results
                  </h3>

                  {result.status === "success" ? (
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-medium">✅ Contract Address:</span>
                           <div className="flex items-center gap-2">
                             <a
                               href={result.deployment?.deploy_result?.contract_address ? `https://etherscan.io/address/${result.deployment.deploy_result.contract_address}` : '#'}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-sm bg-muted px-2 py-1 rounded hover:bg-primary/10 transition-colors cursor-pointer"
                             >
                               {result.deployment?.deploy_result?.contract_address || "Unknown Address"}
                             </a>
                             <CopyButton text={result.deployment?.deploy_result?.contract_address || "Unknown Address"} />
                           </div>
                         </div>
                         <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">✅ Transaction Hash:</span>
                            <div className="flex items-center gap-2">
                              <a
                                href={result.deployment?.deploy_result?.tx_hash ? `https://etherscan.io/tx/${result.deployment.deploy_result.tx_hash}` : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm bg-muted px-2 py-1 rounded hover:bg-primary/10 transition-colors cursor-pointer"
                              >
                                {result.deployment?.deploy_result?.tx_hash || "Unknown Tx"}
                              </a>
                              <CopyButton text={result.deployment?.deploy_result?.tx_hash || "Unknown Tx"} />
                            </div>
                          </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-red-100/50 border border-red-300 text-red-700">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        <div className="font-semibold">Contract deployment failed.</div>
                      </div>
                      <p className="text-sm mt-2">
                        Please check the generated Solidity code and security analysis below for potential issues.
                      </p>
                    </div>
                  )}
                </div>

                {result.deployment && (
                  <>
                    {/* Solidity Code */}
                    {result.deployment.solidity_code && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">Generated Solidity Code</h3>
                          <CopyButton text={typeof result.deployment.solidity_code === 'string' ? result.deployment.solidity_code : JSON.stringify(result.deployment.solidity_code, null, 2)} />
                        </div>
                        <div className="rounded-lg overflow-hidden border">
                          <SyntaxHighlighter
                            language="solidity"
                            style={tomorrow}
                            customStyle={{ margin: 0, fontSize: '14px' }}
                          >
                            {typeof result.deployment.solidity_code === 'string' ? result.deployment.solidity_code : JSON.stringify(result.deployment.solidity_code, null, 2)}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    )}

                    {/* Security Analysis */}
                    {result.deployment.rule_issues && result.deployment.rule_issues.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Security Analysis</h3>
                        <div className="space-y-2">
                          {result.deployment.rule_issues.map((issue, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                              {issue.safe ? (
                                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                              )}
                              <div>
                                <div className="font-medium">
                                  {typeof issue.type === 'string' ? issue.type : JSON.stringify(issue.type)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {typeof issue.description === 'string' ? issue.description : JSON.stringify(issue.description)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Message */}
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">Status:</div>
                        <span className="text-sm">{result.status}</span>
                      </div>
                    </div>
                  </>
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
                <div className="relative">
                  <CopyButton text={rawResponse} className="absolute top-2 right-2 z-10" />
                  <SyntaxHighlighter
                    language="json"
                    style={tomorrow}
                    customStyle={{ margin: 0, fontSize: '14px' }}
                  >
                    {rawResponse}
                  </SyntaxHighlighter>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  );
};

export default Deploy;
