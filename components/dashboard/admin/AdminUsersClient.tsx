"use client";

import { useState, useMemo } from "react";
import { useSignIn } from "@clerk/nextjs";
import {
  Users,
  Store,
  ShoppingBag,
  Shield,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Calendar,
  Loader2,
  UserCheck,
  UserX,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Ban,
  LogIn,
} from "lucide-react";

type AccountStatus =
  | "PENDING_VERIFICATION"
  | "PENDING_APPROVAL"
  | "ACTIVE"
  | "SUSPENDED"
  | "REJECTED";

type Role = "ADMIN" | "SELLER" | "BUYER";

interface UserData {
  id: string;
  clerkId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: Role;
  status: AccountStatus;
  avatarUrl: string | null;
  createdAt: string;
  store: {
    storeName: string;
    isVerified: boolean;
    isPremium: boolean;
  } | null;
  _count: {
    orders: number;
  };
}

interface Props {
  initialUsers: UserData[];
}

const STATUS_CONFIG: Record<
  AccountStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  ACTIVE: { label: "Active", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  PENDING_VERIFICATION: { label: "Pending Verification", color: "bg-amber-100 text-amber-700", icon: Clock },
  PENDING_APPROVAL: { label: "Pending Approval", color: "bg-blue-100 text-blue-700", icon: Clock },
  SUSPENDED: { label: "Suspended", color: "bg-red-100 text-red-700", icon: Ban },
  REJECTED: { label: "Rejected", color: "bg-gray-100 text-gray-600", icon: XCircle },
};

const ROLE_CONFIG: Record<Role, { label: string; color: string; icon: React.ElementType }> = {
  ADMIN: { label: "Admin", color: "bg-purple-100 text-purple-700", icon: Shield },
  SELLER: { label: "Seller", color: "bg-amber-100 text-amber-700", icon: Store },
  BUYER: { label: "Buyer", color: "bg-blue-100 text-blue-700", icon: ShoppingBag },
};

type FilterTab = "ALL" | Role;
type StatusFilter = "ALL" | AccountStatus;

