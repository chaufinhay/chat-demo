import {Tool} from 'langchain/agents';

export class VNSCAsset extends Tool {
  name: string;
  description: string;

  constructor() {
    super();
    this.name = 'get_user_asset';
    this.description = `Đây là công cụ lấy thông tin tài sản của khách hàng. Không có tham số truyền vào.`;
  }

  async _call(arg: string): Promise<string> {
    console.log(this.name, arg);
    return 'Nhy có quyền truy cập tài sản của khách hàng. Tổng tài sản của khách hàng là 100.000.000 đồng. Trong đó tiểu khoản thường có 50.000.000 đồng, tiểu khoản margin có 50.000.000 đồng.';
  }
}
