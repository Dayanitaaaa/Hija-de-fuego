import { Router } from 'express';
import { showTypeFiles, showTypeFilesId, addTypeFiles, updateTypeFiles, deleteTypeFiles} from '../controllers/typeFiles.Controller.js';

const router = Router();
const nameTypeFiles = '/typeFiles';

router.route(nameTypeFiles)
    .get(showTypeFiles)
    .post(addTypeFiles);
router.route(`${nameTypeFiles}/:id`)
    .get(showTypeFilesId)
    .put(updateTypeFiles)
    .delete(deleteTypeFiles);
export default router;