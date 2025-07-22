import { defineMarkdocConfig } from '@astrojs/markdoc/config';
import starlightMarkdoc from '@astrojs/starlight-markdoc';
import JsonSchemaViewer from './src/components/JsonSchemaViewer.tsx';

// https://docs.astro.build/en/guides/integrations-guide/markdoc/
export default defineMarkdocConfig({
	extends: [starlightMarkdoc()],
	tags: {
		'schema-viewer': {
			render: JsonSchemaViewer,
			attributes: {
				name: { type: String, required: true },
				schemaUrl: { type: String, required: true },
				expanded: { type: Boolean, default: true },
				hideTopBar: { type: Boolean, default: false }
			}
		}
	}
});
