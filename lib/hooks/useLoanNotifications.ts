"use client";

import { useEffect } from "react";
import { getPusherClient } from "@/lib/pusher/client";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface LoanStatusEvent {
    loanId: string;
    status: "APPROVED" | "REJECTED";
    approvedAmount?: number;
    adminNote?: string;
}

export function useLoanNotifications(onUpdate?: (event: LoanStatusEvent) => void) {
    const { dbUser } = useCurrentUser();

    useEffect(() => {
        if (!dbUser?.id) return;

        const pusher = getPusherClient();
        const channel = pusher.subscribe(`private-user-${dbUser.id}`);

        channel.bind("loan-status-update", (data: LoanStatusEvent) => {
            // Show toast-style notification
            if (data.status === "APPROVED") {
                showToast(
                    `✅ Your loan of $${data.approvedAmount?.toFixed(2)} has been approved! Available now.`,
                    "success"
                );
            } else {
                showToast(
                    `❌ Your loan request was not approved. ${data.adminNote ? `Reason: ${data.adminNote}` : "View admin note."}`,
                    "error"
                );
            }
            onUpdate?.(data);
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`private-user-${dbUser.id}`);
        };
    }, [dbUser?.id, onUpdate]);
}

function showToast(message: string, type: "success" | "error") {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-[9999] max-w-sm px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 transform translate-x-full ${type === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = "translateX(0)";
    });

    setTimeout(() => {
        toast.style.transform = "translateX(120%)";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 6000);
}
