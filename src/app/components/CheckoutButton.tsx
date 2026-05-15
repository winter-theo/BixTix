"use client";

import { useFormStatus } from "react-dom";
import { createCheckoutSession } from "@/app/actions/checkout";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[#6c47ff] text-white rounded-md px-6 py-3 disabled:opacity-50"
    >
      {pending ? "Redirection..." : "Passer la commande"}
    </button>
  );
}

export function CheckoutButton() {
  return (
    <form action={createCheckoutSession}>
      <SubmitButton />
    </form>
  );
}