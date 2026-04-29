"use client";

import { type FormEvent, useState } from "react";

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "submitting"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function splitLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProjectIntakeForm() {
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: "submitting", message: "Creating project" });

    const formData = new FormData(event.currentTarget);
    const payload = {
      productName: String(formData.get("productName") ?? "").trim(),
      targetAudience: String(formData.get("targetAudience") ?? "").trim(),
      sellingPoints: splitLines(formData.get("sellingPoints")),
      brandKeywords: splitLines(formData.get("brandKeywords")),
      cta: String(formData.get("cta") ?? "").trim(),
      imageUrls: splitLines(formData.get("imageUrls")),
      price: String(formData.get("price") ?? "").trim() || undefined,
      tone: String(formData.get("tone") ?? "").trim() || undefined,
      trustSignals: splitLines(formData.get("trustSignals")),
      referenceUrls: splitLines(formData.get("referenceUrls")),
    };

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { projectId?: string; error?: unknown };

      if (!response.ok) {
        setSubmitState({
          status: "error",
          message: "Check the required fields and image URLs.",
        });
        return;
      }

      setSubmitState({
        status: "success",
        message: `Project ${result.projectId} created`,
      });
    } catch {
      setSubmitState({
        status: "error",
        message: "Project creation failed.",
      });
    }
  }

  const isSubmitting = submitState.status === "submitting";

  return (
    <form className="intake-form" onSubmit={handleSubmit}>
      <div className="field-grid">
        <label className="field">
          <span>Product name</span>
          <input name="productName" placeholder="Atlas Bottle" required />
        </label>

        <label className="field">
          <span>Target audience</span>
          <input name="targetAudience" placeholder="Urban commuters" required />
        </label>
      </div>

      <label className="field">
        <span>Selling points</span>
        <textarea
          name="sellingPoints"
          placeholder={"Leak-proof seal\nKeeps drinks cold for 24 hours"}
          required
        />
      </label>

      <div className="field-grid">
        <label className="field">
          <span>Brand keywords</span>
          <textarea name="brandKeywords" placeholder={"sleek\nconfident"} required />
        </label>

        <label className="field">
          <span>Image URLs</span>
          <textarea
            name="imageUrls"
            placeholder="https://example.com/product.jpg"
            required
          />
        </label>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Primary CTA</span>
          <input name="cta" placeholder="Shop now" required />
        </label>

        <label className="field">
          <span>Price</span>
          <input name="price" placeholder="$48" />
        </label>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Tone</span>
          <input name="tone" placeholder="Precise, premium, calm" />
        </label>

        <label className="field">
          <span>Trust signals</span>
          <input name="trustSignals" placeholder="500+ reviews, lifetime warranty" />
        </label>
      </div>

      <label className="field">
        <span>Reference URLs</span>
        <input name="referenceUrls" placeholder="https://example.com/reference" />
      </label>

      <div className="form-actions">
        <button className="primary-action" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating" : "Create project"}
        </button>
        {submitState.message ? (
          <p className={`form-status ${submitState.status}`} role="status">
            {submitState.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
