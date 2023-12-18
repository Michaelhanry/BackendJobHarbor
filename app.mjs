// app.mjs
import express from 'express';
import bodyParser from 'body-parser';
import userRouter from './user.mjs';
import companyRouter from './company.mjs';
import joblistRouter from './joblist.mjs';
import profilRouter from './profil.mjs';
import komunitasRouter from './komunitas.mjs'

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/user', userRouter);
app.use('/company', companyRouter);
app.use('/joblist', joblistRouter);
app.use('/profil', profilRouter);
app.use('/komunitas', komunitasRouter);

export default app;