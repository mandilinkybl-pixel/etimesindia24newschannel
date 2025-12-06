const Business = require("../models/Business");
const Crime = require("../models/Crime");
const Education = require("../models/Education");
const Entertainment = require("../models/Entertainment");
const Environment = require("../models/Environment");
const Health = require("../models/Health");
const Live = require("../models/Live");
const Politics = require("../models/Politics");
const Science = require("../models/Science");
const Sports = require("../models/Sports");
const Technology = require("../models/Technology");
const World = require("../models/World");

class apicontroller {
    // ================= TRENDING NEWS API =================
getTrendingNews = async (req, res) => {
  try {
    const sectionModels = {
      business: Business,
      crime: Crime,
      education: Education,
      entertainment: Entertainment,
      environment: Environment,
      health: Health,
      politics: Politics,
      science: Science,
      sports: Sports,
      technology: Technology,
      world: World,
      live: Live,
    };

    let trending = [];

    // Fetch latest from all sections
    for (const key of Object.keys(sectionModels)) {
      const latestNews = await sectionModels[key]
        .find()
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(10) // how many latest from each model
        .lean();

      const formatted = latestNews.map((item) => ({
        ...item,
        section: key,
        url: `/${key}/${item._id}`,
      }));

      trending = trending.concat(formatted);
    }

    // Sort globally
    trending = trending.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    );

    return res.json({
      status: true,
      message: "Latest Trending News",
      total: trending.length,
      data: trending.slice(0, 30), // return top 30 global trending news
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server Error" });
  }
};
}

module.exports = new apicontroller();