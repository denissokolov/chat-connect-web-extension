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
    name: FunctionName.ClickButton,
    description: 'Click the button on the page.',
    parameters: [
      {
        name: 'button_selector',
        description:
          'The selector of the button to click. It will be used as document.querySelector(button_selector).',
        required: true,
      },
      {
        name: 'button_text',
        description:
          'The text of the button to click. Provide any relevant details if there is no text, e.g. the button label.',
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
