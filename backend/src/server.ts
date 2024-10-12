import config from './config/environment';
import app from './app';

const PORT = config.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});