/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51KdWUNI2gFXpKucHEY5FFVwmWNF4OhnxmPvUzRrMTGrCCkgUP0EfHNpxiFIij2Z9zNfnbvRgfVWiCGsBqMQUx1AI00p2zeNs1L'
  );
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    // 2) Create checkout form + charged credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
    // window.location.replace(session.data.session.url);
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
