import React from "react";

import { Skeleton } from "../ui/skeleton";

export function RecipeDetailsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto text-foreground space-y-4">
      <div className="grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-card rounded-lg shadow border border-main/20 overflow-hidden">
          <div className="relative">
            <Skeleton className="h-64 w-full bg-main/60" />
          </div>
          <div className="p-6 space-y-4">
            <div className="md:flex items-center justify-between">
              <Skeleton className="h-10 w-64 bg-main/60" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20 bg-main/60" />
                <Skeleton className="h-6 w-20 bg-main/60" />
              </div>
            </div>
            <Skeleton className="h-4 w-full bg-main/60" />
          </div>
        </section>
        <div className="space-y-6">
          <section className="bg-card rounded-lg shadow-sm p-4 border border-main/20">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Skeleton className="h-6 w-6 mb-1 bg-main/60" />
                  <Skeleton className="h-4 w-16 bg-main/60" />
                </div>
              ))}
            </div>
          </section>
          {[...Array(3)].map((_, index) => (
            <section
              key={index}
              className="bg-card rounded-lg shadow-sm p-4 border border-main/20"
            >
              <Skeleton className="h-6 w-40 mb-3 bg-main/60" />
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full bg-main/60" />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <section className="w-full bg-card rounded-lg shadow-sm p-4 border border-main/20">
        <Skeleton className="h-6 w-40 mb-3 bg-main/60" />
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex">
              <Skeleton className="h-4 w-4 mr-3 bg-main/60" />
              <Skeleton className="h-4 w-full bg-main/60" />
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8 bg-card rounded-lg shadow-sm p-6 border border-main/20">
        <Skeleton className="h-6 w-40 mb-3 bg-main/60" />
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full bg-main/60" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4 bg-main/60" />
                <Skeleton className="h-4 w-full bg-main/60" />
                <Skeleton className="h-4 w-3/4 bg-main/60" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
