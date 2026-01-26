import { defineMarkdocConfig, component } from '@astrojs/markdoc/config';
import starlightMarkdoc from '@astrojs/starlight-markdoc';

// https://docs.astro.build/en/guides/integrations-guide/markdoc/
export default defineMarkdocConfig({
	extends: [starlightMarkdoc()],
	tags: {
		'teamMemberCard': {
			render: component('./src/components/TeamMemberCard.astro'),
			attributes: {
				name: { type: String, required: true },
				role: { type: String, required: true },
				bio: { type: String, required: true },
				avatar: { type: String, required: true },
				location: { type: String },
				github: { type: String, required: true },
				website: { type: String },
				twitter: { type: String }
			}
		}
		// 'schema-viewer': {
		// 	render: component('./src/components/JsonSchemaViewer.tsx'),
		// 	attributes: {
		// 		name: { type: String, required: true },
		// 		schemaUrl: { type: String, required: true },
		// 		expanded: { type: Boolean, default: true },
		// 		hideTopBar: { type: Boolean, default: false }
		// 	}
		// }
	}
});
