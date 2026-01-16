import { Router } from 'express';
import { showUsers, showUsersId, addUsers, updateUsers, deleteUsers, loginUsers} from '../controllers/users.Controller.js';

const router = Router();
const nameUsers = '/users';

router.route(nameUsers)
    .get(showUsers)
    .post(addUsers);

router.route(`${nameUsers}/:id`)
    .get(showUsersId)
    .put(updateUsers)
    .delete(deleteUsers);
router.route(`${nameUsers}/login`)
    .post(loginUsers); // Iniciar sesión 
export default router;