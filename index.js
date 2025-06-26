import { configDotenv } from "dotenv";
import app from './src/app.js';
configDotenv();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});