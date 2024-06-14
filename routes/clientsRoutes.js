const express = require('express');
const clientControllers = require('../controllers/clientControllers');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router.post('/singup', authController.singup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
//user friendly forget password functionality
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// basiclly we need to create the protect funciton to all of the other request other the top one's .
//the router user , is used as a little application that runing in our program behind the sence, so like a regular app we can use middleware on this router aswell ,

//Protect All Routes After This Middleware
router.use(authController.protect);
//what this will do is that after this point , all the bottom one's will be protected as the way it readed
//this is availble becosue middlewares are syncrible , and this meaning that the code is readed onces it get there and not in the background waiting to end when meantime it running others function.

//we doing patch becouse we manipulatiog the user document
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', clientControllers.getMe, clientControllers.getClient);
router.patch(
  '/updateMe',
  clientControllers.uploadUserPhoto,
  clientControllers.resizeUserPhoto, // manipulate user images that uploaded
  clientControllers.updateMe
);
router.delete('/deleteMe', clientControllers.deleteMe);

router.use(authController.restrictTo('admin'));
///api/v1/users
router
  .route('/')
  .get(clientControllers.getAllClients)
  .post(clientControllers.createClient);
router
  .route('/:id')
  .get(clientControllers.getClient)
  .patch(clientControllers.updateClient)
  .delete(clientControllers.deleteUser);

module.exports = router;
