import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, Vote, Plus, CheckCircle, XCircle } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiService, ProposalRequest, VoteRequest } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { useToast } from "@/hooks/use-toast";

const DAO = () => {
  // Proposal creation state
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalDescription, setProposalDescription] = useState("");
  const [proposalWallet, setProposalWallet] = useState("");
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalError, setProposalError] = useState("");
  const [proposalResult, setProposalResult] = useState<any>(null);
  const [proposalRawResponse, setProposalRawResponse] = useState("");

  // Voting state
  const [voteProposalId, setVoteProposalId] = useState("");
  const [voteChoice, setVoteChoice] = useState<"for" | "against">("for");
  const [voteWallet, setVoteWallet] = useState("");
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState("");
  const [voteResult, setVoteResult] = useState<any>(null);
  const [voteRawResponse, setVoteRawResponse] = useState("");

  // UI state
  const [showProposalRaw, setShowProposalRaw] = useState(false);
  const [showVoteRaw, setShowVoteRaw] = useState(false);

  const { toast } = useToast();

  const handleCreateProposal = async () => {
    if (!proposalTitle.trim() || !proposalDescription.trim() || !proposalWallet.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setProposalLoading(true);
    setProposalError("");
    setProposalResult(null);

    try {
      const requestData: ProposalRequest = {
        title: proposalTitle.trim(),
        description: proposalDescription.trim(),
        wallet_address: proposalWallet.trim()
      };

      const response = await apiService.createProposal(requestData);
      setProposalResult(response.data);
      setProposalRawResponse(JSON.stringify(response.data, null, 2));
      
      // Reset form
      setProposalTitle("");
      setProposalDescription("");
      setProposalWallet("");
      
      toast({
        title: "Success!",
        description: "Proposal created successfully",
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
      
      setProposalError(errorMessage);
      setProposalRawResponse(JSON.stringify(err.response?.data || { error: errorMessage }, null, 2));
    } finally {
      setProposalLoading(false);
    }
  };

  const handleVote = async () => {
    if (!voteProposalId.trim() || !voteWallet.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setVoteLoading(true);
    setVoteError("");
    setVoteResult(null);

    try {
      const requestData: VoteRequest = {
        proposal_id: voteProposalId.trim(),
        vote: voteChoice,
        wallet_address: voteWallet.trim()
      };

      const response = await apiService.vote(requestData);
      setVoteResult(response.data);
      setVoteRawResponse(JSON.stringify(response.data, null, 2));
      
      // Reset form
      setVoteProposalId("");
      setVoteWallet("");
      
      toast({
        title: "Success!",
        description: `Vote "${voteChoice}" submitted successfully`,
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
      
      setVoteError(errorMessage);
      setVoteRawResponse(JSON.stringify(err.response?.data || { error: errorMessage }, null, 2));
    } finally {
      setVoteLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-trustflow-gradient bg-clip-text text-transparent">
          DAO Governance
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Participate in decentralized governance by creating proposals and voting on community decisions.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Create Proposal Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create Proposal
            </CardTitle>
            <CardDescription>
              Submit a new proposal for community voting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="proposal-title">Title *</Label>
              <Input
                id="proposal-title"
                placeholder="Proposal title..."
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal-description">Description *</Label>
              <Textarea
                id="proposal-description"
                placeholder="Detailed description of the proposal..."
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal-wallet">Wallet Address *</Label>
              <Input
                id="proposal-wallet"
                placeholder="0x742d35Cc6641C4532B4f21bbCD8f8f02..."
                value={proposalWallet}
                onChange={(e) => setProposalWallet(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleCreateProposal} 
              disabled={proposalLoading}
              className="w-full bg-trustflow-gradient hover:opacity-90"
            >
              {proposalLoading ? <LoadingSpinner text="Creating..." /> : "Create Proposal"}
            </Button>

            {proposalError && <ErrorAlert message={proposalError} />}

            {proposalResult && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium text-success">Proposal Created Successfully!</span>
                </div>
                {proposalResult.proposal_id && (
                  <div className="text-sm text-muted-foreground">
                    Proposal ID: <code className="bg-muted px-1 rounded">{proposalResult.proposal_id}</code>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vote Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-primary" />
              Cast Vote
            </CardTitle>
            <CardDescription>
              Vote on existing proposals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="vote-proposal-id">Proposal ID *</Label>
              <Input
                id="vote-proposal-id"
                placeholder="Enter proposal ID..."
                value={voteProposalId}
                onChange={(e) => setVoteProposalId(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Vote Choice *</Label>
              <RadioGroup value={voteChoice} onValueChange={(value: "for" | "against") => setVoteChoice(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="for" id="vote-for" />
                  <Label htmlFor="vote-for" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Vote For
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="against" id="vote-against" />
                  <Label htmlFor="vote-against" className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    Vote Against
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vote-wallet">Wallet Address *</Label>
              <Input
                id="vote-wallet"
                placeholder="0x742d35Cc6641C4532B4f21bbCD8f8f02..."
                value={voteWallet}
                onChange={(e) => setVoteWallet(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleVote} 
              disabled={voteLoading}
              className="w-full bg-trustflow-gradient hover:opacity-90"
            >
              {voteLoading ? <LoadingSpinner text="Submitting vote..." /> : `Vote ${voteChoice === 'for' ? 'For' : 'Against'}`}
            </Button>

            {voteError && <ErrorAlert message={voteError} />}

            {voteResult && (
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-medium text-success">Vote Submitted Successfully!</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Your vote "{voteChoice}" has been recorded
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raw Response Viewers */}
      <div className="mt-8 space-y-4">
        {(proposalResult || proposalError) && (
          <Card>
            <Collapsible open={showProposalRaw} onOpenChange={setShowProposalRaw}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <span>Proposal API Response</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showProposalRaw ? 'rotate-180' : ''}`} />
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
                    {proposalRawResponse}
                  </SyntaxHighlighter>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {(voteResult || voteError) && (
          <Card>
            <Collapsible open={showVoteRaw} onOpenChange={setShowVoteRaw}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <CardTitle className="flex items-center justify-between">
                    <span>Vote API Response</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showVoteRaw ? 'rotate-180' : ''}`} />
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
                    {voteRawResponse}
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

export default DAO;