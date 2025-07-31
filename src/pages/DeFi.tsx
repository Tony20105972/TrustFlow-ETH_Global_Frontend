import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, TrendingUp, ArrowRightLeft, Coins, CheckCircle } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiService, SwapRequest, QuoteParams } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { useToast } from "@/hooks/use-toast";

const DeFi = () => {
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  
  // Quote state
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [quoteRawResponse, setQuoteRawResponse] = useState("");
  
  // Swap state
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapError, setSwapError] = useState("");
  const [swapResult, setSwapResult] = useState<any>(null);
  const [swapRawResponse, setSwapRawResponse] = useState("");

  // UI state
  const [showQuoteRaw, setShowQuoteRaw] = useState(false);
  const [showSwapRaw, setShowSwapRaw] = useState(false);

  const { toast } = useToast();

  const handleGetQuote = async () => {
    if (!fromToken.trim() || !toToken.trim() || !amount.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all quote fields",
        variant: "destructive",
      });
      return;
    }

    setQuoteLoading(true);
    setQuoteError("");
    setQuoteResult(null);

    try {
      const params: QuoteParams = {
        src_token: fromToken.trim(),
        dst_token: toToken.trim(),
        amount: amount.trim()
      };

      const response = await apiService.getQuote(params);
      setQuoteResult(response.data);
      setQuoteRawResponse(JSON.stringify(response.data, null, 2));
      
      toast({
        title: "📊 Quote Retrieved",
        description: `Price quote: ${response.data.quote_data?.toTokenAmount || 'Available'}`,
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
      
      setQuoteError(errorMessage);
      setQuoteRawResponse(JSON.stringify(err.response?.data || { error: errorMessage }, null, 2));
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!fromToken.trim() || !toToken.trim() || !amount.trim() || !walletAddress.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all swap fields",
        variant: "destructive",
      });
      return;
    }

    setSwapLoading(true);
    setSwapError("");
    setSwapResult(null);

    try {
      const requestData: SwapRequest = {
        src_token: fromToken.trim(),
        dst_token: toToken.trim(),
        amount: amount.trim(),
        from_address: walletAddress.trim()
      };

      const response = await apiService.swap(requestData);
      setSwapResult(response.data);
      setSwapRawResponse(JSON.stringify(response.data, null, 2));
      
      toast({
        title: "🔄 Swap Successful!",
        description: "✅ Swap simulated successfully",
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
      
      setSwapError(errorMessage);
      setSwapRawResponse(JSON.stringify(err.response?.data || { error: errorMessage }, null, 2));
    } finally {
      setSwapLoading(false);
    }
  };

  const populateExample = () => {
    setFromToken("0xA0b86a33E6C8b4B99b1A8FAA0C6A33B68B39A2f8"); // Example token
    setToToken("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");   // WETH
    setAmount("1000000000000000000"); // 1 token (18 decimals)
    setWalletAddress("0x742d35Cc6641C4532B4f21bbCD8f8f02E5BF8A8e");
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-trustflow-gradient bg-clip-text text-transparent">
          DeFi Trading
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get real-time price quotes and execute token swaps using the 1inch protocol for optimal DeFi trading.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Token Swap
            </CardTitle>
            <CardDescription>
              Enter token details for quotes and swaps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="from-token">From Token Address *</Label>
              <Input
                id="from-token"
                placeholder="0xA0b86a33E6C8b4B99b1A8FAA0C6A33B68B39A2f8"
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-token">To Token Address *</Label>
              <Input
                id="to-token"
                placeholder="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
                value={toToken}
                onChange={(e) => setToToken(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (in wei) *</Label>
              <Input
                id="amount"
                placeholder="1000000000000000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet Address (for swap) *</Label>
              <Input
                id="wallet-address"
                placeholder="0x742d35Cc6641C4532B4f21bbCD8f8f02E5BF8A8e"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleGetQuote} 
                disabled={quoteLoading}
                variant="outline"
              >
                {quoteLoading ? (
                  <LoadingSpinner text="Getting quote..." />
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Get Quote
                  </>
                )}
              </Button>

              <Button 
                onClick={handleSwap} 
                disabled={swapLoading}
                className="bg-trustflow-gradient hover:opacity-90"
              >
                {swapLoading ? (
                  <LoadingSpinner text="Swapping..." />
                ) : (
                  <>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Swap
                  </>
                )}
              </Button>
            </div>

            <Button variant="ghost" onClick={populateExample} className="w-full">
              Load Example Values
            </Button>

            {quoteError && <ErrorAlert message={quoteError} />}
            {swapError && <ErrorAlert message={swapError} />}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Trading Results</CardTitle>
            <CardDescription>
              Quote and swap execution results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!quoteResult && !swapResult && !quoteLoading && !swapLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>⚠️ No trading data - Get a quote or execute a swap to see results here</p>
              </div>
            )}

            <div className="space-y-6">
              {/* DeFi Results Panel */}
              {(quoteResult || swapResult) && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="font-semibold mb-2">✅ DeFi Trading Results</div>
                  <div className="text-sm space-y-1">
                    {quoteResult && <div><strong>Quote Data:</strong> Available</div>}
                    {swapResult && <div><strong>Swap Data:</strong> Available</div>}
                  </div>
                </div>
              )}

              {/* Quote Results */}
              {(quoteResult || quoteLoading) && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Price Quote
                  </h3>
                  
                  {quoteLoading && <LoadingSpinner text="📊 Getting quote..." />}
                  
                  {quoteResult && (
                    <div className="p-4 rounded-lg border bg-muted/25">
                      <div className="text-sm font-medium mb-2">✅ Quote Retrieved Successfully</div>
                      <div className="space-y-2">
                        {quoteResult.quote_data?.toTokenAmount && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Price Quote:</span>
                            <span className="font-mono">{quoteResult.quote_data.toTokenAmount} tokens</span>
                          </div>
                        )}
                        {quoteResult.quote_data?.estimatedGas && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Estimated Gas:</span>
                            <span className="font-mono">{quoteResult.quote_data.estimatedGas}</span>
                          </div>
                        )}
                        {quoteResult.quote_data && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="ml-2">Quote available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Swap Results */}
              {(swapResult || swapLoading) && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4" />
                    Swap Execution
                  </h3>
                  
                  {swapLoading && <LoadingSpinner text="🔄 Swapping..." />}
                  
                  {swapResult && (
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span className="font-medium text-success">✅ Swap simulated successfully</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {swapResult.swap_data?.txHash && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Transaction Hash:</span>
                            <a 
                              href={`https://etherscan.io/tx/${swapResult.swap_data.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-xs hover:text-primary cursor-pointer"
                            >
                              {swapResult.swap_data.txHash}
                            </a>
                          </div>
                        )}
                        {swapResult.swap_data?.toTokenAmount && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Received Amount:</span>
                            <span className="font-mono">{swapResult.swap_data.toTokenAmount}</span>
                          </div>
                        )}
                        {swapResult.swap_data?.gasUsed && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gas Used:</span>
                            <span className="font-mono">{swapResult.swap_data.gasUsed}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raw Response Viewers */}
      <div className="mt-8 space-y-4">
        {(quoteResult || quoteError) && (
          <Card>
            <Collapsible open={showQuoteRaw} onOpenChange={setShowQuoteRaw}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <span>Quote API Response</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showQuoteRaw ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <SyntaxHighlighter
                    language="json"
                    style={tomorrow}
                    customStyle={{ margin: 0, fontSize: '14px' }}
                  >
                    {quoteRawResponse}
                  </SyntaxHighlighter>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {(swapResult || swapError) && (
          <Card>
            <Collapsible open={showSwapRaw} onOpenChange={setShowSwapRaw}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <span>Swap API Response</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showSwapRaw ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <SyntaxHighlighter
                    language="json"
                    style={tomorrow}
                    customStyle={{ margin: 0, fontSize: '14px' }}
                  >
                    {swapRawResponse}
                  </SyntaxHighlighter>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeFi;