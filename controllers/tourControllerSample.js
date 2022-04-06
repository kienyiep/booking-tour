const fs = require('fs');
const Tour = require('./../models/tourModel');
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);
  if (req.params.id * 1 > tours.length) {
    // without the return, it will run the next(). and move on to next middleware and send another respond to client
    // hence the return is needed, so that the next() wont be executed.
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: tours.length,
    data: { tours: tours },
  });
};

exports.getTour = (req, res) => {
  console.log(req.params);

  const id = req.params.id * 1; // convert the string to number
  // if (id > tours.length) {
  const tour = tours.find((el) => el.id === id);
  //   if (!tour) {
  //     return res.status(404).json({ status: 'fail', message: 'Invalid ID' });
  //   }
  res.status(200).json({ status: 'success', data: { tour } });
};

exports.createTour = (req, res) => {
  // body is the property which will available on the request, because we use the middleware
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        body: req.body,
        data: {
          tour: newTour,
        },
      });
    }
  );
  // res.send('Done');
};

exports.updateTour = (req, res) => {
  //   if (req.params.id * 1 > tours.length) {
  //     return res.status(404).json({
  //       status: 'fail',
  //       message: 'Invalid ID',
  //     });
  //   }
  res
    .status(200)
    .json({ status: 'success', data: { tour: '<Updated tour here...>' } });
};

exports.deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res
    .status(204) // 204 means no content
    .json({ status: 'success', data: null });
};
