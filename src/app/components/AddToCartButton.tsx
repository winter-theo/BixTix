"use client";

import { useActionState, useEffect, useState } from "react";
import { addToCart } from "@/app/actions/cart";
import { initialActionState } from "@/lib/types";
import { SubmitButton } from "./SubmitButton";

type Props = {
  productId: string;
};

export function AddToCartButton({ productId }: Props) {
  const [state, formAction] = useActionState(addToCart, initialActionState);
  const [showFeedback, setShowFeedback] = useState(false);

  // Afficher le message 3 secondes apres une action
  useEffect(() => {
    if (state.message) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value="1" />
      <SubmitButton pendingText="Ajout...">Ajouter</SubmitButton>

      {showFeedback && state.message && (
        <span
          className={`text-sm ${
            state.success ? "text-green-600" : "text-red-600"
          }`}
        >
          {state.message}
        </span>
      )}
    </form>
  );
}