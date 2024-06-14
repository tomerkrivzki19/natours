// we making a function that her goal is to catch async errors
module.exports = (fn) => {
  return (req, res, next) => {
    //                        (err => next(err))
    fn(req, res, next).catch(next); //where all the magic happens -> this will alow us to get rid-of the catch block that we got prevecly
    //this catch will pass the function to the next function -> means that our err will ends up in our global err handaling middleware
  };
};
//this function is basically supposed to replace the try and catch functionality
