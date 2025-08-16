import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { transcript, prompt } = await req.json();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are an AI summarizer. Your task is to summarize the provided transcript according to the given instructions. If the transcript content is irrelevant, unclear, or unrelated to the request, respond only with: 'Enter a relevant transcript'. Do not use Markdown syntax or any other special text formatting. Instead, use plain text enhanced with relevant emojis, checkboxes (☑, ☐), arrows (→), and other simple Unicode symbols where appropriate to make the summary more readable and engaging. Use clear spacing and line breaks to ensure the output is well-structured, visually organized, and easy to read, similar to a neatly formatted document.",
            },
            {
              role: "user",
              content: `Transcript: ${transcript}  ,
          Instructions:${prompt}`,
            },
          ],
          model: "llama-3.3-70b-versatile",
          stream: true,
        });
        for await (const chunk of response) {
          const text = chunk.choices[0].delta.content || '';
          controller.enqueue(new TextEncoder().encode(text));
        }
        return 
      } catch (err){
        controller.error(err)
      }finally{
        controller.close()
      }
    },
  });

  return new Response(stream,{
    headers:{'Content-Type':'text/plain; charset=utf-8'}
  })
}
