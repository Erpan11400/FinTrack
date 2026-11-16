import { Router } from 'express'
import transactionRouter from '../services/transaction/transactionRoutes.js'
import accountRouter from '../services/account/accountRoutes.js'
import categoryRouter from '../services/category/categoryRoutes.js'
import systemSettingRouter from '../services/systemSetting/systemSettingRoutes.js'
import presetTransactionRouter from '../services/preset/presetTransactionRoutes.js'
import summaryRouter from '../services/summary/summaryRoutes.js'

const router = Router()

router.get('/', (_, res) => {
  res.send('Hello World!')
})

router.use('/transaction', transactionRouter)
router.use('/account', accountRouter)
router.use('/category', categoryRouter)
router.use('/system', systemSettingRouter)
router.use('/preset', presetTransactionRouter)
router.use('/summary', summaryRouter)

export default router