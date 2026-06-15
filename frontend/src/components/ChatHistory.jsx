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

          history.map((chat, index) => (

            <div
              key={index}
              className="mb-3 bg-slate-900 hover:bg-slate-800 p-3 rounded-lg cursor-pointer transition"
            >

              <p className="text-sm text-white truncate">

                {chat.question}

              </p>

              <p className="text-xs text-slate-500 mt-1">

                {
                  chat.created_at
                  ?
                  new Date(
                    chat.created_at
                  ).toLocaleString()
                  :
                  ""
                }

              </p>

            </div>

          ))

        )}

      </div>

    </div>

  );
}