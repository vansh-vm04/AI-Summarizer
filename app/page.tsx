"use client";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const setFileText = async () => {
    if (file) setTranscript(await file.text());
  };

  useEffect(() => {
    if (file) {
      setTranscript("");
      setFileText();
    }
    if (summaryRef.current) {
      summaryRef.current.scrollIntoView();
    }
  }, [summary, file]);

  const handleGenerate = async () => {
    const trimmed = transcript.trim();
    if (!trimmed) {
      setTranscript("");
      toast.error(
        "Atleast write the transcript, don't depend on AI for everything"
      );
      return;
    }
    setSummary("");
    setLoading(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/summarize`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: trimmed,
          prompt: prompt || "Summarize this",
        }),
      }
    );

    if (!response.body) {
      toast.error("There was an error, try again");
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader?.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      setSummary((prev) => prev + chunk);
    }
    setLoading(false);
  };


  return (
    <div className="flex flex-col justify-center items-center h-screen w-full bg-gray-950 text-white px-6 py-4 gap-2">
      <span className="text-4xl font-bold text-transparent bg-gradient-to-br from-purple-400 to-blue-700 bg-clip-text px-8 py-4 rounded-xl shadow-lg max-sm:text-2xl">
        AI Summarizer
      </span>
      <div className="w-full max-w-5xl flex flex-col gap-4">
        {summary && (
        <div className="w-full hideScrollbar scroll-smooth overflow-y-scroll h-[55vh] p-4 text-white bg-transparent">
          <pre className="whitespace-pre-wrap">{summary}</pre>
          <div ref={summaryRef}/>
        </div>
      )}
        <textarea
          onChange={(e) => setTranscript(e.target.value)}
          value={transcript}
          placeholder="Enter a transcript to summarize..."
          className="w-full h-32 p-4 resize-none hideScrollbar text-gray-900 border border-gray-700 rounded-xl bg-gray-100 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        />

        <div className="flex flex-wrap gap-4 items-center">
          <input
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            value={prompt}
            placeholder="Provide instructions for summary..."
            className="flex-1 bg-gray-100 border border-gray-700 text-gray-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <div className="relative w-32">
            <label
              htmlFor="file_input"
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl cursor-pointer hover:bg-blue-700 transition"
            >
              Upload File
            </label>
            <input
              id="file_input"
              type="file"
              accept=".txt"
              onChange={(e) => setFile(e.target?.files?.[0] || null)}
              className="hidden"
            />
          </div>

          <button
            disabled={loading}
            onClick={handleGenerate}
            type="button"
            className="text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-6 py-3"
          >
            Generate Summary
          </button>
        </div>
      </div>
    </div>
  );
}
