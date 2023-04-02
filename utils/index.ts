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
      temperature: 0.0
    })
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }


  return res.json();

  // return new ReadableStream({
  //   async start(controller) {
  //     const onParse = (event: ParsedEvent | ReconnectInterval) => {
  //       if (event.type === "event") {
  //         const data = event.data;
  //
  //         if (data === "[DONE]") {
  //           controller.close();
  //           return;
  //         }
  //
  //         try {
  //           const json = JSON.parse(data);
  //           const text = json.choices[0].delta.content;
  //           const queue = encoder.encode(text);
  //           controller.enqueue(queue);
  //         } catch (e) {
  //           controller.error(e);
  //         }
  //       }
  //     };
  //
  //     const parser = createParser(onParse);
  //
  //     for await (const chunk of res.body as any) {
  //       parser.feed(decoder.decode(chunk));
  //     }
  //   }
  // });
};
