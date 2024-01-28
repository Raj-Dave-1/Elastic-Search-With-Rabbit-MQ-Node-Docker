// Dada Ki Jay Ho


import { Router } from "express";
import * as blogController from '../controller/blog'
const router = Router();

router.post("/add", blogController.add);

router.get("/query", blogController.query)

export default router;