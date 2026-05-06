const NARRATIVE_MAP: [RegExp, string][] = [
  [/kupo?v[a-z]*/gi, "Nabavka i implementacija osnovnih sredstava"],
  [/proš[a-z]*/gi, "Proširenje proizvodnih kapaciteta i povećanje tržišnog udela"],
  [/lokalno?\s+tržišt[a-z]*/gi, "Plasman na regionalno i domaće tržište uz mogućnost izvoza"],
  [/domaći\s+dobavljač[a-z]*/gi, "Nabavka repromaterijala od sertifikovanih domaćih dobavljača"],
  [/izvoz/gi, "Unapređenje izvoznog potencijala i pozicioniranje na EU tržištu"],
  [/zapad[a-z]*/gi, "Plasman na tržišta zapadnih zemalja i EU"],
  [/sezona[a-z]*/gi, "Optimizacija sezonske proizvodnje i kalendarskog plana radova"],
  [/profit[a-z]*/gi, "Povećanje ekonomske efikasnosti i stope akumulacije kapitala"],
];

export function formatNarrative(text: string): string {
  let result = text;
  for (const [pattern, replacement] of NARRATIVE_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export function fmtRSD(n: number): string {
  return n.toLocaleString("sr-RS", { minimumFractionDigits: 0 }) + " RSD";
}

export function fmtN(n: number, d = 0): string {
  return n.toLocaleString("sr-RS", { minimumFractionDigits: d, maximumFractionDigits: d });
}
