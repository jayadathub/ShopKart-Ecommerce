import express from 'express';
import { resgiterUser, loginUser, getUser, logoutUser, changePassword } from '../controllers/user.controllers.js';
import isAuthenticated from '../middlewares/authMiddleware.js';

// Authentication and user profile management routes
const userRoutes = express.Router();

userRoutes.post('/register', resgiterUser);
userRoutes.post('/login', loginUser);
userRoutes.get('/me', isAuthenticated, getUser);
userRoutes.post('/logout', logoutUser);
userRoutes.patch('/change-password', isAuthenticated, changePassword);

export default userRoutes;