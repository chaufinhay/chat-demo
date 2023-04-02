import {Message, OpenAIModel} from '@/types';

export const OpenAIStream = async (messages: Message[]) => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    method: "POST",
    body: JSON.stringify({
      model: OpenAIModel.DAVINCI_TURBO,
      messages,
      max_tokens: 800,
      temperature: 0.4
    })
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  return res.json();
};
