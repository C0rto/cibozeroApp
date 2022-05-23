const mongoose = require('mongoose');
// DB MONGOOSE---------------------------------------------------------------------------------------
mongoose.connect('mongodb://localhost:27017/123');
const db = mongoose.connection;
db.on('Error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database Connected');
});

db.farms.find({});
