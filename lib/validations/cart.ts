import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Produit invalide"),
  quantity: z.coerce
    .number({ message: "La quantite doit etre un nombre" })
    .int("La quantite doit etre un entier")
    .min(1, "La quantite minimale est 1")
    .max(99, "La quantite maximale est 99")
    .default(1),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, "Item invalide"),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "La quantite minimale est 1")
    .max(99, "La quantite maximale est 99"),
});

export const removeCartItemSchema = z.object({
  itemId: z.string().min(1, "Item invalide"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;