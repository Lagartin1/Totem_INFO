export default function Loader(props: { frase?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-75 z-999">
      <div className="flex flex-col items-center justify-center mt-20">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-2xl text-white">{props.frase}</p>
      </div>
    </div>
  );
}
