import { DateTime } from 'luxon'

import type { Message } from '@/types/types'
import { FunctionName, FunctionStatus, MessageContentType, MessageRole } from '@/types/types'

export const messagesMock: Message[] = [
  {
    id: '1',
    content: [
      { type: MessageContentType.OutputText, text: 'Please make a summary of this page', id: '1' },
    ],
    role: MessageRole.User,
    createdAt: DateTime.now().toISO(),
    threadId: '1',
    complete: true,
  },
  {
    id: '2',
    content: [
      {
        type: MessageContentType.OutputText,
        text: 'This is the summary of the page: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        id: '2',
      },
    ],
    role: MessageRole.Assistant,
    createdAt: DateTime.now().toISO(),
    threadId: '1',
    complete: true,
  },
  {
    id: '3',
    content: [
      { type: MessageContentType.OutputText, text: 'What is the main idea of the page?', id: '3' },
    ],
    role: MessageRole.User,
    createdAt: DateTime.now().toISO(),
    threadId: '1',
    complete: true,
  },
  {
    id: '4',
    content: [
      {
        type: MessageContentType.OutputText,
        text: 'The main idea of the page is to make a summary of the page',
        id: '4',
      },
    ],
    role: MessageRole.Assistant,
    createdAt: DateTime.now().toISO(),
    threadId: '1',
    complete: true,
  },
  {
    id: '5',
    content: [{ type: MessageContentType.OutputText, text: 'What time is it?', id: '5' }],
    role: MessageRole.User,
    createdAt: DateTime.now().toISO(),
    threadId: '1',
    complete: true,
  },
  {
    id: '6',
    content: [{ type: MessageContentType.OutputText, text: 'It is 12:00 PM', id: '6' }],
    role: MessageRole.Assistant,
    createdAt: DateTime.now().toISO(),
    threadId: '1',
    complete: true,
  },
  {
    id: '7',
    content: [
      {
        type: MessageContentType.OutputText,
        text: 'Ultimate Question of Life, the Universe, and Everything',
        id: '7',
      },
    ],
    role: MessageRole.User,
    createdAt: DateTime.now().toISO(),
    threadId: '1',
    complete: true,
  },
]

export const messagesWithFunctionCallMock: Message[] = [
  {
    id: '1',
    content: [{ type: MessageContentType.OutputText, text: 'Please order sushi', id: '1' }],
    role: MessageRole.User,
    createdAt: DateTime.now().toISO(),
    threadId: '1',
    context: {
      title: 'Amsterdam Sushi',
      url: 'https://example.com',
      favicon:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAABeUlEQVR4nGJZbsDCAAOr5pbC2XObVsDZPtu3wNl1KwPhbMtrt+DsQ5cmw9mn0j3gbCYGGoOhbwFLm5UunLOaTw7Oznd0h7PvbCuAsxXEdeDsHZeN4ewHhy3hbFZ3hJlDP4hoHwc8zGfgHMEVaXC2lm01nL27VwLO/ta/Cc7++e4rnK3vtQbO9n60Ds4e+kFEcwsYxdd8hHOuzUCUOe8a7sHZ9z9MgbNvlO2Gs3Mmn4Cz//jIwNkbr2+As4d+ENE+DsqyOeAcnvPNcPYT1i9w9t3IJ3B249IEOFuTBaE39hIif3zMmgVnD/0gon0cfJJKgnN083jg7NcMLXB2/9QGOLuEvQKhuW8vnN387Tmc/djkJ5w99IOI9vWB1Zv5cA7b56twtl5HJ5zdVI4Ia5e1UnD2z3sz4WyxAwfh7KsvTOHsoR9EtM8HTUGJcI5u1Fk4+17+Zjh7aq8WnL0+8Byc3fNPGc4+7bMfzj5q/B7OHvpBRHMLAAEAAP//zHllDdnL2AgAAAAASUVORK5CYII=',
    },
    complete: true,
  },
  {
    id: '2',
    content: [
      {
        type: MessageContentType.OutputText,
        text: 'Sure, I will fill the form for you',
        id: 'answer_1',
      },
      {
        id: 'answer_2',
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.FillInput,
        arguments: {
          input_type: 'radio',
          input_value: 'personal',
          input_selector: '#typeofclient',
          label_value: 'Particulier',
        },
      },
      {
        id: 'answer_3',
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.FillInput,
        arguments: {
          input_type: 'radio',
          input_value: 'company',
          input_selector: '#typeofclient',
          label_value: 'Bedrijf',
        },
      },
      {
        id: 'answer_4',
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.FillInput,
        arguments: {
          input_type: 'input',
          input_value: 'Jan',
          input_selector: '#firstname',
          label_value: 'Naam',
        },
      },
      {
        id: 'answer_5',
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.FillInput,
        arguments: {
          input_type: 'input',
          input_value: 'Jansen',
          input_selector: '#lastname',
          label_value: 'Achternaam',
        },
      },
      {
        id: 'answer_6',
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.FillInput,
        arguments: {
          input_type: 'input',
          input_value: '14A',
          input_selector: '#streetnumber',
          label_value: 'Huisnummer',
        },
      },
      {
        id: 'answer_7',
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.FillInput,
        arguments: {
          input_type: 'input',
          input_value: '1234',
          input_selector: '#postalcode',
          label_value: 'Postcode',
        },
      },
      {
        id: 'answer_8',
        type: MessageContentType.FunctionCall,
        status: FunctionStatus.Idle,
        name: FunctionName.FillInput,
        arguments: {
          input_type: 'input',
          input_value: 'AB',
          input_selector: '#postalcode_letters',
          label_value: 'Postcode letters',
        },
      },
    ],
    role: MessageRole.Assistant,
    createdAt: DateTime.now().toISO(),
    threadId: '1',
    complete: true,
  },
]
