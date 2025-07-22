import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';
import starlightMarkdoc from '@astrojs/starlight-markdoc';

// https://docs.astro.build/en/guides/integrations-guide/markdoc/
export default defineMarkdocConfig({
	extends: [starlightMarkdoc()],
	tags: {
		'schema-viewer': {
			render: component('./src/components/JsonSchemaViewer.tsx'),
			attributes: {
				name: { type: String, required: true },
				schemaUrl: { type: String, required: true },
				expanded: { type: Boolean, default: true },
				hideTopBar: { type: Boolean, default: false }
			}
		}
	}
});
