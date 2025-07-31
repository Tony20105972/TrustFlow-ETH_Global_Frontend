import axios from 'axios';

const BASE_URL = 'https://trust-flow-backend-ethglobal.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DeployCodeRequest {
  prompt: string;
  wallet_address?: string;
}

export interface DeployCodeResponse {
  solidity_code: string | object;
  rule_issues: Array<{
    type: string | object;
    description: string | object;
    safe: boolean;
  }>;
  deploy_result?: {
    txHash: string;
    contractAddress: string;
  } | null;
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
  code: string;
}

export interface ZKDetectResponse {
  issues: Array<{
    type: string;
    location: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }>;
}

export interface SwapRequest {
  from_token: string;
  to_token: string;
  amount: string;
  wallet_address: string;
}

export interface QuoteParams {
  from_token: string;
  to_token: string;
  amount: string;
}

export const apiService = {
  deployCode: (data: DeployCodeRequest) => 
    api.post<DeployCodeResponse>('/deploy/code', data),

  createProposal: (data: ProposalRequest) => 
    api.post('/dao/proposal', data),

  vote: (data: VoteRequest) => 
    api.post('/dao/vote', data),

  zkDetect: (data: ZKDetectRequest) => 
    api.post<ZKDetectResponse>('/zk-detect', data),

  uploadToIPFS: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/ipfs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getQuote: (params: QuoteParams) => 
    api.get('/1inch/quote', { params }),

  swap: (data: SwapRequest) => 
    api.post('/1inch/swap', data),
};