export default function AdminUsersClient({ initialUsers }: Props) {
  const { signIn, setActive } = useSignIn();
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<FilterTab>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (statusFilter !== "ALL" && u.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.store?.storeName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "ADMIN").length;
    const sellers = users.filter((u) => u.role === "SELLER").length;
    const buyers = users.filter((u) => u.role === "BUYER").length;
    const active = users.filter((u) => u.status === "ACTIVE").length;
    const suspended = users.filter((u) => u.status === "SUSPENDED").length;
    const pending = users.filter((u) =>
      u.status === "PENDING_APPROVAL" || u.status === "PENDING_VERIFICATION"
    ).length;
    return { total, admins, sellers, buyers, active, suspended, pending };
  }, [users]);

  const handleAction = async (action: string, userId: string, extra?: Record<string, string>) => {
    setLoadingAction(`${action}-${userId}`);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, ...extra }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Action failed");
        return;
      }
      // Update local state
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (action === "suspend") return { ...u, status: "SUSPENDED" as const };
          if (action === "activate") return { ...u, status: "ACTIVE" as const };
          if (action === "changeRole" && extra?.role)
            return { ...u, role: extra.role as Role };
          return u;
        })
      );
    } catch {
      alert("Network error");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLoginAs = async (userId: string, userName: string) => {
    if (!signIn || !setActive) return;
    if (!confirm(`You will be logged in as "${userName}". Your current session will end. Continue?`)) return;

    setLoadingAction(`login-${userId}`);
    try {
      const res = await fetch("/api/admin/login-as", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to login as user");
        return;
      }
      const { signInToken, dashboardUrl } = await res.json();

      // Use the sign-in token to create a session
      const result = await signIn.create({
        strategy: "ticket",
        ticket: signInToken,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = dashboardUrl;
      }
    } catch {
      alert("Failed to login as user");
    } finally {
      setLoadingAction(null);
    }
  };

  const STAT_CARDS = [
    { label: "Total Users", value: stats.total, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Admins", value: stats.admins, icon: Shield, color: "bg-purple-50 text-purple-600" },
    { label: "Sellers", value: stats.sellers, icon: Store, color: "bg-amber-50 text-amber-600" },
    { label: "Buyers", value: stats.buyers, icon: ShoppingBag, color: "bg-green-50 text-green-600" },
    { label: "Active", value: stats.active, icon: UserCheck, color: "bg-emerald-50 text-emerald-600" },
    { label: "Suspended", value: stats.suspended, icon: UserX, color: "bg-red-50 text-red-600" },
    { label: "Pending", value: stats.pending, icon: AlertTriangle, color: "bg-amber-50 text-amber-600" },
  ];

  const ROLE_TABS: { label: string; value: FilterTab; count: number }[] = [
    { label: "All Users", value: "ALL", count: users.length },
    { label: "Admins", value: "ADMIN", count: stats.admins },
    { label: "Sellers", value: "SELLER", count: stats.sellers },
    { label: "Buyers", value: "BUYER", count: stats.buyers },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-1">
          View and manage all registered users across the platform.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500">{label}</span>
              <div className={`p-1.5 rounded-lg ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Role Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setRoleFilter(tab.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              roleFilter === tab.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or store..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 focus:border-[#E53935] cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>User</span>
          <span>Role</span>
          <span>Status</span>
          <span>Orders</span>
          <span>Joined</span>
          <span></span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No users found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((user, index) => {
              const isExpanded = expandedId === user.id;
              const roleConf = ROLE_CONFIG[user.role];
              const statusConf = STATUS_CONFIG[user.status];
              const StatusIcon = statusConf.icon;
              const isLoading = loadingAction?.includes(user.id);

              return (
                <div key={user.id}>
                  {/* Row */}
                  <div
                    className={`grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-3 md:gap-4 px-5 py-4 items-center cursor-pointer hover:bg-gray-50/50 transition-colors ${
                      isExpanded ? "bg-gray-50/80" : ""
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : user.id)}
                  >
                    {/* User info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                          {user.firstName} {user.lastName}
                          {user.store?.isPremium && (
                            <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          )}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        {user.store && (
                          <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                            <Store className="w-3 h-3" />
                            {user.store.storeName}
                            {user.store.isVerified && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Role */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${roleConf.color}`}
                      >
                        <roleConf.icon className="w-3 h-3" />
                        {roleConf.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusConf.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConf.label}
                      </span>
                    </div>

                    {/* Orders */}
                    <div className="text-sm text-gray-600 font-medium">{user._count.orders}</div>

                    {/* Joined */}
                    <div className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>

                    {/* Expand */}
                    <div className="flex justify-end">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 bg-gray-50/80 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                        {/* Contact Info */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Contact Info
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {user.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {user.phone || "No phone"}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              Joined{" "}
                              {new Date(user.createdAt).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Store Info (if seller) */}
                        {user.store && (
                          <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                              Store Details
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Store className="w-4 h-4 text-gray-400" />
                                {user.store.storeName}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                {user.store.isVerified ? (
                                  <span className="text-emerald-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> Verified
                                  </span>
                                ) : (
                                  <span className="text-gray-400 flex items-center gap-1">
                                    <XCircle className="w-4 h-4" /> Not verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                {user.store.isPremium ? (
                                  <span className="text-amber-600 flex items-center gap-1">
                                    <Crown className="w-4 h-4" /> Premium Seller
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Standard Seller</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Actions
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {user.status === "ACTIVE" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction("suspend", user.id);
                                }}
                                disabled={!!isLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                              >
                                {isLoading && loadingAction === `suspend-${user.id}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserX className="w-3 h-3" />
                                )}
                                Suspend
                              </button>
                            ) : user.status === "SUSPENDED" ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAction("activate", user.id);
                                }}
                                disabled={!!isLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                              >
                                {isLoading && loadingAction === `activate-${user.id}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserCheck className="w-3 h-3" />
                                )}
                                Activate
                              </button>
                            ) : null}

                            {/* Login As */}
                            {user.role !== "ADMIN" && user.status === "ACTIVE" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLoginAs(user.id, `${user.firstName} ${user.lastName}`);
                                }}
                                disabled={!!isLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                              >
                                {isLoading && loadingAction === `login-${user.id}` ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <LogIn className="w-3 h-3" />
                                )}
                                Login As
                              </button>
                            )}

                            {user.role !== "ADMIN" && (
                              <select
                                value={user.role}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (
                                    confirm(
                                      `Change ${user.firstName}'s role to ${e.target.value}?`
                                    )
                                  ) {
                                    handleAction("changeRole", user.id, {
                                      role: e.target.value,
                                    });
                                  }
                                }}
                                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#E53935]/20 cursor-pointer"
                              >
                                <option value="BUYER">Buyer</option>
                                <option value="SELLER">Seller</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-center text-xs text-gray-400">
        Showing {filtered.length} of {users.length} users
      </div>
    </div>
  );
}
