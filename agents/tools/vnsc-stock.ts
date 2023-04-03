import { Tool } from "langchain/agents";
import { ZapierValues } from "langchain/dist/agents/tools/zapier";
import { renderTemplate } from "langchain/prompts";

const zapierNLABaseDescription: string =
  "A wrapper around Zapier NLA actions. " +
  "The input to this tool is a natural language instruction, " +
  'for example "get the latest email from my bank" or ' +
  '"send a slack message to the #general channel". ' +
  "Each tool will have params associated with it that are specified as a list. You MUST take into account the params when creating the instruction. " +
  "For example, if the params are ['Message_Text', 'Channel'], your instruction should be something like 'send a slack message to the #general channel with the text hello world'. " +
  "Another example: if the params are ['Calendar', 'Search_Term'], your instruction should be something like 'find the meeting in my personal calendar at 3pm'. " +
  "Do not make up params, they will be explicitly specified in the tool description. " +
  "If you do not have enough information to fill in the params, just say 'not enough information provided in the instruction, missing <param>'. " +
  "If you get a none or null response, STOP EXECUTION, do not try to another tool! " +
  "This tool specifically used for: {zapier_description}, " +
  "and has params: {params}";

export type VNSCValues = Record<string, any>;


export class VNSCStockAPI extends Tool {
  // apiWrapper: ZapierNLAWrapper;

  actionId: string;

  params?: VNSCValues;

  name: string;

  description: string;

  constructor(
    // apiWrapper: ZapierNLAWrapper,
    actionId: string,
    zapierDescription: string,
    paramsSchema: ZapierValues,
    params?: ZapierValues
  ) {
    super();
    // this.apiWrapper = apiWrapper;
    this.actionId = actionId;
    this.params = params;
    this.name = 'stock_price';
    const paramsSchemaWithoutInstructions = { ...paramsSchema };
    delete paramsSchemaWithoutInstructions.instructions;
    const paramsSchemaKeysString = JSON.stringify(
      Object.keys(paramsSchemaWithoutInstructions)
    );
    this.description = renderTemplate(zapierNLABaseDescription, "f-string", {
      zapier_description: zapierDescription,
      params: paramsSchemaKeysString,
    });
    console.log(this.description);
  }

  async _call(arg: string): Promise<string> {
    console.log('wefwef', this.actionId, arg);
    return '18500 đồng'
    // return this.apiWrapper.runAsString(this.actionId, arg, this.params);
  }
}
