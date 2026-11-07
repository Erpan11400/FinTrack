import {
  ArrowLeftRight, Banknote, Coffee, Fuel, Landmark, Smartphone, Star, UtensilsCrossed, Wallet, Zap,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  landmark: Landmark,
  wallet: Wallet,
  smartphone: Smartphone,
  banknote: Banknote,
  coffee: Coffee,
  utensils: UtensilsCrossed,
  fuel: Fuel,
  'arrow-left-right': ArrowLeftRight,
  star: Star,
  zap: Zap,
}

export function getIcon(name?: string): LucideIcon {
  return (name && ICONS[name]) || Zap
}

