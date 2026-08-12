import { Router } from "express";
import crypto from "crypto";
import Star from "../models/Star.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/*
  ============================================================
  PUBLIC SHARED JAR
  GET /api/stars/share/:shareToken
  ============================================================
*/

router.get("/share/:shareToken", async (req, res) => {
  try {
    const user = await User.findOne({
      shareToken: req.params.shareToken,
    }).select("_id name");

    if (!user) {
      return res.status(404).json({
        error: "Shared jar not found",
      });
    }

    const stars = await Star.find({
      userId: user._id,
    })
      .select("text color photoUrl createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      ownerName: user.name,
      starCount: stars.length,
      stars,
    });
  } catch (err) {
    console.error("Public jar error:", err);

    res.status(500).json({
      error: "Failed to load shared jar",
    });
  }
});


/*
  ============================================================
  AUTHENTICATED STAR ROUTES
  ============================================================
*/

router.use(requireAuth);


/*
  GET /api/stars
  Optional:
    ?color=pink
    ?from=2026-08-01
    ?to=2026-08-12
*/

router.get("/", async (req, res) => {
  try {
    const { color, from, to } = req.query;

    const query = {
      userId: req.userId,
    };

    if (color) {
      query.color = color;
    }

    if (from || to) {
      query.createdAt = {};

      if (from) {
        query.createdAt.$gte = new Date(`${from}T00:00:00`);
      }

      if (to) {
        query.createdAt.$lte = new Date(`${to}T23:59:59.999`);
      }
    }

    const stars = await Star.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json(stars);
  } catch (err) {
    console.error("Get stars error:", err);

    res.status(500).json({
      error: "Failed to load stars",
    });
  }
});


/*
  POST /api/stars

  body:
  {
    text,
    color,
    photoUrl
  }
*/

router.post("/", async (req, res) => {
  try {
    const {
      text,
      color = "pink",
      photoUrl = null,
    } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        error: "Memory text is required",
      });
    }

    const validColors = [
      "pink",
      "sage",
      "blue",
      "yellow",
      "purple",
    ];

    if (!validColors.includes(color)) {
      return res.status(400).json({
        error: "Invalid star color",
      });
    }

    const star = await Star.create({
      userId: req.userId,
      text: text.trim(),
      color,
      photoUrl,
    });

    res.status(201).json(star);
  } catch (err) {
    console.error("Create star error:", err);

    res.status(500).json({
      error: "Failed to create star",
    });
  }
});


/*
  PUT /api/stars/:id
*/

router.put("/:id", async (req, res) => {
  try {
    const {
      text,
      color,
      photoUrl,
    } = req.body;

    const updates = {};

    if (typeof text === "string") {
      updates.text = text.trim();
    }

    if (color) {
      updates.color = color;
    }

    if (photoUrl !== undefined) {
      updates.photoUrl = photoUrl;
    }

    const star = await Star.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!star) {
      return res.status(404).json({
        error: "Star not found",
      });
    }

    res.json(star);
  } catch (err) {
    console.error("Update star error:", err);

    res.status(500).json({
      error: "Failed to update star",
    });
  }
});


/*
  DELETE /api/stars/:id
*/

router.delete("/:id", async (req, res) => {
  try {
    const star = await Star.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!star) {
      return res.status(404).json({
        error: "Star not found",
      });
    }

    res.json({
      success: true,
    });
  } catch (err) {
    console.error("Delete star error:", err);

    res.status(500).json({
      error: "Failed to delete star",
    });
  }
});


/*
  GET /api/stars/share-link

  Creates a share token for old users if they don't have one.
*/

router.get("/share-link/current", async (req, res) => {
  try {
    let user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!user.shareToken) {
      user.shareToken = crypto.randomBytes(24).toString("hex");
      await user.save();
    }

    res.json({
      shareToken: user.shareToken,
    });
  } catch (err) {
    console.error("Share token error:", err);

    res.status(500).json({
      error: "Failed to create share link",
    });
  }
});


/*
  GET /api/stars/:id
*/

router.get("/:id", async (req, res) => {
  try {
    const star = await Star.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!star) {
      return res.status(404).json({
        error: "Star not found",
      });
    }

    res.json(star);
  } catch (err) {
    console.error("Get star error:", err);

    res.status(500).json({
      error: "Failed to load star",
    });
  }
});


export default router;