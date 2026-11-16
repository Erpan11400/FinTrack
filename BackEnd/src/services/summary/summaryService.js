import Account from '../../models/Account.js';
import Category from '../../models/Category.js';
import Transaction from '../../models/Transaction.js';
import { InvariantError } from '../../exceptions/index.js';

const ALLOWED_PERIODS = ['harian', 'mingguan', 'bulanan', 'tahunan'];

const INDONESIAN_DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
];

const INDONESIAN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const pad = (n) => String(n).padStart(2, '0');

/**
 * Helper to get Monday-based start of the week
 * @param {Date} date
 * @returns {Date}
 */
const weekStart = (date) => {
  const r = new Date(date);
  const day = r.getDay();
  const diff = (day + 6) % 7; // Monday = 0, Sunday = 6
  r.setDate(r.getDate() - diff);
  return r;
};

/**
 * Service to get main summary dashboard data: totals & asset composition
 * @returns {Promise<Object>}
 */
const getSummary = async () => {
  // 1. Ambil seluruh akun aktif
  const activeAccounts = await Account.find({ is_active: true }).lean();

  // 2. Ambil seluruh data transaksi
  const transactions = await Transaction.find().lean();

  // 3. Map saldo berjalan per akun aktif
  const accountBalanceMap = new Map();
  for (const acc of activeAccounts) {
    accountBalanceMap.set(acc._id.toString(), acc.initial_balance || 0);
  }

  // 4. Hitung arus kas masuk, keluar, dan mutasi saldo akun aktif
  let inflow = 0;
  let outflow = 0;

  for (const t of transactions) {
    const amount = t.amount || 0;
    const fee = t.admin_fee || 0;

    if (t.type === 'income') {
      inflow += amount;
      const sourceId = t.account_id ? t.account_id.toString() : null;
      if (sourceId && accountBalanceMap.has(sourceId)) {
        accountBalanceMap.set(sourceId, accountBalanceMap.get(sourceId) + amount);
      }
    } else if (t.type === 'expense') {
      outflow += amount;
      const sourceId = t.account_id ? t.account_id.toString() : null;
      if (sourceId && accountBalanceMap.has(sourceId)) {
        accountBalanceMap.set(sourceId, accountBalanceMap.get(sourceId) - amount);
      }
    } else if (t.type === 'transfer') {
      outflow += fee;
      const sourceId = t.account_id ? t.account_id.toString() : null;
      const destId = t.destination_account_id ? t.destination_account_id.toString() : null;

      if (sourceId && accountBalanceMap.has(sourceId)) {
        accountBalanceMap.set(sourceId, accountBalanceMap.get(sourceId) - (amount + fee));
      }
      if (destId && accountBalanceMap.has(destId)) {
        accountBalanceMap.set(destId, accountBalanceMap.get(destId) + amount);
      }
    }
  }

  // 5. Susun komposisi aset & hitung total aset dari seluruh akun aktif
  let totalAssets = 0;
  const assetComposition = activeAccounts.map((acc) => {
    const balance = accountBalanceMap.get(acc._id.toString()) || 0;
    totalAssets += balance;
    return {
      id: acc._id.toString(),
      name: acc.name,
      type: acc.type,
      color: acc.color || '#2563eb',
      balance,
    };
  });

  const net = inflow - outflow;
  const isDeficit = net < 0;

  return {
    totals: {
      inflow,
      outflow,
      net,
      is_deficit: isDeficit,
      total_assets: totalAssets,
    },
    asset_composition: assetComposition,
  };
};

/**
 * Service to get cash flow time-series grouped by period
 * @param {string} [period='bulanan']
 * @returns {Promise<Object>}
 */
