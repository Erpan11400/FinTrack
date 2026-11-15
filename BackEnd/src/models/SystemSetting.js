import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    master_password_hash: {
      type: String,
      required: true,
      description: 'Nilai hash terenkripsi Master Password (bcrypt/Argon2)'
    },
    auto_lock_timeout_minutes: {
      type: Number,
      default: 15,
      description: 'Durasi batas waktu inaktivitas sesi sebelum otomatis terkunci'
    }
  },
  { timestamps: true }
);

export default mongoose.model('SystemSetting', systemSettingSchema);

