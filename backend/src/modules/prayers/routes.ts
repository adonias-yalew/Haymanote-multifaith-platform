import { Router } from 'express';
import { prayerController } from './controller.js';
import { prayerTrackerController } from './prayerTrackerController.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = Router();

// ===== PRAYER REQUESTS =====
// Public prayers feed (any authenticated user can read public prayers)
router.get('/public', authMiddleware, prayerController.getPublicPrayers);

// My prayers
router.get('/my', authMiddleware, prayerController.getMyPrayers);

// Create, update, delete
router.post('/', authMiddleware, prayerController.create);
router.put('/:id', authMiddleware, prayerController.update);
router.delete('/:id', authMiddleware, prayerController.delete);

// Pray for a public request
router.post('/:id/pray', authMiddleware, prayerController.prayFor);

// ===== PRAYER TRACKER =====
// Log a prayer
router.post('/tracker/log', authMiddleware, prayerTrackerController.logPrayer);

// Get tracker statistics
router.get('/tracker/stats', authMiddleware, prayerTrackerController.getStats);

// Get default prayers for religion
router.get('/tracker/defaults', authMiddleware, prayerTrackerController.getDefaultPrayers);

// Get prayers by period
router.get('/tracker/today', authMiddleware, prayerTrackerController.getTodayPrayers);
router.get('/tracker/week', authMiddleware, prayerTrackerController.getWeekPrayers);
router.get('/tracker/month', authMiddleware, prayerTrackerController.getMonthPrayers);

// Add custom prayer
router.post('/tracker/custom', authMiddleware, prayerTrackerController.addCustomPrayer);

export default router;
