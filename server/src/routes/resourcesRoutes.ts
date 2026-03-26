import { Router } from 'express';
import {
  createFolderHandler,
  createResourceHandler,
  deleteFolderHandler,
  deleteResourceHandler,
  getResourcesTreeHandler,
  renameFolderHandler,
  renameResourceHandler,
  updateResourceUrlHandler,
} from '../controllers/resourcesController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/resources/tree', authorize(['admin', 'student']), getResourcesTreeHandler);

router.post('/resources/folders', authorize(['admin']), createFolderHandler);
router.patch('/resources/folders/:folderId', authorize(['admin']), renameFolderHandler);
router.delete('/resources/folders/:folderId', authorize(['admin']), deleteFolderHandler);

router.post('/resources', authorize(['admin']), createResourceHandler);
router.patch('/resources/:resourceId/rename', authorize(['admin']), renameResourceHandler);
router.patch('/resources/:resourceId/url', authorize(['admin']), updateResourceUrlHandler);
router.delete('/resources/:resourceId', authorize(['admin']), deleteResourceHandler);

export default router;
