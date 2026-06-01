import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-yellow-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">401</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Unauthorized</h2>
        <p className="text-gray-500 mb-8">
          Please sign in to access this page.
        </p>
        <Link href="/login">
          <Button>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}