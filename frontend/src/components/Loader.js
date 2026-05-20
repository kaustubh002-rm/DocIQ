export default function Loader() {
  return (
    <div className="flex gap-1 px-4 py-2">
      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
    </div>
  );
}