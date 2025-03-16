import { Router } from "express";
import { audio } from "../controllers/routes.controllers.js";

const route=Router();

route.get('/getAudio',audio);

export default route;