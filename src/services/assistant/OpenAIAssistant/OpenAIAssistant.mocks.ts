import type { Response } from 'openai/resources/responses/responses'

export const mockMultipleOutputsResponse: Response = {
  id: 'resp_686145bad4648198b60fe31f143278950b325342bb03bdeb',
  object: 'response',
  created_at: 1751205306,
  status: 'completed',
  background: false,
  error: null,
  incomplete_details: null,
  instructions:
    '# Identity\nYou are a helpful assistant that can help users with questions about the current webpage they are viewing.\n\n# Page Information\n\n<page-title>\n  🍣 Ama Sushi Amsterdam | Officiële Website | GRATIS frisdrank bij online bestellen!\n</page-title>\n\n<page-url>\n  https://www.amasushi.nl/bestellen\n</page-url>',
  max_output_tokens: null,
  model: 'gpt-4.1-2025-04-14',
  output: [
    {
      id: 'msg_686145bb8ee481988ed71b0d998d48c90b325342bb03bdeb',
      type: 'message',
      status: 'completed',
      content: [
        {
          type: 'output_text',
          annotations: [],
          logprobs: [],
          text: 'Certainly! Here’s how I’ll approach autofilling the form with random values:\n\n---\n\n### Chain-of-Thought Reasoning\n\n1. **Identify all input fields** on the order form, including text fields, checkboxes, and select/drop-down menus.\n2. **Assign appropriate random values** to each field:\n   - Names, addresses, and emails should look plausible.\n   - Phone number should match Dutch format.\n   - Postal code and city can be random but plausible for Amsterdam.\n   - Payment and tip options will be randomly selected from allowed choices.\n3. **Ensure required fields are filled:** All fields marked `required` must have values, and field types (like email and phone) must have valid formats.\n4. **Handle radio/select elements:** Choose a random but valid option (e.g., random payment method).\n5. **Leave optional fields blank or with dummy content.**\n6. **Checkboxes:** Randomly choose whether to subscribe to the newsletter.\n\n---\n\n### Mapping Form Fields with Example Random Values\n\n| Field                | Type         | Example Value             | Notes                              |\n|----------------------|--------------|---------------------------|-------------------------------------|\n| typeofclient         | radio        | business                  | personal or business                |\n| companyname          | input        | "ABC Consultants"         | Only for business                   |\n| firstname            | input        | "Lucas"                   | Random common Dutch first name      |\n| lastname             | input        | "Vermeer"                 |                                      |\n| street               | input        | "Prinsenstraat"           | Plausible AMS street                |\n| streetnumber         | input        | "28B"                     |                                      |\n| postalcode           | input        | "1015"                    | Locked field: keep original         |\n| postalcode_letters   | input        | "DW"                      | Random valid letters                |\n| city                 | input        | "Amsterdam"               |                                      |\n| phone                | input        | "0612345678"              | Dutch mobile format                 |\n| email                | input        | "lucas.vermeer@gmail.com" |                                      |\n| voucher              | input        | ""                        | Leave blank (no code)               |\n| requestedTime        | select       | "18:45"                   | Random valid time                   |\n| tipping              | select       | "3.5"                     | Random tip value                    |\n| paymentmethod        | select       | "creditcard"              | Random, e.g., creditcard            |\n| paywith              | select       | "34.00"                   | Random option                       |\n| remark               | textarea     | "Leave at door, please."  | Optional comment                    |\n| newsletter           | checkbox     | on                        | Random (let’s check it)             |\n\n---\n\n### Action\n\nI’ll fill these fields in the form accordingly.',
        },
      ],
      role: 'assistant',
    },
    {
      id: 'fc_6864535ec228819ba2559f273bac03b8060efbe81c5b5256',
      type: 'function_call',
      status: 'completed',
      arguments:
        '{"input_type":"radio","input_value":"personal","input_selector":"typeofclient","label_value":"Particulier"}',
      call_id: 'call_V8DXgOfseNt66chXUplx7L2Z',
      name: 'fill_input',
    },
    {
      id: 'fc_6864535f2404819ba1555e61809b5f81060efbe81c5b5256',
      type: 'function_call',
      status: 'completed',
      arguments:
        '{"input_type":"input","input_value":"Jan","input_selector":"#firstname","label_value":"Naam"}',
      call_id: 'call_LH7df6L6NqMKezUq1DN81PYb',
      name: 'fill_input',
    },
    {
      id: 'fc_6864536001f4819bab78433adec1a78e060efbe81c5b5256',
      type: 'function_call',
      status: 'completed',
      arguments: '{"element_selector":"#submit","element_text":"Bestellen"}',
      call_id: 'call_112keBYEDQI5dgV01fLbW3aC',
      name: 'click_element',
    },
  ],
  parallel_tool_calls: true,
  previous_response_id: null,
  reasoning: {
    effort: null,
    summary: null,
  },
  service_tier: 'default',
  temperature: 1,
  text: {
    format: {
      type: 'text',
    },
  },
  tool_choice: 'auto',
  tools: [
    {
      type: 'function',
      description: 'Fill the input on the page with the given value',
      name: 'fill_input',
      parameters: {
        type: 'object',
        properties: {
          input_name: {
            type: 'string',
            description: 'The name attribute of the input to fill',
          },
          input_type: {
            type: 'string',
            enum: ['input', 'textarea', 'select', 'radio', 'checkbox'],
            description: 'The type of the input to fill',
          },
          value: {
            type: 'string',
            description: 'The value to fill in the input',
          },
        },
        required: ['input_name', 'input_type', 'value'],
        additionalProperties: false,
      },
      strict: true,
    },
  ],
  top_p: 1,
  truncation: 'disabled',
  usage: {
    input_tokens: 7525,
    input_tokens_details: {
      cached_tokens: 8092,
    },
    output_tokens: 1043,
    output_tokens_details: {
      reasoning_tokens: 0,
    },
    total_tokens: 8568,
  },
  user: undefined,
  metadata: {},
  output_text:
    'Certainly! Here’s how I’ll approach autofilling the form with random values:\n\n---\n\n### Chain-of-Thought Reasoning\n\n1. **Identify all input fields** on the order form, including text fields, checkboxes, and select/drop-down menus.\n2. **Assign appropriate random values** to each field:\n   - Names, addresses, and emails should look plausible.\n   - Phone number should match Dutch format.\n   - Postal code and city can be random but plausible for Amsterdam.\n   - Payment and tip options will be randomly selected from allowed choices.\n3. **Ensure required fields are filled:** All fields marked `required` must have values, and field types (like email and phone) must have valid formats.\n4. **Handle radio/select elements:** Choose a random but valid option (e.g., random payment method).\n5. **Leave optional fields blank or with dummy content.**\n6. **Checkboxes:** Randomly choose whether to subscribe to the newsletter.\n\n---\n\n### Mapping Form Fields with Example Random Values\n\n| Field                | Type         | Example Value             | Notes                              |\n|----------------------|--------------|---------------------------|-------------------------------------|\n| typeofclient         | radio        | business                  | personal or business                |\n| companyname          | input        | "ABC Consultants"         | Only for business                   |\n| firstname            | input        | "Lucas"                   | Random common Dutch first name      |\n| lastname             | input        | "Vermeer"                 |                                      |\n| street               | input        | "Prinsenstraat"           | Plausible AMS street                |\n| streetnumber         | input        | "28B"                     |                                      |\n| postalcode           | input        | "1015"                    | Locked field: keep original         |\n| postalcode_letters   | input        | "DW"                      | Random valid letters                |\n| city                 | input        | "Amsterdam"               |                                      |\n| phone                | input        | "0612345678"              | Dutch mobile format                 |\n| email                | input        | "lucas.vermeer@gmail.com" |                                      |\n| voucher              | input        | ""                        | Leave blank (no code)               |\n| requestedTime        | select       | "18:45"                   | Random valid time                   |\n| tipping              | select       | "3.5"                     | Random tip value                    |\n| paymentmethod        | select       | "creditcard"              | Random, e.g., creditcard            |\n| paywith              | select       | "34.00"                   | Random option                       |\n| remark               | textarea     | "Leave at door, please."  | Optional comment                    |\n| newsletter           | checkbox     | on                        | Random (let’s check it)             |\n\n---\n\n### Action\n\nI’ll fill these fields in the form accordingly.',
}

