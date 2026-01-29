"use client";

import { useState, useMemo, useEffect } from "react";

interface Customer {
  id: string;
  name: string;
  mrr: number;
  plan: string;
  startDate: string;
}

const SAMPLE_CUSTOMERS: Customer[] = [
  { id: "1", name: "Acme Corp", mrr: 99, plan: "Pro", startDate: "2025-11-01" },
  { id: "2", name: "TechStart Inc", mrr: 49, plan: "Starter", startDate: "2025-12-15" },
  { id: "3", name: "Growth Labs", mrr: 199, plan: "Business", startDate: "2026-01-05" },
];

export default function MRRCalculator() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({ name: "", mrr: "", plan: "" });
  const [targetMRR, setTargetMRR] = useState(10000);
  const [growthRate, setGrowthRate] = useState(15);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mrrCustomers");
    if (saved) {
      setCustomers(JSON.parse(saved));
    } else {
      setCustomers(SAMPLE_CUSTOMERS);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem("mrrCustomers", JSON.stringify(customers));
    }
  }, [customers]);

  const metrics = useMemo(() => {
    const totalMRR = customers.reduce((sum, c) => sum + c.mrr, 0);
    const arr = totalMRR * 12;
    const customerCount = customers.length;
    const arpu = customerCount > 0 ? totalMRR / customerCount : 0;

    // Calculate months to target
    const monthsToTarget =
      totalMRR > 0 && growthRate > 0
        ? Math.log(targetMRR / totalMRR) / Math.log(1 + growthRate / 100)
        : Infinity;

    // Generate projection data (12 months)
    const projections = [];
    let projectedMRR = totalMRR;
    for (let i = 0; i <= 12; i++) {
      projections.push({
        month: i,
        mrr: Math.round(projectedMRR),
      });
      projectedMRR *= 1 + growthRate / 100;
    }

    return {
      totalMRR,
      arr,
      customerCount,
      arpu,
      monthsToTarget: isFinite(monthsToTarget) ? Math.ceil(monthsToTarget) : null,
      projections,
    };
  }, [customers, targetMRR, growthRate]);

  const addCustomer = () => {
    if (!newCustomer.name || !newCustomer.mrr) return;

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      mrr: parseFloat(newCustomer.mrr),
      plan: newCustomer.plan || "Standard",
      startDate: new Date().toISOString().split("T")[0],
    };

    setCustomers([...customers, customer]);
    setNewCustomer({ name: "", mrr: "", plan: "" });
  };

  const removeCustomer = (id: string) => {
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const clearAll = () => {
    setCustomers([]);
    localStorage.removeItem("mrrCustomers");
  };

  // Simple bar chart
  const maxProjectedMRR = Math.max(...metrics.projections.map((p) => p.mrr));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            MRR
            <span className="text-indigo-400"> Calculator</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track your Monthly Recurring Revenue, forecast growth, and know when
            you&apos;ll hit your targets.
          </p>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl p-6 border border-indigo-500/30">
            <p className="text-sm text-gray-400 mb-1">Monthly MRR</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(metrics.totalMRR)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <p className="text-sm text-gray-400 mb-1">ARR</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(metrics.arr)}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <p className="text-sm text-gray-400 mb-1">Customers</p>
            <p className="text-3xl font-bold text-white">{metrics.customerCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <p className="text-sm text-gray-400 mb-1">ARPU</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(metrics.arpu)}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Customer List */}
          <div className="md:col-span-2 space-y-6">
            {/* Add Customer Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Add Customer</h2>
              <div className="flex flex-wrap gap-4">
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  placeholder="Customer name"
                  className="flex-1 min-w-[150px] px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  value={newCustomer.mrr}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, mrr: e.target.value })
                  }
                  placeholder="MRR (£)"
                  className="w-28 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={newCustomer.plan}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, plan: e.target.value })
                  }
                  placeholder="Plan"
                  className="w-28 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addCustomer}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Customer List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Customers</h2>
                {customers.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {customers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No customers yet. Add your first customer above!
                </p>
              ) : (
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-white">{customer.name}</p>
                        <p className="text-sm text-gray-400">
                          {customer.plan} • Started {customer.startDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-indigo-400">
                          {formatCurrency(customer.mrr)}/mo
                        </span>
                        <button
                          onClick={() => removeCustomer(customer.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Growth Projection Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                12-Month Projection ({growthRate}% MoM Growth)
              </h2>
              <div className="flex items-end gap-1 h-40">
                {metrics.projections.map((point) => (
                  <div
                    key={point.month}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t"
                      style={{
                        height: `${(point.mrr / maxProjectedMRR) * 100}%`,
                        minHeight: "4px",
                      }}
                    />
                    <span className="text-xs text-gray-500 mt-1">
                      {point.month === 0 ? "Now" : `+${point.month}`}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-center text-gray-400 mt-4">
                Projected MRR in 12 months:{" "}
                <span className="text-white font-semibold">
                  {formatCurrency(metrics.projections[12].mrr)}
                </span>
              </p>
            </div>
          </div>

          {/* Sidebar - Projections */}
          <div className="space-y-6">
            {/* Target Calculator */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold text-white mb-4">
                🎯 Target Calculator
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Target MRR
                  </label>
                  <input
                    type="number"
                    value={targetMRR}
                    onChange={(e) => setTargetMRR(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Monthly Growth Rate (%)
                  </label>
                  <input
                    type="number"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {metrics.monthsToTarget !== null ? (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400">Time to target:</p>
                    <p className="text-3xl font-bold text-green-400">
                      {metrics.monthsToTarget} months
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      At {growthRate}% MoM growth
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 pt-4">
                    Add customers to calculate time to target
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Revenue</span>
                  <span className="text-white font-medium">
                    {formatCurrency(metrics.totalMRR / 30)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weekly Revenue</span>
                  <span className="text-white font-medium">
                    {formatCurrency((metrics.totalMRR / 30) * 7)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Revenue per Customer</span>
                  <span className="text-white font-medium">
                    {formatCurrency(metrics.arpu)}/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                🚀 Milestones
              </h3>
              <div className="space-y-2">
                {[1000, 5000, 10000, 25000, 50000].map((milestone) => (
                  <div
                    key={milestone}
                    className={`flex items-center gap-2 ${
                      metrics.totalMRR >= milestone
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    <span>{metrics.totalMRR >= milestone ? "✓" : "○"}</span>
                    <span>{formatCurrency(milestone)} MRR</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Track your revenue journey 📈</p>
          <p className="mt-2">
            <a
              href="https://sumaqconsulting.com"
              className="text-indigo-400 hover:underline"
            >
              Sumaq Consulting
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
