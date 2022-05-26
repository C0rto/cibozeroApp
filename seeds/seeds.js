const mongoose = require('mongoose');
const cities = require('./city');
const geo = require('./geocity');
const Farm = require('../models/farm');
const { places, descriptors } = require('./seeders');

// ------------------
mongoose.connect('mongodb://localhost:27017/123');
const db = mongoose.connection;
db.on('Error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database Connected');
});
// ------------------

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Farm.deleteMany({});
  for (let i = 0; i < 80; i++) {
    const random1000 = Math.floor(Math.random() * 5000);
    const farm = new Farm({
      name: `${sample(descriptors)} ${sample(places)}`,
      holder: 'Luigi M. De Vecchis',
      PIVA: 23456781321,
      email: `${sample(descriptors)}@mail.it `,
      phone: 34566263,
      city: `${geo[random1000].comune}`,
      district: `${cities[random1000].sigla}`,
      CAP: `${cities[random1000].cap}`,
      country: `${cities[random1000].regione.nome}`,
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
      owner: '627a8a08e8f6dae31a5f1ae7',
      geometry: {
        type: 'Point',
        coordinates: [geo[random1000].lng, geo[random1000].lat],
      },
    });
    await farm.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
