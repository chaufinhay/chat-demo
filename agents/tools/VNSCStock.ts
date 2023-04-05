import {Tool} from 'langchain/agents';

export class VNSCStock extends Tool {
  name: string;
  description: string;

  constructor() {
    super();
    this.name = 'get_user_stock_portfolio';
    this.description = `Đây là công cụ lấy thông tin danh mục chứng khoán của khách hàng. Không có tham số truyền vào.`;
  }

  async _call(arg: string): Promise<string> {
    console.log(this.name, arg);
    return `
Danh mục chứng khoán của khách hàng là:
- VNM: 1000 cổ phiếu
- VCB: 2000 cổ phiếu
- VRE: 3000 cổ phiếu
- HPG: 4000 cổ phiếu
`;
  }
}
