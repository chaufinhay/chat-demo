import {OpenAIStream} from '@/utils';
import {PromptTemplate} from 'langchain';
import {pinecone} from '@/utils/pinecone-client';
import {PINECONE_INDEX_NAME, PINECONE_NAME_SPACE} from '@/config/pinecone';
import {NextApiRequest, NextApiResponse} from 'next';
import {PineconeStore} from 'langchain/vectorstores';
import {OpenAIEmbeddings} from 'langchain/embeddings';

const index = pinecone.Index(PINECONE_INDEX_NAME);
const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({}),
    {
      pineconeIndex: index,
      textKey: 'text',
      namespace: PINECONE_NAME_SPACE
    }
);

const template = `
Bạn tên là Nhy. Bạn là một trí tuệ nhân tạo phát triển bởi công ty Finhay. Hãy trả lời câu hỏi của khách một cách chính xác và lịch sự trong trong khoảng từ 2-3 câu.

{context}

Mr Dũng: Giới thiệu về VNSC
Nhy: VNSC là công ty chứng khoán mà Finhay đã mua lại và trở thành chủ quản anh Dũng ạ. VNSC được cấp phép và giám sát hoạt động trực tiếp bởi Uỷ ban Chứng khoán Nhà nước và đã được cấp Giấy phép hoạt động phân phối Chứng chỉ Quỹ. Sau khi hoàn tất lộ trình chuyển đổi, người sử dụng sản phẩm & dịch vụ trên ứng dụng của Finhay sẽ được bảo hộ trực tiếp bởi hệ thống pháp luật Chứng khoán.
Mr Dũng: Tên em là gì?
Nhy: Tên em là Nhy ạ.
Mr Dũng: Ai sáng lập finhay?
Nhy: Finhay được sáng lập bởi anh Nghiêm Xuân Huy ạ.
Mr Dũng: Ai là CTO (Giám đốc công nghệ) của Finhay?
Nhy: CTO của Finhay là anh Hoàng Minh Châu ạ.

{name}: {question}
Nhy: `;


const handler = async (req: NextApiRequest,
                       res: NextApiResponse,) => {
  try {
    const {messages, name} = req.body

    const promptTemplate = new PromptTemplate({template, inputVariables: ['context', 'question', 'name']});
    const sanitizedQuestion = messages[messages.length - 1].content.trim().replaceAll('\n', ' ');
    const docs = await vectorStore.similaritySearch(sanitizedQuestion, 2);
    const finalMessage = await promptTemplate.format({
      context: docs.map(d => d.pageContent).join('\n\n') || '',
      question: sanitizedQuestion,
      name: name || 'Mr Dũng'
    });
    console.log(finalMessage)
    messages[messages.length - 1].content = finalMessage

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
    res.status(500).send('error');
  }
};

export default handler;
