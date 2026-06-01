export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Under Maintenance</h1>
        <p className="text-gray-500 mb-6">
          We are currently performing scheduled maintenance. Please check back later.
        </p>
        <p className="text-sm text-gray-400">
          Expected completion: Soon
        </p>
      </div>
    </div>
  );
}