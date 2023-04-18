import {Tool} from 'langchain/agents';
import {getFinancialHighlights} from '@/agents/repository/Fialda'

export class VNSCStockFundamental extends Tool {
  name: string;
  description: string;

  constructor() {
    super();
    this.name = 'find_stock_fundamental';
    this.description = `Đây là công cụ lấy thông tin các chỉ số tài chình cơ bản của một mã chứng khoán, có thể dùng để đưa ra nhận định về tình hình kinh doanh, làm ăn và sức khỏe tài chính của doanh nghiệp. Tham số truyền vào là mã chứng khoán.`;
  }

  async _call(arg: string): Promise<string> {
    try {
      const symbol = arg.replace('"', '')  // avoid input like "HPG"
      const hightlights = await getFinancialHighlights(symbol);
      return `
      Với thông tin tài chính, hãy đưa ra nhận định của mình, dẫn chứng các con số cụ thể. Với các chỉ số nhỏ hơn 0, hay dùng từ "âm" để mô tả.
      Ví dụ: HPG, lợi nhuận: -120 tỉ đồng, tỉ suất lợi nhuận 8%.
      Trả lời: HPG có lợi nhuận âm 120 tỉ, tỉ suất lợi nhuận 8%.
      Ví dụ: HPG, lợi nhuận: 12.3 tỉ đồng, tỉ suất lợi nhuận 8%.
      Trả lời: HPG có lợi nhuận 12.3 tỉ, tỉ suất lợi nhuận 8%.
      Ví dụ: HPG, tăng trưởng lợi nhuận -3%.
      Trả lời: HPG có tăng trưởng lợi nhuận giảm 3% so với cùng kỳ năm trước.
      Ví dụ: HPG, tăng trưởng lợi nhuận 5.2%.
      Trả lời: HPG có tăng trưởng lợi nhuận tăng 5.2% so với cùng kỳ năm trước.

      Khi có thông tin về ngành, đưa ra so sánh nhận định với ngành.
      Ví dụ: HPG có PE: 14, thuộc ngành Thép. Ngành thép có PE trung bình là 12.
      Trả lời: HPG có PE (14) cao hơn trung bình ngành (12).

      ${hightlights}
      `

    } catch (e) {
      console.log(e)
      return `Không tìm thấy thông tin của mã chứng khoán này: ${arg}`;
    }
  }
}
