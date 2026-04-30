"use client";

import { useTransition } from "react";
import { clearCart } from "@/app/actions/cart";

export function ClearCartButton() {
  const [isPending, startTransition] = useTransition();

  function handleClear() {
    if (!confirm("Vider tout le panier ?")) return;

    startTransition(async () => {
      await clearCart();
    });
  }

  return (
    <button
      onClick={handleClear}
      disabled={isPending}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {isPending ? "Vidage..." : "Vider le panier"}
    </button>
  );
}