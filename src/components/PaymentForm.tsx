// Booking confirmation component - Payment will be implemented in future phases
interface BookingFormProps {
  experienceId: string;
  onSuccess: () => void;
}

export default function BookingForm({ experienceId, onSuccess }: BookingFormProps) {
  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Booking Confirmation</h2>
      <p className="text-gray-600 mb-4">
        Please confirm your booking. Payment integration will be added in future phases.
      </p>
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p className="text-sm text-gray-500">Experience ID: {experienceId}</p>
      </div>
      <button
        onClick={onSuccess}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Confirm Booking
      </button>
    </div>
  )
} 