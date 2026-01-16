import express from 'express';
import {addFiles, showFiles, showFilesById, updateFiles, deleteFiles, downloadFiles} from '../controllers/files.Controller.js';

const router = express.Router();
const nameFiles = '/files';

router.route(nameFiles)
    .get(showFiles)
    .post(addFiles);

router.route(`${nameFiles}/:id`)
    .get(showFilesById)
    .put(updateFiles)
    .delete(deleteFiles)

router.route(`${nameFiles}/download/:id`)   
    .get(downloadFiles);

export default router;

