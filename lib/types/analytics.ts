export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export interface AnalyticsSummary {
    totalRevenue: number;
    totalProfit: number;
    totalOrders: number;
    totalProducts: number;
    avgOrderValue: number;
    profitMargin: number;
    loanBalance: number;
    loanTotalAmount: number;
    loanStatus: string | null;
}

export interface RevenueDataPoint {
    date: string;
    revenue: number;
    profit: number;
    orders: number;
}

export interface TopProduct {
    title: string;
    category: string;
    thumbnail: string;
    orders: number;
    revenue: number;
    profit: number;
}

export interface OrderStatusCount {
    status: string;
    count: number;
    color: string;
}

export interface CategoryData {
    category: string;
    orders: number;
    revenue: number;
    percentage: number;
}

export interface MonthlyData {
    month: string;
    revenue: number;
    profit: number;
    orders: number;
}

export interface RecentOrder {
    id: string;
    orderNumber: string;
    productTitle: string;
    thumbnail: string;
    sellingPrice: number;
    basePrice: number;
    profit: number;
    status: string;
    createdAt: string;
}

export interface AnalyticsData {
    summary: AnalyticsSummary;
    revenueByDay: RevenueDataPoint[];
    topProducts: TopProduct[];
    ordersByStatus: OrderStatusCount[];
    categoryBreakdown: CategoryData[];
    recentOrders: RecentOrder[];
    monthlyTrend: MonthlyData[];
}
