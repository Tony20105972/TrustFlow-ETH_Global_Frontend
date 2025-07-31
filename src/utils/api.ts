import axios from 'axios';

const BASE_URL = 'https://trust-flow-backend-ethglobal.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Updated interfaces to match FastAPI backend exactly
export interface DeployCodeRequest {
  solidity_code: string;
  constructor_args?: any[];
  solc_version?: string;
  gas_price_multiplier?: number;
}

export interface DeployCodeResponse {
  status: string;
  deployment?: {
    solidity_code: string;
    rule_issues: Array<{
      type: string;
      description: string;
      safe: boolean;
    }>;
    deploy_result?: {
      txHash: string;
      contractAddress: string;
    } | null;
  };
}

export interface ProposalRequest {
  title: string;
  description: string;
  wallet_address: string;
}

export interface VoteRequest {
  proposal_id: string;
  vote: "for" | "against";
  wallet_address: string;
}

export interface ZKDetectRequest {
  data: {
    code: string;
  };
}

export interface ZKDetectResponse {
  status: string;
  analysis_result?: {
    issues: Array<{
      type: string;
      location: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
}

export interface SwapRequest {
  src_token: string;
  dst_token: string;
  amount: string;
  from_address: string;
}

export interface QuoteParams {
  src_token: string;
  dst_token: string;
  amount: string;
}

export interface IPFSUploadRequest {
  file_content: string;
  file_name: string;
}

export const apiService = {
  deployCode: (data: DeployCodeRequest) => 
    api.post<DeployCodeResponse>('/deploy/code', data),

  createProposal: (data: ProposalRequest) => 
    api.post('/proposals/create', data),

  vote: (data: VoteRequest) => 
    api.post('/proposals/vote', data),

  getProposal: (proposalId: string) => 
    api.get(`/proposals/${proposalId}`),

  zkDetect: (data: ZKDetectRequest) => 
    api.post<ZKDetectResponse>('/zk_oracle/analyze', data),

  uploadToIPFS: (file: File) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64Content = reader.result as string;
          const requestData: IPFSUploadRequest = {
            file_content: base64Content.split(',')[1] || base64Content,
            file_name: file.name
          };
          const response = await api.post('/ipfs/upload', requestData);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  getQuote: (params: QuoteParams) => 
    api.get('/oneinch/quote', { params }),

  swap: (data: SwapRequest) => 
    api.post('/oneinch/swap', data),
};