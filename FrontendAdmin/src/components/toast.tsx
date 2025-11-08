export default function Toast({ message, status }: { message: string; status: 'success' | 'error' }) {
  const colors: Record<'success' | 'error', string> = { success: 'bg-green-500', error: 'bg-red-500' };

  const selectedColor = colors[status];

  return (
    <>
      <div className={`fixed bottom-10 right-10 ${selectedColor}
      text-white px-4 py-2 rounded shadow-lg z-[9999999] animate-fade-in transition-all duration-500`}>
        {message}
      </div>
    
    </>
  );
}
