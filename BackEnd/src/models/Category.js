import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },
    color: {
      type: String,
      default: null
    },
    is_active: {
      type: Boolean,
      default: true,
      description: 'Status soft delete'
    }
  },
  { timestamps: true }
);

// Index untuk dropdown form transaksi dan manajemen kategori
categorySchema.index({ type: 1, is_active: 1 });

export default mongoose.model('Category', categorySchema);

