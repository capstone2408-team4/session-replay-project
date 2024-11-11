import config from './config/environment.js';
import app from './app.js';

const PORT = config.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});