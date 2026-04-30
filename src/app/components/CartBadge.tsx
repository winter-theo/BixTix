import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getCartItemCount } from "@/lib/queries/cart";

export async function CartBadge() {
  const user = await getCurrentUser();

  // Si pas connecte, on affiche quand meme le lien mais sans badge
  if (!user) {
    return (
      <Link
        href="/panier"
        className="px-3 py-1 border rounded-full text-sm hover:bg-gray-100"
      >
        Panier
      </Link>
    );
  }

  const count = await getCartItemCount(user.id);

  return (
    <Link
      href="/panier"
      className="relative px-3 py-1 border rounded-full text-sm hover:bg-gray-100"
    >
      Panier
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#6c47ff] text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1">
          {count}
        </span>
      )}
    </Link>
  );
}