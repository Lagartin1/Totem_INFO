export default function Toast({ message, status }: { message: string; status: 'success' | 'error' }) {
  const colors: Record<'success' | 'error', string> = { success: 'bg-green-500', error: 'bg-red-500' };

  const selectedColor = colors[status];

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm z-10 animate-fade-in transition ease-out duration-50 "></div>
      <div className={`fixed bottom-10 right-10 ${selectedColor}
      text-white px-4 py-2 rounded shadow-lg z-30  transition ease-out duration-100`}>
        {message}
      </div>
    
    </>
  );
}
