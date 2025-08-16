import { Invoice, Payment, Alert } from '@/types';

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    clientName: 'Acme Corporation',
    amount: 5500.00,
    dueDate: '2024-01-15',
    issueDate: '2023-12-15',
    status: 'overdue',
    description: 'Web development services - Q4 2023',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    clientName: 'TechStart Inc.',
    amount: 3200.00,
    dueDate: '2024-01-25',
    issueDate: '2023-12-25',
    status: 'pending',
    description: 'Mobile app design and development',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    clientName: 'Digital Solutions LLC',
    amount: 2800.00,
    dueDate: '2024-01-10',
    issueDate: '2023-12-10',
    status: 'paid',
    description: 'Database optimization and maintenance',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    clientName: 'Creative Agency Co.',
    amount: 4100.00,
    dueDate: '2024-01-30',
    issueDate: '2023-12-30',
    status: 'pending',
    description: 'Brand identity and website redesign',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    clientName: 'E-commerce Plus',
    amount: 6200.00,
    dueDate: '2024-02-05',
    issueDate: '2024-01-05',
    status: 'paid',
    description: 'E-commerce platform development',
  },
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    invoiceId: '3',
    amount: 2800.00,
    date: '2024-01-08',
    method: 'bank_transfer',
    status: 'completed',
    reference: 'TXN-20240108-001',
  },
  {
    id: '2',
    invoiceId: '5',
    amount: 6200.00,
    date: '2024-02-03',
    method: 'credit_card',
    status: 'completed',
    reference: 'CC-20240203-002',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'overdue',
    invoiceId: '1',
    message: 'Invoice INV-2024-001 from Acme Corporation is 5 days overdue ($5,500.00)',
    date: '2024-01-20',
    isRead: false,
  },
  {
    id: '2',
    type: 'due_soon',
    invoiceId: '2',
    message: 'Invoice INV-2024-002 from TechStart Inc. is due in 3 days ($3,200.00)',
    date: '2024-01-22',
    isRead: false,
  },
  {
    id: '3',
    type: 'payment_received',
    invoiceId: '5',
    message: 'Payment received for Invoice INV-2024-005 ($6,200.00)',
    date: '2024-02-03',
    isRead: true,
  },
];