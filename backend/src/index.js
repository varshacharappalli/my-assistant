import express from 'express';
import puppeteer from 'puppeteer-core';
import route from './routes/routes.js';


const app=express();

app.use('/api',route);

app.listen(5000,()=>{
    console.log("Server is running on port");
})