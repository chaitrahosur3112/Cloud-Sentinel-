// Only ORG_ADMIN and CLOUD_ENGINEER can connect or remove accounts.
// Viewers and Developers can still list them (read-only).

import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { authorize }    from "../middlewares/authorize";
import { validateConnectCloudAccount } from "../validators/resource.validator";
import * as controller from "../controllers/cloudaccount.controller";

const router = Router();

router.use(authenticate);

router.get( "/",    controller.listAccounts);
router.post("/",    authorize("ORG_ADMIN", "CLOUD_ENGINEER"),
                    validateConnectCloudAccount,
                    controller.connectAccount);
router.delete("/:id", authorize("ORG_ADMIN", "CLOUD_ENGINEER"),
                    controller.disconnectAccount);

export default router;