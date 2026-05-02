// Skeleton affiche pendant le chargement du panier
export default function Loading() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="border rounded">
        {/* En-tete simule */}
        <div className="bg-gray-100 p-3 flex gap-4">
          <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
        </div>
        {/* 3 lignes simulees */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-t p-3 flex gap-4">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}