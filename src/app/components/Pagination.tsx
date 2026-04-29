import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  baseUrl: string; // ex: "/produits"
};

export function Pagination({
  currentPage,
  totalPages,
  hasPrevious,
  hasNext,
  baseUrl,
}: Props) {
  if (totalPages <= 1) return null;

  // Genere un tableau [1, 2, 3, ..., totalPages]
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center gap-2 mt-6">
      {/* Bouton Precedent */}
      {hasPrevious ? (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Precedent
        </Link>
      ) : (
        <span className="px-3 py-1 border rounded text-gray-400 cursor-not-allowed">
          Precedent
        </span>
      )}

      {/* Numeros de pages */}
      {pages.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}?page=${page}`}
          className={`px-3 py-1 border rounded ${
            page === currentPage
              ? "bg-[#6c47ff] text-white"
              : "hover:bg-gray-100"
          }`}
        >
          {page}
        </Link>
      ))}

      {/* Bouton Suivant */}
      {hasNext ? (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="px-3 py-1 border rounded hover:bg-gray-100"
        >
          Suivant
        </Link>
      ) : (
        <span className="px-3 py-1 border rounded text-gray-400 cursor-not-allowed">
          Suivant
        </span>
      )}
    </nav>
  );
}