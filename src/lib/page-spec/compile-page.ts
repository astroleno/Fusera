import type {
  SectionGraphPayload,
  ThemeTokensPayload,
} from "@/lib/domain/page-artifacts";
import { sectionRegistry, type RegisteredSectionType } from "./registry";

export type CompiledPageSection = {
  key: string;
  sectionId: string;
  sectionType: RegisteredSectionType;
  title: string;
  props: Record<string, unknown>;
};

export type CompiledPage = {
  sections: CompiledPageSection[];
  theme: ThemeTokensPayload;
};

export function compilePage(input: {
  sectionGraph: SectionGraphPayload;
  themeTokens: ThemeTokensPayload;
}): CompiledPage {
  const nodesById = new Map(
    input.sectionGraph.nodes.map((node) => [node.section_id, node]),
  );

  const sections = input.sectionGraph.section_order.map((sectionId) => {
    const node = nodesById.get(sectionId);

    if (!node) {
      throw new Error(`SectionGraph references missing section ${sectionId}`);
    }

    const sectionType = node.section_type as RegisteredSectionType;

    if (!(sectionType in sectionRegistry)) {
      throw new Error(`Unsupported section type ${node.section_type}`);
    }

    return {
      key: `${sectionType}:${node.section_id}`,
      sectionId: node.section_id,
      sectionType,
      title: node.title,
      props: node.props,
    };
  });

  return {
    sections,
    theme: input.themeTokens,
  };
}
