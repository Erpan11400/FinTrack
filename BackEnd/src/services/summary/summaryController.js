import {
  getSummary,
  getCashflowSummary,
  getAnalyticsSummary,
} from './summaryService.js';
import response from '../../utils/response.js';

const getSummaryHandler = async (_, res, next) => {
  try {
    const data = await getSummary();

    return response(res, 200, 'Berhasil mendapatkan ringkasan dashboard', data);
  } catch (error) {
    next(error);
  }
};

const getCashflowSummaryHandler = async (req, res, next) => {
  try {
    const { period = 'bulanan' } = req.query;
    const data = await getCashflowSummary(period);

    return response(res, 200, 'Berhasil mendapatkan grafik arus kas', data);
  } catch (error) {
    next(error);
  }
};

const getAnalyticsSummaryHandler = async (_, res, next) => {
  try {
    const data = await getAnalyticsSummary();

    return response(res, 200, 'Berhasil mendapatkan data analisis finansial', data);
  } catch (error) {
    next(error);
  }
};

export {
  getSummaryHandler,
  getCashflowSummaryHandler,
  getAnalyticsSummaryHandler,
};
