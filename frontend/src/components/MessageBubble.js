export default function MessageBubble({ type, text }) {

  return (

    <div
      className={`my-6 flex ${
        type === "user"
          ? "justify-end"
          : "justify-start"
      }`}
    >

      <div
        className={`max-w-3xl whitespace-pre-wrap px-5 py-4 rounded-2xl ${
          type === "user"
            ? "bg-blue-600"
            : "bg-slate-800"
        }`}
      >
        {text}
      </div>

    </div>
  );
}