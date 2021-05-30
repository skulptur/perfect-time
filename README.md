## `library-name`

Single paragraph about why this library exists

## Get started

Install

```bash
yarn add library-name-fns
# or
npm install --save library-name-fns
```

Use

```typescript
import { noop } from 'library-name-fns'

console.log(noop()) // undefined
```

[Examples](https://github.com/skulptur/library-name-fns/tree/master/example)

## API

- Pure functions.
- The argument order is optimized for partial application.

Exports:

### noop

`() => void`

```typescript
const nothing = noop() // undefined
```
