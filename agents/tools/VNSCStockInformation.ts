import {Tool} from 'langchain/agents';

export class VNSCStockInformation extends Tool {
  name: string;
  description: string;

  constructor() {
    super();
    this.name = 'find_stock_information';
    this.description = `Đây là công cụ lấy thông tin của một mã chứng khoán. Tham số truyền vào là mã chứng khoán.`;
  }

  async _call(arg: string): Promise<string> {
    try {
      console.log(this.name, arg);

      const response = await fetch("https://fwtapi3.fialda.com/api/services/app/StockInfo/GetCompanyProfile?symbol=" + arg, {
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
      const body = result.result;
      // delete body['history'];
      delete body['businessProspect'];

      // const parser = new DOMParser();
      // const doc = parser.parseFromString(body['history'], "text/html");
      // const serializer = new XMLSerializer();
      // const string = serializer.serializeToString(doc);
      //
      // console.log(string);

      return `Thông tin về mã chứng khoán ${arg} là:
Giá khởi điểm: ${body['initialPrice']}
Tóm tắt: ${body['aboutCompany']}
Mã số thuế: ${body['taxCode']}
Số điện thoại: ${body['tel']}
Địa chỉ email: ${body['email']}
Địa chỉ: ${body['address']}
Website: ${body['website']}
Ngày thành lập: ${body['foundingDate']}
Số cổ phiếu đang lưu hành: ${body['sharesOutstanding']}
Số nhân viên: ${body['numberOfEmployees']}
Lịch sử: ${body['history']}
      `

    } catch (e) {
      console.log(e)
      return 'Không tìm thấy thông tin của mã chứng khoán này.';
    }
  }
}
