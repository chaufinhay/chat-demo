import {Tool} from 'langchain/agents';

export class CurrentTimeTool extends Tool {
  name: string;
  description: string;

  constructor() {
    super();
    this.name = 'current_time';
    this.description = `Công cụ lấy thời gian hiện tại. Không có tham số truyền vào.`;
  }

  async _call(arg: string): Promise<string> {
    console.log(this.name, arg);
    return new Date().toString();
  }
}
