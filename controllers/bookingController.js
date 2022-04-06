const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../model/tourModel');
const User = require('./../model/userModel');
const Booking = require('./../model/bookingModel');
const factory = require('./handlerFactory');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
exports.getCheckOutSession = catchAsync(async (req, res, next) => {
  // 1) get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // 2) create checkout session
  console.log(tour);

  const session = await stripe.checkout.sessions.create({
    // information about the session
    payment_method_types: ['card'], // card - credit card
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`, // if the purchase was successful, the user will be redirected to this url.
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    // it is not secure to create query string here because the user who know this url structure, could simply call it without going through the checkout process. so the user can book the tour without having to pay which is not secure
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, // the page where the user goes, if they cancel the current payment
    customer_email: req.user.email,
    client_reference_id: req.params.tourId, // this field allow us to pass some data about the session that we are currently
    // mode: payment,

    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
        ],
        amount: tour.price * 100, // the amount is expected to be cents
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckOut = catchAsync(async (req, res, next) => {
//   //This is only temporary, eventhough the use cant see the query string but it is still UNSECURE: everyone can still manage to make bookings without paying if they know the query string.
//   // the better solution is to use the stripe webhooks to create the booking more secure way, but it can be done once the website is deployed.
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();
//   await Booking.create({ tour, user, price });
//   res.redirect(req.originalUrl.split('?')[0]); // this redirect will basically create a new request but to this new url: req.originUrl.split('?')[0]
// });rr

const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_details.email }))
    .id;
  const price = session.amount_total / 100;

  await Booking.create({ tour, user, price });
};
exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  //test
  console.log(event);
  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
