import { Suspense } from 'react';
import { SearchForm } from '@/components/search/search-form';
import { SearchResults } from '@/components/search/search-results';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchPageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Search Recipes</h1>
      <SearchForm />
      <Suspense
        fallback={
          <div className="grid gap-6 mt-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        }
      >
        <SearchResults
          query={params.query}
          category={params.category}
          page={params.page}
        />
      </Suspense>
    </div>
  );
}