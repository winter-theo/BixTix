"use client";

import { useActionState, useTransition } from "react";
import { updateCartItem, removeCartItem } from "@/app/actions/cart";
import { initialActionState } from "@/lib/types";

type Props = {
  itemId: string;
  productName: string;
  price: number;
  quantity: number;
};

export function CartItemRow({ itemId, productName, price, quantity }: Props) {
  const [, updateAction] = useActionState(updateCartItem, initialActionState);
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!confirm(`Retirer "${productName}" du panier ?`)) return;

    const formData = new FormData();
    formData.append("itemId", itemId);

    startTransition(async () => {
      await removeCartItem(initialActionState, formData);
    });
  }

  return (
    <tr className="border-t">
      <td className="p-3">{productName}</td>
      <td className="p-3">{price.toFixed(2)} $</td>
      <td className="p-3">
        <form action={updateAction} className="flex items-center gap-2">
          <input type="hidden" name="itemId" value={itemId} />
          <input
            type="number"
            name="quantity"
            defaultValue={quantity}
            min="1"
            max="99"
            className="border rounded px-2 py-1 w-16"
          />
          <button
            type="submit"
            className="text-blue-600 text-sm hover:underline"
          >
            MAJ
          </button>
        </form>
      </td>
      <td className="p-3 font-semibold">{(price * quantity).toFixed(2)} $</td>
      <td className="p-3 text-right">
        <button
          onClick={handleRemove}
          disabled={isPending}
          className="text-red-600 hover:underline disabled:opacity-50"
        >
          {isPending ? "Suppression..." : "Retirer"}
        </button>
      </td>
    </tr>
  );
}