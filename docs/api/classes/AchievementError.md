# Class: AchievementError

Defined in: [src/core/errors/AchievementErrors.ts:4](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/errors/AchievementErrors.ts#L4)

Base error class for all achievement-related errors

## Extends

- `Error`

## Extended by

- [`StorageQuotaError`](StorageQuotaError.md)
- [`ImportValidationError`](ImportValidationError.md)
- [`StorageError`](StorageError.md)
- [`ConfigurationError`](ConfigurationError.md)
- [`SyncError`](SyncError.md)

## Constructors

### Constructor

> **new AchievementError**(`message`, `code`, `recoverable`, `remedy?`): `AchievementError`

Defined in: [src/core/errors/AchievementErrors.ts:5](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/errors/AchievementErrors.ts#L5)

#### Parameters

##### message

`string`

##### code

`string`

##### recoverable

`boolean`

##### remedy?

`string`

#### Returns

`AchievementError`

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: docs/node\_modules/typescript/lib/lib.es2022.error.d.ts:24

#### Inherited from

`Error.cause`

***

### code

> **code**: `string`

Defined in: [src/core/errors/AchievementErrors.ts:7](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/errors/AchievementErrors.ts#L7)

***

### message

> **message**: `string`

Defined in: docs/node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

`Error.message`

***

### name

> **name**: `string`

Defined in: docs/node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

`Error.name`

***

### recoverable

> **recoverable**: `boolean`

Defined in: [src/core/errors/AchievementErrors.ts:8](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/errors/AchievementErrors.ts#L8)

***

### remedy?

> `optional` **remedy**: `string`

Defined in: [src/core/errors/AchievementErrors.ts:9](https://github.com/dave-b-b/react-achievements/blob/ed4961bef31834b3988ece0af794aa96a6c9fce3/src/core/errors/AchievementErrors.ts#L9)

***

### stack?

> `optional` **stack**: `string`

Defined in: docs/node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

`Error.stack`

***

### prepareStackTrace()?

> `static` `optional` **prepareStackTrace**: (`err`, `stackTraces`) => `any`

Defined in: node\_modules/@types/node/globals.d.ts:98

Optional override for formatting stack traces

#### Parameters

##### err

`Error`

##### stackTraces

`CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

`Error.prepareStackTrace`

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: node\_modules/@types/node/globals.d.ts:100

#### Inherited from

`Error.stackTraceLimit`

## Methods

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Defined in: node\_modules/@types/node/globals.d.ts:91

Create .stack property on a target object

#### Parameters

##### targetObject

`object`

##### constructorOpt?

`Function`

#### Returns

`void`

#### Inherited from

`Error.captureStackTrace`
