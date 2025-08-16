"use client";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [email, setEmail] = useState("");
  const [loading,setLoading] = useState(false);

  const handleGenerate = async () => {
    if(!transcript){
      toast.error("Enter transcript to generate summary");
      return;
    }
    setSummary('')
    setLoading(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/summarize`,{
      method:'POST',
      headers: { "Content-Type": "application/json" },
      body:JSON.stringify({
        transcript,
        prompt:prompt || 'Summarize this'
      })
    })

    if(!response.body){
      toast.error('There was an error, try again');
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while(true){
      const {done,value} = await reader?.read();
      if(done) break;
      const chunk = decoder.decode(value,{stream:true});
      setSummary(prev=>prev+chunk);
    }
    setLoading(false);
  };

  const handleShare = async () => {

  };

  return (
    <div className="flex flex-col items-center h-screen w-full bg-gray-950 text-white px-6 py-4 gap-4">
      <span className="text-4xl font-bold text-transparent bg-gradient-to-br from-purple-400 to-blue-700 bg-clip-text px-8 py-4 rounded-xl shadow-lg">
        AI Summarizer
      </span>

      <div className="w-full max-w-5xl flex flex-col gap-6">
        

        <textarea
          onChange={(e) => setTranscript(e.target.value)}
          value={transcript}
          placeholder="Enter meeting transcript..."
          className="w-full h-32 p-4 resize-none hideScrollbar text-gray-900 border border-gray-700 rounded-xl bg-gray-100 text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        />

        <div className="flex gap-4 items-center">
          <input
            onChange={(e) => setPrompt(e.target.value)}
            type="text"
            value={prompt}
            placeholder="Provide instructions for summary..."
            className="flex-1 bg-gray-100 border border-gray-700 text-gray-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <button
          disabled={loading}
            onClick={handleGenerate}
            type="button"
            className="text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-xl text-sm px-6 py-3"
          >
            Generate Summary
          </button>
        </div>

        
        <textarea
        ref = {summaryRef}
          onChange={(e) => setSummary(e.target.value)}
          value={summary}
          readOnly={loading}
          placeholder="Your generated summary will appear here..."
          className="w-full hideScrollbar resize-none overflow-y-auto h-[40vh] p-4 text-white bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-4 items-center">
          
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            value={email}
            placeholder="Recipient email..."
            className="flex-1 bg-gray-100 border border-gray-700 text-gray-900 text-sm rounded-xl p-3 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
          <button
          disabled={loading}
            onClick={handleShare}
            type="button"
            className="text-white disabled:bg-green-900 bg-green-600 hover:bg-green-500 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-xl text-sm px-6 py-3"
          >
            Share Summary
          </button>
          <button onClick={()=>setSummary('')} className="text-white bg-red-600 hover:bg-red-500 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-xl text-sm px-6 py-3">Clear Summary</button>
        </div>
      </div>
    </div>
  );
}
