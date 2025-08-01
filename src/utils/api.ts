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
      tx_hash: string;
      contract_address: string;
    } | null;
  };
}

export interface ProposalRequest {
  title: string;
  description: string;
  proposer_address: string;
}

export interface VoteRequest {
  proposal_id: string;
  vote_type: boolean;
  voter_address: string;
}

export interface ZKDetectRequest {
  code: string;
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

export interface LOPAnalyzeRequest {
  code: string;
}

export interface LOPAnalyzeResponse {
  status: string;
  analysis_result?: {
    issues: Array<{
      type: string;
      line: number;
      severity: 'low' | 'medium' | 'high';
      description: string;
    }>;
    suggestions: Array<{
      line: number;
      suggestion: string;
    }>;
  };
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

  lopAnalyze: (data: LOPAnalyzeRequest) => 
    api.post<LOPAnalyzeResponse>('/lop/analyze', data),
};