import { Router } from 'express';
import { showUsers, showUsersId, addUsers, updateUsers, deleteUsers, loginUsers, forgotPassword, resetPassword, verifyOTP, resendOTP, verifyPhoneOTP, resendPhoneOTP, getProfile } from '../controllers/users.Controller.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = Router();
const nameUsers = '/users';

router.route(nameUsers)
    .get(showUsers)
    .post(addUsers);

router.route(`${nameUsers}/verify-otp`)
    .post(verifyOTP);

router.route(`${nameUsers}/resend-otp`)
    .post(resendOTP);

router.route(`${nameUsers}/verify-phone-otp`)
    .post(verifyPhoneOTP);

router.route(`${nameUsers}/resend-phone-otp`)
    .post(resendPhoneOTP);

router.route(`${nameUsers}/forgot-password`)
    .post(forgotPassword);

router.route(`${nameUsers}/reset-password/:token`)
    .post(resetPassword);

router.get(`${nameUsers}/profile/me`, verifyToken, getProfile);

router.route(`${nameUsers}/:id`)
    .get(showUsersId)
    .put(updateUsers)
    .delete(deleteUsers);
router.route(`${nameUsers}/login`)
    .post(loginUsers); // Iniciar sesión 
export default router;