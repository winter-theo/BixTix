import Link from "next/link";
import { getProductsPaginated } from "@/lib/queries/products";
import { DeleteProductButton } from "@/app/components/DeleteProductButton";
import { Pagination } from "@/app/components/Pagination";
import { AddToCartButton } from "@/app/components/AddToCartButton";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ProduitsPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page, 10) : 1;

  const { products, pagination } = await getProductsPaginated(currentPage);

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Produits BixTix</h1>
        <Link
          href="/produits/nouveau"
          className="bg-[#6c47ff] text-white rounded-md px-4 py-2 text-center"
        >
          + Nouveau produit
        </Link>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {pagination.totalCount} produit(s) au total - Page{" "}
        {pagination.currentPage} sur {pagination.totalPages}
      </p>

      {products.length === 0 ? (
        <p className="text-gray-500">Aucun produit.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border min-w-[600px]">
              <thead className="bg-gray-100 text-black">
                <tr>
                  <th className="text-left p-3">Nom</th>
                  <th className="text-left p-3">Prix</th>
                  <th className="text-left p-3">Actif</th>
                  <th className="text-left p-3">Panier</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">{p.price.toString()} $</td>
                    <td className="p-3">{p.isActive ? "Oui" : "Non"}</td>
                    <td className="p-3">
                      {p.isActive && <AddToCartButton productId={p.id} />}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/produits/${p.id}/modifier`}
                        className="text-blue-600 hover:underline"
                      >
                        Modifier
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            hasPrevious={pagination.hasPrevious}
            hasNext={pagination.hasNext}
            baseUrl="/produits"
          />
        </>
      )}
    </div>
  );
}