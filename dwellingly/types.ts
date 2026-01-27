export enum UserRole {
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  ADMIN = 'ADMIN'
}

export enum DealStatus {
  PRE_LISTING = 'PRE_LISTING',
  ACTIVE = 'ACTIVE',
  UNDER_CONTRACT = 'UNDER_CONTRACT',
  OPTION_PERIOD = 'OPTION_PERIOD',
  PENDING_CLOSING = 'PENDING_CLOSING',
  CLOSED = 'CLOSED',
  TERMINATED = 'TERMINATED'
}

export enum DocStatus {
  MISSING = 'MISSING',
  DRAFT = 'DRAFT',
  UPLOADED = 'UPLOADED',
  APPROVED = 'APPROVED'
}

export enum TaskStatus {
  LOCKED = 'LOCKED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED'
}

export interface Document {
  id: string;
  name: string;
  type: string; // e.g., 'SDN', 'Contract', 'Survey'
  status: DocStatus;
  milestoneTag?: string; // e.g., 'listing', 'option_period', 'closing'
  description?: string; // 'Why needed' text
  url?: string;
  uploadedAt?: Date;
  version?: number;
}

export interface Event {
  id: string;
  actionType: string; // e.g., 'task_completed', 'doc_uploaded', 'contract_executed'
  description: string;
  timestamp: Date;
  userId: string;
  metadata?: Record<string, any>;
}

export interface Offer {
  id: string;
  buyerName: string;
  offerAmount: number;
  receivedDate: Date;
  status: 'active' | 'accepted' | 'rejected' | 'countered';
  keyTerms?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string; // "What it is"
  whatToPrepare?: string[]; // List of items to gather
  status: TaskStatus;
  orderIndex: number;
  requiredDocs?: string[]; // IDs of required docs
  dueDate?: Date;
}

export interface Transaction {
  id: string;
  address: string;
  status: DealStatus;
  sellerName: string;
  buyerName?: string;
  executedDate?: Date | null;
  optionPeriodDays?: number;
  closingDate?: Date | null;
  documents: Document[];
  tasks: Task[];
  offers: Offer[];
  events: Event[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}