import { Router } from "express";
import { audio } from "../controllers/routes.controllers.js";
import { uploadMiddleware } from "../middleware/middleware1.js";

const route=Router();

route.post('/getAudio',uploadMiddleware,audio);

export default route;