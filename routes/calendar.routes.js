const router = require("express").Router();
const calendar_router = require("../controller/calendar.controler");

router.post("/create", calendar_router.CreateCalendar);

router.put("/update/:id", calendar_router.updateCalendar);
router.get("/", calendar_router.getCalendar);

router.patch("/like-post/:id", calendar_router.AddEvent);

router.patch("/unlike-post/:id", calendar_router.NoAddEvent);

module.exports = router;
