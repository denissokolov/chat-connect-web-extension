import type { Meta, StoryObj } from '@storybook/react-vite'

import ReasoningContent from './ReasoningContent'

const meta = {
  title: 'Chat/ReasoningContent',
  component: ReasoningContent,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ReasoningContent>

export default meta
type Story = StoryObj<typeof meta>

export const SummaryOnly: Story = {
  args: {
    summaryText:
      'Analyzing the user request and determining the best approach to solve the problem.',
  },
}

export const WithDetail: Story = {
  args: {
    summaryText: 'Breaking down the task into smaller steps for efficient execution.',
    detailText: `1. First, I need to understand the user's intent and what they're trying to achieve.
2. Then, I'll identify which tools or approaches would be most effective.
3. Next, I'll plan the sequence of operations to execute.
4. Finally, I'll validate the approach before proceeding.`,
  },
}

export const WithDetailExpanded: Story = {
  args: {
    summaryText: 'Planning multi-step approach for complex data transformation.',
    detailText: `## Analysis Phase
I'm analyzing the input data structure to understand the transformation requirements.

### Key Considerations:
- Data format compatibility
- Edge cases and error handling
- Performance implications

## Execution Plan
1. Parse input data
2. Apply transformations
3. Validate output
4. Return formatted result`,
    initiallyExpanded: true,
  },
}

export const LongReasoning: Story = {
  args: {
    summaryText:
      'Evaluating multiple approaches to optimize the solution with consideration for performance, maintainability, and scalability.',
    detailText: `I need to carefully consider several factors before proceeding:

**Performance Analysis:**
The current implementation has O(n²) complexity, which might not scale well with larger datasets. I should consider:
- Using a hash map for O(1) lookups
- Implementing early exit conditions
- Caching intermediate results

**Code Quality:**
The solution should be maintainable and follow best practices:
- Clear variable naming
- Proper error handling
- Comprehensive documentation
- Type safety

**Alternative Approaches:**
1. **Approach A**: Use a nested loop - simple but slow
2. **Approach B**: Use a hash map - faster but uses more memory
3. **Approach C**: Sort and use binary search - balanced approach

After weighing these options, I believe Approach B with the hash map provides the best balance of performance and code clarity for this use case.`,
  },
}
