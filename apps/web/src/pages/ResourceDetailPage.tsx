import { useParams, Link } from "react-router-dom";

export function ResourceDetailPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <Link
        to="/resources"
        className="text-brand-600 hover:underline"
      >
        ← Back to Resources
      </Link>

      <h1 className="text-2xl font-bold">
        Resource Details
      </h1>

      <p>Resource ID: {id}</p>

      <h2 className="text-xl font-semibold">
        Cost History
      </h2>

      <p className="text-gray-500">
        Cost history will appear here.
      </p>
    </div>
  );
}