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
      const response = await apiService.uploadToIPFS(selectedFile);
      setResult((response as any).data);
      setRawResponse(JSON.stringify((response as any).data, null, 2));
      
      toast({
        title: "Success!",
        description: "File uploaded to IPFS successfully",
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
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>
                Your file has been successfully uploaded to IPFS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">File uploaded successfully!</span>
                </div>
                
                {result.ipfs_hash && (
                  <div className="space-y-2">
                    <div className="font-medium">IPFS Hash</div>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="text-sm flex-1 break-all">
                        {result.ipfs_hash}
                      </code>
                      <CopyButton text={result.ipfs_hash} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Access your file at: 
                      <a 
                        href={`https://ipfs.io/ipfs/${result.ipfs_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline ml-1"
                      >
                        https://ipfs.io/ipfs/{result.ipfs_hash}
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