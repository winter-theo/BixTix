"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from "@/lib/validations/cart";
import type { ActionState } from "@/lib/types";

/**
 * Ajoute un produit au panier de l'utilisateur connecte.
 * Si le produit est deja dans le panier, on incremente la quantite.
 * Cree le panier si l'utilisateur n'en a pas encore.
 */
export async function addToCart(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 1. Authentification
  let user;
  try {
    user = await requireUser();
  } catch {
    return {
      success: false,
      message: "Vous devez etre connecte pour ajouter au panier",
    };
  }

  // 2. Validation Zod
  const validation = addToCartSchema.safeParse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity") ?? 1,
  });
  if (!validation.success) {
    return {
      success: false,
      message: "Donnees invalides",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { productId, quantity } = validation.data;

  try {
    // 3. Verifier que le produit existe et est actif
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return { success: false, message: "Produit introuvable" };
    }
    if (!product.isActive) {
      return { success: false, message: "Ce produit n'est plus disponible" };
    }

    // 4. Trouver ou creer le panier de l'utilisateur (upsert)
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    // 5. Verifier si l'item est deja dans le panier
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Item deja present -> incrementer la quantite (max 99)
      const newQuantity = Math.min(existingItem.quantity + quantity, 99);
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Item absent -> creer
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    revalidatePath("/panier");
    revalidatePath("/produits");
    return { success: true, message: "Produit ajoute au panier" };
  } catch (error) {
    console.error("Erreur addToCart:", error);
    return { success: false, message: "Erreur lors de l'ajout au panier" };
  }
}

/**
 * Modifie la quantite d'un item du panier.
 */
export async function updateCartItem(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, message: "Vous devez etre connecte" };
  }

  const validation = updateCartItemSchema.safeParse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
  });
  if (!validation.success) {
    return {
      success: false,
      message: "Donnees invalides",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { itemId, quantity } = validation.data;

  try {
    // Verifier que l'item appartient bien au panier de l'utilisateur
    // (securite : empeche un user de modifier le panier d'un autre)
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== user.id) {
      return { success: false, message: "Item introuvable" };
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    revalidatePath("/panier");
    return { success: true, message: "Quantite mise a jour" };
  } catch (error) {
    console.error("Erreur updateCartItem:", error);
    return { success: false, message: "Erreur lors de la mise a jour" };
  }
}

/**
 * Supprime un item du panier.
 */
export async function removeCartItem(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, message: "Vous devez etre connecte" };
  }

  const validation = removeCartItemSchema.safeParse({
    itemId: formData.get("itemId"),
  });
  if (!validation.success) {
    return { success: false, message: "Item invalide" };
  }

  const { itemId } = validation.data;

  try {
    // Securite : verifier que l'item appartient au user
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== user.id) {
      return { success: false, message: "Item introuvable" };
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    revalidatePath("/panier");
    return { success: true, message: "Item supprime du panier" };
  } catch (error) {
    console.error("Erreur removeCartItem:", error);
    return { success: false, message: "Erreur lors de la suppression" };
  }
}

/**
 * Vide completement le panier de l'utilisateur.
 */
export async function clearCart(): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { success: false, message: "Vous devez etre connecte" };
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      return { success: true, message: "Panier deja vide" };
    }

    // onDelete: Cascade dans le schema -> les CartItem sont supprimes automatiquement
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    revalidatePath("/panier");
    return { success: true, message: "Panier vide" };
  } catch (error) {
    console.error("Erreur clearCart:", error);
    return { success: false, message: "Erreur lors du vidage du panier" };
  }
}