import type { Path1State, Path2State, Path3State } from "../types";

export function calcPath1(s: Path1State) {
  const totalAssets = s.landValue + s.buildingValue + s.livestockValue + s.equipmentValue;
  const totalInvNet = s.investmentItems.reduce((a, i) => a + i.priceNet * i.qty, 0);
  const totalInvGross = totalInvNet * 1.2;
  const grants = totalInvNet * 0.5;
  const loan = totalInvNet - s.ownFunds - grants;
  const annualDep = totalInvNet * 0.10;
  const fixedCosts = annualDep + 420000 + 650000;
  const profits = s.revenueYears.map(r => {
    const grossProfit = r - fixedCosts;
    const tax = Math.max(0, grossProfit * 0.10);
    return { revenue: r, gross: grossProfit, tax, net: grossProfit - tax };
  });
  return { totalAssets, totalInvNet, totalInvGross, grants, loan, annualDep, profits };
}

export function calcPath2(s: Path2State) {
  const revenueByYear = [0, 1, 2, 3, 4].map(yr =>
    s.products.reduce((sum, p) => sum + p.unitPrice * p.qty[yr as 0 | 1 | 2 | 3 | 4], 0)
  );
  const totalMaterial = s.materialCosts.seeds + s.materialCosts.fertilizer + s.materialCosts.chemicals;
  const totalEnergy = s.energyCosts.fuel + s.energyCosts.electricity;
  const totalNonMaterial = s.nonMaterialCosts.insurance + s.nonMaterialCosts.accounting + s.nonMaterialCosts.registration;
  const laborAnnual = s.workers * s.monthlyWage * 12;
  const amortizacija = s.totalInvestment * 0.10;
  const totalCosts = totalMaterial + totalEnergy + totalNonMaterial + laborAnnual + amortizacija;
  const results = revenueByYear.map(rev => {
    const gross = rev - totalCosts;
    const tax = Math.max(0, gross * 0.10);
    return { rev, totalCosts, gross, tax, net: gross - tax };
  });
  const avgNet = results.reduce((a, r) => a + r.net, 0) / 5;
  const avgRev = revenueByYear.reduce((a, r) => a + r, 0) / 5;
  const roi = s.totalInvestment > 0 ? (avgNet / s.totalInvestment) * 100 : 0;
  const economicity = totalCosts > 0 ? avgRev / totalCosts : 0;
  const payback = avgNet > 0 ? s.totalInvestment / avgNet : 0;
  return { revenueByYear, totalMaterial, totalEnergy, totalNonMaterial, laborAnnual, amortizacija, totalCosts, results, roi, economicity, payback };
}

export function calcPath3(s: Path3State) {
  const totalInv = s.items.reduce((a, i) => a + i.price * i.qty, 0);
  const efficiency = s.revenueYears.map((r, i) => ({
    year: 2026 + i,
    revenue: r,
    expense: s.expenseYears[i],
    coeff: s.expenseYears[i] > 0 ? r / s.expenseYears[i] : 0,
    net: r - s.expenseYears[i],
  }));
  const avgCoeff = efficiency.reduce((a, e) => a + e.coeff, 0) / 5;
  return { totalInv, efficiency, avgCoeff };
}
