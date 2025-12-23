# Class: ImportValidationError

Defined in: [src/core/errors/AchievementErrors.ts:39](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/errors/AchievementErrors.ts#L39)

Error thrown when imported data fails validation

## Extends

- [`AchievementError`](AchievementError.md)

## Constructors

### Constructor

> **new ImportValidationError**(`validationErrors`): `ImportValidationError`

Defined in: [src/core/errors/AchievementErrors.ts:40](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/errors/AchievementErrors.ts#L40)

#### Parameters

##### validationErrors

`string`[]

#### Returns

`ImportValidationError`

#### Overrides

[`AchievementError`](AchievementError.md).[`constructor`](AchievementError.md#constructor)

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: docs/node\_modules/typescript/lib/lib.es2022.error.d.ts:24

#### Inherited from

[`AchievementError`](AchievementError.md).[`cause`](AchievementError.md#cause)

***

### code

> **code**: `string`

Defined in: [src/core/errors/AchievementErrors.ts:7](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/errors/AchievementErrors.ts#L7)

#### Inherited from

[`AchievementError`](AchievementError.md).[`code`](AchievementError.md#code)

***

### message

> **message**: `string`

Defined in: docs/node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

[`AchievementError`](AchievementError.md).[`message`](AchievementError.md#message)

***

### name

> **name**: `string`

Defined in: docs/node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

[`AchievementError`](AchievementError.md).[`name`](AchievementError.md#name)

***

### recoverable

> **recoverable**: `boolean`

Defined in: [src/core/errors/AchievementErrors.ts:8](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/errors/AchievementErrors.ts#L8)

#### Inherited from

[`AchievementError`](AchievementError.md).[`recoverable`](AchievementError.md#recoverable)

***

### remedy?

> `optional` **remedy**: `string`

Defined in: [src/core/errors/AchievementErrors.ts:9](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/errors/AchievementErrors.ts#L9)

#### Inherited from

[`AchievementError`](AchievementError.md).[`remedy`](AchievementError.md#remedy)

***

### stack?

> `optional` **stack**: `string`

Defined in: docs/node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

[`AchievementError`](AchievementError.md).[`stack`](AchievementError.md#stack)

***

### validationErrors

> **validationErrors**: `string`[]

Defined in: [src/core/errors/AchievementErrors.ts:40](https://github.com/dave-b-b/react-achievements/blob/3d10e1b67b77878cf7df50ca317f6dc2c677383e/src/core/errors/AchievementErrors.ts#L40)

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

[`AchievementError`](AchievementError.md).[`prepareStackTrace`](AchievementError.md#preparestacktrace)

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: node\_modules/@types/node/globals.d.ts:100

#### Inherited from

[`AchievementError`](AchievementError.md).[`stackTraceLimit`](AchievementError.md#stacktracelimit)

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

[`AchievementError`](AchievementError.md).[`captureStackTrace`](AchievementError.md#capturestacktrace)
