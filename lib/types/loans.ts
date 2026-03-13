export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REPAID' | 'CANCELLED';

export interface LoanTransaction {
    id: string;
    orderId: string;
    amountDeducted: number;
    balanceAfter: number;
    createdAt: string;
}

export interface LoanRequest {
    id: string;
    storeId: string;
    sellerId: string;
    amount: number;
    reason: string;
    status: LoanStatus;
    approvedAmount: number | null;
    adminNote: string | null;
    approvedAt: string | null;
    rejectedAt: string | null;
    balanceRemaining: number;
    totalRepaid: number;
    createdAt: string;
    updatedAt: string;
    transactions: LoanTransaction[];
    store?: {
        storeName: string;
        logoUrl: string | null;
    };
    seller?: {
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl: string | null;
    };
}
