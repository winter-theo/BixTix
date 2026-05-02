import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCartByUserId, getCartTotal } from "@/lib/queries/cart";
import { CartItemRow } from "@/app/components/CartItemRow";
import { ClearCartButton } from "@/app/components/ClearCartButton";

export default async function PanierPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="p-4 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Mon panier</h1>
        <p className="text-gray-600">
          Vous devez etre connecte pour voir votre panier.
        </p>
      </div>
    );
  }

  const cart = await getCartByUserId(user.id);
  const total = await getCartTotal(user.id);

  // Etat vide
  if (!cart || cart.items.length === 0) {
    return (
      <div className="p-4 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Mon panier</h1>
        <div className="border rounded p-8 text-center">
          <p className="text-gray-600 mb-4">Votre panier est vide.</p>
          <Link
            href="/produits"
            className="bg-[#6c47ff] text-white rounded-md px-4 py-2 inline-block"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Mon panier</h1>
        <ClearCartButton />
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full border min-w-[600px]">
          <thead className="bg-gray-100 text-black">
            <tr>
              <th className="text-left p-3">Produit</th>
              <th className="text-left p-3">Prix unitaire</th>
              <th className="text-left p-3">Quantite</th>
              <th className="text-left p-3">Sous-total</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((item) => (
              <CartItemRow
                key={item.id}
                itemId={item.id}
                productName={item.product.name}
                price={Number(item.product.price)}
                quantity={item.quantity}
              />
            ))}
          </tbody>
          <tfoot className="bg-gray-50 font-bold text-black">
            <tr>
              <td colSpan={3} className="p-3 text-right">
                Total :
              </td>
              <td className="p-3" colSpan={2}>
                {total.toFixed(2)} $
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="text-right">
        <button
          disabled
          title="Disponible au Lab 3 (paiement Stripe)"
          className="bg-gray-300 text-gray-600 rounded-md px-6 py-3 cursor-not-allowed"
        >
          Passer la commande (Lab 3)
        </button>
      </div>
    </div>
  );
}