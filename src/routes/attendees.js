import express from "express";
import Registration from "../models/Registration.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const attendees = await Registration.find(
      {
        paymentStatus: "paid",
      },
      {
        name: 1,    
        email: 1,
        amount: 1,
        createdAt: 1,
        _id: 0,
      }
    ).sort({ createdAt: -1 });

    res.json({
      total: attendees.length,
      attendees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
```
