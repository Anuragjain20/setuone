import { Router, type IRouter } from "express";
import healthRouter from "./health";
import servicesRouter from "./services";
import bookingsRouter from "./bookings";
import craftsmenRouter from "./craftsmen";
import adminRouter from "./admin";
import testimonialsRouter from "./testimonials";
import siteConfigRouter from "./site-config";
import authRouter from "./auth";
import notificationsRouter from "./notifications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(servicesRouter);
router.use(bookingsRouter);
router.use(craftsmenRouter);
router.use(adminRouter);
router.use(testimonialsRouter);
router.use(siteConfigRouter);
router.use(notificationsRouter);

export default router;
