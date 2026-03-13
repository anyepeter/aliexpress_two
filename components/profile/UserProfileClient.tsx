"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CloudinaryUpload from "@/components/auth/CloudinaryUpload";
import {
  User,
  Mail,
  Phone,
  Store,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
} from "lucide-react";

type Role = "BUYER" | "SELLER" | "ADMIN";

const ROLE_LABELS: Record<Role, string> = {
  BUYER: "Buyer",
  SELLER: "Seller",
  ADMIN: "Admin",
};

const ROLE_COLORS: Record<Role, string> = {
  BUYER: "bg-blue-100 text-blue-700",
  SELLER: "bg-amber-100 text-amber-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

interface StoreInfo {
  storeName: string;
  storeSlug: string;
  logoUrl?: string | null;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: Role;
  status: string;
}

interface UserProfileClientProps {
  user: UserData;
  store?: StoreInfo | null;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-300 shrink-0">{icon}</span>
      <span className="text-xs text-gray-400 w-28 shrink-0">{label}</span>
      <span className="text-sm text-gray-700">{value}</span>
    </div>
  );
}

export default function UserProfileClient({ user, store }: UserProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Display data — updated optimistically after save
  const [display, setDisplay] = useState<UserData>(user);

  // Form state
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [email, setEmail] = useState(user.email);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const initials = `${display.firstName[0] ?? ""}${display.lastName[0] ?? ""}`.toUpperCase();
  const displayName = `${display.firstName} ${display.lastName}`;

  function enterEditMode() {
    setFirstName(display.firstName);
    setLastName(display.lastName);
    setPhone(display.phone ?? "");
    setAvatarUrl(display.avatarUrl ?? "");
    setEmail(display.email);
    setNewPassword("");
    setConfirmPassword("");
    setErrors([]);
    setSuccess(false);
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setErrors([]);
  }

  async function handleSave() {
    const errs: string[] = [];

    if (!firstName.trim() || !lastName.trim()) {
      errs.push("First and last name are required.");
    }
    if (!email.trim() || !email.includes("@")) {
      errs.push("A valid email address is required.");
    }
    if (newPassword) {
      if (newPassword.length < 8) errs.push("Password must be at least 8 characters.");
      else if (!/[A-Z]/.test(newPassword)) errs.push("Password must contain an uppercase letter.");
      else if (!/[0-9]/.test(newPassword)) errs.push("Password must contain a number.");
      else if (!/[^A-Za-z0-9]/.test(newPassword)) errs.push("Password must contain a special character.");
      else if (newPassword !== confirmPassword) errs.push("Passwords do not match.");
    }

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setErrors([]);
    const apiErrors: string[] = [];

    const profileChanged =
      firstName.trim() !== display.firstName ||
      lastName.trim() !== display.lastName ||
      phone.trim() !== (display.phone ?? "") ||
      avatarUrl !== (display.avatarUrl ?? "");

    // 1. Profile (name / phone / avatar)
    if (profileChanged) {
      try {
        const res = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim() || null,
            avatarUrl: avatarUrl || null,
          }),
        });
        const data = await res.json() as { success?: boolean; error?: string };
        if (!res.ok) apiErrors.push(data.error ?? "Failed to update profile.");
      } catch {
        apiErrors.push("Network error while updating profile.");
      }
    }

    // 2. Email
    if (email.trim().toLowerCase() !== display.email.toLowerCase()) {
      try {
        const res = await fetch("/api/user/email", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
        const data = await res.json() as { success?: boolean; error?: string };
        if (!res.ok) apiErrors.push(data.error ?? "Failed to update email.");
      } catch {
        apiErrors.push("Network error while updating email.");
      }
    }

    // 3. Password
    if (newPassword) {
      try {
        const res = await fetch("/api/user/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        });
        const data = await res.json() as { success?: boolean; error?: string };
        if (!res.ok) apiErrors.push(data.error ?? "Failed to update password.");
      } catch {
        apiErrors.push("Network error while updating password.");
      }
    }

    setSaving(false);

    if (apiErrors.length > 0) {
      setErrors(apiErrors);
      return;
    }

    // Optimistically update display data
    setDisplay((prev) => ({
      ...prev,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim() || null,
      avatarUrl: avatarUrl || null,
      email: email.trim().toLowerCase(),
    }));

    setSuccess(true);
    setIsEditing(false);
    router.refresh();
  }

  // ─── Edit Mode ───────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            type="button"
            onClick={cancelEdit}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            ✕ Cancel
          </button>
        </div>

        {/* Profile Photo */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" /> Profile Photo
          </h3>
          <div className="flex items-start gap-5">
            <div className="shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#E53935] flex items-center justify-center text-white text-xl font-bold">
                  {initials}
                </div>
              )}
              <p className="text-[10px] text-gray-400 text-center mt-1">Current</p>
            </div>
            <div className="flex-1 min-w-0">
              <CloudinaryUpload
                folder="profile-avatars"
                accept="image/*"
                maxSizeMB={2}
                aspectRatio="1:1"
                label="Upload new photo"
                currentUrl={avatarUrl || undefined}
                onUploadComplete={(url) => setAvatarUrl(url)}
                onUploadError={(err) => console.error("Avatar upload error:", err)}
                helperText="Square image recommended · max 2 MB"
              />
            </div>
          </div>
        </Card>

        {/* Personal Info */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-firstName">First Name</Label>
              <Input
                id="pf-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-lastName">Last Name</Label>
              <Input
                id="pf-lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="pf-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Email */}
        <Card className="p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email Address
          </h3>
          <div className="space-y-1.5">
            <Label htmlFor="pf-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                id="pf-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-400">
              Changing your email will also update your sign-in credentials immediately.
            </p>
          </div>
        </Card>

        {/* Password */}
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Change Password
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Leave both fields blank to keep your current password.
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pf-newPw">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="pf-newPw"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowNewPw((v) => !v);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showNewPw ? "Hide password" : "Show password"}
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf-confirmPw">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="pf-confirmPw"
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowConfirmPw((v) => !v);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPw ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 space-y-1.5">
            {errors.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{e}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <button
            type="button"
            onClick={cancelEdit}
            disabled={saving}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#E53935] text-white rounded-lg font-semibold text-sm hover:bg-[#C62828] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ─── View Mode ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-2xl">
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Profile updated successfully.
        </div>
      )}

      {/* Profile header card */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {display.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={display.avatarUrl}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#E53935] flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-100 shrink-0">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
              <span
                className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${ROLE_COLORS[display.role]}`}
              >
                {ROLE_LABELS[display.role]}
              </span>
              <p className="text-sm text-gray-400 mt-1">{display.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={enterEditMode}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-[#E53935] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>
      </Card>

      {/* Personal information */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <User className="w-4 h-4" /> Personal Information
        </h3>
        <InfoRow
          icon={<User className="w-4 h-4" />}
          label="Full Name"
          value={displayName}
        />
        <InfoRow
          icon={<Mail className="w-4 h-4" />}
          label="Email"
          value={display.email}
        />
        <InfoRow
          icon={<Phone className="w-4 h-4" />}
          label="Phone"
          value={display.phone ?? "—"}
        />
        <InfoRow
          icon={<Lock className="w-4 h-4" />}
          label="Password"
          value="••••••••"
        />
      </Card>

      {/* Store info — sellers only */}
      {store && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Store className="w-4 h-4" /> My Store
          </h3>
          <div className="flex items-center gap-3 mb-3">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={store.storeName}
                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Store className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-800">{store.storeName}</p>
              <p className="text-xs text-gray-400">
                markethub.com/store/{store.storeSlug}
              </p>
            </div>
          </div>
          <a
            href="/seller/settings"
            className="text-sm text-[#E53935] font-medium hover:text-[#E53935] transition-colors"
          >
            Manage Store Settings →
          </a>
        </Card>
      )}
    </div>
  );
}
