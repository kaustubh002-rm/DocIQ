import { useState, useEffect } from "react";

import API from "../services/api";

import MessageBubble from "./MessageBubble";

import Loader from "./Loader";

export default function ChatBox() {

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  // Load previous chats after refresh
  useEffect(() => {

    const loadChats = async () => {

      try {

        const res = await API.get(
          "/chat-history"
        );

        const loaded = [];

        res.data.forEach((chat) => {

          loaded.push({
            type: "user",
            text: chat.question
          });

          loaded.push({
            type: "ai",
            text:
              chat.answer +
              "\n\nSources:\n" +
              ((chat.sources || []).join("\n"))
          });

        });

        setMessages(loaded);

      } catch (error) {

        console.log(
          "History Load Error:",
          error
        );

      }

    };

    loadChats();

  }, []);

  const askQuestion = async () => {

    if (!question.trim()) return;

    const userMessage = {
      type: "user",
      text: question
    };

    setMessages((prev) => [
      ...prev,
      userMessage
    ]);

    setLoading(true);

    try {

      const response = await API.post(
        "/ask",
        {
          question
        }
      );

      console.log(
        "BACKEND RESPONSE:",
        response.data
      );

      if (response.data.error) {

        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            text: response.data.error
          }
        ]);

        return;
      }

      const aiMessage = {

        type: "ai",

        text:
          (response.data.answer ||
            "No answer returned") +
          "\n\nSources:\n" +
          (
            (response.data.sources || [])
              .join("\n")
          )

      };

      setMessages((prev) => [
        ...prev,
        aiMessage
      ]);

    } catch (error) {

      console.log(error);

      setMessages((prev) => [

        ...prev,

        {
          type: "ai",
          text:
            "Backend connection failed"
        }

      ]);

    } finally {

      setLoading(false);

      setQuestion("");

    }

  };

  return (

    <div className="h-full flex flex-col">

      {/* CHAT AREA */}

      <div className="flex-1 overflow-y-auto px-6 py-6">

        <div className="max-w-4xl mx-auto">

          {messages.map((msg, index) => (

            <MessageBubble
              key={index}
              type={msg.type}
              text={msg.text}
            />

          ))}

          {loading && <Loader />}

        </div>

      </div>

      {/* INPUT AREA */}

      <div className="border-t border-slate-800 p-4">

        <div className="max-w-4xl mx-auto flex gap-3">

          <input
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            placeholder="Ask question from PDF..."
            className="flex-1 p-4 rounded-xl bg-slate-800 text-white outline-none"
            onKeyDown={(e) => {

              if (e.key === "Enter") {

                askQuestion();

              }

            }}
          />

          <button
            onClick={askQuestion}
            className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
          >
            Ask
          </button>

        </div>

      </div>

    </div>

  );
}