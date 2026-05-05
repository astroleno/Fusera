export function scorePageQuality(input: {
  sectionTypes: string[];
  hasTrustSignals: boolean;
}) {
  const structure = Math.min(40, input.sectionTypes.length * 10);
  const proof = input.hasTrustSignals ? 20 : 10;
  const visual = 28;
  const mobile = 12;

  return {
    total: Math.min(100, structure + proof + visual + mobile),
    breakdown: {
      structure,
      proof,
      visual,
      mobile,
    },
  };
}
