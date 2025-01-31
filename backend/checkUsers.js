import mongoose from 'mongoose';

// הגדר את ה-MONGO_URI שלך
const MONGO_URI = 'mongodb+srv://michaekupfercoc2:TPnZBbVbvqpY4tAo@cluster0workscheduler.c6ty1.mongodb.net/Cluster0workScheduler?retryWrites=true&w=majority';

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  organization: String,
});

const User = mongoose.model('User', userSchema);

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // חפש את כל המשתמשים בקולקשן
    const users = await User.find();
    console.log('Users in database:', users);

    mongoose.disconnect();
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err));
