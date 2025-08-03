---
description: Pattern for adding background styling to Radix UI Select components when open
alwaysApply: false
---

UI Component Open State Styling Pattern:

For Radix UI Select components in /components/ui/select.tsx, add open state background styling using data attributes:

- Use `data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-800` class
- Add to SelectTrigger component's default className in the cn() function
- This applies background styling automatically when any Select is opened
- Individual Select components should use `bg-transparent` to override default `bg-background`
- No need for custom state management in individual components - Radix UI handles state via data attributes

Example implementation:

```typescript
className={cn(
  'base-classes data-[state=open]:bg-gray-100 dark:data-[state=open]:bg-gray-800',
  className,
)}
```

This pattern ensures consistent styling across all Select components in the app.
