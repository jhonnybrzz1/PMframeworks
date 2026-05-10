import { describe, expect, it } from "vitest";
import { analysisFixture, inputTextFixture } from "./fixtures/analysis-fixture";
import {
  buildPDFRequestPayload,
  buildPDFTemplateReplacements,
  formatAnalysisForPDF,
} from "./pdf-helpers";

describe("PDF intermediate contract", () => {
  it("builds the same intermediate JSON for client and server callers", () => {
    const clientPayload = buildPDFRequestPayload(analysisFixture, inputTextFixture);
    const serverPayload = buildPDFRequestPayload(analysisFixture, inputTextFixture);

    expect({
      ...clientPayload,
      timestamp: 0,
    }).toEqual({
      ...serverPayload,
      timestamp: 0,
    });

    expect(formatAnalysisForPDF(clientPayload.analysis, clientPayload.inputText)).toEqual(
      formatAnalysisForPDF(serverPayload.analysis, serverPayload.inputText),
    );
  });

  it("escapes dynamic HTML replacements without changing PDF data fields", () => {
    const pdfData = formatAnalysisForPDF({
      ...analysisFixture,
      summary: '<script>alert("x")</script>',
      strengths: ["Forca com <tag>"],
    }, inputTextFixture);

    const replacements = buildPDFTemplateReplacements(pdfData);

    expect(pdfData.summary).toBe('<script>alert("x")</script>');
    expect(replacements["{{summary}}"]).toBe("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(replacements["{{strengths}}"]).toContain("&lt;tag&gt;");
  });
});
