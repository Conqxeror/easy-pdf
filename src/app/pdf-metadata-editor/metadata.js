import { getToolMetadata } from "@/lib/toolSeoHelper";

const toolSeo = getToolMetadata('/pdf-metadata-editor');
export const metadata = toolSeo?.metadata || {};

export default function PdfMetadataEditorMetadata() {
	return null;
}
