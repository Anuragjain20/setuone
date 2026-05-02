import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import bookingsRouter from "./bookings";
import craftsmenRouter from "./craftsmen";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(servicesRouter);
router.use(bookingsRouter);
router.use(craftsmenRouter);
router.use(adminRouter);

export default router;
