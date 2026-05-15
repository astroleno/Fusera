import type {
  PageSpecPayload,
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

export function compilePageSpec(input: {
  pageSpec: PageSpecPayload;
  themeTokens: ThemeTokensPayload;
}): CompiledPage {
  return {
    sections: input.pageSpec.sections.map((section) => {
      const sectionType = section.section_type as RegisteredSectionType;
      const sectionTitle = (section as unknown as { title?: unknown }).title;

      if (!(sectionType in sectionRegistry)) {
        throw new Error(`Unsupported section type ${section.section_type}`);
      }

      return {
        key: `${sectionType}:${section.section_id}`,
        sectionId: section.section_id,
        sectionType,
        title:
          typeof sectionTitle === "string"
            ? sectionTitle
            : typeof section.props.title === "string"
              ? section.props.title
            : section.section_id,
        props: section.props,
      };
    }),
    theme: input.themeTokens,
  };
}
