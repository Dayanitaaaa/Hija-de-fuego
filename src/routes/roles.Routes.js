import { Router } from 'express';
import { showRoles, showRolesId, addRoles, updateRoles, deleteRoles} from '../controllers/roles.Controller.js';

const router = Router();
const nameRoles = '/roles';

router.route(nameRoles)
    .get(showRoles)
    .post(addRoles);
router.route(`${nameRoles}/:id`)
    .get(showRolesId)
    .put(updateRoles)
    .delete(deleteRoles);
export default router;