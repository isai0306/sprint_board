import { getUserDashboard } from '../services/dashboardService.js';

export async function dashboardController(req, res, next) {
  try {
    const userId = req.user.id;
    const data = await getUserDashboard(userId);
    return res.json({ success: true, ...data });
  } catch (err) {
    return next(err);
  }
}

