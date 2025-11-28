const { render } = require("ejs");
const Business = require("../../models/Business");
const Crime = require("../../models/Crime");
const Education = require("../../models/Education");
const Entertainment = require("../../models/Entertainment");
const Environment = require("../../models/Environment");
const Health = require("../../models/Health");
const Live = require("../../models/Live");
const National = require("../../models/National");
const Politics = require("../../models/Politics");
const Science = require("../../models/Science");
const Sports = require("../../models/Sports");
const Technology = require("../../models/Technology");
const World = require("../../models/World");
const subscriptionplan = require("../../models/subscriptionplan");
const subscription = require("../../models/subscription");

const MainLive = require("../../models/main_video");
const Ads = require("../../models/ads"); // your ads model
const rightad = require("../../models/rightad");
const leftad = require("../../models/leftad");
class Uipagescontroller {
 home = async (req, res) => {
  try {

    // ----- LIVE VIDEO -----
    const livevideo = await MainLive.findOne().sort({ createdAt: -1 });

    // ----- ADS -----
    const rightads = await rightad.find().lean();
    const leftads = await leftad.find().lean();

    // ----- ALL SECTIONS -----
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
    };

    const sections = {};

    // Fetch each section and add section key to every item
    for (const key of Object.keys(sectionModels)) {
      const rawData = await sectionModels[key]
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();

      // Add URL + section field
      sections[key] = rawData.map((item) => ({
        ...item,
        section: key,
        url: `/${key}/${item._id}`,
      }));
    }

    // ----- TRENDING NEWS (Latest from all sections) -----

    let trendingArr = [];

    for (const key of Object.keys(sections)) {
      trendingArr = trendingArr.concat(sections[key]);
    }

    // Sort by date and pick latest 10
    const trendingNews = trendingArr
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // ----- ALL ADS -----
    const ads = await Ads.find({ status: "active" }).lean();

    const sectionAds = {};
    Object.keys(sectionModels).forEach((key) => {
      const adsForSection = ads.filter(
        (ad) => ad.sectionKey === key || ad.sectionKey === "all"
      );
      sectionAds[key] = adsForSection;
    });

    // ----- RENDER PAGE -----

    res.render("ui/home", {
      title: "E-TIMES-INDIA-24",
      user: req.user || null,
      livevideo,
      sections,
      trendingNews,
      sectionAds,
      rightads,
      leftads,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};


  login = async (req, res) => {
    try {
      res.render("ui/login", {
        // ← this renders views/ui/login.ejs
        title: "Login - E TIMES INDIA 24",
        user: req.user || null,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getBusiness = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;

      const [business, count] = await Promise.all([
        Business.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page

      const rightads = await rightad.find();
      const leftads = await leftad.find();
      res.render("ui/allnews", {
        title: "business",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getcrime = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;

      const [business, count] = await Promise.all([
        Crime.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "crime",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getnational = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        National.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "national/news",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getscience = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        Science.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "science",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getSports = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        Sports.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "sports",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getEducation = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        Education.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "education",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getEnvironment = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        Environment.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "environment",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getEntertainment = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        Entertainment.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "entertainment",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getPolitics = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        Politics.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "politics",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getWorld = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        World.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "world",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getTechnology = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        Technology.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "technology",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getLive = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        Live.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "live",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getHealth = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 24; // News per page
      const skip = (page - 1) * limit;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      const [business, count] = await Promise.all([
        Health.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
        Business.countDocuments(),
      ]);
      const pageCount = Math.ceil(count / limit);

      // If AJAX, just send the grid HTML
      // if (req.xhr) {
      //   return res.render('ui/partials/business-grid', { news: business }, (err, html) => {
      //     res.json({ html });
      //   });
      // }

      // Render full page
      res.render("ui/allnews", {
        title: "health",
        user: req.user || null,
        news: business,
        page,
        pageCount,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  };

  getPlansPage = async (req, res) => {
    try {
      const dbPlans = await subscriptionplan
        .find({ status: "active" })
        .sort({ price: 1 });

      // Always show Free Plan first
      const plans = [
        {
          _id: "free",
          name: "Free",
          price: 0,
          durationMonths: 0,
          isFeatured: false,
          features: [
            { text: "Limited News Access", included: true },
            { text: "With Advertisements", included: true },
            { text: "Basic Support", included: true },
            { text: "Ad-Free Experience", included: false },
            { text: "Exclusive Content", included: false },
            { text: "Offline Reading", included: false },
          ],
        },
        ...dbPlans.map((plan) => ({
          ...plan.toObject(),
          isFeatured: plan.price === 99, // Mark ₹99 plan as featured
          features: [
            { text: "Unlimited Articles", included: true },
            { text: "Ad-Free Reading", included: true },
            { text: "Exclusive Stories", included: plan.price >= 99 },
            { text: "Daily Newsletter", included: plan.price >= 99 },
            { text: "Live Event Access", included: plan.price >= 199 },
            { text: "Offline Download", included: plan.price >= 199 },
            { text: "Priority Support", included: plan.price >= 99 },
            { text: "Personalized Feed", included: plan.price >= 199 },
          ],
        })),
      ];

      const rightads = await rightad.find();
      const leftads = await leftad.find();

      res.render("ui/plans", {
        plans,
        user: req.user || null,
        rightads,
        leftads,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  };

  renderPurchaseDetail = async (req, res) => {
    try {
      const planId = req.params.id;
      const plan = await subscriptionplan.findById(planId).lean();
      if (!plan) return res.status(404).send("Plan not found");

      // Your Razorpay KEY_ID (never expose the SECRET!)
      const razorpayKey = process.env.RAZORPAY_KEY_ID;
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      res.render("ui/purchase", {
        plan,
        razorpayKey,
        user: req.user,
        rightads,
        leftads,
      });
    } catch (err) {
      res.status(500).send("Server error loading purchase page");
    }
  };

  getterms = async (req, res) => {
    try {
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      res.render("ui/terms", {
        title: "terms",
        user: req.user,
        rightads,
        leftads,
      });
    } catch {
      res.status(500).send("Server error loading purchase page");
    }
  };

  getprivacy = async (req, res) => {
    try {
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      res.render("ui/privacy", {
        title: "terms",
        user: req.user,
        rightads,
        leftads,
      });
    } catch {
      res.status(500).send("Server error loading purchase page");
    }
  };

  getNewsDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Politics.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Politics.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Politics.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const rightads = await rightad.find();
      const leftads = await leftad.find();

      // Pass data to EJS template
      res.render("ui/detail", {
        title: "politics",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getcrimeNewsDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Crime.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Crime.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Crime.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      // Pass data to EJS template
      res.render("ui/detail", {
        title: "crime",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getNationalNewsDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch news by ID
      const news = await National.findById(newsId)
        .populate("createdBy", "name username")
        .lean();

      // If no news found
      if (!news) {
        return res.status(404).render("404", { message: "News not found" });
      }

      // Increment views
      await National.updateOne({ _id: newsId }, { $inc: { views: 1 } });
      const relatedNews = await National.find()
        .populate("createdBy", "name username")
        .lean();
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      // Render the page with full news data
      res.render("ui/detail", {
        title: "national/news",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news,
        relatedNews,
        user: req.user || null,
        rightads,
        leftads,
      });
    } catch (error) {
      console.error("Error in getNationalNewsDetails:", error);
      return res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getWorldNewsDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await World.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await World.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await World.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      // Pass data to EJS template
      res.render("ui/detail", {
        title: "world",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getSportsNewsDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Sports.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Sports.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Sports.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      // Pass data to EJS template
      res.render("ui/detail", {
        title: "sports",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getBusinessNewsDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Business.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Business.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Business.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const rightads = await rightad.find();
      const leftads = await leftad.find();

      // Pass data to EJS template
      res.render("ui/detail", {
        title: "business",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getTechnologyNewsDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Technology.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Technology.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Technology.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      // Pass data to EJS template
      res.render("ui/detail", {
        title: "technology",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getEntertainmentNewsDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Entertainment.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Entertainment.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Entertainment.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      // Pass data to EJS template
      res.render("ui/detail", {
        title: "entertainment",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getEnvironmentNewsDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Environment.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Environment.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Environment.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const rightads = await rightad.find();
      const leftads = await leftad.find();

      // Pass data to EJS template
      res.render("ui/detail", {
        title: "environment",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getEducationNewsDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Education.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Education.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Education.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      const rightads = await rightad.find();
      const leftads = await leftad.find();

      // Pass data to EJS template
      res.render("ui/detail", {
        title: "education",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getScienceDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Science.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Science.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Science.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      const rightads = await rightad.find();
      const leftads = await leftad.find();
      // Pass data to EJS template
      res.render("ui/detail", {
        title: "science",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };

  getLiveDetails = async (req, res) => {
    try {
      const newsId = req.params.id;

      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Live.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Live.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Live.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };

      const rightads = await rightad.find();
      const leftads = await leftad.find();

      // Pass data to EJS template
      res.render("ui/detail", {
        title: "live",
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
        rightads,
        leftads, // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };
  getHealthDetails = async (req, res) => {
    try {
      const newsId = req.params.id;
const rightads = await rightad.find();
      const leftads = await leftad.find();
      // Validate ObjectId
      if (!newsId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).render("404", { message: "Invalid news ID" });
      }

      // Fetch the main news article
      const news = await Health.findById(newsId)
        .populate("createdBy", "name username") // Get author name
        .lean(); // Use lean() for better performance in rendering

      // If news not found or not published
      if (!news || news.status !== "published") {
        return res.status(404).render("404", {
          message: "News not found or has been removed.",
        });
      }

      // Increment view count
      await Health.updateOne({ _id: newsId }, { $inc: { views: 1 } });

      // Fetch 6 latest published related news (excluding current)
      const relatedNews = await Health.find({
        _id: { $ne: news._id },
        status: "published",
      })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("headline image createdAt views")
        .lean();

      // Format date for display
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      
      // Pass data to EJS template
      res.render("ui/detail", {
        title: "health",
          rightads,
        leftads,
        pageTitle: `${news.headline} | E TIMES INDIA 24`,
        news: {
          ...news,
          formattedDate: formatDate(news.createdAt),
        },
        relatedNews: relatedNews.map((item) => ({
          ...item,
          formattedDate: formatDate(item.createdAt),
        })),
        user: req.user || null,
       // For future login features
      });
    } catch (error) {
      console.error("Error in getNewsDetails:", error);
      res.status(500).render("error", {
        message: "Something went wrong. Please try again later.",
      });
    }
  };
}

module.exports = new Uipagescontroller();
