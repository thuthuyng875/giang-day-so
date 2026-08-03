export default function Loading() {
  return (
    <div className="space-y-12 pb-12 animate-pulse mt-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex gap-2">
        <div className="h-4 w-20 bg-slate-200 rounded-md"></div>
        <div className="h-4 w-4 bg-slate-200 rounded-md"></div>
        <div className="h-4 w-24 bg-slate-200 rounded-md"></div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
        {/* Left: Image Skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-3 shadow-sm">
            <div className="aspect-[4/3] w-full rounded-[1.5rem] bg-slate-200"></div>
          </div>
        </div>

        {/* Right: Info Skeleton */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
              <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
            </div>
            
            <div className="h-10 w-full bg-slate-200 rounded-xl"></div>
            <div className="h-10 w-3/4 bg-slate-200 rounded-xl"></div>
            
            <div className="h-10 w-40 bg-slate-200 rounded-xl mt-6"></div>
          </div>

          <div className="grid grid-cols-1 gap-4 pt-4">
            <div className="h-16 w-full bg-slate-200 rounded-2xl"></div>
            <div className="h-16 w-full bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
