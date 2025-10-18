export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  description: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'check';
  status: 'completed' | 'processing' | 'failed';
  reference?: string;
}

export interface Alert {
  id: string;
  type: 'overdue' | 'due_soon' | 'payment_received';
  invoiceId: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface Child {
  child_id: string;
  child_name: string;
  child_age: number;
  group_name: string;
  report_id: string;
  avatar?: string;
}