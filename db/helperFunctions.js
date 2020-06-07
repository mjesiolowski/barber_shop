// Availability.findOneAndUpdate(
//   { date: utcDate },
//   {
//     $push: {
//       hours: {
//         hour: 830,
//         status: 'occupied',
//         clientName: 'John Dee',
//         serviceType: 'combo',
//       },
//     },
//   },
// )
//   .then((resp) => console.log(resp))
//   .catch((e) => console.log(e));

// const populateAvailability = async () => {
//   const availability = await Availability.findById('5ec2411c1a95f62e7c21d888');
//   // console.log('found: ', availability);
//   // await availability.populate('author').execPopulate();
//   // console.log(availability);
//   const barber = await Barber.findById('5ec2411c1a95f62e7c21d887');
//   await barber.populate('availability').execPopulate();
//   console.log('found: ', barber.availability[0]);
// };

// populateAvailability();
