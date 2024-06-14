//now here we need access to the stripe libary again , the package that we insalled before (stripe npm package -used on the backend  ) is only works for the backend
//and what we need to do on the fronted is actually inculde a scrip on the html ,

//we added the scripe to the head :   script(src="https://js.stripe.com/v3/" async)
//and now we can use that in the fronted
import axios from 'axios';
import { showAlert } from './alerts';
import { loadStripe } from '@stripe/stripe-js';

export const bookTour = async (tourId) => {
  try {
    const stripe = await loadStripe(
      'pk_test_51POKHYITotoxTOIR7OiWCh0dpgMYHwuTJi7KKmS5dCN3Vu381hkLpjnnrbB7WkWQpYfFLtkwOstv9HtWLolTvaAh00zJytBK7N'
    );
    //the object we get from the script in the pug tamplate
    //1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    //needs to return a checkout session
    // console.log(session);

    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    //now the user is proccesed to the checkout page where she provide his credit card details ,d
    //for testing in stripe we using thier credit card for testing
    //4242 4242 4242 4242
    // any date valid |   222 -any num
    //any name

    //we have the option in sprite to send emails for success payments -meaning we dont have to manually emails when the purchest is succesfull
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};
