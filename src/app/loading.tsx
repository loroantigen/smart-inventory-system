export default function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Smart Inventory</h1>
        <p className="text-sm text-gray-500 mt-1">Loading...</p>
        <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-blue-600 rounded-full animate-[loading_1s_ease-in-out_infinite]" 
               style={{ width: '60%', animation: 'loading 1.5s ease-in-out infinite' }} />
        </div>
      </div>
    </div>
  );
}