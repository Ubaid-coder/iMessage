import express from 'express';
import 'dotenv/config';

console.log(process.env.DB_URI);

const app = express();
const port = process.env.PORT;

app.listen(port , () => {
    console.log(`Server is up and running on port 3000`);
})