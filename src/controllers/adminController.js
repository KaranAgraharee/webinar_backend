import Registration from "../models/Registration.js";
import Webinar from "../models/Webinar.js";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * GET /api/admin/webinars/:webinarId/attendees
 * Query parameters:
 *  - filter: 'paid' (only returns paymentStatus = 'paid'), 'all' or empty (returns all registrations)
 *  - format: 'csv' (triggers CSV file download)
 */
export const getWebinarAttendees = asyncHandler(async (req, res) => {
  const { webinarId } = req.params;
  const { filter, format } = req.query;

  if (!webinarId) {
    throw new AppError("webinarId is required", 400);
  }

  const webinar = await Webinar.findById(webinarId);
  if (!webinar) {
    throw new AppError("Webinar not found", 404);
  }

  const query = { webinar: webinarId };

  if (filter === "paid") {
    query.paymentStatus = "paid";
  }

  // Populate 'user' reference for fallback support of older records
  const registrations = await Registration.find(query)
    .populate("user")
    .sort({ createdAt: -1 });

  const attendees = registrations.map((r) => ({
    name: r.name || r.user?.name || "",
    email: r.email || r.user?.email || "",
    phone: r.phone || r.user?.phone || "",
    paymentStatus: r.paymentStatus,
    registrationDate: r.createdAt,
  }));

  // CSV format export support
  if (format === "csv") {
    const headers = ["Name", "Email", "Phone", "Payment Status", "Registration Date"];
    const csvRows = [headers.join(",")];

    for (const attendee of attendees) {
      const regDateStr = attendee.registrationDate instanceof Date
        ? attendee.registrationDate.toISOString()
        : String(attendee.registrationDate);

      const row = [
        `"${attendee.name.replace(/"/g, '""')}"`,
        `"${attendee.email.replace(/"/g, '""')}"`,
        `"${attendee.phone.replace(/"/g, '""')}"`,
        `"${attendee.paymentStatus}"`,
        `"${regDateStr}"`
      ];
      csvRows.push(row.join(","));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=webinar-${webinarId}-attendees.csv`
    );
    return res.status(200).send(csvRows.join("\n"));
  }

  res.status(200).json({
    success: true,
    count: attendees.length,
    data: attendees,
  });
});
