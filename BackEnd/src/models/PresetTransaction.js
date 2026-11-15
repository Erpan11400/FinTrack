import mongoose from 'mongoose';

const presetTransactionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      description: 'Nama preset/template (contoh: "Beli Kopi Pagi", "Bayar Listrik")'
    },
    type: {
      type: String,
      enum: ['income', 'expense', 'transfer'],
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    raw_expression: {
      type: String,
      default: null
    },
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    destination_account_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      default: null
    },
    admin_fee: {
      type: Number,
      default: 0
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    note: {
      type: String,
      default: '',
      trim: true
    },
    icon: {
      type: String,
      default: '',
    }
  },
  { timestamps: true }
);

// Index pengurutan preset transaksi cepat pada modal/dropdown UI
presetTransactionSchema.index({ createdAt: -1 });

export default mongoose.model('PresetTransaction', presetTransactionSchema);

