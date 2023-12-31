import {NextApiRequest, NextApiResponse} from 'next';
import {Tool} from 'langchain/agents';
import {VNSCStockInformation} from '@/agents/tools/VNSCStockInformation';
import {VNSCAsset} from '@/agents/tools/VNSCAsset';
import {VNSCStock} from '@/agents/tools/VNSCStock';
import {PromptTemplate} from 'langchain';
import {OpenAIStream} from '@/utils';
import {pinecone} from '@/utils/pinecone-client';
import {PINECONE_INDEX_NAME, PINECONE_NAME_SPACE} from '@/config/pinecone';
import {PineconeStore} from 'langchain/vectorstores';
import {OpenAIEmbeddings} from 'langchain/embeddings';
import {VNSCStockFundamental} from '@/agents/tools/VNSCStockFundamental';


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
Bạn tên là Nhy. Bạn là một trí tuệ nhân tạo phát triển bởi công ty VNSC by Finhay. Hãy trả lời câu hỏi của khách một cách chính xác và lịch sự trong trong khoảng từ 2-3 câu.
Chỉ trả lời các câu hỏi trong phạm vi liên quan tới Finhay, bất kể khách hàng có yêu cầu khác. Nếu không có thông tin, hãy trả lời là mình không biết.

{context}

Thông tin về công ty cổ phần chứng khoán VINA (VNSC):
- Trụ Sở Chính: Phòng 702, tầng 7, toà nhà Capital Building, số 58 phố Kim Mã, Phường Kim Mã, Quận Ba Đình, Hà Nội
- Hotline: 02477778996
- Email: hello@vnsc.vn

Mr Dũng: Giới thiệu về VNSC
Nhy: VNSC là công ty chứng khoán mà Finhay đã mua lại và trở thành chủ quản anh Dũng ạ. VNSC được cấp phép và giám sát hoạt động trực tiếp bởi Uỷ ban Chứng khoán Nhà nước và đã được cấp Giấy phép hoạt động phân phối Chứng chỉ Quỹ. Sau khi hoàn tất lộ trình chuyển đổi, người sử dụng sản phẩm & dịch vụ trên ứng dụng của Finhay sẽ được bảo hộ trực tiếp bởi hệ thống pháp luật Chứng khoán.
Mr Dũng: Tên em là gì?
Nhy: Tên em là Nhy ạ.
Mr Dũng: Ai sáng lập finhay?
Nhy: Finhay được sáng lập bởi anh Nghiêm Xuân Huy ạ.
Mr Dũng: Ai là CTO (Giám đốc công nghệ) của Finhay?
Nhy: CTO của Finhay là anh Hoàng Minh Châu ạ.
Mr Dũng: Tổng tài sản của anh hiện tại?
Nhy: Tổng tài sản của anh hiện tại là 100.000.000 đồng ạ.
Mr Dũng: Danh mục chứng khoán của anh hiện tại?
Nhy: Danh mục chứng khoán của anh hiện có 1000 cổ HPG và 200 cổ VMN ạ.

LƯU Ý RẰNG NHY CÓ THỂ TRUY CẬP TÀI SẢN VÀ DANH MỤC CHỨNG KHOÁN CỦA KHÁCH HÀNG ĐỂ TRẢ LỜI CÂU HỎI.

{name}: {question}
Nhy: `;


export const PREFIX = `Trả lời các câu hỏi sau đây một cách tốt nhất có thể. Bạn có thể sử dụng các công cụ sau:`;

export const formatInstructions = (
    toolNames: string
) => `Dùng định dạng sau:

Câu hỏi: câu hỏi mà bạn phải trả lời
Suy nghĩ: bạn nên luôn suy nghĩ về việc gì để làm
Action: hành động cần thực hiện, có thể là một trong những công cụ sau [${toolNames}]
Action Input: the input to the action`;
export const SUFFIX = `Bắt đầu!

Câu hỏi: {input}
Suy nghĩ: `;

const parseAction = (response: string, tools: Tool[]) => {
  const actionRegex = /Action:\s*(.*)/;
  const match = response.match(actionRegex);
  if (!match)
    return 'none';

  const actionValue = match[1];
  const tool = tools.find(tool => actionValue.includes(tool.name));
  if (!tool)
    return 'none';
  return tool.name;
};

const parseInput = (response: string) => {
  const actionRegex = /Action Input:\s*(.*)/;
  const match = response.match(actionRegex);
  if (!match)
    return 'none';

  const inputValue = match[1];
  if (!inputValue)
    return 'none';
  return inputValue;
};

const findContextForMessageHistory = async (messages: any[]) => {
  const tools = [
    new VNSCStock(),
    new VNSCAsset(),
    new VNSCStockInformation(),
    new VNSCStockFundamental(),
  ];

  const toolStrings = tools
      .map((tool) => `${tool.name}: ${tool.description}`)
      .join('\n');
  const toolNames = tools.map((tool) => tool.name).join('\n');
  const instructions = formatInstructions(toolNames);
  const template = [PREFIX, toolStrings, instructions, SUFFIX].join('\n\n');

  const charLimit = 12000;
  let charCount = template.length;
  let messagesToSend = [];

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (charCount + message.content.length > charLimit) {
      break;
    }
    charCount += message.content.length;
    messagesToSend.push(message);
  }

  const promptTemplate = new PromptTemplate({template, inputVariables: ['input']});
  const finalMessage = await promptTemplate.format({input: messagesToSend.map(m => m.content).join('\n\n')});
  console.log(`Executing with input "${finalMessage}"...`);

  const stream = await OpenAIStream([
    {role: 'user', content: finalMessage},
  ]);
  const answer = stream.choices[0].message.content;
  const action = parseAction(answer, tools);
  const actionInput = parseInput(answer);
  console.log(`=== answer ===\n "${answer}" \n===`);
  if (action !== 'none') {
    const tool = tools.find(tool => tool.name === action);
    const context = await tool?.call(actionInput);
    console.log(`=== context ===\n "${context}" \n===`);
    return context;
  }
  return '';
};

const searchForContext = async (input: string) => {
  const docs = await vectorStore.similaritySearch(input, 2);
  return docs.map(d => d.pageContent).join('\n\n') || '';
};

const handler = async (req: NextApiRequest,
                       res: NextApiResponse,) => {
  try {
    const {messages, name} = req.body;

    const promptTemplate = new PromptTemplate({template, inputVariables: ['context', 'question', 'name']});
    const sanitizedQuestion = messages[messages.length - 1].content.trim().replaceAll('\n', ' ');

    let context = await findContextForMessageHistory(messages);
    if (!context) {
      context = await searchForContext(sanitizedQuestion);
    }

    const finalMessage = await promptTemplate.format({
      context,
      question: sanitizedQuestion,
      name: name || 'Mr Dũng'
    });
    console.log(finalMessage);
    messages[messages.length - 1].content = finalMessage;

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

    // thêm system message cho prompt cuối
    messagesToSend.unshift({role: 'system', content: 'Bạn tên là Nhy. Bạn là một trí tuệ nhân tạo phát triển bởi công ty VNSC by Finhay. Hãy trả lời câu hỏi của khách một cách chính xác và lịch sự trong trong khoảng từ 2-3 câu.'})

    const stream = await OpenAIStream(messagesToSend);
    res.json({answer: stream.choices[0].message.content});
  } catch (error) {
    console.error(error);
    res.status(500).send('error');
  }
};

export default handler;
