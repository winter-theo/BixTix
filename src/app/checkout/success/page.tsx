import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="p-4 sm:p-8 text-center">
      <h1 className="text-2xl font-bold mb-4 text-green-600">Paiement reussi</h1>
      <p className="mb-6">
        Merci pour votre commande. Vos licences seront disponibles sous peu.
      </p>
      <Link
        href="/produits"
        className="bg-[#6c47ff] text-white rounded-md px-4 py-2 inline-block"
      >
        Continuer mes achats
      </Link>
    </div>
  );
}