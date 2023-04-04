import {Tool} from 'langchain/agents';

export class VNSCStockAPI extends Tool {
  name: string;
  description: string;

  constructor() {
    super();
    this.name = 'find_stock_price';
    this.description = `Đây là công cụ lấy giá của một mã chứng khoán. Tham số truyền vào là mã chứng khoán.`;
  }

  async _call(arg: string): Promise<string> {
    console.log('wefwef', arg);
    return '18500 đồng'
  }
}