export const mockSingleOutputResponse: Response = {
  id: 'resp_686145bad4648198b60fe31f143278950b325342bb03bdeb',
  object: 'response',
  created_at: 1751205306,
  status: 'completed',
  background: false,
  error: null,
  incomplete_details: null,
  instructions:
    '# Identity\nYou are a helpful assistant that can help users with questions about the current webpage they are viewing.\n\n# Page Information\n\n<page-title>\n  🍣 Ama Sushi Amsterdam | Officiële Website | GRATIS frisdrank bij online bestellen!\n</page-title>\n\n<page-url>\n  https://www.amasushi.nl/bestellen\n</page-url>',
  max_output_tokens: null,
  model: 'gpt-4.1-2025-04-14',
  output: [
    {
      id: 'msg_686145bb8ee481988ed71b0d998d48c90b325342bb03bdeb',
      type: 'message',
      status: 'completed',
      content: [
        {
          type: 'output_text',
          text: 'Hello, world!',
          annotations: [],
          logprobs: [],
        },
      ],
      role: 'assistant',
    },
  ],
  parallel_tool_calls: true,
  previous_response_id: null,
  reasoning: {
    effort: null,
    summary: null,
  },
  service_tier: 'default',
  temperature: 1,
  text: {
    format: {
      type: 'text',
    },
  },
  tool_choice: 'auto',
  tools: [],
  top_p: 1,
  truncation: 'disabled',
  usage: {
    input_tokens: 100,
    input_tokens_details: {
      cached_tokens: 0,
    },
    output_tokens: 3,
    output_tokens_details: {
      reasoning_tokens: 0,
    },
    total_tokens: 103,
  },
  user: undefined,
  metadata: {},
  output_text: 'Hello, world!',
}
