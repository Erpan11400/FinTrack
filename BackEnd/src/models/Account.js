import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      description: 'Nama akun (contoh: Bank BCA, Bank Mandiri, DANA, OVO, Cash)'
    },
    type: {
      type: String,
      enum: ['bank', 'e-wallet', 'cash', 'investment', 'other'],
      required: true,
      default: 'bank'
    },
    initial_balance: {
      type: Number,
      required: true,
      default: 0,
      description: 'Saldo awal akun'
    },
    icon: {
      type: String,
      default: 'landmark',
      description: 'Nama icon lucide untuk akun'
    },
    color: {
      type: String,
      default: null,
      description: 'Kode warna hex untuk grafik matriks komposisi aset'
    },
    is_active: {
      type: Boolean,
      default: true,
      description: 'Status aktif/arsip (soft delete)'
    }
  },
  { timestamps: true }
);

// Index untuk query filter akun aktif pada dropdown & rincian saldo
accountSchema.index({ is_active: 1 });

export default mongoose.model('Account', accountSchema);

