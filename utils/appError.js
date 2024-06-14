class AppError extends Error {
  //ea6 classes //extends --> means that one class is henerenet from the other

  constructor(message, statusCode) {
    //called each time that we create a new object out of this class
    //when we extend a parent class we call super in order to call the parent constaructor
    super(message); //we call message becouse this is the only paramater that the buildin err eccepts ,, its basiclly like calling err

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'faild' : 'error';
    this.isOperational = true; //this means that all of our error will get this proparty set to true -> we doing that so that later e can just test for this proparty and only send err messages to the client from this operational errors that we created using this class
    //               the current object | the constructor function
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
