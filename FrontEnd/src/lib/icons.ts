import {
  ArrowLeftRight, Banknote, Car, Coffee, Fuel, Gamepad2, Gift, Heart, Home, Landmark,
  ShoppingBag, ShoppingCart, Smartphone, Star, UtensilsCrossed, Wallet, Wifi, Zap,
  CreditCard, Coins, PiggyBank, TrendingUp, Vault, CircleDollarSign,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  landmark: Landmark,
  wallet: Wallet,
  smartphone: Smartphone,
  banknote: Banknote,
  'credit-card': CreditCard,
  coins: Coins,
  'piggy-bank': PiggyBank,
  'trending-up': TrendingUp,
  vault: Vault,
  'circle-dollar-sign': CircleDollarSign,
  coffee: Coffee,
  utensils: UtensilsCrossed,
  fuel: Fuel,
  'arrow-left-right': ArrowLeftRight,
  star: Star,
  zap: Zap,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  car: Car,
  home: Home,
  heart: Heart,
  wifi: Wifi,
  gamepad: Gamepad2,
  gift: Gift,
}

export function getIcon(name?: string): LucideIcon {
  return (name && ICONS[name]) || Zap
}

export const AVAILABLE_ACCOUNT_ICONS = [
  { id: 'landmark', label: 'Bank' },
  { id: 'wallet', label: 'Dompet' },
  { id: 'banknote', label: 'Tunai' },
  { id: 'smartphone', label: 'E-Wallet' },
  { id: 'credit-card', label: 'Kartu' },
  { id: 'coins', label: 'Koin' },
  { id: 'piggy-bank', label: 'Tabungan' },
  { id: 'trending-up', label: 'Investasi' },
  { id: 'vault', label: 'Brankas' },
  { id: 'circle-dollar-sign', label: 'Valas' },
  { id: 'star', label: 'Bintang' },
  { id: 'zap', label: 'Kilat' },
] as const

export const AVAILABLE_PRESET_ICONS = [
  { id: 'zap', label: 'Kilat' },
  { id: 'coffee', label: 'Kopi' },
  { id: 'utensils', label: 'Makan' },
  { id: 'fuel', label: 'Bensin' },
  { id: 'shopping-cart', label: 'Belanja' },
  { id: 'shopping-bag', label: 'Tas' },
  { id: 'car', label: 'Mobil' },
  { id: 'home', label: 'Rumah' },
  { id: 'heart', label: 'Kesehatan' },
  { id: 'wifi', label: 'Internet' },
  { id: 'gamepad', label: 'Hiburan' },
  { id: 'gift', label: 'Hadiah' },
  { id: 'wallet', label: 'Dompet' },
  { id: 'banknote', label: 'Tunai' },
  { id: 'smartphone', label: 'Gadget' },
  { id: 'landmark', label: 'Bank' },
  { id: 'arrow-left-right', label: 'Transfer' },
  { id: 'star', label: 'Bintang' },
] as const

