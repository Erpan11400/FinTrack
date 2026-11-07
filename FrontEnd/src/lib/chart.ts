import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip,
} from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export const axisStyle = {
  x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
  y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
}

