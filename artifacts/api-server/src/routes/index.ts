import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import categoriesRouter from "./categories";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import landingPagesRouter from "./landing-pages";
import uploadRouter from "./upload";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(categoriesRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(landingPagesRouter);
router.use(uploadRouter);
router.use(settingsRouter);

export default router;