const getCashflowSummary = async (period = 'bulanan') => {
  const normalizedPeriod = String(period || 'bulanan').trim().toLowerCase();

  if (!ALLOWED_PERIODS.includes(normalizedPeriod)) {
    throw new InvariantError(
      `Periode '${period}' tidak valid. Pilihan yang tersedia: ${ALLOWED_PERIODS.join(', ')}`
    );
  }

  const transactions = await Transaction.find().lean();
  const buckets = new Map();

  for (const t of transactions) {
    if (!t.date) continue;
    const d = new Date(t.date);
    if (Number.isNaN(d.getTime())) continue;

    let key = '';
    let label = '';

    if (normalizedPeriod === 'harian') {
      key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      label = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    } else if (normalizedPeriod === 'mingguan') {
      const ws = weekStart(d);
      key = `${ws.getFullYear()}-${pad(ws.getMonth() + 1)}-${pad(ws.getDate())}`;
      label = `Mgg ${pad(ws.getDate())}/${pad(ws.getMonth() + 1)}`;
    } else if (normalizedPeriod === 'bulanan') {
      key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      label = `${INDONESIAN_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
    } else if (normalizedPeriod === 'tahunan') {
      key = String(d.getFullYear());
      label = key;
    }

    if (!buckets.has(key)) {
      buckets.set(key, { label, inflow: 0, outflow: 0 });
    }

    const bucket = buckets.get(key);
    const amount = t.amount || 0;

    if (t.type === 'income') {
      bucket.inflow += amount;
    } else if (t.type === 'expense') {
      bucket.outflow += amount;
    } else if (t.type === 'transfer') {
      bucket.outflow += t.admin_fee || 0;
    }
  }

  // Urutkan secara kronologis berdasarkan key bucket
  const series = [...buckets.entries()]
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([, data]) => ({
      label: data.label,
      inflow: data.inflow,
      outflow: data.outflow,
    }));

  return {
    period: normalizedPeriod,
    series,
  };
};

/**
 * Service to get financial analytics insights, top categories, and breakdown
 * @returns {Promise<Object>}
 */
const getAnalyticsSummary = async () => {
  // 1. Ambil data kategori dan transaksi
  const categories = await Category.find().lean();
  const transactions = await Transaction.find().lean();

  const categoryMap = new Map();
  for (const c of categories) {
    categoryMap.set(c._id.toString(), {
      name: c.name,
      color: c.color || '#64748b',
    });
  }

  // 2. Akumulasi pengeluaran per kategori, pengeluaran harian, serta inflow dan outflow
  const categoryExpenseMap = new Map();
  const dailyExpenseMap = new Map();
  let totalExpense = 0;
  let inflow = 0;
  let outflow = 0;

  for (const t of transactions) {
    const amount = t.amount || 0;
    const fee = t.admin_fee || 0;

    if (t.type === 'income') {
      inflow += amount;
    } else if (t.type === 'expense') {
      outflow += amount;
      totalExpense += amount;

      // Akumulasi pengeluaran per kategori
      const categoryId = t.category_id ? t.category_id.toString() : 'uncategorized';
      categoryExpenseMap.set(
        categoryId,
        (categoryExpenseMap.get(categoryId) || 0) + amount
      );

      // Pengelompokan harian untuk peak spending day
      if (t.date) {
        let dateStr = '';
        if (t.date instanceof Date) {
          dateStr = t.date.toISOString().slice(0, 10);
        } else if (typeof t.date === 'string') {
          dateStr = t.date.slice(0, 10);
        }

        if (dateStr) {
          dailyExpenseMap.set(
            dateStr,
            (dailyExpenseMap.get(dateStr) || 0) + amount
          );
        }
      }
    } else if (t.type === 'transfer') {
      outflow += fee;
    }
  }

  // 3. Susun category breakdown & urutkan descending
  const categoryBreakdownList = [];
  for (const [catId, amount] of categoryExpenseMap.entries()) {
    const catInfo = categoryMap.get(catId) || { name: 'Lainnya', color: '#64748b' };
    const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;

    categoryBreakdownList.push({
      id: catId,
      name: catInfo.name,
      color: catInfo.color,
      amount,
      percentage,
    });
  }

  // Urutkan dari pengeluaran terbesar ke terkecil
  categoryBreakdownList.sort((a, b) => b.amount - a.amount);

  // Top 5 kategori
  const topCategories = categoryBreakdownList.slice(0, 5).map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    amount: c.amount,
  }));

  // Kategori dominan (posisi pertama)
  const dominantCategory = categoryBreakdownList.length > 0
    ? {
        id: categoryBreakdownList[0].id,
        name: categoryBreakdownList[0].name,
        amount: categoryBreakdownList[0].amount,
      }
    : null;

  // 4. Hari pengeluaran tertinggi (peak spending day)
  let peakDate = null;
  let peakAmount = 0;
  for (const [dStr, amount] of dailyExpenseMap.entries()) {
    if (amount > peakAmount) {
      peakAmount = amount;
      peakDate = dStr;
    }
  }

  let peakSpendingDay = null;
  if (peakDate) {
    const d = new Date(peakDate + 'T00:00:00');
    let label = peakDate;
    if (!Number.isNaN(d.getTime())) {
      const dayName = INDONESIAN_DAYS[d.getDay()];
      const dateNum = d.getDate();
      const monthName = INDONESIAN_MONTHS_SHORT[d.getMonth()];
      label = `${dayName}, ${dateNum} ${monthName}`;
    }

    peakSpendingDay = {
      date: peakDate,
      label,
      amount: peakAmount,
    };
  }

  // 5. Rasio tabungan (savings rate)
  const net = inflow - outflow;
  const savingsRatePercentage = inflow > 0 ? Number(((net / inflow) * 100).toFixed(1)) : 0;
  const isPositive = net >= 0;

  return {
    insights: {
      peak_spending_day: peakSpendingDay,
      dominant_category: dominantCategory,
      savings_rate: {
        percentage: savingsRatePercentage,
        is_positive: isPositive,
      },
    },
    top_categories: topCategories,
    category_breakdown: categoryBreakdownList,
  };
};

export {
  getSummary,
  getCashflowSummary,
  getAnalyticsSummary,
};
