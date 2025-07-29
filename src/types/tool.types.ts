export enum FunctionName {
  FillInput = 'fill_input',
  ClickElement = 'click_element',
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

export type ClickElementArguments = {
  element_selector: string
  element_type: string
  element_text: string
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
