import { type AssistantTool, FunctionName } from '@/types/tool.types'

const tools: AssistantTool[] = [
  {
    name: FunctionName.FillInput,
    description: 'Fill the given value into the input field on the page.',
    parameters: [
      {
        name: 'input_type',
        description: 'The type of the input to fill',
        enum: ['input', 'textarea', 'select', 'radio', 'checkbox'],
        required: true,
      },
      {
        name: 'input_value',
        description: 'The value to fill in the input',
        required: true,
      },
      {
        name: 'input_selector',
        description:
          'The selector of the input to fill. It will be used as document.querySelector(input_selector).',
        required: true,
      },
      {
        name: 'label_value',
        description:
          'The value of the label of the input to fill. Provide any relevant details if there is no label, e.g. the placeholder text.',
        required: true,
      },
    ],
  },
  {
    name: FunctionName.ClickElement,
    description: 'Click the html element on the page.',
    parameters: [
      {
        name: 'element_selector',
        description:
          'The selector of the html element to click. It will be used as document.querySelector(element_selector).',
        required: true,
      },
      {
        name: 'element_type',
        description:
          'The type of the html element to click. It could be "button", "input", "link", "select", "textarea", etc.',
        required: true,
      },
      {
        name: 'element_text',
        description:
          'The text of the element (button, input, link, etc.) to click. Provide any relevant details if there is no text, e.g. the element label, placeholder, title, etc.',
        required: true,
      },
    ],
  },
  {
    name: FunctionName.GetPageContent,
    description: 'Get the content of the page.',
    parameters: [
      {
        name: 'format',
        description: 'The format of the content.',
        enum: ['html', 'text'],
        required: true,
      },
    ],
  },
]

export function getAvailableTools(): AssistantTool[] {
  return tools
}
