export enum FunctionName {
  FillInput = 'fill_input',
  ClickButton = 'click_button',
  GetPageContent = 'get_page_content',
}

export enum FunctionStatus {
  Idle = 'idle',
  Pending = 'pending',
  Success = 'success',
  Error = 'error',
}

export type FunctionCallResult = {
  success: boolean
  error?: string
  result?: string
}

export type FillInputArguments = {
  input_type: string
  input_value: string
  input_selector: string
  label_value: string
}

export type ClickButtonArguments = {
  button_selector: string
  button_text: string
}

export enum PageContentFormat {
  Html = 'html',
  Text = 'text',
}

export type GetPageContentArguments = {
  format: PageContentFormat
}

type AssistantToolParameter = {
  name: string
  description: string
  enum?: string[]
  required?: boolean
}

export type AssistantTool = {
  name: FunctionName
  description: string
  parameters: AssistantToolParameter[]
}
