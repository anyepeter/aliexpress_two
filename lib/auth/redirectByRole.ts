export function getRedirectUrl(role: string, _status?: string): string {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "SELLER") return "/seller/dashboard";
  return "/buyer/dashboard";
}
