import {Message} from '@/types';
import {OpenAIStream} from '@/utils';
// import {PromptTemplate} from 'langchain';
import {pinecone} from '@/utils/pinecone-client';
import {PINECONE_INDEX_NAME, PINECONE_NAME_SPACE} from '@/config/pinecone';
import {NextApiRequest, NextApiResponse} from 'next';
// import {PineconeStore} from 'langchain/vectorstores';
// import {OpenAIEmbeddings} from 'langchain/embeddings';

// export const config = {
//   runtime: "edge"
// };

const template = `  
# Ví dụ hội thoại mẫu #
Mr Dũng: Bên mình thành công ty chứng khoán vina rồi, Sao chưa thấy bán chứng khoán trên sàn HNX vậy?
AI: Chào anh Dũng, Finhay cảm ơn anh đã tin tưởng sử dụng dịch vụ của Finhay. Trong thời gian đầu, để người dùng dễ thích nghi với thị trường chứng khoán nên Finhay chỉ có những mã cổ phiếu có thanh khoản tốt và tình hình hoạt động kinh doanh khả quan trên thị trường ạ. Dự kiến trong những phiên bản sau của Finhay sẽ hoàn thiện và bổ sung thêm nhiều mã cổ phiếu ạ.

# Ngữ cảnh #
{context}

Bạn tên là Nhy. Bạn là nhân viên công ty Finhay. Hãy trả lời câu hỏi của khách một cách chính xác và lịch sự. Kết thúc câu có thể thêm từ "nha", "ạ" và "nhé" để tạo cảm giác trẻ trung. Chỉ sử dụng "anh"/"chị" khi nói với khách hàng, không sử dụng "bạn". Trả lời xong thì dừng luôn đừng hỏi khách còn câu hỏi gì nữa không. Đừng hỏi khách còn cần thêm thông tin gì không. Đừng hỏi khách muốn tìm hiểu thêm gì về sản phẩm Finhay ở cuối câu.

# Câu hỏi #
{name}: {question}
AI: `;



const handler = async (req: NextApiRequest,
                       res: NextApiResponse,) => {
  try {
    const { messages } = req.body
    console.log(messages)

    // const index = pinecone.Index(PINECONE_INDEX_NAME);
    // console.log(index)
// const vectorStore = await PineconeStore.fromExistingIndex(
//     new OpenAIEmbeddings({}),
//     {
//       pineconeIndex: index,
//       textKey: 'text',
//       namespace: PINECONE_NAME_SPACE
//     }
// );


    // const promptTemplate = new PromptTemplate({template, inputVariables: ["context", "question", 'name']});
    const sanitizedQuestion = messages[messages.length - 1].content.trim().replaceAll('\n', ' ');
    // const docs = await vectorStore.similaritySearch(sanitizedQuestion, 2);
    // console.log(docs)

    // messages[messages.length - 1].content = await promptTemplate.format({
    //   context: docs.map(d => d.pageContent).join("\n\n"),
    //   question: sanitizedQuestion,
    //   name: 'Mr Dũng'
    // });

    const charLimit = 12000;
    let charCount = 0;
    let messagesToSend = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (charCount + message.content.length > charLimit) {
        break;
      }
      charCount += message.content.length;
      messagesToSend.push(message);
    }

    const stream = await OpenAIStream(messagesToSend);
    res.json({answer: stream.choices[0].message.content});
  } catch (error) {
    console.error(error);
    res.status(500).send("error");
  }
};

export default handler;
