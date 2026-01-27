import { DealStatus, DocStatus, TaskStatus, Transaction, UserRole } from './types';
import { addDays, subDays } from 'date-fns';

export const APP_NAME = "Dwellingly";

// Mock Data Initializer
export const INITIAL_TRANSACTION: Transaction = {
  id: 'txn_001',
  address: '123 Bluebonnet Ln, Austin, TX 78704',
  status: DealStatus.PRE_LISTING,
  sellerName: 'Alex Seller',
  executedDate: null, 
  optionPeriodDays: 7, 
  closingDate: null,
  events: [
    {
      id: 'evt_1',
      actionType: 'deal_created',
      description: 'Transaction workspace created',
      timestamp: subDays(new Date(), 2),
      userId: 'u_1'
    }
  ],
  offers: [],
  documents: [
    { 
      id: 'doc_sdn', 
      name: "Seller's Disclosure Notice", 
      type: 'Disclosure', 
      status: DocStatus.MISSING,
      milestoneTag: 'listing',
      description: 'Texas law requires sellers to disclose material defects to potential buyers.'
    },
    { 
      id: 'doc_survey', 
      name: "Existing Survey (T-47)", 
      type: 'Survey', 
      status: DocStatus.MISSING,
      milestoneTag: 'listing',
      description: 'An existing survey can save money if it is still accurate and accepted by the title company.'
    },
    { 
      id: 'doc_contract', 
      name: "One to Four Family Contract", 
      type: 'Contract', 
      status: DocStatus.MISSING,
      milestoneTag: 'contract',
      description: 'The standard TREC form used for resale of residential properties.'
    },
    { 
      id: 'doc_lead', 
      name: "Lead-Based Paint Addendum", 
      type: 'Disclosure', 
      status: DocStatus.UPLOADED, 
      uploadedAt: new Date(),
      milestoneTag: 'listing',
      description: 'Required for all homes built before 1978.',
      version: 1
    },
  ],
  tasks: [
    {
      id: 'task_1',
      title: 'Prepare Seller Disclosures',
      description: 'Complete the Seller\'s Disclosure Notice (SDN). This is legally required to avoid buyer termination rights.',
      whatToPrepare: ['Knowledge of property condition', 'Repair history', 'Insurance claims history'],
      status: TaskStatus.PENDING,
      orderIndex: 1,
      requiredDocs: ['doc_sdn']
    },
    {
      id: 'task_2',
      title: 'Create Buyer Packet',
      description: 'Bundle your disclosures, survey, and T-47 into a single link. This builds trust with buyers immediately.',
      whatToPrepare: ['PDFs of Disclosures', 'Survey PDF', 'T-47 Affidavit'],
      status: TaskStatus.LOCKED,
      orderIndex: 2
    },
    {
      id: 'task_3',
      title: 'Review & Log Offers',
      description: 'As offers come in, log them here. Review price, closing date, and option period terms carefully.',
      whatToPrepare: ['Received Offer PDF', 'Net Sheet calculator'],
      status: TaskStatus.LOCKED,
      orderIndex: 3
    },
    {
      id: 'task_4',
      title: 'Execute Contract',
      description: 'Once all parties have signed and the effective date is filled in, the contract is "Executed". Log the date to start the clock.',
      whatToPrepare: ['Fully signed contract PDF', 'Effective Date'],
      status: TaskStatus.LOCKED,
      orderIndex: 4,
      requiredDocs: ['doc_contract']
    },
    {
      id: 'task_5',
      title: 'Option Period & Inspections',
      description: 'The buyer will pay the option fee and book inspections. Be ready to provide access.',
      whatToPrepare: ['House keys/codes', 'Utilities on'],
      status: TaskStatus.LOCKED,
      orderIndex: 5
    }
  ]
};

export const MOCK_USER = {
  id: 'u_1',
  name: 'Alex Seller',
  role: UserRole.SELLER
};