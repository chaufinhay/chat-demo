import {Tool} from 'langchain/agents';

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
      const url = `https://api4.fialda.com/api/services/app/TechnicalAnalysis/GetFinancialHighlights?symbol=${symbol}`
      console.log('fetching', url)
      const response = await fetch(url, {
        "headers": {
          ".aspnetcore.culture": "en-US",
          "abp.tenantid": "6",
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "appid": "F7335346-0CB8-49A1-B9CB-A59504CBEF14",
          "cache-control": "private, no-cache, no-store, must-revalidate",
          "sa": "421631180315016268588",
          "sec-ch-ua": "\"Google Chrome\";v=\"111\", \"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"111\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site",
          "x-alt-referer": "https://fwt.fialda.com/co-phieu/SHB/hoso",
          "Referer": "https://fwt.fialda.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      });

      const result = await response.json();
      var quarter_list = result['result'];
      quarter_list = quarter_list.filter((quarter: any) => quarter.quarter != 0 && quarter.quarter != 5)
      const last_index = quarter_list.length - 1;
      const last_quarter = quarter_list[last_index]
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

      Thông tin tài chính cơ bản về mã chứng khoán ${symbol} tại thời điểm quý ${last_quarter.quarter}, năm ${last_quarter.year} là:
        EPS: ${(last_quarter.eps).toFixed(2)} đồng / cổ phiếu
        PE: ${(last_quarter.pe).toFixed(2)}
        PB: ${(last_quarter.pb).toFixed(2)}
        Lợi nhuận: ${(last_quarter.profit / 1000000000).toFixed(4)} tỉ đồng
        Tỉ suất lợi nhuận: ${(last_quarter.profitMargin * 100).toFixed(2)}%
        Tăng trưởng lợi nhuận so với cùng kỳ năm trước: ${(last_quarter.profit_Growth_YoY * 100).toFixed(2)}%
              `

    } catch (e) {
      console.log(e)
      return 'Không tìm thấy thông tin của mã chứng khoán này.';
    }
  }
}
