import { FaSpinner } from "react-icons/fa";

export default function LoadingSpinner({ loading }) {
  if (!loading) return null;
  
  return (
    <div className="absolute top-6 z-50 flex flex-col items-center bg-white p-4 rounded shadow">
      <FaSpinner className="animate-spin text-blue-600 text-3xl" />
      <p>Processing...</p>
    </div>
  );
}