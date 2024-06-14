class APIFeatures {
  // moongose query          queryString we get from express- from thr route
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const exculdedFields = ['page', 'sort', 'limit', 'fields'];
    exculdedFields.forEach((el) => delete queryObj[el]);

    //1B) ADVANCE FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));

    return this; // we doing it in order to rturn the entire objet then have access to this other methods , that way we can call them after
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //.split-> after the , it will give us the value
      this.query = this.query.sort(sortBy); //.join->connecting the words toghther //מחלק ומחבר פשוט ולעניין
    } else {
      //it will oredered by the date they have been created
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      //if we have fields paramter ==> select the values that has been typed inside the fields paramater and send back the result only contain that
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); //called projecting --//.select ->
    } else {
      this.query = this.query.select('-__v '); // the minus role is not inclouding but exscluding
      // exscluding --> meaning is to hide the paramter in this cace in the url path when showing present this to the client
      // we can use it when we dont want the user will knew when the tour was created and hide it from him
      //another example is to hide the user password when displaying the data - we can basily definf it inside the schema
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // make te defult to one , and if there is a string on the req.query.page it will convert to num.
    const limit = this.queryString.limit * 1 || 100; //the user we only specify the page number that she reqeust not even bodeer with the limit this is for more specific use cases
    const skip = (page - 1) * limit; // the prviose page multiplied by the limit that the user sets

    this.query = this.query.skip(skip).limit(limit);

    //we dont actualy need that to told the client that thier is an err while there is no more result
    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments(); // return the number of documents --> return a promise then we need to wait to the result
    //   if (skip >= numTours) throw new Error('This page does not exist'); //if the nummber of documents that we skip is greater then the number of documnets that actualy exist then that means the page does not exist
    // }
    return this;
  }
}

module.exports = APIFeatures;
