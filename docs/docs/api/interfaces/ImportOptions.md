# Interface: ImportOptions

Defined in: [src/core/utils/dataImport.ts:7](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/utils/dataImport.ts#L7)

Options for importing achievement data

## Properties

### expectedConfigHash?

> `optional` **expectedConfigHash**: `string`

Defined in: [src/core/utils/dataImport.ts:13](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/utils/dataImport.ts#L13)

Optional config hash to validate against

***

### mergeStrategy?

> `optional` **mergeStrategy**: `"replace"` \| `"preserve"` \| `"merge"`

Defined in: [src/core/utils/dataImport.ts:9](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/utils/dataImport.ts#L9)

Strategy for merging imported data with existing data

***

### validate?

> `optional` **validate**: `boolean`

Defined in: [src/core/utils/dataImport.ts:11](https://github.com/dave-b-b/react-achievements/blob/2283189c3274a15397f543b098b98d32e4fb9597/src/core/utils/dataImport.ts#L11)

Whether to validate the imported data
