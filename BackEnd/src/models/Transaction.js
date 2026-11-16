import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      description: 'Hasil evaluasi angka tunggal dari ekspresi matematika (FR-06)'
    },
    raw_expression: {
      type: String,
      default: null,
      description: 'Ekspresi matematika mentah yang diinputkan (misal: "(50000 * 2) + 15000")'
    },
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      description: 'Akun utama / akun asal'
    },
    destination_account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null,
      description: 'Akun tujuan (khusus type === "transfer")'
    },
    admin_fee: {
      type: Number,
      default: 0,
      description: 'Biaya admin transfer'
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      description: 'Kategori transaksi (income/expense)'
    },
    note: {
      type: String,
      default: '',
      trim: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  { timestamps: true }
);

// --- Penyesuaian Index Optimal ---
// 1. Query mutasi umum berdasarkan rentang tanggal (Dashboard Cash Flow / Log Transaksi)
transactionSchema.index({ date: -1, createdAt: -1 });

// 2. Ledger Buku Kas per Akun (Filter akun asal & tujuan)
transactionSchema.index({ account_id: 1, date: -1 });
transactionSchema.index({ destination_account_id: 1, date: -1 });

// 3. Analisis Pengeluaran & Pemasukan per Kategori per Periode
transactionSchema.index({ category_id: 1, date: -1 });

// 4. Query filter tipe transaksi (Income vs Expense vs Transfer) pada periode tertentu
transactionSchema.index({ type: 1, date: -1 });

export default mongoose.model('Transaction', transactionSchema);

