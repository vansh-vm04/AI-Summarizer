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
                "You are an ai summarizer which summarizes the transcript according to given instructions if the transcript is irrelevant then just answer enter a relevant transcript",
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
