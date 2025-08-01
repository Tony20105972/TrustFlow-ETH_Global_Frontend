import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Upload, File, CheckCircle, Cloud } from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { apiService } from "@/utils/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import CopyButton from "@/components/CopyButton";
import { useToast } from "@/hooks/use-toast";

const IPFS = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [rawResponse, setRawResponse] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError("");
    setResult(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Use FormData for file upload (no Content-Type header needed - automatic)
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://trust-flow-backend-ethglobal.onrender.com'}/ipfs/upload`, {
        method: "POST",
        body: formData,
        // Note: No Content-Type header needed - browser sets it automatically for FormData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setRawResponse(JSON.stringify(data, null, 2));
      
      toast({
        title: "✅ Upload Successful",
        description: `File uploaded to IPFS: ${data.cid || data.ipfs_hash || 'Unknown CID'}`,
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-trustflow-gradient bg-clip-text text-transparent">
          IPFS Storage
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload and store files on the InterPlanetary File System (IPFS) for decentralized, permanent storage.
        </p>
      </div>

      <div className="space-y-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              File Upload
            </CardTitle>
            <CardDescription>
              Drag and drop a file or click to select
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drag & Drop Area */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/25'
                }
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <File className="h-4 w-4" />
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)} • Click to change file
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-lg font-medium">
                      {dragActive ? "Drop file here" : "Choose file to upload"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Drag and drop a file here, or click to select
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleUpload} 
              disabled={loading || !selectedFile}
              className="w-full bg-trustflow-gradient hover:opacity-90"
            >
              {loading ? <LoadingSpinner text="Uploading to IPFS..." /> : "Upload to IPFS"}
            </Button>

            {error && <ErrorAlert message={error} />}
          </CardContent>
        </Card>

        {/* Results Section */}
        {!result && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>
                ⚠️ No upload data - Upload a file to see results here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Upload a file to see IPFS results here</p>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>
                Your file has been successfully uploaded to IPFS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* IPFS Results Panel */}
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="font-medium text-success mb-2">✅ Upload Successful</div>
                  {(result.cid || result.ipfs_hash) ? (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong>CID:</strong> {result.cid || result.ipfs_hash}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://ipfs.io/ipfs/${result.cid || result.ipfs_hash}`, '_blank')}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        View on IPFS Gateway
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      File uploaded but CID not available
                    </div>
                  )}
                </div>

                {(result.ipfs_hash || result.cid) && (
                  <div className="space-y-2">
                    <div className="font-medium">IPFS Hash/CID</div>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="text-sm flex-1 break-all">
                        {result.cid || result.ipfs_hash}
                      </code>
                      <CopyButton text={result.cid || result.ipfs_hash} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Access your file at: 
                      <a 
                        href={`https://ipfs.io/ipfs/${result.cid || result.ipfs_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline ml-1"
                      >
                        https://ipfs.io/ipfs/{result.cid || result.ipfs_hash}
                      </a>
                    </div>
                  </div>
                )}

                {selectedFile && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-muted-foreground">File Name</div>
                      <div>{selectedFile.name}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">File Size</div>
                      <div>{formatFileSize(selectedFile.size)}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">File Type</div>
                      <div>{selectedFile.type || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground">Last Modified</div>
                      <div>{new Date(selectedFile.lastModified).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Raw Response Viewer */}
        {(result || error) && (
          <Card>
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
    </div>
  );
};

export default IPFS;