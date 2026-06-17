import { useEffect, useState } from "react";
import API from "../services/api";

export default function ChatHistory() {

  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {

    try {

      const res = await API.get(
        "/chat-history"
      );

      if (Array.isArray(res.data)) {
        setHistory(res.data);
      }

    } catch (err) {
      console.log(err);
    }

  };

  const deleteChat = async (id) => {

    try {

      await API.delete(
        `/chat/${id}`
      );

      setHistory(
        history.filter(
          (chat) => chat._id !== id
        )
      );

    } catch (err) {

      console.log(err);

      alert(
        "Failed to delete chat"
      );

    }

  };

  return (

    <div className="h-full flex flex-col">

      {/* HEADER */}

      <div className="p-4 border-b border-slate-800">

        <h2 className="font-bold text-lg">
          Chat History
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          {localStorage.getItem("pdfName")}
        </p>

      </div>

      {/* LIST */}

      <div className="flex-1 overflow-y-auto p-3">

        {history.length === 0 ? (

          <p className="text-slate-500 text-sm">
            No chats yet
          </p>

        ) : (

          history.map((chat) => (

            <div
              key={chat._id}
              className="
                mb-3
                bg-slate-900
                p-3
                rounded-lg
              "
            >

              <div className="flex justify-between items-start">

                <p className="text-sm text-white flex-1 truncate">
                  {chat.question}
                </p>

                <button
                  onClick={() =>
                    deleteChat(chat._id)
                  }
                  className="
                    ml-2
                    text-red-400
                    hover:text-red-300
                  "
                >
                  🗑
                </button>

              </div>

              <p className="text-xs text-slate-500 mt-2">

                {chat.created_at
                  ? new Date(
                      chat.created_at
                    ).toLocaleString()
                  : ""}

              </p>

            </div>

          ))

        )}

      </div>

    </div>

  );

}